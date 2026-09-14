import traitConfig from "../pumpio-traits.json";
import { canonicalPumpios } from "./pumpio-canonical";

export type { PumpioRarity } from "./pumpio-canonical";
export const pumpioPreviews = canonicalPumpios;

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
