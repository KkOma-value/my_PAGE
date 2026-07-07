import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const drinks = await prisma.drink.findMany({
      where: { brandId: id },
      include: {
        brand: true,
        category: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: drinks,
    });
  } catch (error) {
    console.error("Failed to fetch drinks:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "FETCH_FAILED", message: "Failed to fetch drinks" },
      },
      { status: 500 }
    );
  }
}
