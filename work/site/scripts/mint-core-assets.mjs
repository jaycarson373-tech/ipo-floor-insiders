import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { create, createCollection, mplCore } from '@metaplex-foundation/mpl-core';
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  publicKey,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import product from '../product-config.json' with { type: 'json' };

const RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR ?? path.join(os.homedir(), '.config/solana/id.json');
const METADATA_BASE_URL = process.env.METADATA_BASE_URL;
const OWNER = process.env.OWNER_WALLET;
const COLLECTION = process.env.CORE_COLLECTION;
const COLLECTION_KEYPAIR_PATH = process.env.CORE_COLLECTION_KEYPAIR;
const COLLECTION_METADATA_URI = process.env.COLLECTION_METADATA_URI;
const CREATE_COLLECTION = process.env.CREATE_COLLECTION === 'true';
const START_SERIAL = Number(process.env.START_SERIAL ?? '1');
const COUNT = Number(process.env.COUNT ?? '1');

if (process.env.PUMPIOS_METADATA_FINALIZED !== 'true') {
  throw new Error('Pumpio metadata is preview-only. Set PUMPIOS_METADATA_FINALIZED=true only after the 1,200-item collection is reviewed and frozen.');
}

if (!METADATA_BASE_URL) {
  throw new Error('METADATA_BASE_URL is required. Publish finalized Pumpio metadata before minting.');
}

if (!OWNER) {
  throw new Error('OWNER_WALLET is required. Use the buyer wallet for final asset ownership.');
}

const secret = JSON.parse(await readFile(KEYPAIR_PATH, 'utf8'));
const umi = createUmi(RPC_URL).use(mplCore());
umi.use(keypairIdentity(umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret))));

async function ensureCollection() {
  if (!COLLECTION && !COLLECTION_METADATA_URI) {
    throw new Error('COLLECTION_METADATA_URI is required when creating the Pumpios Core collection.');
  }

  if (COLLECTION_KEYPAIR_PATH && CREATE_COLLECTION) {
    const collectionSecret = JSON.parse(await readFile(COLLECTION_KEYPAIR_PATH, 'utf8'));
    const collectionKeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(collectionSecret));
    const collection = createSignerFromKeypair(umi, collectionKeypair);
    await createCollection(umi, {
      collection,
      name: 'Pumpios',
      uri: COLLECTION_METADATA_URI,
    }).sendAndConfirm(umi);
    console.log(`Created Core collection: ${collection.publicKey}`);
    return collection.publicKey;
  }

  if (COLLECTION) {
    return publicKey(COLLECTION);
  }

  const collection = generateSigner(umi);
  await createCollection(umi, {
    collection,
    name: 'Pumpios',
    uri: COLLECTION_METADATA_URI,
  }).sendAndConfirm(umi);
  console.log(`Created Core collection: ${collection.publicKey}`);
  return collection.publicKey;
}

const collection = await ensureCollection();

if (!Number.isInteger(START_SERIAL) || !Number.isInteger(COUNT) || START_SERIAL < 1 || COUNT < 1) {
  throw new Error('START_SERIAL and COUNT must be positive integers.');
}

if (START_SERIAL + COUNT - 1 > product.supply) {
  throw new Error(`Requested serial range exceeds the configured ${product.supply} Pumpio supply.`);
}

for (let serial = START_SERIAL; serial < START_SERIAL + COUNT; serial += 1) {
  const pumpioId = `PUMPIO-${String(serial).padStart(4, '0')}`;
  const asset = generateSigner(umi);
  const uri = `${METADATA_BASE_URL.replace(/\/$/, '')}/${pumpioId}.json`;

  await create(umi, {
    asset,
    collection,
    owner: publicKey(OWNER),
    name: `Pumpio #${String(serial).padStart(4, '0')}`,
    uri,
  }).sendAndConfirm(umi);

  console.log(`Minted Core asset ${pumpioId}: ${asset.publicKey}`);
}
