import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isAppleSignInAvailable, sendPhoneOtp, signInWithApple, verifyPhoneOtp } from "@/lib/auth";

export function AuthScreen() {
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    isAppleSignInAvailable().then((available) => {
      if (mounted) setAppleAvailable(available);
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function requestOtp() {
    try {
      setBusy(true);
      const normalized = await sendPhoneOtp(phone);
      setVerifiedPhone(normalized);
    } catch (error) {
      Alert.alert("验证码发送失败", error instanceof Error ? error.message : "请稍后重试");
    } finally {
      setBusy(false);
    }
  }

  async function confirmOtp() {
    try {
      setBusy(true);
      await verifyPhoneOtp(verifiedPhone, otp);
    } catch (error) {
      Alert.alert("登录失败", error instanceof Error ? error.message : "请检查验证码");
    } finally {
      setBusy(false);
    }
  }

  async function handleAppleSignIn() {
    try {
      setBusy(true);
      await signInWithApple();
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Apple 登录失败", error instanceof Error ? error.message : "请稍后重试");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}>
            <Ionicons name="cafe" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.brand}>SipNotes</Text>
          <Text style={styles.subtitle}>记录你喝过的每一杯</Text>

          <View style={styles.form}>
            <Text style={styles.label}>手机号</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.countryCode}>+86</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                editable={!verifiedPhone && !busy}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                placeholder="请输入手机号"
                placeholderTextColor="#9AA19C"
                style={styles.input}
              />
            </View>

            {verifiedPhone ? (
              <>
                <Text style={styles.label}>验证码</Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={8}
                  placeholder="输入短信验证码"
                  placeholderTextColor="#9AA19C"
                  style={styles.otpInput}
                />
                <Pressable
                  onPress={confirmOtp}
                  disabled={busy || otp.trim().length < 4}
                  style={({ pressed }) => [styles.primaryButton, (busy || otp.trim().length < 4) && styles.disabled, pressed && styles.pressed]}
                >
                  {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>登录 / 注册</Text>}
                </Pressable>
                <Pressable onPress={() => { setVerifiedPhone(""); setOtp(""); }} style={styles.linkButton}>
                  <Text style={styles.linkText}>更换手机号</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={requestOtp}
                disabled={busy || phone.trim().length < 11}
                style={({ pressed }) => [styles.primaryButton, (busy || phone.trim().length < 11) && styles.disabled, pressed && styles.pressed]}
              >
                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>获取验证码</Text>}
              </Pressable>
            )}

            {appleAvailable ? (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>或</Text>
                  <View style={styles.divider} />
                </View>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={7}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />
              </>
            ) : null}
          </View>
          <Text style={styles.legal}>登录即表示你同意服务条款与隐私政策</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8F5" },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 28, alignItems: "center" },
  brandMark: { width: 54, height: 54, borderRadius: 8, backgroundColor: "#2F6B49", alignItems: "center", justifyContent: "center" },
  brand: { marginTop: 18, fontSize: 32, fontWeight: "900", color: "#24332A" },
  subtitle: { marginTop: 8, fontSize: 15, color: "#6C756F" },
  form: { width: "100%", marginTop: 46 },
  label: { marginBottom: 8, fontSize: 13, fontWeight: "700", color: "#4F5C54" },
  phoneRow: { height: 52, borderWidth: 1, borderColor: "#C9D0CA", backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  countryCode: { paddingHorizontal: 14, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: "#C9D0CA", fontSize: 16, fontWeight: "700", color: "#24332A" },
  input: { flex: 1, height: "100%", paddingHorizontal: 14, fontSize: 16, color: "#24332A" },
  otpInput: { height: 52, borderWidth: 1, borderColor: "#C9D0CA", backgroundColor: "#FFFFFF", paddingHorizontal: 14, fontSize: 20, letterSpacing: 4, color: "#24332A" },
  primaryButton: { marginTop: 18, height: 52, backgroundColor: "#2F6B49", alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.72 },
  linkButton: { height: 42, alignItems: "center", justifyContent: "center" },
  linkText: { color: "#2F6B49", fontWeight: "700" },
  dividerRow: { marginVertical: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#C9D0CA" },
  dividerText: { color: "#8A928D", fontSize: 12 },
  appleButton: { width: "100%", height: 50 },
  legal: { marginTop: "auto", paddingTop: 34, fontSize: 11, color: "#8A928D" },
});
