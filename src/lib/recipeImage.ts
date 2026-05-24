import type { Recipe } from "./types";

/** Stable numeric seed from recipe id for consistent AI images */
export function recipeImageSeed(recipeId: string): number {
  return recipeId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

/** Text prompt sent to the image model from recipe metadata */
export function buildRecipeImagePrompt(recipe: Recipe): string {
  const ingredientHint = recipe.baseIngredients
    .slice(0, 5)
    .map((i) => i.name)
    .join(", ");
  const summary =
    recipe.instructionsSummary ??
    recipe.instructions[0] ??
    "healthy high-protein dinner";

  return [
    `Professional food photography of ${recipe.name}.`,
    `Plated fitness dinner with ${ingredientHint}.`,
    summary,
    "Appetizing, natural lighting, shallow depth of field, restaurant quality, no text, no watermark.",
  ].join(" ");
}

/** Pollinations.ai URL — free text-to-image, deterministic per recipe seed */
export function buildRecipeImageUrl(recipe: Recipe): string {
  const prompt = buildRecipeImagePrompt(recipe);
  const seed = recipeImageSeed(recipe.id);
  const params = new URLSearchParams({
    width: "512",
    height: "384",
    seed: String(seed),
    nologo: "true",
    model: "flux",
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
}

export function getRecipeImageSrc(recipe: Recipe): string {
  return recipe.imageUrl ?? buildRecipeImageUrl(recipe);
}
