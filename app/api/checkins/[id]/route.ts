import { NextRequest, NextResponse } from "next/server";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Find the check-in first to get file paths
    const checkIn = await prisma.checkIn.findUnique({
      where: { id },
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

    // Attempt to delete associated image file
    if (checkIn.imageUrl) {
      const imagePath = join(
        process.cwd(),
        "public",
        checkIn.imageUrl.replace(/^\//, "")
      );
      try {
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      } catch {
        // Ignore file deletion errors
      }
    }

    // Attempt to delete associated card file
    if (checkIn.cardUrl) {
      const cardPath = join(
        process.cwd(),
        "public",
        checkIn.cardUrl.replace(/^\//, "")
      );
      try {
        if (existsSync(cardPath)) {
          unlinkSync(cardPath);
        }
      } catch {
        // Ignore file deletion errors
      }
    }

    // Delete the check-in (likes are cascade-deleted by Prisma)
    await prisma.checkIn.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete check-in:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_FAILED",
          message: "Failed to delete check-in",
        },
      },
      { status: 500 }
    );
  }
}
