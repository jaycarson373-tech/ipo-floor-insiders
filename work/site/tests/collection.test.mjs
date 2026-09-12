import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const product = JSON.parse(await readFile(path.join(root, 'product-config.json'), 'utf8'));
const manifest = JSON.parse(await readFile(path.join(root, 'public', 'pumpios', 'preview-manifest.json'), 'utf8'));
const traitCatalog = JSON.parse(await readFile(path.join(root, 'pumpio-traits.json'), 'utf8'));
const blueprint = JSON.parse(await readFile(path.join(root, 'public', 'pumpios', 'trait-blueprint.json'), 'utf8'));

test('Pumpios target economics match the centralized product configuration', () => {
  assert.equal(product.supply, 1_200);
  assert.equal(product.mintPriceLamports, 120_000_000);
  assert.equal(product.mintPriceSol, 0.12);
  assert.equal(product.upgradePolicy.levels, 10);
  assert.equal(product.upgradePolicy.paymentEnabled, false);
  assert.deepEqual(product.draftMintCapitalBps, { rewardAssets: 10_000, operations: 0 });
  assert.deepEqual(product.platformRevenueBps, { holderRewards: 7_000, ipoBuybackBurn: 2_000, protocolOperations: 1_000 });
  assert.equal(product.platformRevenueExecutionEnabled, false);
  assert.equal(manifest.supply, product.supply);
  assert.deepEqual(manifest.mintPrice, { sol: 0.12, lamports: 120_000_000, ipo: 0 });
});

test('platform revenue policy conserves 100% and remains execution-gated', () => {
  assert.equal(Object.values(product.platformRevenueBps).reduce((sum, value) => sum + value, 0), 10_000);
  assert.equal(product.platformRevenueExecutionEnabled, false);
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

test('V3 trait system documents more than 100 traits across meaningful categories', () => {
  const values = traitCatalog.categories.flatMap((category) => Object.values(category.values).flat());
  assert.ok(traitCatalog.categories.length >= 10);
  assert.ok(values.length > 100);
  assert.equal(manifest.uniqueTraitNames, new Set(values.map((value) => value.toLowerCase())).size);
  assert.ok(manifest.uniqueTraitNames > 100);
  assert.equal(manifest.traitCount, values.length);
  assert.equal(manifest.traitCategoryCount, traitCatalog.categories.length);
  assert.ok(traitCatalog.compatibilityRules.length >= 5);
});

test('all 1,200 draft Pumpio trait signatures are deterministic and unique', () => {
  assert.equal(blueprint.status, 'DRAFT_ART_BLUEPRINT');
  assert.equal(blueprint.metadataFinalized, false);
  assert.equal(blueprint.deterministic, true);
  assert.equal(blueprint.items.length, 1_200);
  assert.equal(blueprint.items[0].serial, 1);
  assert.equal(blueprint.items.at(-1).serial, 1_200);
  const signatures = blueprint.items.map((item) => JSON.stringify(item.traits));
  assert.equal(new Set(signatures).size, 1_200);
  assert.equal(manifest.uniqueBlueprintSignatures, 1_200);
});

test('draft rarity assignments preserve the exact planned distribution', () => {
  const counts = Object.fromEntries(manifest.rarityPlan.map(({ label }) => [label, 0]));
  for (const item of blueprint.items) counts[item.rarity] += 1;
  assert.deepEqual(Object.values(counts), [900, 200, 80, 19, 1]);
  assert.equal(blueprint.items.find((item) => item.serial === 1).name, 'The Chairman');
});
