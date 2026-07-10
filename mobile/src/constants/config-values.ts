interface MobileConfigInput {
  publicApiUrl?: string;
  publicSupabaseUrl?: string;
  publicSupabaseKey?: string;
  hostUri?: string | null;
}

function withoutTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function resolveMobileConfig(input: MobileConfigInput) {
  const metroHost = input.hostUri?.split(":")[0];
  const apiUrl = withoutTrailingSlash(
    input.publicApiUrl || (metroHost ? `http://${metroHost}:5555` : "http://localhost:5555"),
  );

  return {
    apiUrl,
    apiBase: `${apiUrl}/api/mobile`,
    supabaseUrl: withoutTrailingSlash(input.publicSupabaseUrl || ""),
    supabaseAnonKey: input.publicSupabaseKey || "",
  };
}
