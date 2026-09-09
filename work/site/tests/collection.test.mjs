import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const collection = path.join(root, 'public', 'collection');
const imageDir = path.join(collection, 'images');
const metadataDir = path.join(collection, 'metadata');
const product = JSON.parse(await readFile(path.join(root, 'product-config.json'), 'utf8'));

test('collection matches the centralized product configuration', async () => {
  const manifest = JSON.parse(await readFile(path.join(collection, 'manifest.json'), 'utf8'));
  assert.equal(manifest.supply, product.supply);
  assert.equal(manifest.mintPrice.sol, product.mintPriceSol);
  assert.equal(manifest.mintPrice.lamports, product.mintPriceLamports);
  assert.equal(product.mintPriceLamports, 120_000_000);
  assert.equal(manifest.mintPrice.ipo, 0);
  assert.match(manifest.rewardParticipation, /Equal base participation/);
  assert.equal(Object.values(product.defaultFeeSharesBps).reduce((sum, value) => sum + value, 0), 10_000);
  assert.equal(Object.values(product.draftMintCapitalBps).reduce((sum, value) => sum + value, 0), 10_000);
  assert.deepEqual(product.draftMintCapitalBps, { rewardAssets: 8_000, operations: 2_000 });
});

test('collection contains every complete deterministic IPO Desk', async () => {
  const metadataFiles = (await readdir(metadataDir)).filter((file) => file.endsWith('.json')).sort();
  const levelOneHashes = new Set();
  assert.equal(metadataFiles.length, product.supply);

  for (const file of metadataFiles) {
    const id = file.slice(0, -5);
    const metadata = JSON.parse(await readFile(path.join(metadataDir, file), 'utf8'));
    assert.match(id, /^IPO-\d{4}$/);
    assert.equal(metadata.image, `images/${id}-L1.svg`);
    assert.match(metadata.properties.visual_signature, /^[A-F0-9]{8}$/);
    assert.ok(!/hood|insider|glowing eyes/i.test(metadata.description));
    assert.match(metadata.description, /no company shares/i);

    for (let level = 1; level <= product.maxLevels; level += 1) {
      const image = await readFile(path.join(imageDir, `${id}-L${level}.svg`));
      const source = image.toString('utf8');
      assert.ok(image.length > 5_000, `${id} L${level} has complete artwork`);
      assert.match(source, /architectural IPO research workspace/);
      assert.ok(!/<image\b|hood|eye glow/i.test(source));
      if (level === 1) levelOneHashes.add(createHash('sha256').update(image).digest('hex'));
    }
  }
  assert.equal(levelOneHashes.size, product.supply, 'every L1 desk has distinct artwork');
});

test('first and final IDs exist with all five levels', async () => {
  for (const id of ['IPO-0001', 'IPO-1212']) {
    for (let level = 1; level <= product.maxLevels; level += 1) {
      const source = await readFile(path.join(imageDir, `${id}-L${level}.svg`), 'utf8');
      assert.match(source, new RegExp(id));
    }
  }
});
