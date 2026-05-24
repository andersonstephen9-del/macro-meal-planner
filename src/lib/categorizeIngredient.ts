import type { Ingredient, SupermarketCategory } from "./types";

const MEAT_KEYWORDS = [
  "chicken",
  "beef",
  "turkey",
  "salmon",
  "shrimp",
  "cod",
  "pork",
  "tofu",
  "fish",
];

const PRODUCE_KEYWORDS = [
  "asparagus",
  "broccoli",
  "pepper",
  "onion",
  "zucchini",
  "tomato",
  "kale",
  "beans",
  "potato",
  "sprout",
  "apple",
  "lemon",
  "avocado",
  "ginger",
  "garlic",
  "green onion",
];

const DAIRY_KEYWORDS = ["yogurt", "butter", "cheese", "milk", "cream"];

export function categorizeIngredient(ingredient: Ingredient): SupermarketCategory {
  const name = ingredient.name.toLowerCase();

  if (DAIRY_KEYWORDS.some((k) => name.includes(k))) {
    return "Dairy";
  }

  if (
    ingredient.macroType === "protein" ||
    MEAT_KEYWORDS.some((k) => name.includes(k))
  ) {
    return "Meat & Seafood";
  }

  if (
    ingredient.macroType === "carb" &&
    PRODUCE_KEYWORDS.some((k) => name.includes(k))
  ) {
    return "Produce";
  }

  if (ingredient.macroType === "pantry" || ingredient.macroType === "fat") {
    const looksProduce = PRODUCE_KEYWORDS.some((k) => name.includes(k));
    if (looksProduce) return "Produce";
    return "Pantry";
  }

  if (ingredient.macroType === "carb") {
    return "Produce";
  }

  return "Pantry";
}
