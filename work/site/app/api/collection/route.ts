import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.json(
    {
      name: "Pumpios",
      symbol: "PUMPIO",
      description: "1,200 capsule-headed underwriters for Initial Pump Offering.",
      image: `${origin}/pumpio-chairman-v3.png`,
      external_url: origin,
      properties: { category: "image", files: [{ uri: `${origin}/pumpio-chairman-v3.png`, type: "image/png" }] },
    },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400", "X-Content-Type-Options": "nosniff" } },
  );
}
