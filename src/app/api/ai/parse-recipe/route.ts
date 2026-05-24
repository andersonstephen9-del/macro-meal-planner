import { NextResponse } from "next/server";
import { parseRecipeWithOpenAI } from "@/lib/aiParseRecipe";
import { isOpenAIConfigured } from "@/lib/openai";
import {
  parseRecipeImportLocal,
  type ParseRecipeImportInput,
} from "@/lib/parseRecipeImport";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ParseRecipeImportInput;

    if (!body.source || !body.content?.trim()) {
      return NextResponse.json(
        { error: "source and content are required." },
        { status: 400 }
      );
    }

    if (isOpenAIConfigured()) {
      try {
        const result = await parseRecipeWithOpenAI(body);
        return NextResponse.json({ ...result, source: "openai" });
      } catch (error) {
        console.error("OpenAI parse-recipe failed:", error);
      }
    }

    const fallback = await parseRecipeImportLocal(body);
    return NextResponse.json({ ...fallback, source: "fallback" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse recipe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
