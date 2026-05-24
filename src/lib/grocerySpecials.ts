import {
  isOnSpecial,
  loadColesProducts,
  specialDiscount,
  type ColesProduct,
} from "./groceryProducts";
import { findBestProductForIngredient } from "./matchGroceryPrice";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function buildIngredientSpecialScores(
  products: ColesProduct[],
  ingredientNames: string[]
): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const name of ingredientNames) {
    const product = findBestProductForIngredient(name, products);
    if (product && isOnSpecial(product)) {
      scores[normalizeName(name)] = specialDiscount(product);
    }
  }

  return scores;
}

export function loadIngredientSpecialScores(
  ingredientNames: string[]
): Record<string, number> {
  const products = loadColesProducts();
  return buildIngredientSpecialScores(products, ingredientNames);
}
