import { NextResponse } from "next/server";
import productConfig from "../../../../product-config.json";
import blueprint from "../../../../public/pumpios/trait-blueprint.json";
import { canonicalPumpiosById } from "../../../pumpio-canonical";

const ID_PATTERN = /^PUMPIO-(\d{4})$/;
const items = new Map(blueprint.items.map((item) => [item.serial, item]));

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const match = ID_PATTERN.exec(id);
  const serial = match ? Number(match[1]) : 0;
  const item = items.get(serial);
  if (!match || serial < 1 || serial > productConfig.supply || !item) {
    return NextResponse.json({ error: "Unknown Pumpio" }, { status: 404 });
  }
  const url = new URL(request.url);
  const canonical = canonicalPumpiosById.get(serial);
  const requestedLevel = Number(url.searchParams.get("level") ?? canonical?.level ?? 0);
  const level = Number.isInteger(requestedLevel) ? Math.min(productConfig.maxLevels, Math.max(0, requestedLevel)) : 0;
  const image = canonical ? `${url.origin}${canonical.image}` : `${url.origin}/api/art/${id}?level=${level}`;
  const visibleTraits = canonical
    ? { Capsule: canonical.capsule, Face: canonical.face, Outfit: canonical.outfit, Accessory: canonical.accessory, Background: canonical.background, Surface: canonical.surface }
    : item.traits;
  return NextResponse.json(
    {
      name: canonical?.name ?? item.name,
      symbol: "PUMPIO",
      description: canonical
        ? "An art-directed representative Pumpio preview. Not minted or frozen as final collection metadata. Artwork traits do not change base economic participation."
        : "A deterministic draft Pumpio preview. Final collection artwork is not complete or frozen. Artwork traits do not change base economic participation.",
      image,
      external_url: `${url.origin}/pumpios?pumpio=${serial}`,
      art_status: canonical ? canonical.status : "DRAFT PREVIEW",
      attributes: [
        { trait_type: "Rarity", value: canonical?.rarity ?? item.rarity },
        { trait_type: "Level", value: level },
        { trait_type: "Art Status", value: canonical ? canonical.status : "DRAFT PREVIEW" },
        ...Object.entries(visibleTraits).map(([traitType, value]) => ({ trait_type: traitType, value })),
      ],
      properties: { category: "image", files: [{ uri: image, type: canonical ? "image/webp" : "image/svg+xml" }] },
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600", "X-Content-Type-Options": "nosniff" } },
  );
}
