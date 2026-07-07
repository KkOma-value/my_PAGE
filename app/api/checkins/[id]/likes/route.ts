import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const likeSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: checkInId } = await params;
    const body = (await request.json()) as unknown;
    const parsed = likeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: parsed.error.issues.map((i) => i.message).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // Verify check-in exists
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
    });

    if (!checkIn) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Check-in not found" },
        },
        { status: 404 }
      );
    }

    // Toggle like: check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_checkInId: {
          userId,
          checkInId,
        },
      },
    });

    if (existingLike) {
      // Unlike: delete the existing like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({
        success: true,
        data: { liked: false },
      });
    }

    // Like: create new like
    await prisma.like.create({
      data: {
        userId,
        checkInId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { liked: true },
    });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LIKE_FAILED",
          message: "Failed to toggle like",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: checkInId } = await params;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    // Get like count
    const count = await prisma.like.count({
      where: { checkInId },
    });

    // Check if specific user has liked
    let liked = false;
    if (userId) {
      const existing = await prisma.like.findUnique({
        where: {
          userId_checkInId: {
            userId,
            checkInId,
          },
        },
      });
      liked = existing !== null;
    }

    return NextResponse.json({
      success: true,
      data: { count, liked },
    });
  } catch (error) {
    console.error("Failed to fetch likes:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "FETCH_FAILED", message: "Failed to fetch likes" },
      },
      { status: 500 }
    );
  }
}
