import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { RecognitionStatus, RecognitionSuggestion } from "../types/app";

interface Props {
  status: RecognitionStatus;
  suggestion: Partial<RecognitionSuggestion>;
  onApply(): void;
  onRetry(): void;
}

export function RecognitionSuggestionBar({ status, suggestion, onApply, onRetry }: Props) {
  if (status === "uploading" || status === "recognizing") {
    return (
      <View style={styles.bar}>
        <ActivityIndicator size="small" color="#2F6B49" />
        <Text style={styles.message}>{status === "uploading" ? "照片上传中" : "正在识别饮品与门店"}</Text>
      </View>
    );
  }
  if (status === "failed") {
    return (
      <View style={styles.bar}>
        <Ionicons name="alert-circle-outline" size={20} color="#A34D3F" />
        <Text style={styles.message}>识别未完成</Text>
        <Pressable onPress={onRetry} style={styles.action}><Text style={styles.actionText}>重试</Text></Pressable>
      </View>
    );
  }
  if (status !== "ready" || (!suggestion.drinkName && !suggestion.brandName)) return null;

  return (
    <View style={styles.bar}>
      <Ionicons name="sparkles" size={20} color="#2F6B49" />
      <View style={styles.copy}>
        <Text style={styles.title}>识别建议</Text>
        <Text style={styles.detail} numberOfLines={1}>
          {[suggestion.brandName, suggestion.drinkName].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <Pressable onPress={onApply} style={styles.action}><Text style={styles.actionText}>应用</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 58, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#EDF3EE", borderLeftWidth: 3, borderLeftColor: "#2F6B49", flexDirection: "row", alignItems: "center", gap: 10 },
  copy: { flex: 1 },
  title: { color: "#2F6B49", fontSize: 13, fontWeight: "800" },
  detail: { marginTop: 2, color: "#59645D", fontSize: 12 },
  message: { flex: 1, color: "#4F5C54", fontSize: 13, fontWeight: "700" },
  action: { minWidth: 48, height: 34, alignItems: "center", justifyContent: "center" },
  actionText: { color: "#2F6B49", fontSize: 13, fontWeight: "800" },
});
