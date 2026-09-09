import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { launchConfig } from './launch-config';

export const MPL_CORE_PROGRAM_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
const CONFIG_DISCRIMINATOR = new Uint8Array([155, 12, 170, 224, 30, 250, 204, 130]);
const MINT_DESK_DISCRIMINATOR = new Uint8Array([13, 78, 211, 198, 47, 173, 187, 207]);
const EXPECTED_SUPPLY = launchConfig.supply;
const EXPECTED_SOL_PRICE = launchConfig.mintPriceLamports;
const EXPECTED_IPO_PRICE = 0n;

export type WalletProvider = {
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
};

export type LaunchState = {
  config: PublicKey;
  authority: PublicKey;
  treasury: PublicKey;
  assetTreasury: PublicKey;
  ipoMint: PublicKey;
  coreCollection: PublicKey;
  totalSupply: number;
  minted: number;
  mintPriceLamports: bigint;
  ipoPriceTokens: bigint;
  metadataBaseUri: string;
  paused: boolean;
};

function readPublicKey(data: Uint8Array, offset: number) {
  return new PublicKey(data.slice(offset, offset + 32));
}

function readU64(view: DataView, offset: number) {
  return view.getBigUint64(offset, true);
}

function decodeConfig(address: PublicKey, data: Uint8Array): LaunchState {
  if (data.length < 194 || !CONFIG_DISCRIMINATOR.every((byte, index) => data[index] === byte)) {
    throw new Error('The configured account is not an IPO launch config.');
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const uriLength = view.getUint32(168, true);
  const numericOffset = 172 + uriLength;
  if (uriLength > 180 || numericOffset + 22 > data.length) {
    throw new Error('The on-chain launch config is malformed.');
  }

  return {
    config: address,
    authority: readPublicKey(data, 8),
    treasury: readPublicKey(data, 40),
    assetTreasury: readPublicKey(data, 72),
    ipoMint: readPublicKey(data, 104),
    coreCollection: readPublicKey(data, 136),
    totalSupply: view.getUint16(numericOffset, true),
    minted: view.getUint16(numericOffset + 2, true),
    mintPriceLamports: readU64(view, numericOffset + 4),
    ipoPriceTokens: readU64(view, numericOffset + 12),
    metadataBaseUri: new TextDecoder().decode(data.slice(172, 172 + uriLength)),
    paused: data[numericOffset + 20] === 1,
  };
}

function validateLaunchState(state: LaunchState) {
  if (state.totalSupply !== EXPECTED_SUPPLY) throw new Error(`On-chain supply is not ${EXPECTED_SUPPLY.toLocaleString()}.`);
  if (state.mintPriceLamports !== EXPECTED_SOL_PRICE) throw new Error(`On-chain SOL price is not ${launchConfig.mintPriceSol.toFixed(3)} SOL.`);
  if (state.ipoPriceTokens !== EXPECTED_IPO_PRICE) throw new Error('On-chain mint unexpectedly requires IPO.');
  if (state.assetTreasury.equals(state.treasury)) throw new Error('On-chain asset and operations treasuries are not separated.');
  const expectedAddresses = [
    ['operations treasury', state.treasury, launchConfig.treasury],
    ['asset-capital treasury', state.assetTreasury, launchConfig.assetTreasury],
    ['IPO mint', state.ipoMint, launchConfig.ipoMint],
    ['Core collection', state.coreCollection, launchConfig.coreCollection],
  ] as const;
  for (const [label, actual, published] of expectedAddresses) {
    if (!published) throw new Error(`The public ${label} is not configured.`);
    if (!actual.equals(new PublicKey(published))) {
      throw new Error(`On-chain ${label} does not match the published address.`);
    }
  }
  if (!launchConfig.metadataBaseUrl.startsWith('https://')) {
    throw new Error('The public metadata base URL must use HTTPS.');
  }
  if (state.metadataBaseUri.replace(/\/$/, '') !== launchConfig.metadataBaseUrl.replace(/\/$/, '')) {
    throw new Error('On-chain metadata URL does not match the published URL.');
  }
  if (state.minted > state.totalSupply) throw new Error('On-chain minted count is invalid.');
}

export function getConnection() {
  return new Connection(launchConfig.rpcUrl, 'confirmed');
}

export async function fetchLaunchState(connection = getConnection()) {
  if (!launchConfig.config) throw new Error('Mint configuration is not published yet.');
  const config = new PublicKey(launchConfig.config);
  const programId = new PublicKey(launchConfig.programId);
  const [programAccount, account] = await Promise.all([
    connection.getAccountInfo(programId, 'confirmed'),
    connection.getAccountInfo(config, 'confirmed'),
  ]);
  if (!programAccount?.executable) throw new Error('The published IPO program is not executable.');
  if (!account) throw new Error('The IPO program is not initialized on this network.');
  if (!account.owner.equals(programId)) throw new Error('The launch config is owned by the wrong program.');
  const state = decodeConfig(config, account.data);
  validateLaunchState(state);

  const [mintAccount, collectionAccount] = await Promise.all([
    connection.getAccountInfo(state.ipoMint, 'confirmed'),
    connection.getAccountInfo(state.coreCollection, 'confirmed'),
  ]);
  if (!mintAccount?.owner.equals(TOKEN_PROGRAM_ID)) {
    throw new Error('The published IPO mint is not an SPL Token mint supported by this program.');
  }
  if (!collectionAccount?.owner.equals(MPL_CORE_PROGRAM_ID)) {
    throw new Error('The published collection is not a Metaplex Core collection.');
  }
  return state;
}

export async function mintDesk(provider: WalletProvider, onSubmitted?: (signature: string) => void) {
  if (!provider.publicKey || !provider.signTransaction) {
    throw new Error('This wallet does not support transaction signing.');
  }

  const connection = getConnection();
  const state = await fetchLaunchState(connection);
  if (state.paused) throw new Error('Minting is currently paused.');
  if (state.minted >= state.totalSupply) throw new Error(`All ${EXPECTED_SUPPLY.toLocaleString()} IPO Desks are minted.`);

  const buyer = provider.publicKey;
  const balance = await connection.getBalance(buyer, 'confirmed');
  if (BigInt(balance) <= EXPECTED_SOL_PRICE) {
    throw new Error(`Wallet needs more than ${launchConfig.mintPriceSol.toFixed(3)} SOL to cover the mint and network/account costs.`);
  }

  const serial = state.minted + 1;
  const serialBytes = new Uint8Array(2);
  new DataView(serialBytes.buffer).setUint16(0, serial, true);
  const [desk] = PublicKey.findProgramAddressSync(
    [new TextEncoder().encode('desk'), state.config.toBytes(), serialBytes],
    new PublicKey(launchConfig.programId),
  );
  const asset = Keypair.generate();
  const data = new Uint8Array(10);
  data.set(MINT_DESK_DISCRIMINATOR, 0);
  data.set(serialBytes, 8);

  const instruction = new TransactionInstruction({
    programId: new PublicKey(launchConfig.programId),
    keys: [
      { pubkey: buyer, isSigner: true, isWritable: true },
      { pubkey: state.config, isSigner: false, isWritable: true },
      { pubkey: desk, isSigner: false, isWritable: true },
      { pubkey: state.treasury, isSigner: false, isWritable: true },
      { pubkey: state.assetTreasury, isSigner: false, isWritable: true },
      { pubkey: asset.publicKey, isSigner: true, isWritable: true },
      { pubkey: state.coreCollection, isSigner: false, isWritable: true },
      { pubkey: MPL_CORE_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  const transaction = new Transaction({ feePayer: buyer, blockhash, lastValidBlockHeight })
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
    .add(instruction);
  transaction.partialSign(asset);

  const signed = await provider.signTransaction(transaction);
  const simulation = await connection.simulateTransaction(signed);
  if (simulation.value.err) {
    const detail = simulation.value.logs?.slice(-4).join(' | ') ?? JSON.stringify(simulation.value.err);
    throw new Error(`Mint simulation failed: ${detail}`);
  }

  const signature = await connection.sendRawTransaction(signed.serialize(), {
    maxRetries: 3,
    preflightCommitment: 'confirmed',
  });
  onSubmitted?.(signature);
  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed',
  );
  if (confirmation.value.err) throw new Error('Mint transaction failed during confirmation.');

  const createdAsset = await connection.getAccountInfo(asset.publicKey, 'confirmed');
  if (!createdAsset?.owner.equals(MPL_CORE_PROGRAM_ID)) {
    throw new Error('Transaction confirmed but the Core asset could not be verified.');
  }

  return { signature, asset: asset.publicKey.toString(), serial };
}
