import type { PumpioArtId } from "./pumpio-art";
import traitConfig from "../pumpio-traits.json";

export type PumpioRarity = "STANDARD" | "RARE" | "SUPER RARE" | "LEGENDARY" | "CHAIRMAN";

export const pumpioPreviews: Array<{
  accessory: string;
  art: PumpioArtId;
  background: string;
  capsule: string;
  face: string;
  id: number;
  level: number;
  name: string;
  outfit: string;
  rarity: PumpioRarity;
  status: "COLLECTION PREVIEW";
  surface: string;
}> = [
  { id: 421, art: "intern", name: "The Intern", rarity: "STANDARD", level: 1, capsule: "Classic green / cream", face: "Deadpan", outfit: "Cheap intern suit", accessory: "No badge", background: "Prospectus yellow", surface: "Pencil ghosts", status: "COLLECTION PREVIEW" },
  { id: 187, art: "analyst", name: "The Analyst", rarity: "STANDARD", level: 2, capsule: "Blue / cream", face: "Tired", outfit: "Banker vest", accessory: "Calculator", background: "Market blue", surface: "Offset print", status: "COLLECTION PREVIEW" },
  { id: 333, art: "market-maker", name: "The Market Maker", rarity: "RARE", level: 7, capsule: "Red / cream", face: "Slightly smug", outfit: "Pinstripe suit", accessory: "Trader headset", background: "Opening red", surface: "Heavy halftone", status: "COLLECTION PREVIEW" },
  { id: 674, art: "bookrunner", name: "The Bookrunner", rarity: "RARE", level: 8, capsule: "Black / acid", face: "Unimpressed", outfit: "Puffer suit", accessory: "Bookrunner cap", background: "Mint green", surface: "Dry brush", status: "COLLECTION PREVIEW" },
  { id: 808, art: "quant", name: "The Quant", rarity: "SUPER RARE", level: 8, capsule: "Liquid aquarium", face: "Liquid reflection", outfit: "Lab coat", accessory: "Quant sensors", background: "Quant lab", surface: "Glass scratches", status: "COLLECTION PREVIEW" },
  { id: 999, art: "whale", name: "The Whale", rarity: "SUPER RARE", level: 9, capsule: "Mirror chrome", face: "Deadpan", outfit: "Fur-collar coat", accessory: "Gold chain", background: "Yacht close", surface: "Chrome scuffs", status: "COLLECTION PREVIEW" },
  { id: 777, art: "printer", name: "The Printer", rarity: "LEGENDARY", level: 9, capsule: "Money-filled glass", face: "Printer stare", outfit: "Pinstripe suit", accessory: "Printer controls", background: "Printing house", surface: "Glass scratches", status: "COLLECTION PREVIEW" },
  { id: 1199, art: "golden-pump", name: "The Golden Pump", rarity: "LEGENDARY", level: 10, capsule: "Brushed gold", face: "Chairman calm", outfit: "Golden tuxedo", accessory: "Golden phone", background: "Golden vault", surface: "Gold leaf wear", status: "COLLECTION PREVIEW" },
  { id: 1, art: "chairman", name: "The Chairman", rarity: "CHAIRMAN", level: 10, capsule: "Classic green / cream", face: "Chairman calm", outfit: "Chairman double-breasted", accessory: "Chairman seal", background: "Chairman boardroom", surface: "Paper tooth", status: "COLLECTION PREVIEW" },
];

export const traitCategories = traitConfig.categories.map((category) => ({
  ...category,
  count: Object.values(category.values).flat().length,
}));

export const traitCount = traitCategories.reduce((total, category) => total + category.count, 0);
export const compatibilityRules = traitConfig.compatibilityRules;

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
