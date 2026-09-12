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
  intern: { alt: "Green and cream Pumpio intern in a charcoal suit", quadrant: 0, src: "/pumpios-preview-standard-v2.png" },
  analyst: { alt: "Translucent blue Pumpio analyst holding a calculator", quadrant: 1, src: "/pumpios-preview-standard-v2.png" },
  "market-maker": { alt: "Red and cream Pumpio market maker in a pinstripe suit", quadrant: 2, src: "/pumpios-preview-standard-v2.png" },
  bookrunner: { alt: "Black and acid-green Pumpio bookrunner with coffee", quadrant: 3, src: "/pumpios-preview-standard-v2.png" },
  quant: { alt: "Crystal blue liquid-filled Pumpio quant", quadrant: 0, src: "/pumpios-preview-rare-v2.png" },
  whale: { alt: "Mirror-chrome Pumpio whale in a fur-collar coat", quadrant: 1, src: "/pumpios-preview-rare-v2.png" },
  printer: { alt: "Transparent money-filled Pumpio printer", quadrant: 2, src: "/pumpios-preview-rare-v2.png" },
  "golden-pump": { alt: "Brushed-gold Pumpio in a cream tuxedo", quadrant: 3, src: "/pumpios-preview-rare-v2.png" },
  chairman: { alt: "The Chairman, the unique green and cream Pumpio", src: "/pumpio-chairman-v2.png" },
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
