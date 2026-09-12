import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const collectionDir = new URL('../public/collection/', import.meta.url);
const imageDir = new URL('./images/', collectionDir);
const metadataDir = new URL('./metadata/', collectionDir);
const product = JSON.parse(await readFile(new URL('../product-config.json', import.meta.url), 'utf8'));

const levels = ['Member', 'Researcher', 'Analyst', 'Strategist', 'Director'];
const materials = [
  { name: 'black titanium', top: '#1b1f1d', edge: '#5c6460', inset: '#0a0d0c', gleam: '#aeb7b0' },
  { name: 'smoked glass', top: '#102124', edge: '#527277', inset: '#081012', gleam: '#9fcbd0' },
  { name: 'dark walnut', top: '#281b15', edge: '#82563d', inset: '#100b09', gleam: '#ca9671' },
  { name: 'white ceramic', top: '#d9d7ce', edge: '#817f77', inset: '#1c201e', gleam: '#ffffff' },
  { name: 'carbon weave', top: '#171919', edge: '#4a504e', inset: '#080a09', gleam: '#8d9591' },
];
const chambers = ['issuance hall', 'curve foundry', 'prospectus archive', 'market observatory', 'settlement vault'];
const rings = ['halo', 'twin rail', 'crescent gate', 'orbital', 'split arc'];
const terminalLayouts = ['wing pair', 'stepped array', 'broker slab', 'signal pods', 'market wall'];
const documents = ['prospectus folio', 'term sheet stack', 'allocation tape', 'glass ledger', 'launch docket'];
const signals = [
  { name: 'acid lime', accent: '#b9ff39', secondary: '#63dec1' },
  { name: 'signal cyan', accent: '#63dec1', secondary: '#b9ff39' },
  { name: 'filing amber', accent: '#f2c76d', secondary: '#ff7b68' },
  { name: 'coral close', accent: '#ff7b68', secondary: '#89b8ff' },
];

const hash = (value) => createHash('sha256').update(value).digest();
const number = (seed, offset = 0) => seed.readUInt32BE(offset % 28);
const pick = (items, seed, offset) => items[number(seed, offset) % items.length];
const serialLabel = (serial) => String(serial).padStart(4, '0');
const idFor = (serial) => `IPO-${serialLabel(serial)}`;

function rarityFor(seed) {
  const roll = number(seed, 20) % 10_000;
  if (roll < 100) return ['Mythic', 5];
  if (roll < 600) return ['Epic', 4];
  if (roll < 2_000) return ['Rare', 3];
  if (roll < 4_500) return ['Uncommon', 2];
  return ['Common', 1];
}

function traitsFor(serial) {
  const seed = hash(`ipo-launch-console-${serial}`);
  const [rarity, rarityScore] = rarityFor(seed);
  return {
    seed,
    signature: seed.subarray(0, 4).toString('hex').toUpperCase(),
    rarity,
    rarityScore,
    material: pick(materials, seed, 1),
    chamber: chambers[Math.min(chambers.length - 1, rarityScore - 1)],
    ring: pick(rings, seed, 7),
    terminalLayout: pick(terminalLayouts, seed, 11),
    document: pick(documents, seed, 15),
    signal: pick(signals, seed, 19),
  };
}

function chartPath(seed, offset, x, y, width, height) {
  return Array.from({ length: 8 }, (_, i) => {
    const px = x + (i * width) / 7;
    const py = y + height - (number(seed, offset + i) % height);
    return `${Math.round(px)},${Math.round(py)}`;
  }).join(' ');
}

function terminal(t, index, x, y, scale = 1, mirror = false) {
  const { accent, secondary } = t.signal;
  const transform = `translate(${x} ${y}) scale(${mirror ? -scale : scale} ${scale})`;
  const chart = chartPath(t.seed, index * 3, 26, 62, 168, 58);
  const bars = Array.from({ length: 6 }, (_, i) => {
    const height = 10 + (number(t.seed, index + i + 8) % 38);
    return `<rect x="${30 + i * 25}" y="${142 - height}" width="12" height="${height}" fill="${i % 2 ? secondary : accent}" opacity="${i % 2 ? '.32' : '.58'}"/>`;
  }).join('');
  return `<g transform="${transform}"><path d="M0 24L220 0V168L0 192Z" fill="#070a09" stroke="#5b6560" stroke-width="6"/><path d="M14 34L206 14V154L14 174Z" fill="#0d1512" stroke="${accent}" stroke-width="2" opacity=".96"/><path d="M26 48H116" stroke="${secondary}" stroke-width="6" opacity=".7"/><path d="M26 57H82" stroke="#88908b" stroke-width="4" opacity=".38"/><polyline points="${chart}" fill="none" stroke="${accent}" stroke-width="5" stroke-linejoin="bevel"/>${bars}<path d="M84 184h54l18 45H62z" fill="#1f2522" stroke="#4f5954" stroke-width="4"/></g>`;
}

function chamberScene(t, level) {
  const { accent, secondary } = t.signal;
  const rarityDepth = 18 + t.rarityScore * 8;
  const ribs = Array.from({ length: 9 }, (_, i) => {
    const x = 94 + i * 126;
    return `<path d="M${x} 116L${600 + (x - 600) * .38} 546" stroke="#323b37" stroke-width="${i % 2 ? 5 : 9}" opacity=".58"/>`;
  }).join('');
  const skyline = Array.from({ length: 12 }, (_, i) => {
    const height = 55 + number(t.seed, i + 4) % 170;
    return `<path d="M${72 + i * 92} 430v-${height}h${52 + (i % 3) * 10}v${height}" fill="#111816" stroke="#27312d" stroke-width="4"/><rect x="${83 + i * 92}" y="${430 - height + 18}" width="8" height="8" fill="${i % 3 ? '#66706a' : accent}" opacity=".34"/>`;
  }).join('');
  const architecture = t.chamber === 'prospectus archive'
    ? Array.from({ length: 6 }, (_, i) => `<path d="M70 ${188 + i * 46}h270M860 ${188 + i * 46}h270" stroke="#4a4035" stroke-width="6"/><rect x="${95 + i * 31}" y="${160 + i * 46}" width="16" height="25" fill="${i % 2 ? accent : secondary}" opacity=".38"/>`).join('')
    : skyline;
  const ceiling = level >= 4 ? `<ellipse cx="600" cy="158" rx="${310 + rarityDepth}" ry="92" fill="none" stroke="${accent}" stroke-width="6" opacity=".24"/><ellipse cx="600" cy="158" rx="220" ry="56" fill="none" stroke="#8e9791" stroke-width="3" opacity=".22"/>` : '';
  return `<defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#050706"/><stop offset="1" stop-color="#17201c"/></linearGradient><linearGradient id="desk" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${t.material.gleam}" stop-opacity=".34"/><stop offset=".16" stop-color="${t.material.top}"/><stop offset="1" stop-color="${t.material.inset}"/></linearGradient><radialGradient id="pool"><stop stop-color="${accent}" stop-opacity=".28"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1200" height="1200" fill="#050706"/><rect x="34" y="34" width="1132" height="1132" fill="url(#wall)" stroke="#303a35" stroke-width="7"/><path d="M34 728L412 470h376l378 258v438H34z" fill="#0b100e"/>${ribs}${architecture}${ceiling}<ellipse cx="600" cy="650" rx="470" ry="260" fill="url(#pool)"/><path d="M34 772h1132M78 1166L414 486M1122 1166L786 486" stroke="#34403a" stroke-width="4" opacity=".48"/><path d="M122 1114L600 758l478 356" fill="none" stroke="${secondary}" stroke-width="3" opacity=".16"/>`;
}

function terminalArray(t, level) {
  const count = Math.min(6, level + Math.floor(t.rarityScore / 2));
  const pieces = [terminal(t, 1, 112, 360, .78), terminal(t, 2, 1088, 360, .78, true)];
  if (count >= 3) pieces.push(terminal(t, 3, 250, 238, .66));
  if (count >= 4) pieces.push(terminal(t, 4, 950, 238, .66, true));
  if (count >= 5) pieces.push(terminal(t, 5, 432, 174, .62));
  if (count >= 6) pieces.push(terminal(t, 6, 768, 174, .62, true));
  return pieces.join('');
}

function launchRail(t, level) {
  const { accent, secondary } = t.signal;
  const reach = 520 - level * 58;
  const branch = t.ring === 'split arc' || t.ring === 'twin rail';
  const main = `<path d="M600 646C688 584 796 ${reach} 1014 ${192 - level * 12}" fill="none" stroke="#202724" stroke-width="38"/><path d="M600 646C688 584 796 ${reach} 1014 ${192 - level * 12}" fill="none" stroke="${accent}" stroke-width="10" filter="url(#glow)"/>`;
  const second = branch ? `<path d="M600 646C512 584 404 ${reach} 186 ${192 - level * 12}" fill="none" stroke="#202724" stroke-width="30"/><path d="M600 646C512 584 404 ${reach} 186 ${192 - level * 12}" fill="none" stroke="${secondary}" stroke-width="7" opacity=".82"/>` : '';
  const markers = Array.from({ length: level + 2 }, (_, i) => {
    const x = 646 + i * (310 / (level + 1));
    const y = 602 - i * (340 / (level + 1));
    return `<g transform="translate(${x} ${y})"><ellipse rx="24" ry="10" fill="#111613" stroke="${accent}" stroke-width="4"/><path d="M0-18v36" stroke="${accent}" stroke-width="3" opacity=".75"/></g>`;
  }).join('');
  return `<g>${main}${second}${markers}</g>`;
}

function offeringConsole(t, level) {
  const { accent, secondary } = t.signal;
  const ringRadius = 112 + level * 18 + t.rarityScore * 4;
  const tier = Array.from({ length: Math.min(4, level) }, (_, i) => `<ellipse cx="600" cy="${690 - i * 10}" rx="${ringRadius + 42 + i * 24}" ry="${74 + i * 11}" fill="none" stroke="${i % 2 ? secondary : accent}" stroke-width="${8 - i}" opacity="${.52 - i * .08}"/>`).join('');
  const papers = Array.from({ length: Math.min(5, level + 1) }, (_, i) => {
    const x = 182 + i * 108;
    return `<g transform="translate(${x} ${904 + (i % 2) * 20}) rotate(${(number(t.seed, i + 17) % 9) - 4})"><path d="M0 0h88l16 58H14z" fill="#dedbd0" stroke="#292d2a" stroke-width="4"/><path d="M17 18h52M21 31h61M25 44h37" stroke="#626862" stroke-width="4"/></g>`;
  }).join('');
  const pylons = level >= 3 ? `<path d="M92 822h86l28 168H70zM1022 822h86l22 168h-108z" fill="${t.material.inset}" stroke="${t.material.edge}" stroke-width="6"/><path d="M107 862h65M1036 862h58" stroke="${accent}" stroke-width="8"/>` : '';
  const keys = Array.from({ length: 14 }, (_, i) => `<rect x="${430 + i * 24}" y="${858 + (i % 3) * 18}" width="15" height="10" fill="${i % 5 ? '#707873' : accent}" opacity=".72"/>`).join('');
  return `<g><path d="M104 688L600 566l496 122 76 392H28z" fill="url(#desk)" stroke="${t.material.edge}" stroke-width="10"/><path d="M142 742L600 632l458 110 42 252H100z" fill="${t.material.inset}" stroke="#3c4540" stroke-width="5"/>${pylons}<ellipse cx="600" cy="700" rx="${ringRadius + 96}" ry="${ringRadius * .62 + 52}" fill="#070a09" stroke="${t.material.edge}" stroke-width="8"/>${tier}<ellipse cx="600" cy="676" rx="${ringRadius}" ry="${ringRadius * .54}" fill="#0c1511" stroke="${accent}" stroke-width="9" filter="url(#glow)"/><ellipse cx="600" cy="664" rx="${ringRadius - 38}" ry="${ringRadius * .34}" fill="${accent}" opacity=".12"/><g transform="translate(600 646)"><ellipse rx="58" ry="24" fill="#dfe4dc" fill-opacity=".16" stroke="#eff5ee" stroke-width="5"/><path d="M-46 0h92M0-22v44" stroke="${accent}" stroke-width="5"/><ellipse cy="-18" rx="38" ry="15" fill="${accent}" opacity=".18"/></g><path d="M420 834h360l34 102H386z" fill="#090c0b" stroke="#56605b" stroke-width="6"/>${keys}${papers}<g transform="translate(918 888)"><path d="M0 0h104l20 126H16z" fill="#101714" stroke="${secondary}" stroke-width="5"/><circle cx="58" cy="38" r="12" fill="${accent}" opacity=".72"/><path d="M32 72h58M38 89h42" stroke="#8d9690" stroke-width="5"/></g></g>`;
}

function artwork(serial, level) {
  const t = traitsFor(serial);
  const id = idFor(serial);
  const { accent, secondary } = t.signal;
  const rail = level >= 2 ? launchRail(t, level) : '';
  const pixels = Array.from({ length: 44 }, (_, i) => `<rect x="${number(t.seed, i) % 1200}" y="${number(t.seed, i + 9) % 1200}" width="${i % 4 ? 4 : 8}" height="4" fill="${i % 3 ? accent : secondary}" opacity=".12"/>`).join('');
  const rareHalo = t.rarityScore >= 4 ? `<ellipse cx="600" cy="654" rx="430" ry="230" fill="none" stroke="${secondary}" stroke-width="4" opacity=".18"/><path d="M180 654h840" stroke="${accent}" stroke-width="3" opacity=".12"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><title>${id} ${t.rarity} ${levels[level - 1]} launch console</title><desc>An architectural IPO launch chamber and research workspace with no people or company affiliation.</desc>${chamberScene(t, level)}${terminalArray(t, level)}${rail}${rareHalo}${offeringConsole(t, level)}${pixels}<g><path d="M58 58h216v58H58z" fill="#070a09" stroke="${accent}" stroke-width="3"/><text x="82" y="96" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-weight="800" font-size="22" fill="#f1efe7">IPO #${serialLabel(serial)}</text></g><g><path d="M942 58h200v58H942z" fill="#070a09" stroke="#46504b" stroke-width="3"/><text x="1042" y="95" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="17" fill="${accent}">${t.signature}</text></g><text x="82" y="1130" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="17" fill="#89918c">${t.material.name.toUpperCase()} / ${t.ring.toUpperCase()}</text></svg>`;
}

async function generateDesk(serial) {
  const id = idFor(serial);
  const t = traitsFor(serial);
  for (let level = 1; level <= product.maxLevels; level += 1) {
    await writeFile(new URL(`${id}-L${level}.svg`, imageDir), artwork(serial, level));
  }
  const metadata = {
    name: `IPO Desk #${serialLabel(serial)}`,
    symbol: 'IPO',
    description: 'A collectible IPO launch console represented by an architectural issuance chamber. Holder rewards and launch features require published, funded terms; no company shares, allocation, or financial return is guaranteed.',
    image: `images/${id}-L1.svg`,
    attributes: [
      { trait_type: 'Rarity', value: t.rarity },
      { trait_type: 'Chamber', value: t.chamber },
      { trait_type: 'Offering Ring', value: t.ring },
      { trait_type: 'Terminal Layout', value: t.terminalLayout },
      { trait_type: 'Material', value: t.material.name },
      { trait_type: 'Signal', value: t.signal.name },
      { trait_type: 'Document System', value: t.document },
      { trait_type: 'Desk Serial', value: serial },
    ],
    properties: {
      category: 'image',
      files: Array.from({ length: product.maxLevels }, (_, i) => ({ uri: `images/${id}-L${i + 1}.svg`, type: 'image/svg+xml' })),
      upgrade_images: Array.from({ length: product.maxLevels }, (_, i) => ({ level: i + 1, status: levels[i], uri: `images/${id}-L${i + 1}.svg` })),
      seed: `ipo-launch-console-${serial}`,
      visual_signature: t.signature,
    },
  };
  await writeFile(new URL(`${id}.json`, metadataDir), `${JSON.stringify(metadata, null, 2)}\n`);
}

await rm(imageDir, { recursive: true, force: true });
await rm(metadataDir, { recursive: true, force: true });
await mkdir(imageDir, { recursive: true });
await mkdir(metadataDir, { recursive: true });
for (let serial = 1; serial <= product.supply; serial += 1) await generateDesk(serial);

await writeFile(new URL('manifest.json', collectionDir), `${JSON.stringify({
  name: 'IPO Launch Consoles', symbol: 'IPO', standard: 'Metaplex Core', supply: product.supply,
  mintPrice: { sol: product.mintPriceSol, lamports: product.mintPriceLamports, ipo: 0 },
  mintAllocation: '100% of the mint price is attributed to the minted desk as mint-funded asset capital; network and account costs are separate.',
  rewardParticipation: 'Equal base participation per eligible desk; terms published per program.',
  upgradeLevels: levels, assetCategory: 'IPO project launch membership and research', securitiesAccess: false,
  artDirection: 'Architectural offering consoles with a shared three-quarter silhouette, launch rings, curve rails, terminal arrays, and precision material variations.',
}, null, 2)}\n`);
console.log(`Generated ${product.supply} IPO Launch Consoles with ${product.maxLevels} architectural stages each.`);
