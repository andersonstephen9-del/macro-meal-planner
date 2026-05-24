import { DAYS } from "./constants";
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

function recipeUsesBannedIngredient(
  recipe: Recipe,
  blacklist: string[]
): boolean {
  if (blacklist.length === 0) return false;
  const banned = blacklist.map((b) => b.toLowerCase());
  return recipe.baseIngredients.some((ing) =>
    banned.some(
      (b) =>
        normalizeName(ing.name).includes(b) || b.includes(normalizeName(ing.name))
    )
  );
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function ingredientOverlapScore(a: Recipe, b: Recipe): number {
  const namesA = new Set(a.baseIngredients.map((i) => normalizeName(i.name)));
  let score = 0;
  for (const ing of b.baseIngredients) {
    if (namesA.has(normalizeName(ing.name))) score += 1;
  }
  return score;
}

function isImportedRecipe(recipe: Recipe): boolean {
  return recipe.id.startsWith("recipe-imported-");
}

function pickCohesiveWeek(
  pool: Recipe[],
  blacklist: string[],
  profiles: Profile[],
  specialScores: Record<string, number>
): Recipe[] {
  const eligible = pool.filter((r) => !recipeUsesBannedIngredient(r, blacklist));
  if (eligible.length === 0) return [];

  const macroEligible = eligible.filter((recipe) =>
    recipeFitsAllProfiles(recipe, profiles)
  );
  const candidates =
    macroEligible.length >= 7 ? macroEligible : eligible;

  const selected: Recipe[] = [];
  const usedIds = new Set<string>();

  const starter =
    candidates.find((r) => isImportedRecipe(r)) ??
    candidates.find((r) => r.rating && r.rating >= 4) ??
    candidates[0];
  selected.push(starter);
  usedIds.add(starter.id);

  while (selected.length < 7) {
    let best: Recipe | null = null;
    let bestScore = -1;

    for (const candidate of candidates) {
      if (usedIds.has(candidate.id)) continue;

      const overlap = selected.reduce(
        (sum, s) => sum + ingredientOverlapScore(s, candidate),
        0
      );
      const ratingBonus = (candidate.rating ?? 3) * 0.5;
      const importedBonus = isImportedRecipe(candidate) ? 1.5 : 0;
      const specialBonus = recipeSpecialScore(candidate, specialScores) * 8;
      const macroBonus = averageMacroFitScore(candidate, profiles);
      const score =
        overlap * 2 +
        ratingBonus +
        importedBonus +
        specialBonus +
        macroBonus;

      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    if (!best) {
      const fallback = candidates.find((r) => !usedIds.has(r.id));
      if (!fallback) break;
      best = fallback;
    }

    selected.push(best);
    usedIds.add(best.id);
  }

  return selected;
}

export interface GenerateWeeklyPlanResult {
  weeklyPlan: WeeklyPlan;
  recipeVault: Recipe[];
}

/**
 * Weekly plan generator: macro-aware for all profiles, prefers Coles specials,
 * and favours ingredient overlap across the week.
 */
export function generateWeeklyPlan(
  existingVault: Recipe[],
  preferenceLedger: PreferenceLedger,
  profiles: Profile[],
  specialScores: Record<string, number> = {}
): GenerateWeeklyPlanResult {
  const pool = [...MOCK_RECIPES];
  for (const r of existingVault) {
    if (!pool.some((p) => p.id === r.id)) {
      pool.push(r);
    }
  }

  const picked = pickCohesiveWeek(
    pool,
    preferenceLedger.dislikedIngredients,
    profiles,
    specialScores
  );

  const weeklyPlan = {} as WeeklyPlan;
  DAYS.forEach(({ key }, index) => {
    weeklyPlan[key] = picked[index % picked.length]?.id ?? null;
  });

  const vaultMap = new Map(existingVault.map((r) => [r.id, r]));
  for (const recipe of picked) {
    if (!vaultMap.has(recipe.id)) {
      vaultMap.set(recipe.id, recipe);
    }
  }

  return {
    weeklyPlan,
    recipeVault: Array.from(vaultMap.values()),
  };
}
