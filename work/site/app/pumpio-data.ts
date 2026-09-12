import type { PumpioArtId } from "./pumpio-art";

export type PumpioRarity = "STANDARD" | "RARE" | "SUPER RARE" | "LEGENDARY" | "CHAIRMAN";

export const pumpioPreviews: Array<{
  accessory: string;
  art: PumpioArtId;
  capsule: string;
  id: number;
  level: number;
  name: string;
  outfit: string;
  rarity: PumpioRarity;
  status: "COLLECTION PREVIEW";
}> = [
  { id: 421, art: "intern", name: "The Intern", rarity: "STANDARD", level: 1, capsule: "Classic green / cream", outfit: "Cheap gray suit", accessory: "None", status: "COLLECTION PREVIEW" },
  { id: 187, art: "analyst", name: "The Analyst", rarity: "STANDARD", level: 2, capsule: "Blue / cream", outfit: "Banker vest", accessory: "Calculator", status: "COLLECTION PREVIEW" },
  { id: 333, art: "market-maker", name: "The Market Maker", rarity: "RARE", level: 7, capsule: "Red / cream", outfit: "Pinstripe suit", accessory: "Trader headset", status: "COLLECTION PREVIEW" },
  { id: 674, art: "bookrunner", name: "The Bookrunner", rarity: "RARE", level: 8, capsule: "Black / acid", outfit: "Puffer suit", accessory: "Coffee", status: "COLLECTION PREVIEW" },
  { id: 808, art: "quant", name: "The Quant", rarity: "SUPER RARE", level: 8, capsule: "Liquid glass", outfit: "Lab coat", accessory: "Calculator", status: "COLLECTION PREVIEW" },
  { id: 999, art: "whale", name: "The Whale", rarity: "SUPER RARE", level: 9, capsule: "Chrome / blue", outfit: "Fur-collar coat", accessory: "Gold chain", status: "COLLECTION PREVIEW" },
  { id: 777, art: "printer", name: "The Printer", rarity: "LEGENDARY", level: 9, capsule: "Money-filled glass", outfit: "Black suit", accessory: "Green candle pin", status: "COLLECTION PREVIEW" },
  { id: 1199, art: "golden-pump", name: "The Golden Pump", rarity: "LEGENDARY", level: 10, capsule: "Brushed gold", outfit: "Cream tuxedo", accessory: "Halo", status: "COLLECTION PREVIEW" },
  { id: 1, art: "chairman", name: "The Chairman", rarity: "CHAIRMAN", level: 10, capsule: "Classic green / cream", outfit: "Chairman suit", accessory: "Canonical concept", status: "COLLECTION PREVIEW" },
];

export const rarityPlan = [
  { count: 900, label: "STANDARD" },
  { count: 200, label: "RARE" },
  { count: 80, label: "SUPER RARE" },
  { count: 19, label: "LEGENDARY" },
  { count: 1, label: "CHAIRMAN" },
] as const;

export const levelPlan = [
  "INTERN",
  "ANALYST",
  "ASSOCIATE",
  "TRADER",
  "BROKER",
  "UNDERWRITER",
  "MARKET MAKER",
  "BOOKRUNNER",
  "PARTNER",
  "CHAIRMAN",
] as const;
