import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { CategoryType, RankingItem } from "@/types";

const VALID_CATEGORIES = ["milk_tea", "coffee", "fruit_tea"] as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const cityCode = url.searchParams.get("city");
    const date = url.searchParams.get("date") ?? todayDate();
    const category = url.searchParams.get("category")?.toLowerCase() ?? null;

    if (!cityCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_CITY",
            message: "city query parameter is required",
          },
        },
        { status: 400 }
      );
    }

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { code: cityCode },
    });

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "City not found" },
        },
        { status: 404 }
      );
    }

    // Build base where clause
    const checkInWhere: Record<string, unknown> = {
      cityId: city.id,
      date,
    };

    // If category filter, find matching category ID first
    let categoryId: string | null = null;
    let categoryName: string | null = null;
    if (category && VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      categoryName = category;
      const cat = await prisma.category.findUnique({
        where: { name: category },
      });
      if (cat) {
        categoryId = cat.id;
      }
    }

    // Get all check-ins for this city + date, grouped by drink
    const checkIns = await prisma.checkIn.findMany({
      where: checkInWhere,
      include: {
        drink: {
          include: {
            brand: true,
            category: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    // If category filter, filter check-ins by drink category
    const filteredCheckIns = categoryId
      ? checkIns.filter((ci) => ci.drink.categoryId === categoryId)
      : checkIns;

    // Aggregate by drink
    const drinkAgg = new Map<
      string,
      {
        drink: {
          id: string;
          name: string;
          brand: string;
          category: CategoryType;
        };
        count: number;
        likes: number;
      }
    >();

    for (const ci of filteredCheckIns) {
      const existing = drinkAgg.get(ci.drinkId);
      if (existing) {
        existing.count += 1;
        existing.likes += ci._count?.likes ?? 0;
      } else {
        drinkAgg.set(ci.drinkId, {
          drink: {
            id: ci.drink.id,
            name: ci.drink.name,
            brand: ci.drink.brand.name,
            category: ci.drink.category.name as CategoryType,
          },
          count: 1,
          likes: ci._count?.likes ?? 0,
        });
      }
    }

    // Sort by count DESC, then likes DESC
    const sorted = Array.from(drinkAgg.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.likes - a.likes;
    });

    // Take top 3 and assign ranks
    const top3: RankingItem[] = sorted.slice(0, 3).map((item, index) => ({
      rank: index + 1,
      drink: item.drink,
      count: item.count,
      likes: item.likes,
    }));

    return NextResponse.json({
      success: true,
      data: {
        city: city.name,
        date,
        category: categoryName ?? "all",
        top3,
      },
    });
  } catch (error) {
    console.error("Failed to fetch rankings:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch rankings",
        },
      },
      { status: 500 }
    );
  }
}

function todayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
