import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const product = JSON.parse(await readFile(path.join(root, 'product-config.json'), 'utf8'));
const manifest = JSON.parse(await readFile(path.join(root, 'public', 'pumpios', 'preview-manifest.json'), 'utf8'));

test('Pumpios target economics match the centralized product configuration', () => {
  assert.equal(product.supply, 1_200);
  assert.equal(product.mintPriceLamports, 120_000_000);
  assert.equal(product.mintPriceSol, 0.12);
  assert.equal(product.upgradePolicy.levels, 10);
  assert.equal(product.upgradePolicy.paymentEnabled, false);
  assert.deepEqual(product.draftMintCapitalBps, { rewardAssets: 10_000, operations: 0 });
  assert.equal(manifest.supply, product.supply);
  assert.deepEqual(manifest.mintPrice, { sol: 0.12, lamports: 120_000_000, ipo: 0 });
});

test('preview rarity plan totals exactly 1,200 without claiming finalized metadata', () => {
  assert.equal(manifest.rarityPlan.reduce((sum, item) => sum + item.count, 0), 1_200);
  assert.deepEqual(manifest.rarityPlan.map((item) => item.count), [900, 200, 80, 19, 1]);
  assert.equal(manifest.metadataFinalized, false);
  assert.equal(manifest.collectionDeployed, false);
  assert.equal(manifest.status, 'COLLECTION PREVIEW');
});

test('approved Pumpio preview assets exist and retain a single Chairman concept', async () => {
  assert.equal(manifest.previews.length, 9);
  assert.equal(manifest.previews.filter((item) => item.rarity === 'CHAIRMAN').length, 1);
  const sources = new Set(manifest.previews.map((item) => item.source));
  for (const source of sources) {
    const file = path.resolve(root, 'public', 'pumpios', source);
    assert.ok((await stat(file)).size > 100_000, `${source} is a complete preview asset`);
  }
});
