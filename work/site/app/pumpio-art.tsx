export type PumpioArtId =
  | "intern"
  | "analyst"
  | "market-maker"
  | "bookrunner"
  | "quant"
  | "whale"
  | "printer"
  | "golden-pump"
  | "chairman";

const artMap: Record<PumpioArtId, { alt: string; quadrant?: number; src: string }> = {
  intern: { alt: "Green and cream Pumpio intern in a gray suit", quadrant: 0, src: "/pumpios-preview-standard-v1.png" },
  analyst: { alt: "Blue and white Pumpio analyst holding a calculator", quadrant: 1, src: "/pumpios-preview-standard-v1.png" },
  "market-maker": { alt: "Red and white Pumpio market maker in a pinstripe suit", quadrant: 2, src: "/pumpios-preview-standard-v1.png" },
  bookrunner: { alt: "Black and green Pumpio bookrunner with coffee", quadrant: 3, src: "/pumpios-preview-standard-v1.png" },
  quant: { alt: "Transparent liquid-filled Pumpio quant", quadrant: 0, src: "/pumpios-preview-rare-v1.png" },
  whale: { alt: "Chrome blue Pumpio whale in a fur-collar coat", quadrant: 1, src: "/pumpios-preview-rare-v1.png" },
  printer: { alt: "Transparent money-filled Pumpio printer", quadrant: 2, src: "/pumpios-preview-rare-v1.png" },
  "golden-pump": { alt: "Gold and black Pumpio in a cream tuxedo", quadrant: 3, src: "/pumpios-preview-rare-v1.png" },
  chairman: { alt: "The Chairman, the canonical green and cream Pumpio", src: "/pumpio-chairman-reference.jpg" },
};

export default function PumpioArt({ art, className = "" }: { art: PumpioArtId; className?: string }) {
  const item = artMap[art];
  return (
    <div className={`pumpioArt ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={item.alt}
        className={item.quadrant === undefined ? "pumpioSingle" : `pumpioSheet pumpioQ${item.quadrant}`}
        src={item.src}
      />
    </div>
  );
}
