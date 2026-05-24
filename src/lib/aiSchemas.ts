import type {
  DayKey,
  Ingredient,
  MacroType,
  Recipe,
} from "./types";

const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MACRO_TYPES = new Set<MacroType>(["protein", "carb", "fat", "pantry"]);

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value
    .map((item) => asString(item))
    .filter((item): item is string => item != null);
  return items.length > 0 ? items : null;
}

function normalizeMacroType(value: unknown): MacroType {
  const raw = asString(value)?.toLowerCase();
  if (raw && MACRO_TYPES.has(raw as MacroType)) {
    return raw as MacroType;
  }
  return "pantry";
}

export function normalizeIngredient(raw: unknown): Ingredient | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const name = asString(record.name);
  const amount = asNumber(record.amount);
  const unit = asString(record.unit);
  if (!name || amount == null || amount <= 0 || !unit) return null;
  return {
    name,
    amount,
    unit,
    macroType: normalizeMacroType(record.macroType),
  };
}

export function normalizeRecipeDraft(
  raw: unknown,
  fallbackId: string
): Recipe | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const name = asString(record.name);
  const baseCalories = asNumber(record.baseCalories);
  const baseProtein = asNumber(record.baseProtein);
  const baseCarbs = asNumber(record.baseCarbs);
  const baseFats = asNumber(record.baseFats);
  const instructions = asStringArray(record.instructions);

  if (
    !name ||
    baseCalories == null ||
    baseProtein == null ||
    baseCarbs == null ||
    baseFats == null ||
    !instructions
  ) {
    return null;
  }

  const ingredients = Array.isArray(record.baseIngredients)
    ? record.baseIngredients
        .map(normalizeIngredient)
        .filter((item): item is Ingredient => item != null)
    : [];

  if (ingredients.length < 2) return null;

  const id = asString(record.id) ?? fallbackId;
  const instructionsSummary = asString(record.instructionsSummary);

  return {
    id,
    name,
    baseCalories: Math.round(baseCalories),
    baseProtein: Math.round(baseProtein),
    baseCarbs: Math.round(baseCarbs),
    baseFats: Math.round(baseFats),
    baseIngredients: ingredients,
    instructions,
    instructionsSummary: instructionsSummary ?? instructions[0],
  };
}

export function parseJsonFromModel(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

export function isDayKey(value: string): value is DayKey {
  return DAY_KEYS.includes(value as DayKey);
}

export { DAY_KEYS };
