export type PumpioArtId =
  | "dealmaker"
  | "oracle"
  | "red-line"
  | "bookrunner"
  | "quant"
  | "whale"
  | "printer"
  | "golden-pump"
  | "chairman";

const artMap: Record<PumpioArtId, { alt: string; quadrant?: number; src: string }> = {
  dealmaker: { alt: "The Dealmaker, a cracked green Pumpio holding a sealed contract cube at a night auction", src: "/pumpios/v7/dealmaker.webp" },
  oracle: { alt: "The Oracle, a stormglass blue Pumpio holding an all-seeing calculator in a flooded shrine", src: "/pumpios/v7/oracle.webp" },
  "red-line": { alt: "The Red Line, a three-eyed red Pumpio taking a call inside a volcanic trading cathedral", src: "/pumpios/v7/red-line.webp" },
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
