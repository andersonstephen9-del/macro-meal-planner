import { NextResponse } from "next/server";
import { generateWeekWithOpenAI } from "@/lib/aiGenerateWeek";
import { generateWeeklyPlan } from "@/lib/generateWeeklyPlan";
import { loadIngredientSpecialScores } from "@/lib/grocerySpecials";
import { isOpenAIConfigured } from "@/lib/openai";
import { MOCK_RECIPES } from "@/lib/mockRecipes";
import { collectIngredientNames } from "@/lib/recipeMacroFit";
import type {
  PreferenceLedger,
  Profile,
  Recipe,
} from "@/lib/types";

interface GenerateWeekRequest {
  profiles?: Profile[];
  recipeVault?: Recipe[];
  preferenceLedger?: PreferenceLedger;
  specialScores?: Record<string, number>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateWeekRequest;
    const profiles = body.profiles ?? [];
    const recipeVault = body.recipeVault ?? [];
    const preferenceLedger = body.preferenceLedger ?? {
      dislikedIngredients: [],
      likedFlavorProfiles: [],
    };
    const specialScores =
      body.specialScores ??
      loadIngredientSpecialScores(
        collectIngredientNames([
          ...MOCK_RECIPES,
          ...recipeVault.filter(
            (recipe) => !MOCK_RECIPES.some((mock) => mock.id === recipe.id)
          ),
        ])
      );

    if (profiles.length === 0) {
      return NextResponse.json(
        { error: "At least one profile is required." },
        { status: 400 }
      );
    }

    if (isOpenAIConfigured()) {
      try {
        const result = await generateWeekWithOpenAI({
          profiles,
          recipeVault,
          preferenceLedger,
          specialScores,
        });
        return NextResponse.json({ ...result, source: "openai" });
      } catch (error) {
        console.error("OpenAI generate-week failed:", error);
      }
    }

    const fallback = generateWeeklyPlan(
      recipeVault,
      preferenceLedger,
      profiles,
      specialScores
    );
    return NextResponse.json({ ...fallback, source: "fallback" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate weekly plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
