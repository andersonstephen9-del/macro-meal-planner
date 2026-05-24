import { scaleIngredients } from "./scaleIngredients";
import type { Profile, Recipe, ScaledIngredient } from "./types";

function ingredientKey(name: string, unit: string): string {
  return `${name.trim().toLowerCase()}::${unit.toLowerCase()}`;
}

/** Sum scaled ingredient amounts across every profile for one recipe */
export function mergeScaledIngredientsForProfiles(
  recipe: Recipe,
  profiles: Profile[]
): ScaledIngredient[] {
  if (profiles.length === 0) return [];

  const merged = new Map<string, ScaledIngredient>();

  for (const profile of profiles) {
    const { ingredients } = scaleIngredients(recipe, profile);
    for (const ing of ingredients) {
      const key = ingredientKey(ing.name, ing.unit);
      const existing = merged.get(key);
      if (existing) {
        existing.scaledAmount += ing.scaledAmount;
      } else {
        merged.set(key, { ...ing });
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
