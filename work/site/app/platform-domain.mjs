export const BPS_TOTAL = 10_000;
export const FEE_SHARE_KEYS = ['coinHolders', 'deskHolders', 'creator', 'operations'];

function assertInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer.`);
}

export function validateFeeShares(shares) {
  const normalized = {};
  for (const key of FEE_SHARE_KEYS) {
    const value = Number(shares[key]);
    assertInteger(value, key);
    normalized[key] = value;
  }
  const total = FEE_SHARE_KEYS.reduce((sum, key) => sum + normalized[key], 0);
  return { valid: total === BPS_TOTAL, total, remaining: BPS_TOTAL - total, shares: normalized };
}

export function splitIntegerAmount(totalUnits, shares) {
  const total = BigInt(totalUnits);
  if (total < 0n) throw new Error('Amount cannot be negative.');
  const validation = validateFeeShares(shares);
  if (!validation.valid) throw new Error('Fee shares must total exactly 10,000 basis points.');
  const allocations = {};
  let allocated = 0n;
  for (const key of FEE_SHARE_KEYS) {
    const value = total * BigInt(validation.shares[key]) / BigInt(BPS_TOTAL);
    allocations[key] = value;
    allocated += value;
  }
  return { allocations, dust: total - allocated };
}

export function splitMintReceipt(totalLamports, allocation = { rewardAssets: 8000, operations: 2000 }) {
  const total = BigInt(totalLamports);
  if (total < 0n) throw new Error('Mint receipt cannot be negative.');
  const rewardAssets = Number(allocation.rewardAssets);
  const operations = Number(allocation.operations);
  assertInteger(rewardAssets, 'rewardAssets');
  assertInteger(operations, 'operations');
  if (rewardAssets + operations !== BPS_TOTAL) throw new Error('Mint allocation must total 10,000 basis points.');
  const initialAssetCapital = total * BigInt(rewardAssets) / BigInt(BPS_TOTAL);
  const operationFunds = total * BigInt(operations) / BigInt(BPS_TOTAL);
  return { initialAssetCapital, operationFunds, dust: total - initialAssetCapital - operationFunds };
}

export function splitUpgradePayment(totalUnits, burnBps) {
  const total = BigInt(totalUnits);
  const burnShare = Number(burnBps);
  if (total < 0n) throw new Error('Upgrade payment cannot be negative.');
  assertInteger(burnShare, 'burnBps');
  if (burnShare > BPS_TOTAL) throw new Error('Burn share cannot exceed 10,000 basis points.');
  const burnUnits = total * BigInt(burnShare) / BigInt(BPS_TOTAL);
  return { burnUnits, retainedUnits: total - burnUnits };
}

export function allocateDeskRewards(totalUnits, desks, excludedAddresses = []) {
  const total = BigInt(totalUnits);
  if (total < 0n) throw new Error('Reward amount cannot be negative.');
  const excluded = new Set(excludedAddresses);
  const eligible = desks.filter((desk) => desk?.id && desk?.owner && !excluded.has(desk.owner));
  if (!eligible.length) return { entries: [], eligibleDesks: 0, allocated: 0n, dust: total };
  const perDesk = total / BigInt(eligible.length);
  const entries = eligible.map((desk) => ({ deskId: desk.id, owner: desk.owner, units: perDesk }));
  const allocated = perDesk * BigInt(eligible.length);
  return { entries, eligibleDesks: eligible.length, allocated, dust: total - allocated };
}

export function allocateEpochRewards(totalUnits, desks, epoch, excludedAddresses = []) {
  assertInteger(epoch, 'epoch');
  const eligible = desks.filter((desk) => desk?.id && desk?.owner && desk.eligibleFromEpoch <= epoch);
  return allocateDeskRewards(totalUnits, eligible, excludedAddresses);
}

export function transferDeskForNextEpoch(desk, newOwner, transferEpoch) {
  assertInteger(transferEpoch, 'transferEpoch');
  if (!desk?.id || !desk?.owner || !newOwner) throw new Error('Desk transfer requires a desk and owners.');
  return { previousOwner: desk.owner, desk: { ...desk, owner: newOwner, eligibleFromEpoch: transferEpoch + 1 } };
}

export function recordPurchaseResult(account, result) {
  const pending = BigInt(account.pendingUnits);
  if (pending < 0n) throw new Error('Pending balance cannot be negative.');
  if (!result?.success) return { ...account, pendingUnits: pending, purchasedUnits: BigInt(account.purchasedUnits ?? 0), lastFailure: result?.reason ?? 'Purchase failed.' };
  const spent = BigInt(result.spentUnits);
  const purchased = BigInt(result.purchasedUnits);
  if (spent < 0n || purchased < 0n || spent > pending) throw new Error('Purchase result is invalid.');
  return { ...account, pendingUnits: pending - spent, purchasedUnits: BigInt(account.purchasedUnits ?? 0) + purchased, lastFailure: '' };
}

export function reconcileReceipt(receipts, receipt) {
  if (!receipt?.signature || !Number.isSafeInteger(receipt.instructionIndex) || receipt.instructionIndex < 0) {
    throw new Error('Receipt requires a signature and non-negative instruction index.');
  }
  if (BigInt(receipt.amountUnits) < 0n) throw new Error('Receipt amount cannot be negative.');
  const id = `${receipt.signature}:${receipt.instructionIndex}`;
  if (receipts.some((item) => item.id === id)) return { receipts, inserted: false };
  return { receipts: [...receipts, { ...receipt, id, amountUnits: BigInt(receipt.amountUnits) }], inserted: true };
}

export function claimAllocation(claimedIds, allocation) {
  if (!allocation?.id || BigInt(allocation.units) < 0n) throw new Error('Claim allocation is invalid.');
  if (claimedIds.has(allocation.id)) return { claimedIds, claimed: false, units: 0n };
  const next = new Set(claimedIds);
  next.add(allocation.id);
  return { claimedIds: next, claimed: true, units: BigInt(allocation.units) };
}

const mintTransitions = {
  idle: ['review'],
  review: ['signing', 'cancelled', 'idle'],
  signing: ['submitted', 'cancelled', 'failed'],
  submitted: ['confirmed', 'failed'],
  confirmed: ['idle'],
  cancelled: ['review', 'idle'],
  failed: ['review', 'idle'],
};

export function transitionMint(current, next) {
  if (!mintTransitions[current]?.includes(next)) throw new Error(`Invalid mint transition: ${current} -> ${next}.`);
  return next;
}

export function appendRoomRevision(revisions, draft, timestamp) {
  if (!draft?.title?.trim() || !draft?.thesis?.trim()) throw new Error('Room revisions require a title and thesis.');
  let source;
  try {
    source = new URL(draft.source);
  } catch {
    throw new Error('Room revisions require a valid source URL.');
  }
  if (!['http:', 'https:'].includes(source.protocol)) throw new Error('Room sources must use HTTP or HTTPS.');
  const updatedAt = new Date(timestamp).toISOString();
  const revision = {
    ...draft,
    source: source.toString(),
    updatedAt,
    revision: revisions.length + 1,
  };
  return [...revisions, revision];
}

const contributionTransitions = {
  pending: ['accepted', 'declined'],
  accepted: [],
  declined: ['pending'],
};

export function transitionContribution(current, next) {
  if (!contributionTransitions[current]?.includes(next)) {
    throw new Error(`Invalid contribution transition: ${current} -> ${next}.`);
  }
  return next;
}

const transitions = {
  draft: ['metadata_ready', 'cancelled'],
  metadata_ready: ['token_submitted', 'failed', 'cancelled'],
  token_submitted: ['token_confirmed', 'failed'],
  token_confirmed: ['fee_routing_pending', 'rewards_disabled'],
  fee_routing_pending: ['fee_routing_verified', 'failed'],
  fee_routing_verified: ['rewards_active', 'failed'],
  rewards_disabled: ['fee_routing_pending'],
  failed: ['draft', 'metadata_ready', 'token_confirmed', 'fee_routing_pending'],
  rewards_active: [],
  cancelled: ['draft'],
};

export function transitionLaunch(current, next) {
  if (!transitions[current]?.includes(next)) throw new Error(`Invalid launch transition: ${current} -> ${next}.`);
  return next;
}

export function validateAssetRecord(asset) {
  const checks = {
    exactMint: typeof asset?.mint === 'string' && asset.mint.length >= 32,
    tokenProgram: asset?.tokenProgram === 'SPL Token' || asset?.tokenProgram === 'Token-2022',
    controlsChecked: Boolean(asset?.controlsCheckedAt),
    routeSupported: Boolean(asset?.quoteRoute),
    liquidityChecked: Boolean(asset?.liquidityCheckedAt),
    backingReviewed: asset?.category !== 'tokenized financial asset' || Boolean(asset?.backingReviewedAt),
  };
  return { checks, purchaseEligible: Object.values(checks).every(Boolean) && asset.purchaseEligible === true };
}
