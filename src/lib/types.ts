export type MacroType = "protein" | "carb" | "fat" | "pantry";

export type SupermarketCategory =
  | "Meat & Seafood"
  | "Produce"
  | "Pantry"
  | "Dairy";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Profile {
  id: string;
  name: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  macroType: MacroType;
}

export interface Recipe {
  id: string;
  name: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFats: number;
  baseIngredients: Ingredient[];
  instructions: string[];
  instructionsSummary?: string;
  rating?: number;
  /** Cached AI-generated meal photo URL */
  imageUrl?: string;
}

export interface ArchivedMeal {
  id: string;
  recipeId: string;
  recipeName: string;
  imageUrl?: string;
  rating: number;
  dayKey: DayKey;
  dayLabel: string;
  profileNames: string[];
  completedAt: string;
}

export type CompletedDays = Record<DayKey, boolean>;

export interface WeeklyPlan {
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
}

export interface PreferenceLedger {
  dislikedIngredients: string[];
  likedFlavorProfiles: string[];
}

export interface AppState {
  profiles: Profile[];
  weeklyPlan: WeeklyPlan;
  recipeVault: Recipe[];
  archivedMeals: ArchivedMeal[];
  completedDays: CompletedDays;
  preferenceLedger: PreferenceLedger;
  /** Profiles included in planner portion / macro totals */
  selectedPortionProfileIds: string[];
  activeDay: DayKey;
  checkedShoppingItems: string[];
}

export interface ProfileTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
}

export interface ScaledIngredient extends Ingredient {
  scaledAmount: number;
}

export interface ScaledRecipeResult {
  scaleFactor: number;
  ingredients: ScaledIngredient[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface AggregatedShoppingItem {
  id: string;
  name: string;
  totalAmount: number;
  unit: string;
  category: SupermarketCategory;
  /** e.g. "Mon · Salmon", "Wed · Stir Fry" */
  usedInMeals: string[];
}

export type NavTab = "profiles" | "planner" | "shopping" | "archive";
