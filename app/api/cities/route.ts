import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { code: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "FETCH_FAILED", message: "Failed to fetch cities" },
      },
      { status: 500 }
    );
  }
}
