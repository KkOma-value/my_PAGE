import Constants from 'expo-constants';
import { resolveMobileConfig } from './config-values';

const config = resolveMobileConfig({
  publicApiUrl: process.env.EXPO_PUBLIC_API_URL,
  publicSupabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  publicSupabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  hostUri: Constants.expoConfig?.hostUri,
});

export const API_URL = config.apiUrl;
export const API_BASE = config.apiBase;
export const SUPABASE_URL = config.supabaseUrl;
export const SUPABASE_ANON_KEY = config.supabaseAnonKey;
