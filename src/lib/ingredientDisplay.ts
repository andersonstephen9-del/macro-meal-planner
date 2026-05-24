import type { ScaledIngredient } from "./types";

export type IngredientSection = "weigh" | "season";

export interface IngredientLine {
  name: string;
  section: IngredientSection;
  primary: string;
  hint?: string;
}

/** Gram weight for count / volume units (approximate, for scaling math) */
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  tbsp: 15,
  tsp: 5,
  cloves: 5,
  stalks: 15,
  spray: 2,
  pinch: 0.5,
};

const PIECE_GRAMS: { match: string; gramsPerPiece: number }[] = [
  { match: "bell pepper", gramsPerPiece: 150 },
  { match: "onion", gramsPerPiece: 110 },
  { match: "lemon", gramsPerPiece: 60 },
  { match: "lime", gramsPerPiece: 45 },
  { match: "avocado", gramsPerPiece: 200 },
  { match: "apple", gramsPerPiece: 180 },
  { match: "zucchini", gramsPerPiece: 200 },
];

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function scaledAmountToGrams(ing: ScaledIngredient): number | null {
  const unit = ing.unit.toLowerCase();
  const amount = ing.scaledAmount;

  if (unit === "g") return roundGrams(amount);
  if (unit === "kg") return roundGrams(amount * 1000);
  if (unit === "ml") return roundGrams(amount);

  if (unit === "pc") {
    const name = normalizeName(ing.name);
    for (const { match, gramsPerPiece } of PIECE_GRAMS) {
      if (name.includes(match)) {
        return roundGrams(amount * gramsPerPiece);
      }
    }
    return roundGrams(amount * 100);
  }

  const factor = UNIT_TO_GRAMS[unit];
  if (factor != null) return roundGrams(amount * factor);

  return null;
}

export function roundGrams(g: number): number {
  if (g >= 100) return Math.round(g / 5) * 5;
  if (g >= 20) return Math.round(g / 5) * 5;
  return Math.max(1, Math.round(g));
}

function isSeasoning(ing: ScaledIngredient): boolean {
  const unit = ing.unit.toLowerCase();
  if (["tsp", "tbsp", "pinch", "spray"].includes(unit)) return true;
  if (ing.macroType === "pantry" && unit !== "g" && unit !== "ml") return true;
  return false;
}

function formatVolume(ing: ScaledIngredient): string {
  const n = ing.scaledAmount;
  const unit = ing.unit;
  const rounded =
    unit === "pinch" || unit === "spray"
      ? Math.max(1, Math.round(n))
      : Math.round(n * 10) / 10;
  return `${rounded} ${unit}`;
}

function practicalHint(ing: ScaledIngredient, grams: number): string | undefined {
  const name = normalizeName(ing.name);

  if (name.includes("bell pepper")) {
    const peppers = grams / 150;
    if (peppers < 0.55) {
      return "About half a medium pepper — slice and share across portions at the pan";
    }
    if (peppers < 1.25) {
      return "About 1 medium pepper for the batch — no need to weigh each slice per person";
    }
    return `About ${Math.ceil(peppers)} peppers — prep together, divide when you plate`;
  }

  if (name.includes("broccoli")) {
    return "Weigh florets once on the scale; split evenly when serving if needed";
  }

  if (name.includes("zucchini") || name.includes("asparagus") || name.includes("green bean")) {
    return "Weigh on the scale — divide by eye across plates after cooking";
  }

  if (name.includes("onion") || name.includes("green onion")) {
    return "Dice the weighed amount — split across servings when plating";
  }

  if (name.includes("rice") || name.includes("quinoa")) {
    return "Dry weight before cooking";
  }

  if (name.includes("chicken") || name.includes("beef") || name.includes("turkey") || name.includes("pork") || name.includes("salmon") || name.includes("cod") || name.includes("shrimp") || name.includes("tofu")) {
    return "Raw weight — most accurate for hitting protein targets";
  }

  return undefined;
}

export function toIngredientLine(ing: ScaledIngredient): IngredientLine {
  if (isSeasoning(ing)) {
    return {
      name: ing.name,
      section: "season",
      primary: formatVolume(ing),
      hint: "Season to taste — exact grams aren't critical here",
    };
  }

  const grams = scaledAmountToGrams(ing);
  if (grams != null) {
    return {
      name: ing.name,
      section: "weigh",
      primary: `${grams} g`,
      hint: practicalHint(ing, grams),
    };
  }

  return {
    name: ing.name,
    section: "weigh",
    primary: `${ing.scaledAmount} ${ing.unit}`,
  };
}

export function toIngredientLines(ingredients: ScaledIngredient[]): {
  weigh: IngredientLine[];
  season: IngredientLine[];
} {
  const weigh: IngredientLine[] = [];
  const season: IngredientLine[] = [];

  for (const ing of ingredients) {
    const line = toIngredientLine(ing);
    if (line.section === "season") season.push(line);
    else weigh.push(line);
  }

  return { weigh, season };
}
