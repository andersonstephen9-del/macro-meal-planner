import { scaledAmountToGrams, toIngredientLine } from "./ingredientDisplay";
import { mergeScaledIngredientsForProfiles } from "./scaleIngredientsMulti";
import { scaleIngredients } from "./scaleIngredients";
import type { Profile, Recipe, ScaledIngredient } from "./types";

export type ProfileAccent = "emerald" | "violet" | "cyan" | "coral";

export const PROFILE_ACCENTS: ProfileAccent[] = [
  "emerald",
  "violet",
  "cyan",
  "coral",
];

export interface PortionIngredientRow {
  name: string;
  section: "weigh" | "season";
  amounts: { person: string; shortName: string; amount: string }[];
  total: string;
  unit: string;
}

function parsePrimaryDisplay(primary: string): { total: string; unit: string } {
  const match = primary.match(/^([\d.]+)\s*(.*)$/);
  if (!match) return { total: primary, unit: "" };
  return { total: match[1], unit: match[2] || "" };
}

export function buildPortionIngredientRows(
  recipe: Recipe,
  profiles: Profile[]
): PortionIngredientRow[] {
  if (profiles.length === 0) return [];

  const merged = mergeScaledIngredientsForProfiles(recipe, profiles);

  return merged.map((ing) => {
    const line = toIngredientLine(ing);
    const { total, unit } = parsePrimaryDisplay(line.primary);

    const amounts = profiles
      .map((profile) => {
        const { ingredients } = scaleIngredients(recipe, profile);
        const single = ingredients.find((i) => i.name === ing.name);
        if (!single) return null;
        const singleLine = toIngredientLine(single);
        return {
          person: profile.name,
          shortName: profile.name.charAt(0).toUpperCase(),
          amount: singleLine.primary,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a != null);

    return {
      name: ing.name,
      section: line.section,
      amounts,
      total,
      unit,
    };
  });
}

export function sumScaledMacrosForProfiles(
  recipe: Recipe,
  profiles: Profile[]
) {
  return profiles.reduce(
    (acc, profile) => {
      const s = scaleIngredients(recipe, profile);
      return {
        calories: acc.calories + s.calories,
        protein: acc.protein + s.protein,
        carbs: acc.carbs + s.carbs,
        fats: acc.fats + s.fats,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

/** e.g. "Alex 275 g + Jordan 260 g" for one ingredient across profiles */
export function buildIngredientBreakdownHint(
  recipe: Recipe,
  ingredientName: string,
  profiles: Profile[]
): string | undefined {
  if (profiles.length <= 1) return undefined;

  const parts = profiles.map((profile) => {
    const { ingredients } = scaleIngredients(recipe, profile);
    const ing = ingredients.find((i) => i.name === ingredientName);
    if (!ing) return null;
    const grams = scaledAmountToGrams(ing);
    const amount = grams ?? ing.scaledAmount;
    const unit = grams != null ? "g" : ing.unit;
    return `${profile.name} ${amount}${unit === "g" ? " g" : ` ${unit}`}`;
  });

  const valid = parts.filter((p): p is string => p != null);
  if (valid.length === 0) return undefined;

  const totalGrams = profiles.reduce((sum, profile) => {
    const { ingredients } = scaleIngredients(recipe, profile);
    const ing = ingredients.find((i) => i.name === ingredientName);
    if (!ing) return sum;
    return sum + (scaledAmountToGrams(ing) ?? ing.scaledAmount);
  }, 0);

  const roundedTotal = Math.round(totalGrams);
  return `${valid.join(" + ")} = ${roundedTotal} g`;
}

export function buildBreakdownHints(
  recipe: Recipe,
  ingredients: ScaledIngredient[],
  profiles: Profile[]
): Record<string, string> {
  const hints: Record<string, string> = {};
  for (const ing of ingredients) {
    const hint = buildIngredientBreakdownHint(recipe, ing.name, profiles);
    if (hint) hints[ing.name] = hint;
  }
  return hints;
}
