import type { CompletedDays, DayKey } from "./types";

export const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function emptyCompletedDays(): CompletedDays {
  return {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  };
}

export function isDayCompleted(
  completedDays: CompletedDays,
  dayKey: DayKey
): boolean {
  return Boolean(completedDays[dayKey]);
}
