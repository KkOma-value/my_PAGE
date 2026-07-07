import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { randomBytes } from "crypto";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_FILE", message: "No image file provided" },
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: `File type must be one of: ${ALLOWED_TYPES.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "File size must be less than 5MB",
          },
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = randomBytes(4).toString("hex");
    // Always output .jpg for consistency
    const filename = `upload-${timestamp}-${random}.jpg`;

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(UPLOAD_DIR, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      data: { url: `/uploads/${filename}` },
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "UPLOAD_FAILED", message: "Failed to upload image" },
      },
      { status: 500 }
    );
  }
}
