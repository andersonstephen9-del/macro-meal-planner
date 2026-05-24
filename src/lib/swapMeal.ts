import { MOCK_RECIPES } from "./mockRecipes";
import {
  averageMacroFitScore,
  recipeFitsAllProfiles,
  recipeSpecialScore,
} from "./recipeMacroFit";
import type {
  DayKey,
  PreferenceLedger,
  Profile,
  Recipe,
  WeeklyPlan,
} from "./types";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function recipeUsesBannedIngredient(
  recipe: Recipe,
  blacklist: string[]
): boolean {
  if (blacklist.length === 0) return false;
  const banned = blacklist.map((b) => b.toLowerCase());
  return recipe.baseIngredients.some((ing) =>
    banned.some(
      (b) =>
        normalizeName(ing.name).includes(b) ||
        b.includes(normalizeName(ing.name))
    )
  );
}

function weekIngredientOverlap(
  recipe: Recipe,
  weeklyPlan: WeeklyPlan,
  recipeMap: Map<string, Recipe>,
  excludeDay: DayKey
): number {
  const weekNames = new Set<string>();
  for (const [day, id] of Object.entries(weeklyPlan) as [DayKey, string | null][]) {
    if (day === excludeDay || !id) continue;
    const r = recipeMap.get(id);
    if (!r) continue;
    for (const ing of r.baseIngredients) {
      weekNames.add(normalizeName(ing.name));
    }
  }
  let score = 0;
  for (const ing of recipe.baseIngredients) {
    if (weekNames.has(normalizeName(ing.name))) score += 1;
  }
  return score;
}

/**
 * Rank swap candidates: macro fit for all profiles, Coles specials, and week overlap.
 */
export function getSwapAlternatives(
  dayKey: DayKey,
  currentRecipeId: string | null,
  weeklyPlan: WeeklyPlan,
  recipeVault: Recipe[],
  preferenceLedger: PreferenceLedger,
  profiles: Profile[],
  specialScores: Record<string, number> = {}
): Recipe[] {
  const pool = [...recipeVault];
  for (const r of MOCK_RECIPES) {
    if (!pool.some((p) => p.id === r.id)) pool.push(r);
  }

  const recipeMap = new Map(pool.map((r) => [r.id, r]));
  const blacklist = preferenceLedger.dislikedIngredients;

  const eligible = pool
    .filter((r) => r.id !== currentRecipeId)
    .filter((r) => !recipeUsesBannedIngredient(r, blacklist));

  const macroEligible = eligible.filter((recipe) =>
    recipeFitsAllProfiles(recipe, profiles)
  );
  const candidates =
    macroEligible.length > 0 ? macroEligible : eligible;

  return candidates
    .map((r) => ({
      recipe: r,
      score:
        weekIngredientOverlap(r, weeklyPlan, recipeMap, dayKey) * 2 +
        (r.rating ?? 3) * 0.5 +
        recipeSpecialScore(r, specialScores) * 8 +
        averageMacroFitScore(r, profiles),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.recipe);
}
