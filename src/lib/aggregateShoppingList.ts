import { DAYS } from "./constants";
import { categorizeIngredient } from "./categorizeIngredient";
import { scaledAmountToGrams } from "./ingredientDisplay";
import { mergeScaledIngredientsForProfiles } from "./scaleIngredientsMulti";
import type {
  AggregatedShoppingItem,
  DayKey,
  Profile,
  Recipe,
  WeeklyPlan,
} from "./types";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function makeItemId(name: string): string {
  return normalizeName(name);
}

export function aggregateShoppingList(
  weeklyPlan: WeeklyPlan,
  recipeVault: Recipe[],
  profiles: Profile[]
): AggregatedShoppingItem[] {
  if (profiles.length === 0) return [];

  const recipeMap = new Map(recipeVault.map((r) => [r.id, r]));
  const totals = new Map<string, AggregatedShoppingItem>();

  for (const { key, short } of DAYS) {
    const recipeId = weeklyPlan[key as DayKey];
    if (!recipeId) continue;

    const recipe = recipeMap.get(recipeId);
    if (!recipe) continue;

    const mealLabel = `${short} · ${recipe.name}`;
    const householdIngredients = mergeScaledIngredientsForProfiles(
      recipe,
      profiles
    );

    for (const ing of householdIngredients) {
      const isCountUnit = ing.unit.toLowerCase() === "pc";
      const grams = isCountUnit ? null : scaledAmountToGrams(ing);
      const amount = isCountUnit ? ing.scaledAmount : (grams ?? ing.scaledAmount);
      const unit = isCountUnit ? ing.unit : grams != null ? "g" : ing.unit;
      const id = makeItemId(ing.name);
      const existing = totals.get(id);

      if (existing) {
        existing.totalAmount += amount;
        if (!existing.usedInMeals.includes(mealLabel)) {
          existing.usedInMeals.push(mealLabel);
        }
      } else {
        totals.set(id, {
          id,
          name: ing.name,
          totalAmount: amount,
          unit,
          category: categorizeIngredient(ing),
          usedInMeals: [mealLabel],
        });
      }
    }
  }

  const dayOrder = new Map(DAYS.map((d, i) => [d.short, i]));

  return Array.from(totals.values())
    .map((item) => ({
      ...item,
      usedInMeals: [...item.usedInMeals].sort(
        (a, b) =>
          (dayOrder.get(a.split(" · ")[0]) ?? 99) -
          (dayOrder.get(b.split(" · ")[0]) ?? 99)
      ),
    }))
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
}
