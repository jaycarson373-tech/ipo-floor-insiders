import assert from 'node:assert/strict';
import test from 'node:test';
import {
  allocateDeskRewards,
  allocateEpochRewards,
  claimAllocation,
  recordPurchaseResult,
  reconcileReceipt,
  splitIntegerAmount,
  splitMintReceipt,
  transferDeskForNextEpoch,
  transitionLaunch,
  validateAssetRecord,
  validateFeeShares,
} from '../app/platform-domain.mjs';

const feeShares = { coinHolders: 6000, deskHolders: 1500, creator: 1500, operations: 1000 };

test('fee shares conserve exactly 10,000 basis points', () => {
  assert.deepEqual(validateFeeShares(feeShares), { valid: true, total: 10_000, remaining: 0, shares: feeShares });
  assert.equal(validateFeeShares({ ...feeShares, operations: 999 }).valid, false);
  assert.throws(() => validateFeeShares({ ...feeShares, operations: 1.5 }), /integer/);
});

test('fee receipts split with integer math and retain dust', () => {
  const result = splitIntegerAmount(101n, feeShares);
  assert.deepEqual(result.allocations, { coinHolders: 60n, deskHolders: 15n, creator: 15n, operations: 10n });
  assert.equal(result.dust, 1n);
});

test('mint receipts preserve the 80/20 per-desk allocation without assuming sellout', () => {
  const one = splitMintReceipt(120_000_000n);
  assert.equal(one.initialAssetCapital, 96_000_000n);
  assert.equal(one.operationFunds, 24_000_000n);
  const partial = splitMintReceipt(7n * 120_000_000n);
  assert.equal(partial.initialAssetCapital, 672_000_000n);
  assert.equal(partial.operationFunds, 168_000_000n);
});

test('new desks receive no historical rewards and transfers start next epoch', () => {
  const desks = [{ id: '1', owner: 'early', eligibleFromEpoch: 1 }, { id: '2', owner: 'new', eligibleFromEpoch: 4 }];
  assert.deepEqual(allocateEpochRewards(100n, desks, 3).entries.map((entry) => entry.owner), ['early']);
  const moved = transferDeskForNextEpoch(desks[0], 'buyer', 3);
  assert.equal(moved.previousOwner, 'early');
  assert.equal(allocateEpochRewards(100n, [moved.desk], 3).eligibleDesks, 0);
  assert.equal(allocateEpochRewards(100n, [moved.desk], 4).entries[0].owner, 'buyer');
});

test('failed purchases retain unspent capital and successful purchases preserve residue', () => {
  const account = { pendingUnits: 96n, purchasedUnits: 0n };
  const failed = recordPurchaseResult(account, { success: false, reason: 'Quote expired' });
  assert.equal(failed.pendingUnits, 96n);
  assert.equal(failed.lastFailure, 'Quote expired');
  const completed = recordPurchaseResult(account, { success: true, spentUnits: 90n, purchasedUnits: 450n });
  assert.equal(completed.pendingUnits, 6n);
  assert.equal(completed.purchasedUnits, 450n);
});

test('desk rewards use equal per-desk participation and preserve rounding dust', () => {
  const result = allocateDeskRewards(10n, [
    { id: 'IPO-0001', owner: 'A' },
    { id: 'IPO-0002', owner: 'A' },
    { id: 'IPO-0003', owner: 'B' },
    { id: 'IPO-0004', owner: 'POOL' },
  ], ['POOL']);
  assert.equal(result.eligibleDesks, 3);
  assert.deepEqual(result.entries.map((entry) => entry.units), [3n, 3n, 3n]);
  assert.equal(result.dust, 1n);
});

test('zero revenue and no eligible desks remain visible as unallocated', () => {
  assert.equal(allocateDeskRewards(0n, [{ id: 'IPO-0001', owner: 'A' }]).allocated, 0n);
  assert.equal(allocateDeskRewards(9n, [], []).dust, 9n);
});

test('receipt reconciliation and claims reject duplicates', () => {
  const receipt = { signature: 'sig', instructionIndex: 2, amountUnits: 50n };
  const first = reconcileReceipt([], receipt);
  const duplicate = reconcileReceipt(first.receipts, receipt);
  assert.equal(first.inserted, true);
  assert.equal(duplicate.inserted, false);

  const claim = claimAllocation(new Set(), { id: 'round:desk', units: 12n });
  assert.equal(claim.claimed, true);
  assert.equal(claimAllocation(claim.claimedIds, { id: 'round:desk', units: 12n }).claimed, false);
});

test('interrupted launch setup only follows recoverable transitions', () => {
  assert.equal(transitionLaunch('draft', 'metadata_ready'), 'metadata_ready');
  assert.equal(transitionLaunch('token_confirmed', 'fee_routing_pending'), 'fee_routing_pending');
  assert.equal(transitionLaunch('failed', 'token_confirmed'), 'token_confirmed');
  assert.throws(() => transitionLaunch('draft', 'rewards_active'), /Invalid launch transition/);
});

test('reward asset eligibility requires identity, controls, route, liquidity, and backing review when relevant', () => {
  const base = {
    mint: 'So11111111111111111111111111111111111111112',
    tokenProgram: 'SPL Token',
    controlsCheckedAt: '2026-09-08',
    liquidityCheckedAt: '2026-09-08',
    quoteRoute: 'route',
    category: 'project token',
    purchaseEligible: true,
  };
  assert.equal(validateAssetRecord(base).purchaseEligible, true);
  assert.equal(validateAssetRecord({ ...base, controlsCheckedAt: '' }).purchaseEligible, false);
  assert.equal(validateAssetRecord({ ...base, category: 'tokenized financial asset' }).purchaseEligible, false);
});
