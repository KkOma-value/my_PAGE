import { NextResponse } from "next/server";

export function jsonOkPayload<T>(data: T) {
  return { success: true as const, data };
}

export function jsonErrorPayload(code: string, message: string) {
  return { success: false as const, error: { code, message } };
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(jsonOkPayload(data), init);
}

export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json(jsonErrorPayload(code, message), { status });
}

export function errorDetails(error: unknown, fallbackCode: string, fallbackMessage: string) {
  if (error instanceof Error) {
    const tagged = error as Error & { code?: string; status?: number };
    return {
      code: tagged.code ?? fallbackCode,
      message: tagged.message,
      status: tagged.status ?? 500,
    };
  }

  return { code: fallbackCode, message: fallbackMessage, status: 500 };
}
