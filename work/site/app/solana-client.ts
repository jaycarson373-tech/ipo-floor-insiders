import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { launchConfig } from './launch-config';

export const MPL_CORE_PROGRAM_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
const CONFIG_DISCRIMINATOR = new Uint8Array([155, 12, 170, 224, 30, 250, 204, 130]);
const MINT_DESK_DISCRIMINATOR = new Uint8Array([13, 78, 211, 198, 47, 173, 187, 207]);
const EXPECTED_SUPPLY = 333;
const EXPECTED_SOL_PRICE = 250_000_000n;
const EXPECTED_IPO_PRICE = 1_000_000n;

export type WalletProvider = {
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
};

export type LaunchState = {
  config: PublicKey;
  authority: PublicKey;
  treasury: PublicKey;
  ipoMint: PublicKey;
  ipoVault: PublicKey;
  coreCollection: PublicKey;
  totalSupply: number;
  minted: number;
  mintPriceLamports: bigint;
  ipoPriceTokens: bigint;
  paused: boolean;
};

function readPublicKey(data: Uint8Array, offset: number) {
  return new PublicKey(data.slice(offset, offset + 32));
}

function readU64(view: DataView, offset: number) {
  return view.getBigUint64(offset, true);
}

function decodeConfig(address: PublicKey, data: Uint8Array): LaunchState {
  if (data.length < 206 || !CONFIG_DISCRIMINATOR.every((byte, index) => data[index] === byte)) {
    throw new Error('The configured account is not an IPO Floor launch config.');
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
    ipoMint: readPublicKey(data, 72),
    ipoVault: readPublicKey(data, 104),
    coreCollection: readPublicKey(data, 136),
    totalSupply: view.getUint16(numericOffset, true),
    minted: view.getUint16(numericOffset + 2, true),
    mintPriceLamports: readU64(view, numericOffset + 4),
    ipoPriceTokens: readU64(view, numericOffset + 12),
    paused: data[numericOffset + 20] === 1,
  };
}

function validateLaunchState(state: LaunchState) {
  if (state.totalSupply !== EXPECTED_SUPPLY) throw new Error('On-chain supply is not 333.');
  if (state.mintPriceLamports !== EXPECTED_SOL_PRICE) throw new Error('On-chain SOL price is not 0.25 SOL.');
  if (state.ipoPriceTokens !== EXPECTED_IPO_PRICE) throw new Error('On-chain IPO lock is not 1,000,000 IPO.');
  if (state.minted > state.totalSupply) throw new Error('On-chain minted count is invalid.');
}

export function getConnection() {
  return new Connection(launchConfig.rpcUrl, 'confirmed');
}

export async function fetchLaunchState(connection = getConnection()) {
  if (!launchConfig.config) throw new Error('Mint configuration is not published yet.');
  const config = new PublicKey(launchConfig.config);
  const programId = new PublicKey(launchConfig.programId);
  const account = await connection.getAccountInfo(config, 'confirmed');
  if (!account) throw new Error('The IPO Floor program is not initialized on this network.');
  if (!account.owner.equals(programId)) throw new Error('The launch config is owned by the wrong program.');
  const state = decodeConfig(config, account.data);
  validateLaunchState(state);
  return state;
}

export async function mintDesk(provider: WalletProvider) {
  if (!provider.publicKey || !provider.signTransaction) {
    throw new Error('This wallet does not support transaction signing.');
  }

  const connection = getConnection();
  const state = await fetchLaunchState(connection);
  if (state.paused) throw new Error('Minting is currently paused.');
  if (state.minted >= state.totalSupply) throw new Error('All 333 desks are minted.');

  const buyer = provider.publicKey;
  const mint = await getMint(connection, state.ipoMint, 'confirmed', TOKEN_PROGRAM_ID);
  const buyerIpoAccount = getAssociatedTokenAddressSync(state.ipoMint, buyer);
  const buyerTokens = await getAccount(connection, buyerIpoAccount, 'confirmed', TOKEN_PROGRAM_ID)
    .catch(() => null);
  const rawIpoRequired = EXPECTED_IPO_PRICE * (10n ** BigInt(mint.decimals));
  if (!buyerTokens || buyerTokens.amount < rawIpoRequired) {
    throw new Error('Wallet needs at least 1,000,000 IPO to mint.');
  }

  const balance = await connection.getBalance(buyer, 'confirmed');
  if (BigInt(balance) <= EXPECTED_SOL_PRICE) {
    throw new Error('Wallet needs more than 0.25 SOL to cover the mint and network rent.');
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
      { pubkey: buyerIpoAccount, isSigner: false, isWritable: true },
      { pubkey: state.ipoVault, isSigner: false, isWritable: true },
      { pubkey: state.ipoMint, isSigner: false, isWritable: false },
      { pubkey: asset.publicKey, isSigner: true, isWritable: true },
      { pubkey: state.coreCollection, isSigner: false, isWritable: true },
      { pubkey: MPL_CORE_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
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
