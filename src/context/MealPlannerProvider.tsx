"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isDayCompleted } from "@/lib/completedDays";
import {
  parseRecipeImport,
  type ParseRecipeImportInput,
} from "@/lib/parseRecipeImport";
import { DAYS } from "@/lib/constants";
import { getRecipeImageSrc } from "@/lib/recipeImage";
import { emptyCompletedDays } from "@/lib/completedDays";
import { createInitialState, loadState, saveState } from "@/lib/storage";
import { MAX_PROFILES } from "@/lib/constants";
import type {
  AppState,
  ArchivedMeal,
  DayKey,
  NavTab,
  Profile,
  Recipe,
} from "@/lib/types";

interface MealPlannerContextValue extends AppState {
  navTab: NavTab;
  setNavTab: (tab: NavTab) => void;
  setActiveDay: (day: DayKey) => void;
  getRecipeById: (id: string | null) => Recipe | undefined;
  selectedPortionProfiles: Profile[];
  togglePortionProfile: (id: string) => void;
  selectAllPortionProfiles: () => void;
  updateProfile: (profile: Profile) => void;
  addProfile: () => void;
  removeProfile: (id: string) => void;
  runGenerateWeeklyPlan: () => void;
  cacheRecipeImage: (recipeId: string, imageUrl: string) => void;
  finishMeal: (dayKey: DayKey, recipeId: string, rating: number) => void;
  isDayCompleted: (dayKey: DayKey) => boolean;
  addBannedIngredient: (ingredient: string) => void;
  removeBannedIngredient: (ingredient: string) => void;
  removeLikedFlavorProfile: (tag: string) => void;
  toggleShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;
  isGenerating: boolean;
  isSwapping: boolean;
  lastRebalanceMessage: string | null;
  swapMeal: (dayKey: DayKey, newRecipeId: string) => void;
  assignRecipeToDay: (dayKey: DayKey, recipeId: string) => void;
  importRecipe: (
    input: ParseRecipeImportInput & {
      dryRun?: boolean;
      recipeOverride?: Recipe;
    }
  ) => Promise<{ recipe: Recipe; summary: string }>;
}

const MealPlannerContext = createContext<MealPlannerContextValue | null>(null);

export function MealPlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);
  const [navTab, setNavTab] = useState<NavTab>("profiles");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastRebalanceMessage, setLastRebalanceMessage] = useState<string | null>(
    null
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const getRecipeById = useCallback(
    (id: string | null) => state.recipeVault.find((r) => r.id === id),
    [state.recipeVault]
  );

  const selectedPortionProfiles = useMemo(
    () =>
      state.profiles.filter((p) =>
        state.selectedPortionProfileIds.includes(p.id)
      ),
    [state.profiles, state.selectedPortionProfileIds]
  );

  const setActiveDay = useCallback((day: DayKey) => {
    setState((s) => ({ ...s, activeDay: day }));
  }, []);

  const togglePortionProfile = useCallback((id: string) => {
    setState((s) => {
      const selected = s.selectedPortionProfileIds;
      const isOn = selected.includes(id);
      if (isOn && selected.length <= 1) return s;
      const next = isOn
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      return { ...s, selectedPortionProfileIds: next };
    });
  }, []);

  const selectAllPortionProfiles = useCallback(() => {
    setState((s) => ({
      ...s,
      selectedPortionProfileIds: s.profiles.map((p) => p.id),
    }));
  }, []);

  const updateProfile = useCallback((profile: Profile) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === profile.id ? profile : p)),
    }));
  }, []);

  const addProfile = useCallback(() => {
    setState((s) => {
      if (s.profiles.length >= MAX_PROFILES) return s;
      const id = `profile-${Date.now()}`;
      const newProfile: Profile = {
        id,
        name: `Profile ${s.profiles.length + 1}`,
        targetCalories: 550,
        targetProtein: 45,
        targetCarbs: 40,
        targetFats: 18,
      };
      return {
        ...s,
        profiles: [...s.profiles, newProfile],
        selectedPortionProfileIds: [...s.selectedPortionProfileIds, id],
      };
    });
  }, []);

  const removeProfile = useCallback((id: string) => {
    setState((s) => {
      if (s.profiles.length <= 1) return s;
      const profiles = s.profiles.filter((p) => p.id !== id);
      let selected = s.selectedPortionProfileIds.filter((x) => x !== id);
      if (selected.length === 0) {
        selected = [profiles[0].id];
      }
      return { ...s, profiles, selectedPortionProfileIds: selected };
    });
  }, []);

  const runGenerateWeeklyPlan = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profiles: state.profiles.filter((p) =>
            state.selectedPortionProfileIds.includes(p.id)
          ),
          recipeVault: state.recipeVault,
          preferenceLedger: state.preferenceLedger,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not generate weekly plan.");
      }

      const result = (await response.json()) as {
        weeklyPlan: AppState["weeklyPlan"];
        recipeVault: Recipe[];
      };

      setState((s) => ({
        ...s,
        weeklyPlan: result.weeklyPlan,
        recipeVault: result.recipeVault,
        completedDays: emptyCompletedDays(),
        checkedShoppingItems: [],
      }));
    } catch (error) {
      console.error(error);
      setLastRebalanceMessage(
        error instanceof Error
          ? error.message
          : "Could not generate weekly plan."
      );
      setTimeout(() => setLastRebalanceMessage(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  }, [state.profiles, state.selectedPortionProfileIds, state.recipeVault, state.preferenceLedger]);

  const cacheRecipeImage = useCallback((recipeId: string, imageUrl: string) => {
    setState((s) => ({
      ...s,
      recipeVault: s.recipeVault.map((r) =>
        r.id === recipeId && r.imageUrl !== imageUrl
          ? { ...r, imageUrl }
          : r
      ),
    }));
  }, []);

  const finishMeal = useCallback(
    (dayKey: DayKey, recipeId: string, rating: number) => {
      setState((s) => {
        const recipe = s.recipeVault.find((r) => r.id === recipeId);
        if (
          !recipe ||
          s.weeklyPlan[dayKey] !== recipeId ||
          s.completedDays[dayKey]
        ) {
          return s;
        }

        const profileNames = s.profiles.map((p) => p.name);
        const imageUrl = getRecipeImageSrc(recipe);
        const dayMeta = DAYS.find((d) => d.key === dayKey);

        const updatedVault = s.recipeVault.map((r) =>
          r.id === recipeId ? { ...r, rating, imageUrl } : r
        );

        const flavorTags = extractFlavorTags(recipe.name);
        const likedFlavorProfiles =
          rating >= 4
            ? Array.from(
                new Set([
                  ...s.preferenceLedger.likedFlavorProfiles,
                  ...flavorTags,
                ])
              )
            : s.preferenceLedger.likedFlavorProfiles;

        const archivedEntry: ArchivedMeal = {
          id: `archived-${Date.now()}`,
          recipeId,
          recipeName: recipe.name,
          imageUrl,
          rating,
          dayKey,
          dayLabel: dayMeta?.label ?? dayKey,
          profileNames,
          completedAt: new Date().toISOString(),
        };

        return {
          ...s,
          recipeVault: updatedVault,
          completedDays: { ...s.completedDays, [dayKey]: true },
          archivedMeals: [archivedEntry, ...s.archivedMeals],
          preferenceLedger: {
            ...s.preferenceLedger,
            likedFlavorProfiles,
          },
        };
      });
    },
    []
  );

  const checkDayCompleted = useCallback(
    (dayKey: DayKey) => isDayCompleted(state.completedDays, dayKey),
    [state.completedDays]
  );

  const addBannedIngredient = useCallback((ingredient: string) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      preferenceLedger: {
        ...s.preferenceLedger,
        dislikedIngredients: Array.from(
          new Set([...s.preferenceLedger.dislikedIngredients, trimmed])
        ),
      },
    }));
  }, []);

  const removeBannedIngredient = useCallback((ingredient: string) => {
    setState((s) => ({
      ...s,
      preferenceLedger: {
        ...s.preferenceLedger,
        dislikedIngredients: s.preferenceLedger.dislikedIngredients.filter(
          (i) => i !== ingredient
        ),
      },
    }));
  }, []);

  const removeLikedFlavorProfile = useCallback((tag: string) => {
    setState((s) => ({
      ...s,
      preferenceLedger: {
        ...s.preferenceLedger,
        likedFlavorProfiles: s.preferenceLedger.likedFlavorProfiles.filter(
          (t) => t !== tag
        ),
      },
    }));
  }, []);

  const toggleShoppingItem = useCallback((id: string) => {
    setState((s) => {
      const checked = s.checkedShoppingItems.includes(id)
        ? s.checkedShoppingItems.filter((x) => x !== id)
        : [...s.checkedShoppingItems, id];
      return { ...s, checkedShoppingItems: checked };
    });
  }, []);

  const clearCompletedShopping = useCallback(() => {
    setState((s) => ({ ...s, checkedShoppingItems: [] }));
  }, []);

  const swapMeal = useCallback((dayKey: DayKey, newRecipeId: string) => {
    setIsSwapping(true);
    let message = "Grocery list updated.";
    setState((s) => {
      const oldId = s.weeklyPlan[dayKey];
      const oldRecipe = s.recipeVault.find((r) => r.id === oldId);
      const newRecipe = s.recipeVault.find((r) => r.id === newRecipeId);
      if (!newRecipe) return s;

      const dayLabel = DAYS.find((d) => d.key === dayKey)?.label ?? dayKey;
      message = `Grocery list updated: swapped ${dayLabel} to ${newRecipe.name}${oldRecipe ? ` (was ${oldRecipe.name})` : ""}.`;

      return {
        ...s,
        weeklyPlan: { ...s.weeklyPlan, [dayKey]: newRecipeId },
        completedDays: { ...s.completedDays, [dayKey]: false },
      };
    });
    window.setTimeout(() => {
      setLastRebalanceMessage(message);
      setIsSwapping(false);
      window.setTimeout(() => setLastRebalanceMessage(null), 4000);
    }, 300);
  }, []);

  const assignRecipeToDay = useCallback((dayKey: DayKey, recipeId: string) => {
    setState((s) => ({
      ...s,
      weeklyPlan: { ...s.weeklyPlan, [dayKey]: recipeId },
      completedDays: { ...s.completedDays, [dayKey]: false },
    }));
    setLastRebalanceMessage("Meal added to your plan — shopping list refreshed.");
    setTimeout(() => setLastRebalanceMessage(null), 4000);
  }, []);

  const importRecipe = useCallback(
    async (
      input: ParseRecipeImportInput & {
        dryRun?: boolean;
        recipeOverride?: Recipe;
      }
    ) => {
      const result = input.recipeOverride
        ? {
            recipe: input.recipeOverride,
            summary: "Saved imported recipe.",
            confidence: "high" as const,
          }
        : await parseRecipeImport(input);

      if (!input.dryRun) {
        setState((s) => {
          const exists = s.recipeVault.some((r) => r.id === result.recipe.id);
          return {
            ...s,
            recipeVault: exists
              ? s.recipeVault.map((r) =>
                  r.id === result.recipe.id ? result.recipe : r
                )
              : [...s.recipeVault, result.recipe],
          };
        });
        setLastRebalanceMessage(
          `${result.recipe.name} saved to your vault — Generate New Week can now include it.`
        );
        setTimeout(() => setLastRebalanceMessage(null), 4000);
      }

      return { recipe: result.recipe, summary: result.summary };
    },
    []
  );

  const value: MealPlannerContextValue = {
    ...state,
    navTab,
    setNavTab,
    setActiveDay,
    getRecipeById,
    selectedPortionProfiles,
    togglePortionProfile,
    selectAllPortionProfiles,
    updateProfile,
    addProfile,
    removeProfile,
    runGenerateWeeklyPlan,
    cacheRecipeImage,
    finishMeal,
    isDayCompleted: checkDayCompleted,
    addBannedIngredient,
    removeBannedIngredient,
    removeLikedFlavorProfile,
    toggleShoppingItem,
    clearCompletedShopping,
    isGenerating,
    isSwapping,
    lastRebalanceMessage,
    swapMeal,
    assignRecipeToDay,
    importRecipe,
  };

  return (
    <MealPlannerContext.Provider value={value}>
      {children}
    </MealPlannerContext.Provider>
  );
}

function extractFlavorTags(recipeName: string): string[] {
  const lower = recipeName.toLowerCase();
  const tags: string[] = [];
  if (lower.includes("stir")) tags.push("stir-fry");
  if (lower.includes("garlic")) tags.push("garlic");
  if (
    lower.includes("salmon") ||
    lower.includes("cod") ||
    lower.includes("shrimp")
  )
    tags.push("seafood");
  if (
    lower.includes("chicken") ||
    lower.includes("turkey") ||
    lower.includes("beef")
  )
    tags.push("high-protein");
  return tags;
}

export function useMealPlanner() {
  const ctx = useContext(MealPlannerContext);
  if (!ctx) {
    throw new Error("useMealPlanner must be used within MealPlannerProvider");
  }
  return ctx;
}
