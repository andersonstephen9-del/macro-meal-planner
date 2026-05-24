"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { useMealPlanner } from "@/context/MealPlannerProvider";
import { getRecipeImageSrc } from "@/lib/recipeImage";
import type { Recipe } from "@/lib/types";

interface RecipeImageProps {
  recipe: Recipe;
  className?: string;
  alt?: string;
}

export function RecipeImage({ recipe, className = "", alt }: RecipeImageProps) {
  const { cacheRecipeImage } = useMealPlanner();
  const src = getRecipeImageSrc(recipe);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
  }, [recipe.id, src]);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 ${className}`}
    >
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-emerald/70">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xs font-medium">Generating photo…</span>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
          <ImageIcon className="h-12 w-12" />
          <span className="mt-1 text-xs">Image unavailable</span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? `${recipe.name} — AI generated meal photo`}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setStatus("loaded");
          if (!recipe.imageUrl) {
            cacheRecipeImage(recipe.id, src);
          }
        }}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
