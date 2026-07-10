import { getSupabaseAuth } from "@/lib/supabase/server";

export interface AuthenticatedUser {
  userId: string;
  accessToken: string;
}

export function parseBearerToken(header: string | null) {
  const match = header?.match(/^Bearer ([^\s]+)$/);
  return match?.[1] ?? null;
}

export async function requireUser(request: Request): Promise<AuthenticatedUser> {
  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) {
    throw Object.assign(new Error("Missing bearer token"), { status: 401, code: "UNAUTHORIZED" });
  }

  const { data, error } = await getSupabaseAuth().auth.getUser(token);
  if (error || !data.user) {
    throw Object.assign(new Error("Invalid session"), { status: 401, code: "UNAUTHORIZED" });
  }

  return { userId: data.user.id, accessToken: token };
}
