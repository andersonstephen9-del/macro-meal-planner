import { NextResponse } from "next/server";
import { MOCK_RECIPES } from "@/lib/mockRecipes";
import { collectIngredientNames } from "@/lib/recipeMacroFit";
import { loadIngredientSpecialScores } from "@/lib/grocerySpecials";
import type { Recipe } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { recipes?: Recipe[] };
    const recipes = body.recipes?.length ? body.recipes : MOCK_RECIPES;
    const ingredientNames = collectIngredientNames(recipes);
    const specials = loadIngredientSpecialScores(ingredientNames);
    return NextResponse.json({ specials });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Coles specials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ingredientNames = collectIngredientNames(MOCK_RECIPES);
    const specials = loadIngredientSpecialScores(ingredientNames);
    return NextResponse.json({ specials });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Coles specials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
