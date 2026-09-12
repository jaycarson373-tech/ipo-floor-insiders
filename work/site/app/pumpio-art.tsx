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
  intern: { alt: "Hand-illustrated green and cream Pumpio intern in a charcoal suit", quadrant: 0, src: "/pumpios-preview-standard-v3.png" },
  analyst: { alt: "Hand-illustrated blue Pumpio analyst holding a calculator", quadrant: 1, src: "/pumpios-preview-standard-v3.png" },
  "market-maker": { alt: "Hand-illustrated red and cream Pumpio market maker in a pinstripe suit", quadrant: 2, src: "/pumpios-preview-standard-v3.png" },
  bookrunner: { alt: "Hand-illustrated black and acid-green Pumpio bookrunner", quadrant: 3, src: "/pumpios-preview-standard-v3.png" },
  quant: { alt: "Hand-illustrated crystal blue liquid-filled Pumpio quant", quadrant: 0, src: "/pumpios-preview-rare-v3.png" },
  whale: { alt: "Hand-illustrated mirror-chrome Pumpio whale in a fur-collar coat", quadrant: 1, src: "/pumpios-preview-rare-v3.png" },
  printer: { alt: "Hand-illustrated transparent money-filled Pumpio printer", quadrant: 2, src: "/pumpios-preview-rare-v3.png" },
  "golden-pump": { alt: "Hand-illustrated brushed-gold Pumpio in a cream tuxedo", quadrant: 3, src: "/pumpios-preview-rare-v3.png" },
  chairman: { alt: "Hand-illustrated Chairman, the unique green and cream Pumpio", src: "/pumpio-chairman-v3.png" },
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
