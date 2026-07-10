import { useEffect, useState, type ReactNode } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AuthScreen } from "./AuthScreen";
import { getSupabase, registerSupabaseAutoRefresh } from "@/lib/supabase";

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>();
  const [runtimeError, setRuntimeError] = useState("");
  const [setup] = useState<{ supabase?: SupabaseClient; error: string }>(() => {
    try {
      return { supabase: getSupabase(), error: "" };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Supabase 配置错误" };
    }
  });

  useEffect(() => {
    let mounted = true;
    let stopAutoRefresh = () => {};
    const supabase = setup.supabase;
    if (!supabase) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setRuntimeError(error.message);
      else setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });
    stopAutoRefresh = registerSupabaseAutoRefresh();
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      stopAutoRefresh();
    };
  }, [setup.supabase]);

  const configurationError = setup.error || runtimeError;
  if (configurationError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>无法连接 SipNotes</Text>
        <Text style={styles.errorText}>{configurationError}</Text>
      </View>
    );
  }
  if (session === undefined) {
    return <View style={styles.center}><ActivityIndicator color="#2F6B49" /></View>;
  }
  if (!session) return <AuthScreen />;
  return children;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#F7F8F5", alignItems: "center", justifyContent: "center", padding: 28 },
  errorTitle: { fontSize: 18, fontWeight: "800", color: "#24332A", marginBottom: 8 },
  errorText: { fontSize: 13, lineHeight: 19, color: "#6C756F", textAlign: "center" },
});
