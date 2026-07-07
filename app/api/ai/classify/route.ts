import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { classifyImage } from "@/lib/ai";

const classifyRequestSchema = z.object({
  imageUrl: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;
    const parsed = classifyRequestSchema.safeParse(body);

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

    const result = await classifyImage(parsed.data.imageUrl);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI classify error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "CLASSIFY_FAILED", message: "Classification failed" },
      },
      { status: 500 }
    );
  }
}
