import { scaleIngredients } from "./scaleIngredients";
import type { Profile, Recipe } from "./types";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/** Average relative deviation from protein, carbs, and fat targets after calorie scaling. */
export function macroDeviation(recipe: Recipe, profile: Profile): number {
  const scaled = scaleIngredients(recipe, profile);
  const proteinGap =
    Math.abs(scaled.protein - profile.targetProtein) /
    Math.max(profile.targetProtein, 1);
  const carbsGap =
    Math.abs(scaled.carbs - profile.targetCarbs) /
    Math.max(profile.targetCarbs, 1);
  const fatsGap =
    Math.abs(scaled.fats - profile.targetFats) /
    Math.max(profile.targetFats, 1);
  return (proteinGap + carbsGap + fatsGap) / 3;
}

export function recipeFitsAllProfiles(
  recipe: Recipe,
  profiles: Profile[],
  tolerance = 0.35
): boolean {
  if (profiles.length === 0) return true;
  return profiles.every((profile) => macroDeviation(recipe, profile) <= tolerance);
}

export function averageMacroFitScore(
  recipe: Recipe,
  profiles: Profile[]
): number {
  if (profiles.length === 0) return 0;
  const fit =
    profiles.reduce(
      (sum, profile) => sum + Math.max(0, 1 - macroDeviation(recipe, profile)),
      0
    ) / profiles.length;
  return fit * 10;
}

export function recipeSpecialScore(
  recipe: Recipe,
  specialScores: Record<string, number>
): number {
  let total = 0;
  for (const ingredient of recipe.baseIngredients) {
    total += specialScores[normalizeName(ingredient.name)] ?? 0;
  }
  return total;
}

export function collectIngredientNames(recipes: Recipe[]): string[] {
  const names = new Set<string>();
  for (const recipe of recipes) {
    for (const ingredient of recipe.baseIngredients) {
      names.add(ingredient.name);
    }
  }
  return Array.from(names);
}
