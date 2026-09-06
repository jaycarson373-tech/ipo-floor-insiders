import { NextRequest, NextResponse } from 'next/server';

const ID_PATTERN = /^(GTA|NLNK|ANTH)-(\d{3})$/;
const TICKERS = ['GTA', 'NLNK', 'ANTH'] as const;

type MetadataDocument = Record<string, unknown> & {
  attributes?: Array<{ trait_type?: string; value?: unknown }>;
  properties?: Record<string, unknown>;
};

function artStageForLevel(level: number) {
  if (level <= 1) return 1;
  if (level <= 3) return 2;
  if (level <= 5) return 3;
  if (level <= 7) return 4;
  return 5;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const match = ID_PATTERN.exec(id);
  const serial = match ? Number(match[2]) : 0;
  const expectedTicker = serial >= 1 && serial <= 333 ? TICKERS[(serial - 1) % 3] : null;

  if (!match || !expectedTicker || match[1] !== expectedTicker) {
    return NextResponse.json({ error: 'Unknown IPO Floor desk' }, { status: 404 });
  }

  const levelValue = Number(request.nextUrl.searchParams.get('level') ?? '0');
  if (!Number.isInteger(levelValue) || levelValue < 0 || levelValue > 10) {
    return NextResponse.json({ error: 'Level must be between 0 and 10' }, { status: 400 });
  }

  const sourceUrl = new URL(`/collection/metadata/${id}.json`, request.nextUrl.origin);
  const sourceResponse = await fetch(sourceUrl);
  if (!sourceResponse.ok) {
    return NextResponse.json({ error: 'Desk metadata unavailable' }, { status: 503 });
  }

  const metadata = await sourceResponse.json() as MetadataDocument;
  const artStage = artStageForLevel(levelValue);
  const image = new URL(`/collection/images/${id}-L${artStage}.webp`, request.nextUrl.origin).toString();
  const attributes = Array.isArray(metadata.attributes)
    ? metadata.attributes.filter((trait) => trait.trait_type !== 'On-chain Level')
    : [];

  return NextResponse.json(
    {
      ...metadata,
      image,
      attributes: [
        ...attributes,
        { trait_type: 'On-chain Level', value: levelValue },
        { trait_type: 'Art Stage', value: artStage },
      ],
      properties: {
        ...(metadata.properties ?? {}),
        files: [{ uri: image, type: 'image/webp' }],
      },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
