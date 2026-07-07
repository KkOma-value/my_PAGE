import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const monthParam = url.searchParams.get("month");
    const month = monthParam
      ? parseInt(monthParam, 10)
      : new Date().getMonth() + 1;

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_MONTH",
            message: "Month must be between 1 and 12",
          },
        },
        { status: 400 }
      );
    }

    const tip = await prisma.seasonTip.findFirst({
      where: { month },
    });

    if (!tip) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Parse comma-separated drink IDs and fetch drinks
    const drinkIds = tip.drinkIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const drinks =
      drinkIds.length > 0
        ? await prisma.drink.findMany({
            where: { id: { in: drinkIds } },
            include: {
              brand: true,
              category: true,
            },
          })
        : [];

    return NextResponse.json({
      success: true,
      data: {
        ...tip,
        drinks,
      },
    });
  } catch (error) {
    console.error("Failed to fetch season tip:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch season tip",
        },
      },
      { status: 500 }
    );
  }
}
