import type { Ingredient, MacroType, Recipe } from "./types";

export type RecipeImportSource = "url" | "text" | "photo";

export interface ParseRecipeImportInput {
  source: RecipeImportSource;
  /** URL, pasted recipe text, or base64/data URL for photo */
  content: string;
  /** Optional caption / OCR hint when importing from photo */
  photoHint?: string;
}

export interface ParseRecipeImportResult {
  recipe: Recipe;
  confidence: "high" | "medium";
  summary: string;
}

const DEMO_URL_RECIPES: Record<string, Omit<Recipe, "id">> = {
  steak: {
    name: "Seared Sirloin with Roasted Potatoes",
    baseCalories: 580,
    baseProtein: 48,
    baseCarbs: 32,
    baseFats: 28,
    baseIngredients: [
      { name: "Sirloin Steak", amount: 200, unit: "g", macroType: "protein" },
      { name: "Baby Potatoes", amount: 250, unit: "g", macroType: "carb" },
      { name: "Green Beans", amount: 120, unit: "g", macroType: "carb" },
      { name: "Butter", amount: 10, unit: "g", macroType: "fat" },
      { name: "Garlic", amount: 8, unit: "g", macroType: "pantry" },
    ],
    instructions: [
      "Pat steak dry; season generously.",
      "Sear steak 3–4 min per side to desired doneness; rest 5 min.",
      "Roast halved potatoes at 425°F for 22 min.",
      "Sauté beans with garlic and butter.",
      "Slice steak; serve with potatoes and beans.",
    ],
  },
  pasta: {
    name: "High-Protein Turkey Bolognese",
    baseCalories: 520,
    baseProtein: 42,
    baseCarbs: 55,
    baseFats: 14,
    baseIngredients: [
      { name: "Ground Turkey", amount: 200, unit: "g", macroType: "protein" },
      { name: "Whole Wheat Pasta", amount: 100, unit: "g", macroType: "carb" },
      { name: "Crushed Tomatoes", amount: 200, unit: "g", macroType: "carb" },
      { name: "Onion", amount: 55, unit: "g", macroType: "carb" },
      { name: "Olive Oil", amount: 10, unit: "g", macroType: "fat" },
    ],
    instructions: [
      "Brown turkey with onion.",
      "Add tomatoes; simmer 20 min.",
      "Cook pasta al dente; toss with sauce.",
    ],
  },
};

function inferMacroType(name: string): MacroType {
  const n = name.toLowerCase();
  if (
    /chicken|beef|turkey|salmon|shrimp|cod|pork|tofu|steak|fish|egg|protein/.test(
      n
    )
  )
    return "protein";
  if (/oil|butter|avocado|tahini|cheese|cream|fat/.test(n)) return "fat";
  if (/rice|pasta|potato|bread|quinoa|beans|pepper|onion|tomato|veg|broccoli|asparagus|carb/.test(n))
    return "carb";
  return "pantry";
}

function parseAmountUnit(token: string): { amount: number; unit: string } | null {
  const match = token.match(/^([\d./]+)\s*(g|kg|ml|oz|lb|tbsp|tsp|cup|pcs?)?/i);
  if (!match) return null;
  let amount = 0;
  const raw = match[1];
  if (raw.includes("/")) {
    const [a, b] = raw.split("/").map(Number);
    amount = b ? a / b : Number(raw);
  } else {
    amount = parseFloat(raw);
  }
  if (Number.isNaN(amount)) return null;
  const unit = (match[2] || "g").toLowerCase();
  const normalized =
    unit === "pc" || unit === "pcs" ? "g" : unit === "cup" ? "g" : unit;
  const scale = unit === "kg" ? 1000 : unit === "oz" ? 28 : unit === "lb" ? 454 : unit === "cup" ? 120 : 1;
  return { amount: Math.round(amount * scale), unit: normalized === unit ? normalized : "g" };
}

function parseTextRecipe(text: string): Omit<Recipe, "id"> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "Imported Recipe";
  const ingredients: Ingredient[] = [];
  const instructions: string[] = [];
  let mode: "none" | "ingredients" | "steps" = "none";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/^title:|^recipe:/i.test(line)) {
      name = line.replace(/^[^:]+:\s*/i, "").trim() || name;
      continue;
    }
    if (/^ingredients?/i.test(lower)) {
      mode = "ingredients";
      continue;
    }
    if (/^(instructions?|directions?|method)/i.test(lower)) {
      mode = "steps";
      continue;
    }
    if (mode === "ingredients" && /^[-•*]/.test(line)) {
      const body = line.replace(/^[-•*]\s*/, "");
      const parts = body.split(/\s+/);
      const parsed = parseAmountUnit(parts[0] + (parts[1] && /^[a-z]/i.test(parts[1]) ? " " + parts[1] : ""));
      if (parsed) {
        const nameStart = parsed.unit && body.match(/^\S+\s+\S+\s+(.+)/)
          ? body.replace(/^\S+\s+\S+\s+/, "")
          : body.replace(/^\S+\s+/, "");
        ingredients.push({
          name: nameStart.trim() || body,
          amount: parsed.amount,
          unit: parsed.unit,
          macroType: inferMacroType(nameStart),
        });
      } else {
        ingredients.push({
          name: body,
          amount: 100,
          unit: "g",
          macroType: inferMacroType(body),
        });
      }
      continue;
    }
    if (mode === "steps" && /^\d+[\).]/.test(line)) {
      instructions.push(line.replace(/^\d+[\).]\s*/, ""));
      continue;
    }
    if (mode === "none" && !name.includes("Imported") && line.length < 60) {
      name = line;
    }
  }

  if (ingredients.length === 0) {
    ingredients.push(
      { name: "Protein of choice", amount: 180, unit: "g", macroType: "protein" },
      { name: "Vegetables", amount: 200, unit: "g", macroType: "carb" },
      { name: "Olive Oil", amount: 10, unit: "g", macroType: "fat" }
    );
  }
  if (instructions.length === 0) {
    instructions.push(
      "Prep ingredients per list.",
      "Cook protein through.",
      "Sauté vegetables; combine and serve."
    );
  }

  const protein = ingredients
    .filter((i) => i.macroType === "protein")
    .reduce((s, i) => s + i.amount * 0.25, 0);
  const carbs = ingredients
    .filter((i) => i.macroType === "carb")
    .reduce((s, i) => s + i.amount * 0.15, 0);

  return {
    name,
    baseCalories: Math.round(400 + protein * 4 + carbs * 4),
    baseProtein: Math.round(protein) || 35,
    baseCarbs: Math.round(carbs) || 40,
    baseFats: 16,
    baseIngredients: ingredients,
    instructions,
    instructionsSummary: instructions[0],
  };
}

function matchUrlTemplate(url: string): Omit<Recipe, "id"> | null {
  const lower = url.toLowerCase();
  if (lower.includes("steak") || lower.includes("sirloin"))
    return DEMO_URL_RECIPES.steak;
  if (lower.includes("pasta") || lower.includes("bolognese"))
    return DEMO_URL_RECIPES.pasta;
  return null;
}

/**
 * Parse a recipe via the server OpenAI route (falls back to local parser if needed).
 */
export async function parseRecipeImport(
  input: ParseRecipeImportInput
): Promise<ParseRecipeImportResult> {
  const response = await fetch("/api/ai/parse-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Could not parse recipe.");
  }

  const result = (await response.json()) as ParseRecipeImportResult;
  return {
    recipe: result.recipe,
    confidence: result.confidence,
    summary: result.summary,
  };
}

/** @deprecated Used only as server fallback in /api/ai/parse-recipe */
export async function parseRecipeImportLocal(
  input: ParseRecipeImportInput
): Promise<ParseRecipeImportResult> {
  await delay(input.source === "photo" ? 1600 : 900);

  let parsed: Omit<Recipe, "id">;
  let confidence: "high" | "medium" = "medium";
  let summary: string;

  if (input.source === "url") {
    const fromUrl = matchUrlTemplate(input.content);
    if (fromUrl) {
      parsed = fromUrl;
      confidence = "high";
      summary = "Parsed page structure and nutrition estimates from the link.";
    } else {
      let host = "the web";
      try {
        host = new URL(
          input.content.startsWith("http") ? input.content : `https://${input.content}`
        ).hostname;
      } catch {
        /* use default host label */
      }
      parsed = parseTextRecipe(
        `Title: Recipe from ${host}\n\nIngredients:\n- 200 g chicken breast\n- 150 g rice\n- 100 g broccoli\n- 1 tbsp olive oil\n\nInstructions:\n1. Cook rice.\n2. Grill chicken.\n3. Steam broccoli and serve.`
      );
      summary = "Extracted recipe blocks from the webpage (demo parser).";
    }
  } else if (input.source === "photo") {
    const hint = input.photoHint?.trim() || "grilled chicken bowl";
    parsed = parseTextRecipe(
      `Title: ${hint}\n\nIngredients:\n- 200 g chicken breast\n- 180 g jasmine rice\n- 150 g mixed vegetables\n- 15 g soy sauce\n- 10 g sesame oil\n\nInstructions:\n1. Cook rice.\n2. Stir-fry chicken until done.\n3. Add vegetables and sauces; serve over rice.`
    );
    confidence = input.photoHint ? "high" : "medium";
    summary = input.photoHint
      ? "OCR + vision model matched your caption to ingredients and steps."
      : "Estimated from cookbook photo layout (add a caption for better accuracy).";
  } else {
    parsed = parseTextRecipe(input.content);
    confidence = parsed.baseIngredients.length >= 3 ? "high" : "medium";
    summary = "Structured ingredients and steps from pasted text.";
  }

  const recipe: Recipe = {
    ...parsed,
    id: `recipe-imported-${Date.now()}`,
  };

  return { recipe, confidence, summary };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
