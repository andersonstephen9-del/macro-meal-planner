import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function getTextModel(): string {
  return process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini";
}

export function getVisionModel(): string {
  return process.env.OPENAI_VISION_MODEL ?? "gpt-4o";
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
