import { NextResponse } from "next/server";
import productConfig from "../../../../product-config.json";

const ID_PATTERN = /^PUMPIO-(\d{4})$/;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const match = ID_PATTERN.exec(id);
  const serial = match ? Number(match[1]) : 0;
  if (!match || serial < 1 || serial > productConfig.supply) {
    return NextResponse.json({ error: "Unknown Pumpio" }, { status: 404 });
  }
  return NextResponse.json(
    {
      error: "Pumpio metadata is not finalized.",
      status: "COLLECTION_MIGRATION_REQUIRED",
      detail: "Approved concept previews are not minted metadata.",
    },
    { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
