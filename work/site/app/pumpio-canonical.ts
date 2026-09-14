import manifest from "../pumpio-canonical.json";

export type PumpioRarity = "STANDARD" | "RARE" | "SUPER RARE" | "LEGENDARY" | "CHAIRMAN";

export type CanonicalPumpio = {
  accessory: string;
  background: string;
  capsule: string;
  face: string;
  id: number;
  image: string;
  level: number;
  master: string;
  name: string;
  outfit: string;
  rarity: PumpioRarity;
  slug: string;
  status: "REPRESENTATIVE PREVIEW";
  surface: string;
};

export const canonicalPumpios = manifest as CanonicalPumpio[];
export const canonicalPumpiosById = new Map(canonicalPumpios.map((pumpio) => [pumpio.id, pumpio]));

