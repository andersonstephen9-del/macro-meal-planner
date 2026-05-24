import {
  normalizeRecipeDraft,
  parseJsonFromModel,
} from "./aiSchemas";
import { getOpenAIClient, getTextModel, getVisionModel } from "./openai";
import type {
  ParseRecipeImportInput,
  ParseRecipeImportResult,
} from "./parseRecipeImport";

const MAX_URL_CHARS = 12000;

async function fetchUrlText(url: string): Promise<string> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const response = await fetch(normalized, {
    headers: { "User-Agent": "MacroMealPlanner/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Could not fetch recipe URL (HTTP ${response.status}).`);
  }
  const html = await response.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_URL_CHARS);
}

function buildTextPrompt(input: ParseRecipeImportInput, body: string): string {
  if (input.source === "url") {
    return [
      "Extract a structured dinner recipe from this webpage text.",
      `Original URL: ${input.content}`,
      "",
      body,
    ].join("\n");
  }

  if (input.source === "photo") {
    return [
      "Extract a structured dinner recipe from this cookbook photo.",
      input.photoHint?.trim()
        ? `User caption: ${input.photoHint.trim()}`
        : "No caption provided — infer from the image.",
    ].join("\n");
  }

  return ["Extract a structured dinner recipe from this text:", "", body].join(
    "\n"
  );
}

export async function parseRecipeWithOpenAI(
  input: ParseRecipeImportInput
): Promise<ParseRecipeImportResult> {
  const client = getOpenAIClient();
  const systemPrompt = [
    "You extract dinner recipes for a macro meal planner.",
    "Return JSON only with shape:",
    '{ "recipe": { "name", "baseCalories", "baseProtein", "baseCarbs", "baseFats", "baseIngredients", "instructions", "instructionsSummary" }, "confidence": "high"|"medium", "summary": "one sentence" }',
    "Use grams for weighable ingredients when possible.",
    "Each ingredient needs macroType: protein, carb, fat, or pantry.",
    "Estimate reasonable macros if not provided.",
  ].join(" ");

  if (input.source === "photo") {
    if (!input.content.startsWith("data:image/")) {
      throw new Error("Photo import requires an image upload.");
    }

    const response = await client.chat.completions.create({
      model: getVisionModel(),
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildTextPrompt(input, ""),
            },
            {
              type: "image_url",
              image_url: { url: input.content },
            },
          ],
        },
      ],
    });

    return finalizeParseResult(response.choices[0]?.message?.content);
  }

  const body =
    input.source === "url"
      ? await fetchUrlText(input.content)
      : input.content.trim();

  if (!body) {
    throw new Error("No recipe content to parse.");
  }

  const response = await client.chat.completions.create({
    model: getTextModel(),
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: buildTextPrompt(input, body),
      },
    ],
  });

  return finalizeParseResult(response.choices[0]?.message?.content);
}

function finalizeParseResult(content: string | null | undefined): ParseRecipeImportResult {
  if (!content) {
    throw new Error("OpenAI returned an empty recipe.");
  }

  const parsed = parseJsonFromModel(content) as {
    recipe?: unknown;
    confidence?: string;
    summary?: string;
  };

  const recipe = normalizeRecipeDraft(
    parsed.recipe,
    `recipe-imported-${Date.now()}`
  );
  if (!recipe) {
    throw new Error("OpenAI returned an invalid recipe shape.");
  }

  return {
    recipe,
    confidence: parsed.confidence === "high" ? "high" : "medium",
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Parsed with OpenAI.",
  };
}
