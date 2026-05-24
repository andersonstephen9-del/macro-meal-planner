"use client";

import { useEffect, useState } from "react";
import type { AggregatedShoppingItem } from "./types";
import type { PriceEstimate } from "./matchGroceryPrice";

interface ShoppingPriceState {
  estimates: Record<string, PriceEstimate | null>;
  total: number;
  matchedCount: number;
  loading: boolean;
  error: string | null;
}

const EMPTY_STATE: ShoppingPriceState = {
  estimates: {},
  total: 0,
  matchedCount: 0,
  loading: false,
  error: null,
};

export function useShoppingPrices(items: AggregatedShoppingItem[]): ShoppingPriceState {
  const [state, setState] = useState<ShoppingPriceState>(EMPTY_STATE);

  useEffect(() => {
    if (items.length === 0) {
      setState(EMPTY_STATE);
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    fetch("/api/grocery-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          totalAmount: item.totalAmount,
          unit: item.unit,
          category: item.category,
        })),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Could not load Coles prices");
        }
        return response.json() as Promise<{
          estimates: Record<string, PriceEstimate | null>;
          total: number;
          matchedCount: number;
        }>;
      })
      .then((result) => {
        if (cancelled) return;
        setState({
          estimates: result.estimates,
          total: result.total,
          matchedCount: result.matchedCount,
          loading: false,
          error: null,
        });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState({
          estimates: {},
          total: 0,
          matchedCount: 0,
          loading: false,
          error: error.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [items]);

  return state;
}

export function formatAud(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
