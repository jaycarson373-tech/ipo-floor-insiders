import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const collectionDir = new URL('../public/collection/', import.meta.url);
const imageDir = new URL('./images/', collectionDir);
const metadataDir = new URL('./metadata/', collectionDir);
const product = JSON.parse(await readFile(new URL('../product-config.json', import.meta.url), 'utf8'));

const levels = ['Member', 'Researcher', 'Analyst', 'Strategist', 'Director'];
const materials = [
  ['matte black', '#111514', '#252d2a'],
  ['brushed steel', '#252b2b', '#737b77'],
  ['dark walnut', '#231b17', '#6d4c37'],
  ['smoked glass', '#10191a', '#496164'],
  ['carbon composite', '#111313', '#414846'],
];
const forms = ['cantilever', 'bridge', 'crescent', 'console', 'modular'];
const rooms = ['research studio', 'filing archive', 'analyst pod', 'market library', 'executive observatory'];
const lighting = [
  ['acid lime', '#b8ff38'],
  ['signal cyan', '#65d9e8'],
  ['filing amber', '#f2bd55'],
  ['paper white', '#e8eadf'],
];
const views = ['night city', 'rain glass', 'data wall', 'archive shelving', 'dark atrium'];
const screenSets = ['filing review', 'launch research', 'allocation ledger', 'risk notes', 'market brief'];
const objects = ['research folio', 'desk lamp', 'reference books', 'conference phone', 'model block'];

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
  const seed = hash(`ipo-desk-${serial}`);
  const [rarity, rarityScore] = rarityFor(seed);
  return {
    seed,
    signature: seed.subarray(0, 4).toString('hex').toUpperCase(),
    rarity,
    rarityScore,
    material: pick(materials, seed, 1),
    form: pick(forms, seed, 5),
    room: rooms[Math.min(rooms.length - 1, Math.max(0, rarityScore - 1 + (number(seed, 9) % 2)))],
    light: pick(lighting, seed, 13),
    view: pick(views, seed, 17),
    screenSet: pick(screenSets, seed, 21),
    object: pick(objects, seed, 25),
  };
}

function screen(x, y, width, height, accent, seed, index) {
  const chart = Array.from({ length: 8 }, (_, point) => {
    const px = x + 24 + point * ((width - 48) / 7);
    const py = y + height * .66 - (number(seed, index + point) % Math.floor(height * .34));
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');
  const rows = Array.from({ length: 4 }, (_, row) => {
    const rowWidth = 34 + (number(seed, index + row + 7) % Math.max(36, Math.floor(width - 80)));
    return `<rect x="${x + 22}" y="${y + 30 + row * 20}" width="${rowWidth}" height="5" fill="${row % 2 ? '#87918c' : accent}" opacity="${row % 2 ? '.34' : '.62'}"/>`;
  }).join('');
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#070a09" stroke="#3b4541" stroke-width="6"/><rect x="${x + 12}" y="${y + 12}" width="${width - 24}" height="${height - 24}" rx="3" fill="#0b100e"/>${rows}<polyline points="${chart}" fill="none" stroke="${accent}" stroke-width="5" stroke-linejoin="miter" opacity=".82"/><rect x="${x + width / 2 - 7}" y="${y + height}" width="14" height="42" fill="#2b312f"/><rect x="${x + width / 2 - 44}" y="${y + height + 38}" width="88" height="8" fill="#343c39"/></g>`;
}

function roomScene(t, level) {
  const accent = t.light[1];
  const columns = Array.from({ length: 7 }, (_, i) => {
    const h = 80 + number(t.seed, i + 2) % 250;
    return `<rect x="${350 + i * 72}" y="${470 - h}" width="42" height="${h}" fill="#121817" stroke="#28312e" stroke-width="3"/>`;
  }).join('');
  const shelves = Array.from({ length: 5 + t.rarityScore }, (_, i) => {
    const y = 170 + i * 48;
    return `<path d="M82 ${y}h230M888 ${y}h230" stroke="#343c38" stroke-width="6" opacity=".55"/><rect x="${102 + (number(t.seed, i) % 72)}" y="${y - 30}" width="12" height="28" fill="${i % 3 === 0 ? accent : '#6d746f'}" opacity=".5"/><rect x="${920 + (number(t.seed, i + 11) % 72)}" y="${y - 30}" width="12" height="28" fill="${i % 2 ? accent : '#6d746f'}" opacity=".45"/>`;
  }).join('');
  const premium = t.rarityScore >= 4 || level >= 4;
  return `<rect width="1200" height="1200" fill="#070908"/><rect x="42" y="42" width="1116" height="1116" rx="18" fill="#0c0f0e" stroke="#27302d" stroke-width="6"/><path d="M48 810L380 494h440l332 316v344H48z" fill="#101412" opacity=".92"/>${t.view === 'archive shelving' ? shelves : `<rect x="332" y="104" width="536" height="384" fill="#090d0c" stroke="#303936" stroke-width="7"/>${columns}`}${t.view === 'rain glass' ? Array.from({ length: 24 }, (_, i) => `<path d="M${350 + (i * 43) % 500} ${120 + number(t.seed, i) % 210}l-18 54" stroke="#a9c7c1" stroke-width="3" opacity=".18"/>`).join('') : ''}${premium ? `<path d="M76 742h1048" stroke="${accent}" stroke-width="3" opacity=".2"/><rect x="92" y="770" width="1016" height="12" fill="${accent}" opacity=".08"/>` : ''}<ellipse cx="600" cy="570" rx="${280 + level * 28}" ry="210" fill="${accent}" opacity=".055"/><path d="M48 890h1110M210 1154l170-336M990 1154L820 818" stroke="#252d2a" stroke-width="4" opacity=".58"/>`;
}

function monitorArray(t, level) {
  const accent = t.light[1];
  const count = Math.min(7, 1 + level + Math.floor((t.rarityScore - 1) / 2));
  if (count <= 2) return `${screen(350, 280, 500, 300, accent, t.seed, 1)}${count === 2 ? screen(842, 350, 230, 170, accent, t.seed, 6) : ''}`;
  if (count <= 4) return [0, 1, 2].map((i) => screen(164 + i * 294, 288 + Math.abs(i - 1) * 34, 276, 210, accent, t.seed, i * 4)).join('') + (count === 4 ? screen(460, 118, 280, 150, accent, t.seed, 18) : '');
  return Array.from({ length: count }, (_, i) => {
    const top = i < 4;
    return screen(top ? 88 + i * 258 : 218 + (i - 4) * 290, top ? 154 : 390, top ? 238 : 270, top ? 184 : 194, accent, t.seed, i * 3);
  }).join('');
}

function deskScene(t, level) {
  const [materialName, dark, edge] = t.material;
  const accent = t.light[1];
  const widthInset = t.form === 'crescent' ? 64 : t.form === 'cantilever' ? 30 : 0;
  const documents = Array.from({ length: Math.min(5, level + (t.rarityScore > 2 ? 1 : 0)) }, (_, i) => {
    const x = 206 + i * 112 + number(t.seed, i) % 34;
    return `<g transform="rotate(${(number(t.seed, i + 8) % 9) - 4} ${x} 900)"><rect x="${x}" y="${878 + (i % 2) * 22}" width="96" height="68" fill="#d8d5ca" stroke="#171a18" stroke-width="4"/><path d="M${x + 14} ${900 + (i % 2) * 22}h62m-62 16h46" stroke="#545954" stroke-width="4"/></g>`;
  }).join('');
  return `<g><path d="M${86 + widthInset} 754H${1114 - widthInset}l70 300H16z" fill="${dark}" stroke="${edge}" stroke-width="10"/><path d="M${118 + widthInset} 790H${1082 - widthInset}l34 176H84z" fill="#151a18" stroke="#343c38" stroke-width="4"/><path d="M${152 + widthInset} 816H${1048 - widthInset}" stroke="${accent}" stroke-width="5" opacity=".55"/><rect x="450" y="840" width="300" height="94" rx="8" fill="#080b0a" stroke="#3a423f" stroke-width="6"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${478 + i * 21}" y="${868 + (i % 3) * 15}" width="13" height="8" fill="${i % 4 === 0 ? accent : '#69716d'}" opacity=".65"/>`).join('')}${documents}<rect x="${886 + number(t.seed, 6) % 72}" y="864" width="78" height="116" rx="7" fill="#111715" stroke="#414a46" stroke-width="5"/><circle cx="${925 + number(t.seed, 6) % 72}" cy="890" r="8" fill="${accent}" opacity=".7"/>${level >= 3 ? `<path d="M154 994h238" stroke="#727a75" stroke-width="7"/><circle cx="178" cy="1025" r="18" fill="${accent}" opacity=".28"/>` : ''}${level >= 5 ? `<rect x="966" y="988" width="128" height="72" fill="#0a0e0c" stroke="${accent}" stroke-width="3"/><path d="M984 1016h82m-82 18h54" stroke="${accent}" stroke-width="4" opacity=".55"/>` : ''}<text x="82" y="1110" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18" fill="#8e9691">${materialName.toUpperCase()} / ${t.form.toUpperCase()}</text></g>`;
}

function artwork(serial, level) {
  const t = traitsFor(serial);
  const id = idFor(serial);
  const accent = t.light[1];
  const pixels = Array.from({ length: 38 }, (_, i) => `<rect x="${number(t.seed, i) % 1200}" y="${number(t.seed, i + 9) % 1200}" width="4" height="4" fill="${accent}" opacity=".10"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><title>${id} ${t.rarity} ${levels[level - 1]} research desk</title><desc>An architectural IPO research workspace with no people or company affiliation.</desc>${roomScene(t, level)}${monitorArray(t, level)}${deskScene(t, level)}${pixels}<g><rect x="58" y="62" width="188" height="52" rx="5" fill="#090c0b" stroke="${accent}" stroke-width="3"/><text x="82" y="96" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-weight="800" font-size="22" fill="#f1efe7">IPO #${serialLabel(serial)}</text></g><g><rect x="956" y="62" width="186" height="52" rx="5" fill="#090c0b" stroke="#39423e" stroke-width="3"/><text x="1049" y="95" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="17" fill="${accent}">${t.signature}</text></g></svg>`;
}

async function generateDesk(serial) {
  const id = idFor(serial);
  const t = traitsFor(serial);
  for (let level = 1; level <= product.maxLevels; level += 1) await writeFile(new URL(`${id}-L${level}.svg`, imageDir), artwork(serial, level));
  const metadata = {
    name: `IPO Launch Pass #${serialLabel(serial)}`,
    symbol: 'IPO',
    description: 'A collectible IPO Launch Pass represented by an architectural research desk. Holder-drop and launch features require published, funded terms; no company shares, allocation, or financial return is guaranteed.',
    image: `images/${id}-L1.svg`,
    attributes: [
      { trait_type: 'Rarity', value: t.rarity },
      { trait_type: 'Workspace', value: t.room },
      { trait_type: 'Desk Form', value: t.form },
      { trait_type: 'Material', value: t.material[0] },
      { trait_type: 'Lighting', value: t.light[0] },
      { trait_type: 'View', value: t.view },
      { trait_type: 'Research Mode', value: t.screenSet },
      { trait_type: 'Desk Object', value: t.object },
      { trait_type: 'Desk Serial', value: serial },
    ],
    properties: {
      category: 'image',
      files: Array.from({ length: product.maxLevels }, (_, i) => ({ uri: `images/${id}-L${i + 1}.svg`, type: 'image/svg+xml' })),
      upgrade_images: Array.from({ length: product.maxLevels }, (_, i) => ({ level: i + 1, status: levels[i], uri: `images/${id}-L${i + 1}.svg` })),
      seed: `ipo-desk-${serial}`,
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
  name: 'IPO Launch Pass', symbol: 'IPO', standard: 'Metaplex Core', supply: product.supply,
  mintPrice: { sol: product.mintPriceSol, lamports: product.mintPriceLamports, ipo: 0 }, rewardParticipation: 'Equal base participation per eligible desk; terms published per program.',
  upgradeLevels: levels, assetCategory: 'IPO-themed project launch membership and research', securitiesAccess: false,
  artDirection: 'Architectural launch consoles with a consistent camera, restrained materials, and crisp pixel-grid detail.',
}, null, 2)}\n`);
console.log(`Generated ${product.supply} IPO Launch Passes with ${product.maxLevels} architectural art stages each.`);
