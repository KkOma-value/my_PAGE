import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        drinks: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "FETCH_FAILED", message: "Failed to fetch brands" },
      },
      { status: 500 }
    );
  }
}
