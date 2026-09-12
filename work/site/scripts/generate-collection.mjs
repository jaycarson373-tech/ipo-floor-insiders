import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const product = JSON.parse(await readFile(new URL('../product-config.json', import.meta.url), 'utf8'));
const traitConfig = JSON.parse(await readFile(new URL('../pumpio-traits.json', import.meta.url), 'utf8'));
const outputDir = new URL('../public/pumpios/', import.meta.url);

const rarityPlan = [
  { label: 'STANDARD', count: 900 },
  { label: 'RARE', count: 200 },
  { label: 'SUPER RARE', count: 80 },
  { label: 'LEGENDARY', count: 19 },
  { label: 'CHAIRMAN', count: 1 },
];

const previews = [
  { id: 421, name: 'The Intern', rarity: 'STANDARD', source: '../pumpios-preview-standard-v3.png', quadrant: 0 },
  { id: 187, name: 'The Analyst', rarity: 'STANDARD', source: '../pumpios-preview-standard-v3.png', quadrant: 1 },
  { id: 333, name: 'The Market Maker', rarity: 'RARE', source: '../pumpios-preview-standard-v3.png', quadrant: 2 },
  { id: 674, name: 'The Bookrunner', rarity: 'RARE', source: '../pumpios-preview-standard-v3.png', quadrant: 3 },
  { id: 808, name: 'The Quant', rarity: 'SUPER RARE', source: '../pumpios-preview-rare-v3.png', quadrant: 0 },
  { id: 999, name: 'The Whale', rarity: 'SUPER RARE', source: '../pumpios-preview-rare-v3.png', quadrant: 1 },
  { id: 777, name: 'The Printer', rarity: 'LEGENDARY', source: '../pumpios-preview-rare-v3.png', quadrant: 2 },
  { id: 1199, name: 'The Golden Pump', rarity: 'LEGENDARY', source: '../pumpios-preview-rare-v3.png', quadrant: 3 },
  { id: 1, name: 'The Chairman', rarity: 'CHAIRMAN', source: '../pumpio-chairman-v3.png' },
];

const previewTraits = new Map([
  [421, { capsule: 'Classic green / cream', face: 'Deadpan', eyes: 'Signature black', outfit: 'Cheap intern suit', headwear: 'None', eyewear: 'None', heldItem: 'None', neckwear: 'Green tie', background: 'Prospectus yellow', marketArtifact: 'Candlestick fragment', surface: 'Pencil ghosts', statusDetail: 'No badge' }],
  [187, { capsule: 'Blue / cream', face: 'Tired', eyes: 'Heavy lids', outfit: 'Banker vest', headwear: 'None', eyewear: 'None', heldItem: 'Calculator', neckwear: 'No tie', background: 'Market blue', marketArtifact: 'Price ladder', surface: 'Offset print', statusDetail: 'Margin note' }],
  [333, { capsule: 'Red / cream', face: 'Slightly smug', eyes: 'Side-eye', outfit: 'Pinstripe suit', headwear: 'Trader headset', eyewear: 'None', heldItem: 'None', neckwear: 'Red tie', background: 'Opening red', marketArtifact: 'Order sheet', surface: 'Heavy halftone', statusDetail: 'Market-maker tab' }],
  [674, { capsule: 'Black / acid', face: 'Unimpressed', eyes: 'Market close', outfit: 'Puffer suit', headwear: 'Bookrunner cap', eyewear: 'None', heldItem: 'Coffee', neckwear: 'No tie', background: 'Mint green', marketArtifact: 'Prospectus collage', surface: 'Dry brush', statusDetail: 'Bookrunner stripe' }],
  [808, { capsule: 'Liquid aquarium', face: 'Liquid reflection', eyes: 'Blue screen', outfit: 'Lab coat', headwear: 'None', eyewear: 'None', heldItem: 'Calculator', neckwear: 'Black tie', background: 'Quant lab', marketArtifact: 'Liquid chart', surface: 'Glass scratches', statusDetail: 'Quant notation' }],
  [999, { capsule: 'Mirror chrome', face: 'Deadpan', eyes: 'Chrome reflection', outfit: 'Fur-collar coat', headwear: 'None', eyewear: 'None', heldItem: 'Whale phone', neckwear: 'Gold chain', background: 'Yacht close', marketArtifact: 'Whale wake', surface: 'Chrome scuffs', statusDetail: 'Whale seal' }],
  [777, { capsule: 'Money-filled glass', face: 'Printer stare', eyes: 'Signature black', outfit: 'Pinstripe suit', headwear: 'None', eyewear: 'None', heldItem: 'Printer controls', neckwear: 'Red tie', background: 'Printing house', marketArtifact: 'Infinite green candle', surface: 'Glass scratches', statusDetail: 'Legend plate' }],
  [1199, { capsule: 'Brushed gold', face: 'Chairman calm', eyes: 'Gold market', outfit: 'Golden tuxedo', headwear: 'None', eyewear: 'None', heldItem: 'Golden phone', neckwear: 'Black tie', background: 'Golden vault', marketArtifact: 'Golden book', surface: 'Gold leaf wear', statusDetail: 'Legend plate' }],
  [1, { capsule: 'Classic green / cream', face: 'Chairman calm', eyes: 'Signature black', outfit: 'Chairman double-breasted', headwear: 'Crown emblem', eyewear: 'None', heldItem: 'None', neckwear: 'Chairman pin', background: 'Chairman boardroom', marketArtifact: 'Infinite green candle', surface: 'Paper tooth', statusDetail: 'Chairman seal' }],
]);

const legendaryNames = [
  'The Dev', 'The Market Maker', 'The Whale', 'The Bagholder', 'The Liquidation',
  'The Printer', 'The Insider', 'The Underwriter', 'The Intern', 'The Rug',
  'The Exit', 'The Quant', 'The Degen', 'The Pump Native', 'The Solana Native',
  'The Bookrunner', 'The Green Candle', 'The Red Candle', 'The Golden Pump',
];

function digest(value) {
  return createHash('sha256').update(`${traitConfig.seedNamespace}:${value}`).digest();
}

function rankIds(ids, namespace) {
  return [...ids].sort((a, b) => Buffer.compare(digest(`${namespace}:${a}`), digest(`${namespace}:${b}`)));
}

const fixedRarities = new Map(previews.map((preview) => [preview.id, preview.rarity]));
const rarityById = new Map(fixedRarities);
const availableIds = Array.from({ length: product.supply }, (_, index) => index + 1).filter((id) => !fixedRarities.has(id));
const rankedIds = rankIds(availableIds, 'rarity');
let cursor = 0;

for (const { label, count } of rarityPlan.slice().reverse()) {
  const alreadyFixed = [...fixedRarities.values()].filter((rarity) => rarity === label).length;
  const needed = count - alreadyFixed;
  if (needed < 0) throw new Error(`Too many fixed ${label} previews.`);
  for (const id of rankedIds.slice(cursor, cursor + needed)) rarityById.set(id, label);
  cursor += needed;
}

const tierKey = { STANDARD: 'standard', RARE: 'rare', 'SUPER RARE': 'superRare', LEGENDARY: 'legendary' };
const tierOrder = ['standard', 'rare', 'superRare', 'legendary'];
const focalCategories = new Set(['capsule', 'outfit', 'background']);

function pick(serial, category, rarity) {
  const tier = tierKey[rarity] ?? 'legendary';
  const exact = category.values[tier];
  const pools = tierOrder.slice(0, tierOrder.indexOf(tier) + 1).flatMap((key) => category.values[key]);
  const pool = focalCategories.has(category.id) && tier !== 'standard' ? exact : pools;
  return pool[digest(`${serial}:${category.id}`)[0] % pool.length];
}

function compatibleTraits(serial, rarity) {
  const traits = Object.fromEntries(traitConfig.categories.map((category) => [category.id, pick(serial, category, rarity)]));
  const openCapsules = new Set(['Smoked glass', 'Frosted glass', 'Liquid aquarium', 'Mirror chrome', 'Holographic foil', 'Money-filled glass', 'Radioactive crystal']);
  if (openCapsules.has(traits.capsule)) {
    traits.headwear = 'None';
    traits.eyewear = 'None';
  }
  if (traits.face === 'Skeleton trace' && !['Smoked glass', 'Radioactive crystal'].includes(traits.capsule)) traits.face = 'Deadpan';
  if (serial !== 1) {
    if (traits.headwear === 'Crown emblem') traits.headwear = 'Golden antenna';
    if (traits.statusDetail === 'Chairman seal') traits.statusDetail = 'Legend plate';
    if (traits.neckwear === 'Chairman pin') traits.neckwear = 'IPO medallion';
  }
  return traits;
}

const legendaryIds = rankIds([...rarityById].filter(([, rarity]) => rarity === 'LEGENDARY').map(([id]) => id), 'legendary-name');
const legendaryNameById = new Map(legendaryIds.map((id, index) => [id, legendaryNames[index]]));
const blueprint = Array.from({ length: product.supply }, (_, index) => {
  const serial = index + 1;
  const rarity = rarityById.get(serial);
  if (!rarity) throw new Error(`Missing rarity for Pumpio #${serial}.`);
  return {
    serial,
    seed: digest(`seed:${serial}`).toString('hex').slice(0, 16),
    rarity,
    name: serial === 1 ? 'The Chairman' : legendaryNameById.get(serial) ?? `Pumpio #${String(serial).padStart(4, '0')}`,
    traits: previewTraits.get(serial) ?? compatibleTraits(serial, rarity),
  };
});

const traitCount = traitConfig.categories.reduce((total, category) => total + Object.values(category.values).flat().length, 0);
const uniqueTraitNames = new Set(traitConfig.categories.flatMap((category) => Object.values(category.values).flat()).map((value) => value.toLowerCase())).size;
const signatures = new Set(blueprint.map((item) => JSON.stringify(item.traits)));
if (blueprint.length !== product.supply) throw new Error('Blueprint supply mismatch.');
if (signatures.size !== blueprint.length) throw new Error('Duplicate full trait signatures detected.');

const plannedTotal = rarityPlan.reduce((sum, item) => sum + item.count, 0);
if (plannedTotal !== product.supply) throw new Error(`Rarity plan totals ${plannedTotal}; expected ${product.supply}.`);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await writeFile(new URL('trait-blueprint.json', outputDir), `${JSON.stringify({
  status: 'DRAFT_ART_BLUEPRINT',
  seedNamespace: traitConfig.seedNamespace,
  deterministic: true,
  metadataFinalized: false,
  supply: product.supply,
  items: blueprint,
}, null, 2)}\n`);
await writeFile(new URL('preview-manifest.json', outputDir), `${JSON.stringify({
  name: 'Pumpios',
  symbol: 'PUMPIO',
  standard: 'Metaplex Core (target)',
  status: 'COLLECTION PREVIEW',
  supply: product.supply,
  mintPrice: { sol: product.mintPriceSol, lamports: product.mintPriceLamports, ipo: 0 },
  capsuleSilhouetteLocked: true,
  artDirection: 'Hand-illustrated ink, graphite, gouache, and screen-print aesthetic',
  traitCount,
  uniqueTraitNames,
  traitCategoryCount: traitConfig.categories.length,
  uniqueBlueprintSignatures: signatures.size,
  compatibilityRuleCount: traitConfig.compatibilityRules.length,
  rarityPlan,
  levels: product.upgradePolicy.levels,
  previews,
  blueprint: './trait-blueprint.json',
  metadataFinalized: false,
  collectionDeployed: false,
  note: 'Draft trait blueprints and concept art are not minted assets or finalized metadata. No rarity is assigned on-chain by this manifest.',
}, null, 2)}\n`);

console.log(`Generated Pumpios V3 blueprint: ${blueprint.length} unique drafts, ${traitCount} traits across ${traitConfig.categories.length} categories.`);
