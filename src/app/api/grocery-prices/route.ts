import { NextResponse } from "next/server";
import { loadColesProducts } from "@/lib/groceryProducts";
import {
  estimateShoppingPrices,
  type PriceEstimateRequest,
} from "@/lib/matchGroceryPrice";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: PriceEstimateRequest[] };
    const items = body.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({
        estimates: {},
        total: 0,
        matchedCount: 0,
      });
    }

    const products = loadColesProducts();
    const result = estimateShoppingPrices(items, products);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load grocery prices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
