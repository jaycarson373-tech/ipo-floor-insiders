import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCollection, mplCore } from '@metaplex-foundation/mpl-core';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const deployerPath = path.join(root, 'keys', 'deployer-authority.json');
const collectionPath = path.join(root, 'keys', 'core-collection.json');
const programKeypairPath = path.join(root, 'program', 'target', 'deploy', 'program-keypair.json');
const rpcUrl = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const treasuryValue = process.env.TREASURY_WALLET ?? '5AjpQUTJSD4PJAx7v6saLv1wLwABk7pJn83q9tgiX875';
const assetTreasuryValue = process.env.ASSET_TREASURY_WALLET;
const metadataBaseUrl = process.env.METADATA_BASE_URL ?? 'https://ipo-floor-insiders.vercel.app/api/metadata';
const collectionMetadataUrl = process.env.COLLECTION_METADATA_URL
  ?? 'https://ipo-floor-insiders.vercel.app/collection/manifest.json';
const execute = process.env.EXECUTE === 'true';

if (!assetTreasuryValue) {
  throw new Error('ASSET_TREASURY_WALLET is required and must differ from TREASURY_WALLET.');
}
if (rpcUrl.includes('mainnet') && process.env.CONFIRM_MAINNET !== 'IPO') {
  throw new Error('Mainnet is selected. Set CONFIRM_MAINNET=IPO after reviewing the printed addresses.');
}
if (!metadataBaseUrl.startsWith('https://')) {
  throw new Error('METADATA_BASE_URL must be a public HTTPS URL.');
}

const readKeypair = (filename) => Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(filename, 'utf8'))),
);
const payer = readKeypair(deployerPath);
const collectionKeypair = readKeypair(collectionPath);
const programId = readKeypair(programKeypairPath).publicKey;
const treasury = new PublicKey(treasuryValue);
const assetTreasury = new PublicKey(assetTreasuryValue);
if (assetTreasury.equals(treasury)) throw new Error('Asset capital and operations must use separate treasury addresses.');
const connection = new Connection(rpcUrl, 'confirmed');
const [config] = PublicKey.findProgramAddressSync(
  [Buffer.from('config'), payer.publicKey.toBuffer()],
  programId,
);

console.log('IPO launch configuration');
console.log('RPC:             ', rpcUrl);
console.log('Authority:       ', payer.publicKey.toBase58());
console.log('Program:         ', programId.toBase58());
console.log('Config PDA:      ', config.toBase58());
console.log('Treasury:        ', treasury.toBase58());
console.log('Asset treasury:  ', assetTreasury.toBase58());
console.log('Core collection: ', collectionKeypair.publicKey.toBase58());
console.log('Metadata:        ', metadataBaseUrl);
console.log('Mode:            ', execute ? 'EXECUTE' : 'DRY RUN');

const [programAccount, configAccount] = await Promise.all([
  connection.getAccountInfo(programId, 'confirmed'),
  connection.getAccountInfo(config, 'confirmed'),
]);
if (!programAccount?.executable) throw new Error('Deploy the IPO program before initialization.');

if (configAccount) {
  console.log('Config already initialized; no transaction sent.');
  printSiteEnvironment();
  process.exit(0);
}
if (!execute) {
  console.log('Dry run complete. Set EXECUTE=true to create the collection and config.');
  process.exit(0);
}

const umi = createUmi(rpcUrl).use(mplCore());
const umiPayer = createSignerFromKeypair(
  umi,
  umi.eddsa.createKeypairFromSecretKey(payer.secretKey),
);
umi.use(keypairIdentity(umiPayer));
const collectionSigner = createSignerFromKeypair(
  umi,
  umi.eddsa.createKeypairFromSecretKey(collectionKeypair.secretKey),
);

if (!(await connection.getAccountInfo(collectionKeypair.publicKey, 'confirmed'))) {
  const builder = createCollection(umi, {
    collection: collectionSigner,
    updateAuthority: publicKey(config.toBase58()),
    name: 'IPO Desks',
    uri: collectionMetadataUrl,
  });
  const latest = await umi.rpc.getLatestBlockhash({ commitment: 'confirmed' });
  builder.setBlockhash(latest);
  const transaction = await builder.buildAndSign(umi);
  const simulation = await umi.rpc.simulateTransaction(transaction, {
    commitment: 'confirmed',
    verifySignatures: true,
  });
  if (simulation.err) {
    throw new Error(`Collection simulation failed: ${simulation.logs?.slice(-4).join(' | ')}`);
  }
  const signature = await umi.rpc.sendTransaction(transaction, {
    commitment: 'confirmed',
    maxRetries: 3,
  });
  const result = await umi.rpc.confirmTransaction(signature, {
    commitment: 'confirmed',
    strategy: { type: 'blockhash', ...latest },
  });
  if (result.value.err) throw new Error('Collection transaction failed during confirmation.');
  console.log('Core collection created.');
}

const uriBytes = Buffer.from(metadataBaseUrl, 'utf8');
const initializeData = Buffer.alloc(8 + 32 + 32 + 4 + uriBytes.length);
Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]).copy(initializeData, 0);
treasury.toBuffer().copy(initializeData, 8);
assetTreasury.toBuffer().copy(initializeData, 40);
initializeData.writeUInt32LE(uriBytes.length, 72);
uriBytes.copy(initializeData, 76);

const initializeInstruction = new TransactionInstruction({
  programId,
  keys: [
    { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    { pubkey: config, isSigner: false, isWritable: true },
    { pubkey: collectionKeypair.publicKey, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ],
  data: initializeData,
});
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
const setupTransaction = new Transaction({
  feePayer: payer.publicKey,
  blockhash,
  lastValidBlockHeight,
}).add(
  initializeInstruction,
);
setupTransaction.sign(payer);
const setupSimulation = await connection.simulateTransaction(setupTransaction);
if (setupSimulation.value.err) {
  throw new Error(`Initialization simulation failed: ${setupSimulation.value.logs?.slice(-4).join(' | ')}`);
}
const setupSignature = await connection.sendRawTransaction(setupTransaction.serialize(), {
  maxRetries: 3,
  preflightCommitment: 'confirmed',
});
const setupConfirmation = await connection.confirmTransaction(
  { signature: setupSignature, blockhash, lastValidBlockHeight },
  'confirmed',
);
if (setupConfirmation.value.err) throw new Error('Initialization failed during confirmation.');

console.log('Program initialized:', setupSignature);
printSiteEnvironment();

function printSiteEnvironment() {
  console.log('\nPublish these site environment variables:');
  console.log(`NEXT_PUBLIC_SOLANA_CLUSTER=${rpcUrl.includes('mainnet') ? 'mainnet-beta' : 'devnet'}`);
  console.log(`NEXT_PUBLIC_SOLANA_RPC_URL=${rpcUrl}`);
  console.log(`NEXT_PUBLIC_IPO_PROGRAM_ID=${programId.toBase58()}`);
  console.log(`NEXT_PUBLIC_IPO_CONFIG=${config.toBase58()}`);
  console.log(`NEXT_PUBLIC_TREASURY_WALLET=${treasury.toBase58()}`);
  console.log(`NEXT_PUBLIC_ASSET_TREASURY_WALLET=${assetTreasury.toBase58()}`);
  console.log(`NEXT_PUBLIC_CORE_COLLECTION=${collectionKeypair.publicKey.toBase58()}`);
  console.log(`NEXT_PUBLIC_METADATA_BASE_URL=${metadataBaseUrl}`);
}
