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
  dealmaker: { alt: "The Dealmaker Pumpio at a night auction", src: "/pumpios/v8/0421.webp" },
  oracle: { alt: "The Oracle Pumpio in a flooded data shrine", src: "/pumpios/v8/0187.webp" },
  "red-line": { alt: "The Red Line Pumpio taking a call", src: "/pumpios/v8/0333.webp" },
  bookrunner: { alt: "The Bookrunner Pumpio in an office corridor", src: "/pumpios/v8/0674.webp" },
  quant: { alt: "The Quant Pumpio in an ocean convenience lab", src: "/pumpios/v8/0808.webp" },
  whale: { alt: "The Whale Pumpio in a rainy financial district", src: "/pumpios/v8/0999.webp" },
  printer: { alt: "The Printer Pumpio in a copy-room laundromat", src: "/pumpios/v8/0777.webp" },
  "golden-pump": { alt: "The Golden Pump in an abandoned luxury mall", src: "/pumpios/v8/1199.webp" },
  chairman: { alt: "The Chairman Pumpio at a suburban shareholder banquet", src: "/pumpios/v8/0001.webp" },
};

export default function PumpioArt({ alt, art, className = "", src }: { alt?: string; art?: PumpioArtId; className?: string; src?: string }) {
  const item = art ? artMap[art] : undefined;
  const imageSrc = src ?? item?.src;
  if (!imageSrc) return null;
  return (
    <div className={`pumpioArt ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt ?? item?.alt ?? "Pumpio collection preview"}
        className={item?.quadrant === undefined ? "pumpioSingle" : `pumpioSheet pumpioQ${item.quadrant}`}
        src={imageSrc}
      />
    </div>
  );
}
