import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rpcUrl = process.env.SOLANA_RPC_URL ?? 'http://127.0.0.1:8899';
const program = readKeypair(path.join(root, 'keys', 'program.json'));
const authority = readKeypair(path.join(root, 'keys', 'deployer-authority.json'));
const [config] = PublicKey.findProgramAddressSync(
  [Buffer.from('config'), authority.publicKey.toBuffer()],
  program.publicKey,
);
const connection = new Connection(rpcUrl, 'confirmed');
const coreProgram = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
const mintDiscriminator = Buffer.from([13, 78, 211, 198, 47, 173, 187, 207]);
const pauseDiscriminator = Buffer.from([63, 32, 154, 2, 56, 103, 79, 45]);

const beforeConfig = await readConfig();
if (beforeConfig.totalSupply !== 1200 || beforeConfig.price !== 120_000_000n) {
  throw new Error(`Unexpected local economics: ${beforeConfig.totalSupply} / ${beforeConfig.price}`);
}
if (beforeConfig.paused) throw new Error('Local mint is paused.');

const buyer = Keypair.generate();
await transfer(authority, buyer.publicKey, 500_000_000);
const serial = beforeConfig.minted + 1;
const asset = Keypair.generate();
const treasuryBefore = await connection.getBalance(beforeConfig.assetTreasury, 'confirmed');
const signature = await mint(serial, buyer, asset);
const afterConfig = await readConfig();
const treasuryAfter = await connection.getBalance(beforeConfig.assetTreasury, 'confirmed');
const assetAccount = await connection.getAccountInfo(asset.publicKey, 'confirmed');

assert(afterConfig.minted === serial, 'Minted counter did not increment exactly once.');
assert(BigInt(treasuryAfter - treasuryBefore) === beforeConfig.price, 'Asset treasury did not receive the exact 0.12 SOL mint price.');
assert(assetAccount?.owner.equals(coreProgram), 'Minted account is not owned by Metaplex Core.');

let duplicateRejected = false;
try {
  await mint(serial, buyer, Keypair.generate());
} catch {
  duplicateRejected = true;
}
assert(duplicateRejected, 'Duplicate serial submission unexpectedly succeeded.');

let insufficientBalanceRejected = false;
try {
  await mint(afterConfig.minted + 1, Keypair.generate(), Keypair.generate());
} catch {
  insufficientBalanceRejected = true;
}
assert(insufficientBalanceRejected, 'An unfunded wallet unexpectedly minted.');

await setPaused(true);
let pausedMintRejected = false;
try {
  await mint(afterConfig.minted + 1, buyer, Keypair.generate());
} catch {
  pausedMintRejected = true;
}
assert(pausedMintRejected, 'A mint unexpectedly succeeded while paused.');
await setPaused(false);

console.log(JSON.stringify({
  status: 'PASS',
  rpcUrl,
  program: program.publicKey.toBase58(),
  config: config.toBase58(),
  serial,
  asset: asset.publicKey.toBase58(),
  signature,
  assetTreasuryIncreaseLamports: treasuryAfter - treasuryBefore,
  duplicateRejected,
  insufficientBalanceRejected,
  pausedMintRejected,
}, null, 2));

async function mint(serialNumber, signer, assetSigner) {
  const state = await readConfig();
  const serialBytes = Buffer.alloc(2);
  serialBytes.writeUInt16LE(serialNumber);
  const [desk] = PublicKey.findProgramAddressSync(
    [Buffer.from('desk'), config.toBuffer(), serialBytes],
    program.publicKey,
  );
  const instruction = new TransactionInstruction({
    programId: program.publicKey,
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: true },
      { pubkey: desk, isSigner: false, isWritable: true },
      { pubkey: state.assetTreasury, isSigner: false, isWritable: true },
      { pubkey: assetSigner.publicKey, isSigner: true, isWritable: true },
      { pubkey: state.coreCollection, isSigner: false, isWritable: true },
      { pubkey: coreProgram, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([mintDiscriminator, serialBytes]),
  });
  const transaction = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
    .add(instruction);
  return sendAndConfirmTransaction(connection, transaction, [signer, assetSigner], {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
}

async function transfer(from, recipient, lamports) {
  const transaction = new Transaction().add(SystemProgram.transfer({
    fromPubkey: from.publicKey,
    toPubkey: recipient,
    lamports,
  }));
  await sendAndConfirmTransaction(connection, transaction, [from], { commitment: 'confirmed' });
}

async function setPaused(paused) {
  const instruction = new TransactionInstruction({
    programId: program.publicKey,
    keys: [
      { pubkey: config, isSigner: false, isWritable: true },
      { pubkey: authority.publicKey, isSigner: true, isWritable: false },
    ],
    data: Buffer.concat([pauseDiscriminator, Buffer.from([paused ? 1 : 0])]),
  });
  await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [authority], {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
}

async function readConfig() {
  const account = await connection.getAccountInfo(config, 'confirmed');
  if (!account?.owner.equals(program.publicKey)) throw new Error('IPO config is missing or has the wrong owner.');
  const view = new DataView(account.data.buffer, account.data.byteOffset, account.data.byteLength);
  const uriLength = view.getUint32(136, true);
  const offset = 140 + uriLength;
  return {
    assetTreasury: new PublicKey(account.data.subarray(72, 104)),
    coreCollection: new PublicKey(account.data.subarray(104, 136)),
    totalSupply: view.getUint16(offset, true),
    minted: view.getUint16(offset + 2, true),
    price: view.getBigUint64(offset + 4, true),
    paused: account.data[offset + 12] === 1,
  };
}

function readKeypair(filename) {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(filename, 'utf8'))));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
