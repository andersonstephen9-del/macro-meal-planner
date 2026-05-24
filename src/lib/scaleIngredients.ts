import { roundGrams } from "./ingredientDisplay";
import type {
  ProfileTargets,
  Recipe,
  ScaledIngredient,
  ScaledRecipeResult,
} from "./types";

function roundAmount(value: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === "g") return roundGrams(value);
  if (u === "pinch" || u === "spray") return Math.max(1, Math.round(value));
  if (u === "tsp" || u === "tbsp") return Math.round(value * 10) / 10;
  if (u === "pc" || u === "cloves" || u === "stalks") {
    return Math.max(0.25, Math.round(value * 4) / 4);
  }
  return Math.round(value);
}

/**
 * Scales recipe ingredients and macros to match a profile's dinner calorie target.
 */
export function scaleIngredients(
  recipe: Recipe,
  profileTarget: ProfileTargets
): ScaledRecipeResult {
  const scaleFactor =
    recipe.baseCalories > 0
      ? profileTarget.targetCalories / recipe.baseCalories
      : 1;

  const ingredients: ScaledIngredient[] = recipe.baseIngredients.map((ing) => ({
    ...ing,
    scaledAmount: roundAmount(ing.amount * scaleFactor, ing.unit),
  }));

  return {
    scaleFactor,
    ingredients,
    calories: Math.round(recipe.baseCalories * scaleFactor),
    protein: Math.round(recipe.baseProtein * scaleFactor),
    carbs: Math.round(recipe.baseCarbs * scaleFactor),
    fats: Math.round(recipe.baseFats * scaleFactor),
  };
}
