import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/map-checkins?city=shanghai&date=2026-07-07
// Returns check-ins with lat/lng for map markers
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const cityCode = url.searchParams.get("city");
    const date = url.searchParams.get("date");
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") ?? "50", 10)));

    const where: Record<string, unknown> = {};

    if (cityCode) {
      where.city = { code: cityCode };
    }
    if (date) {
      where.date = date;
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      select: {
        id: true,
        lat: true,
        lng: true,
        locationName: true,
        imageUrl: true,
        cardUrl: true,
        caption: true,
        date: true,
        drink: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true, label: true } },
            brand: { select: { name: true } },
          },
        },
        city: { select: { name: true, code: true } },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    console.error("Failed to fetch map check-ins:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_FAILED", message: "Failed to fetch check-ins" } },
      { status: 500 }
    );
  }
}
