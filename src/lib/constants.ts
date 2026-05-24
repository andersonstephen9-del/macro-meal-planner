import type { DayKey } from "./types";

export const STORAGE_KEY = "macro-meal-planner-state-v3";

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

export const MAX_PROFILES = 6;

export const CATEGORY_ORDER = [
  "Meat & Seafood",
  "Produce",
  "Pantry",
  "Dairy",
] as const;
