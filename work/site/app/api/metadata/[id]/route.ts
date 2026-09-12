import { NextResponse } from "next/server";
import productConfig from "../../../../product-config.json";
import blueprint from "../../../../public/pumpios/trait-blueprint.json";

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
  const requestedLevel = Number(url.searchParams.get("level") ?? "0");
  const level = Number.isInteger(requestedLevel) ? Math.min(productConfig.maxLevels, Math.max(0, requestedLevel)) : 0;
  const image = `${url.origin}/api/art/${id}?level=${level}`;
  return NextResponse.json(
    {
      name: item.name,
      symbol: "PUMPIO",
      description: "A capsule-headed underwriter for Initial Pump Offering. Artwork traits do not change base economic participation.",
      image,
      external_url: `${url.origin}/pumpios?pumpio=${serial}`,
      attributes: [
        { trait_type: "Rarity", value: item.rarity },
        { trait_type: "Level", value: level },
        ...Object.entries(item.traits).map(([traitType, value]) => ({ trait_type: traitType, value })),
      ],
      properties: { category: "image", files: [{ uri: image, type: "image/svg+xml" }] },
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600", "X-Content-Type-Options": "nosniff" } },
  );
}
