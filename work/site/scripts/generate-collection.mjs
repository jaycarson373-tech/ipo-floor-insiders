import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const product = JSON.parse(await readFile(new URL('../product-config.json', import.meta.url), 'utf8'));
const outputDir = new URL('../public/pumpios/', import.meta.url);

const rarityPlan = [
  { label: 'STANDARD', count: 900 },
  { label: 'RARE', count: 200 },
  { label: 'SUPER RARE', count: 80 },
  { label: 'LEGENDARY', count: 19 },
  { label: 'CHAIRMAN', count: 1 },
];

const previews = [
  { id: 421, name: 'The Intern', rarity: 'STANDARD', source: '../pumpios-preview-standard-v1.png', quadrant: 0 },
  { id: 187, name: 'The Analyst', rarity: 'STANDARD', source: '../pumpios-preview-standard-v1.png', quadrant: 1 },
  { id: 333, name: 'The Market Maker', rarity: 'RARE', source: '../pumpios-preview-standard-v1.png', quadrant: 2 },
  { id: 674, name: 'The Bookrunner', rarity: 'RARE', source: '../pumpios-preview-standard-v1.png', quadrant: 3 },
  { id: 808, name: 'The Quant', rarity: 'SUPER RARE', source: '../pumpios-preview-rare-v1.png', quadrant: 0 },
  { id: 999, name: 'The Whale', rarity: 'SUPER RARE', source: '../pumpios-preview-rare-v1.png', quadrant: 1 },
  { id: 777, name: 'The Printer', rarity: 'LEGENDARY', source: '../pumpios-preview-rare-v1.png', quadrant: 2 },
  { id: 1199, name: 'The Golden Pump', rarity: 'LEGENDARY', source: '../pumpios-preview-rare-v1.png', quadrant: 3 },
  { id: 1, name: 'The Chairman', rarity: 'CHAIRMAN', source: '../pumpio-chairman-reference.jpg' },
];

const plannedTotal = rarityPlan.reduce((sum, item) => sum + item.count, 0);
if (plannedTotal !== product.supply) throw new Error(`Rarity plan totals ${plannedTotal}; expected ${product.supply}.`);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await writeFile(new URL('preview-manifest.json', outputDir), `${JSON.stringify({
  name: 'Pumpios',
  symbol: 'PUMPIO',
  standard: 'Metaplex Core (target)',
  status: 'COLLECTION PREVIEW',
  supply: product.supply,
  mintPrice: { sol: product.mintPriceSol, lamports: product.mintPriceLamports, ipo: 0 },
  capsuleSilhouetteLocked: true,
  rarityPlan,
  levels: product.upgradePolicy.levels,
  previews,
  metadataFinalized: false,
  collectionDeployed: false,
  note: 'Preview concepts are not minted assets or finalized metadata. No rarity is assigned on-chain by this manifest.',
}, null, 2)}\n`);

console.log(`Generated Pumpios preview manifest: ${previews.length} concepts, ${plannedTotal} planned supply.`);
