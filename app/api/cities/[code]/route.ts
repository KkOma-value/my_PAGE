import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
): Promise<NextResponse> {
  try {
    const { code } = await params;

    const city = await prisma.city.findUnique({
      where: { code },
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

    const checkInCount = await prisma.checkIn.count({
      where: { cityId: city.id },
    });

    return NextResponse.json({
      success: true,
      data: { city, checkInCount },
    });
  } catch (error) {
    console.error("Failed to fetch city:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "FETCH_FAILED", message: "Failed to fetch city" },
      },
      { status: 500 }
    );
  }
}
