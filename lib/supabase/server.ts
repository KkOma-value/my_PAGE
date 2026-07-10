import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ServerEnvironment = Record<string, string | undefined>;

export function readSupabaseServerConfig(environment: ServerEnvironment = process.env) {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !publishableKey || !serviceRoleKey) {
    throw new Error("Missing Supabase server configuration");
  }

  return { url, publishableKey, serviceRoleKey };
}

let authClient: SupabaseClient | undefined;
let adminClient: SupabaseClient | undefined;

const serverAuthOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

export function getSupabaseAuth() {
  if (!authClient) {
    const config = readSupabaseServerConfig();
    authClient = createClient(config.url, config.publishableKey, serverAuthOptions);
  }
  return authClient;
}

export function getSupabaseAdmin() {
  if (!adminClient) {
    const config = readSupabaseServerConfig();
    adminClient = createClient(config.url, config.serviceRoleKey, serverAuthOptions);
  }
  return adminClient;
}
