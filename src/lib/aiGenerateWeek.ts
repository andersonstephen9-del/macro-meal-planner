import { MOCK_RECIPES } from "./mockRecipes";
import {
  DAY_KEYS,
  isDayKey,
  normalizeRecipeDraft,
  parseJsonFromModel,
} from "./aiSchemas";
import { getOpenAIClient, getTextModel } from "./openai";
import type { GenerateWeeklyPlanResult } from "./generateWeeklyPlan";
import type {
  PreferenceLedger,
  Profile,
  Recipe,
  WeeklyPlan,
} from "./types";

export interface GenerateWeekAIInput {
  profiles: Profile[];
  recipeVault: Recipe[];
  preferenceLedger: PreferenceLedger;
  specialScores: Record<string, number>;
}

function summarizeRecipe(recipe: Recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    baseCalories: recipe.baseCalories,
    baseProtein: recipe.baseProtein,
    baseCarbs: recipe.baseCarbs,
    baseFats: recipe.baseFats,
    ingredients: recipe.baseIngredients.map((ing) => ing.name),
  };
}

function buildSpecialList(specialScores: Record<string, number>): string[] {
  return Object.entries(specialScores)
    .filter(([, discount]) => discount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([name, discount]) => `${name} (~${Math.round(discount * 100)}% off)`);
}

export async function generateWeekWithOpenAI(
  input: GenerateWeekAIInput
): Promise<GenerateWeeklyPlanResult> {
  const pool = [...MOCK_RECIPES];
  for (const recipe of input.recipeVault) {
    if (!pool.some((item) => item.id === recipe.id)) {
      pool.push(recipe);
    }
  }

  const specials = buildSpecialList(input.specialScores);
  const client = getOpenAIClient();
  const model = getTextModel();

  const response = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are a diet-aware meal planner for an Australian household shopping at Coles.",
          "Return JSON only.",
          "Design exactly 7 dinner recipes (one per weekday) that work for ALL profiles after calorie scaling.",
          "Prefer ingredients on special, reuse ingredients across the week, and avoid banned ingredients.",
          "Use grams for produce and protein where possible.",
          "Each recipe needs: name, baseCalories, baseProtein, baseCarbs, baseFats, baseIngredients[], instructions[].",
          "Each ingredient needs: name, amount, unit, macroType (protein|carb|fat|pantry).",
          'JSON shape: { "meals": [ { "day": "monday", "recipe": { ... } }, ... ] }',
          "Days must be monday through sunday exactly once each.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            profiles: input.profiles,
            bannedIngredients: input.preferenceLedger.dislikedIngredients,
            colesSpecials: specials,
            existingRecipes: pool.map(summarizeRecipe),
            rules: [
              "Every meal must reasonably fit every profile's protein, carbs, and fats when scaled to each profile's targetCalories.",
              "Maximize overlap of ingredients between meals.",
              "When a special ingredient fits the macros, prefer it.",
              "You may reuse or adapt existingRecipes, or create new ones.",
            ],
          },
          null,
          2
        ),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty meal plan.");
  }

  const parsed = parseJsonFromModel(content) as {
    meals?: Array<{ day?: string; recipe?: unknown }>;
  };

  if (!Array.isArray(parsed.meals) || parsed.meals.length !== 7) {
    throw new Error("OpenAI meal plan must include exactly 7 meals.");
  }

  const weeklyPlan = {} as WeeklyPlan;
  const vaultMap = new Map(input.recipeVault.map((recipe) => [recipe.id, recipe]));
  const timestamp = Date.now();

  for (const [index, meal] of parsed.meals.entries()) {
    const day = meal.day?.toLowerCase();
    if (!day || !isDayKey(day)) {
      throw new Error(`Invalid day in AI meal plan: ${meal.day ?? "missing"}`);
    }

    const recipe = normalizeRecipeDraft(
      meal.recipe,
      `recipe-ai-${timestamp}-${index}`
    );
    if (!recipe) {
      throw new Error(`Invalid recipe for ${day} in AI meal plan.`);
    }

    weeklyPlan[day] = recipe.id;
    if (!vaultMap.has(recipe.id)) {
      vaultMap.set(recipe.id, recipe);
    }
  }

  for (const day of DAY_KEYS) {
    if (!weeklyPlan[day]) {
      throw new Error(`AI meal plan missing ${day}.`);
    }
  }

  return {
    weeklyPlan,
    recipeVault: Array.from(vaultMap.values()),
  };
}
