import { NextRequest, NextResponse } from 'next/server';
import productConfig from '../../../../product-config.json';

const ID_PATTERN = /^IPO-(\d{4})$/;

type MetadataDocument = Record<string, unknown> & {
  attributes?: Array<{ trait_type?: string; value?: unknown }>;
  properties?: Record<string, unknown>;
};

function artStageForLevel(level: number) {
  return Math.max(1, level);
}

function publicOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS outside localhost.');
    }
    return url.origin;
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
  return host ? `${protocol}://${host}` : request.nextUrl.origin;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const match = ID_PATTERN.exec(id);
  const serial = match ? Number(match[1]) : 0;

  if (!match || serial < 1 || serial > productConfig.supply) {
    return NextResponse.json({ error: 'Unknown IPO Launch Pass' }, { status: 404 });
  }

  const levelValue = Number(request.nextUrl.searchParams.get('level') ?? '0');
  if (!Number.isInteger(levelValue) || levelValue < 0 || levelValue > productConfig.maxLevels) {
    return NextResponse.json({ error: `Level must be between 0 and ${productConfig.maxLevels}` }, { status: 400 });
  }

  const sourceUrl = new URL(`/collection/metadata/${id}.json`, request.nextUrl.origin);
  const sourceResponse = await fetch(sourceUrl);
  if (!sourceResponse.ok) {
    return NextResponse.json({ error: 'Desk metadata unavailable' }, { status: 503 });
  }

  const metadata = await sourceResponse.json() as MetadataDocument;
  const artStage = artStageForLevel(levelValue);
  const image = new URL(`/collection/images/${id}-L${artStage}.svg`, publicOrigin(request)).toString();
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
        files: [{ uri: image, type: 'image/svg+xml' }],
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
