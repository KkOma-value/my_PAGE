import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { apiRequest } from "./api";
import { normalizePhoneNumber } from "./auth-input";
import { getSupabase } from "./supabase";

export async function sendPhoneOtp(phoneInput: string) {
  const phone = normalizePhoneNumber(phoneInput);
  const { error } = await getSupabase().auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
  return phone;
}

export async function verifyPhoneOtp(phoneInput: string, token: string) {
  const phone = normalizePhoneNumber(phoneInput);
  const { error } = await getSupabase().auth.verifyOtp({ phone, token: token.trim(), type: "sms" });
  if (error) throw new Error(error.message);
}

export function isAppleSignInAvailable() {
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple() {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const credential = await AppleAuthentication.signInAsync({
    nonce: hashedNonce,
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) throw new Error("Apple 登录未返回身份令牌");

  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw new Error(error.message);

  if (credential.fullName) {
    const fullName = AppleAuthentication.formatFullName(credential.fullName, "default").trim();
    if (fullName) await supabase.auth.updateUser({ data: { full_name: fullName } });
  }
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut({ scope: "global" });
  if (error) throw new Error(error.message);
}

export async function deleteAccount() {
  await apiRequest<{ deleted: boolean }>("/account/delete", { method: "POST" });
  await getSupabase().auth.signOut({ scope: "local" });
}
