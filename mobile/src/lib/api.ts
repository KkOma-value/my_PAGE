import { API_BASE } from "@/constants/Config";
import { getSupabase } from "./supabase";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function accessToken() {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("请先登录");
  return token;
}

async function readEnvelope<T>(response: Response) {
  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !envelope?.success) {
    throw new Error(envelope?.error?.message ?? `请求失败 (${response.status})`);
  }
  return envelope.data as T;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${await accessToken()}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return readEnvelope<T>(response);
}

export async function apiFormRequest<T>(path: string, formData: FormData) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}` },
    body: formData,
  });
  return readEnvelope<T>(response);
}
