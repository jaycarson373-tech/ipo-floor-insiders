import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const projectRoot = path.resolve(root, "..");
const mastersDir = path.join(projectRoot, "art", "pumpios-v8", "masters");
const reviewDir = path.join(projectRoot, "art", "pumpios-v8");
const webDir = path.join(root, "public", "pumpios", "v8");
const manifest = JSON.parse(await fs.readFile(path.join(root, "pumpio-canonical.json"), "utf8"));

await fs.mkdir(webDir, { recursive: true });

for (const item of manifest) {
  await sharp(path.join(mastersDir, item.master))
    .resize(1000, 1000, { fit: "cover", position: "centre" })
    .webp({ quality: 88, effort: 6 })
    .toFile(path.join(webDir, `${String(item.id).padStart(4, "0")}.webp`));
}

const xml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const labelSvg = (item, width, height) => Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#11120f"/><text x="14" y="19" fill="#f5f0e5" font-family="Arial, sans-serif" font-size="13" font-weight="700">#${String(item.id).padStart(4, "0")} ${xml(item.name.toUpperCase())}</text><text x="14" y="36" fill="#a6ff3d" font-family="Arial, sans-serif" font-size="10">${xml(item.rarity)}</text></svg>`);
const tileWidth = 300;
const imageSize = 260;
const labelHeight = 48;
const columns = 6;
const rows = 4;
const sheet = sharp({ create: { width: tileWidth * columns, height: (imageSize + labelHeight) * rows, channels: 3, background: "#090a08" } });
const sheetLayers = [];

for (let index = 0; index < manifest.length; index += 1) {
  const item = manifest[index];
  const left = (index % columns) * tileWidth + 20;
  const top = Math.floor(index / columns) * (imageSize + labelHeight);
  const image = await sharp(path.join(mastersDir, item.master)).resize(imageSize, imageSize, { fit: "cover" }).jpeg({ quality: 90 }).toBuffer();
  sheetLayers.push({ input: image, left, top });
  sheetLayers.push({ input: labelSvg(item, imageSize, labelHeight), left, top: top + imageSize });
}

await sheet.composite(sheetLayers).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toFile(path.join(reviewDir, "pumpios-v8-contact-sheet.jpg"));

const avatarIds = [42, 421, 808, 1];
const avatarItems = avatarIds.map((id) => manifest.find((item) => item.id === id));
const avatarCanvas = sharp({ create: { width: 960, height: 1240, channels: 3, background: "#11120f" } });
const avatarLayers = [];
const sizes = [256, 128, 64];

for (let row = 0; row < avatarItems.length; row += 1) {
  const item = avatarItems[row];
  const y = row * 300 + 20;
  const masterPath = path.join(mastersDir, item.master);
  const full = await sharp(masterPath).resize(256, 256).png().toBuffer();
  const circleMask = Buffer.from('<svg width="256" height="256"><circle cx="128" cy="128" r="126" fill="white"/></svg>');
  const circle = await sharp(masterPath).resize(256, 256).composite([{ input: circleMask, blend: "dest-in" }]).png().toBuffer();
  avatarLayers.push({ input: full, left: 20, top: y });
  avatarLayers.push({ input: circle, left: 306, top: y });
  let x = 592;
  for (const size of sizes.slice(1)) {
    const sample = await sharp(masterPath).resize(size, size).png().toBuffer();
    avatarLayers.push({ input: sample, left: x, top: y + Math.floor((256 - size) / 2) });
    x += size + 44;
  }
  avatarLayers.push({ input: labelSvg(item, 256, 44), left: 20, top: y + 256 });
}

await avatarCanvas.composite(avatarLayers).jpeg({ quality: 94, chromaSubsampling: "4:4:4" }).toFile(path.join(reviewDir, "pumpios-v8-avatar-check.jpg"));

console.log(`Built ${manifest.length} web previews, contact sheet, and avatar QA sheet.`);

