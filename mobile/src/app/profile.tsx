import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrinkCalendar } from "@/components/DrinkCalendar";
import { deleteAccount, signOut } from "@/lib/auth";
import { fetchMyCheckIns } from "@/lib/checkins";
import { checkinsForDate, summarizeCheckins } from "@/lib/profile";
import { getSupabase } from "@/lib/supabase";
import type { PublishedCheckIn } from "@/types/app";

const CATEGORY_LABELS: Record<string, string> = {
  coffee: "咖啡",
  pour_over: "手冲",
  milk_tea: "奶茶",
  fruit_tea: "果茶",
  tea: "原叶茶",
  matcha: "抹茶",
  other: "其他",
};

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function ProfileScreen() {
  const today = useMemo(() => new Date(), []);
  const [displayName, setDisplayName] = useState("SipNotes 用户");
  const [accountLabel, setAccountLabel] = useState("");
  const [checkins, setCheckins] = useState<PublishedCheckIn[]>([]);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    getSupabase().auth.getSession().then(({ data }) => {
      if (!mounted || !data.session?.user) return;
      const user = data.session.user;
      const name = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name.trim() : "";
      setDisplayName(name || user.phone || "SipNotes 用户");
      setAccountLabel(user.phone || user.email || "Apple ID");
    });
    return () => {
      mounted = false;
    };
  }, []);

  const loadCheckins = useCallback(async () => {
    try {
      setErrorMessage("");
      setCheckins(await fetchMyCheckIns());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "饮记加载失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadCheckins();
  }, [loadCheckins]));

  const summary = useMemo(() => summarizeCheckins(checkins), [checkins]);
  const selectedRecords = useMemo(
    () => checkinsForDate(checkins, selectedDate),
    [checkins, selectedDate],
  );

  function moveMonth(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelectedDate(dateKey(next));
  }

  function refresh() {
    setRefreshing(true);
    void loadCheckins();
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("退出失败", error instanceof Error ? error.message : "请稍后重试");
    }
  }

  async function handleDeleteAccount() {
    try {
      setDeleting(true);
      await deleteAccount();
    } catch (error) {
      Alert.alert("删除失败", error instanceof Error ? error.message : "请稍后重试");
      setDeleting(false);
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "删除账号",
      "删除后将移除你的资料、私密记录和公开卡片。此操作无法撤销。",
      [
        { text: "取消", style: "cancel" },
        { text: "确认删除", style: "destructive", onPress: () => void handleDeleteAccount() },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#2F6B49" />}
      >
        <View style={styles.identityBand}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.displayName} numberOfLines={1}>{displayName}</Text>
            {accountLabel ? <Text style={styles.accountLabel} numberOfLines={1}>{accountLabel}</Text> : null}
          </View>
        </View>

        <View style={styles.metricsBand}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{summary.total}</Text>
            <Text style={styles.metricLabel}>饮记</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{summary.cityCount}</Text>
            <Text style={styles.metricLabel}>城市</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricValueSmall}>{summary.topCategory ? CATEGORY_LABELS[summary.topCategory] ?? summary.topCategory : "暂无"}</Text>
            <Text style={styles.metricLabel}>常喝</Text>
          </View>
        </View>

        <View style={styles.calendarBand}>
          <View style={styles.monthHeader}>
            <Pressable onPress={() => moveMonth(-1)} style={styles.iconButton} accessibilityLabel="上个月">
              <Ionicons name="chevron-back" size={21} color="#2F6B49" />
            </Pressable>
            <Text style={styles.monthTitle}>{month.getFullYear()} 年 {month.getMonth() + 1} 月</Text>
            <Pressable onPress={() => moveMonth(1)} style={styles.iconButton} accessibilityLabel="下个月">
              <Ionicons name="chevron-forward" size={21} color="#2F6B49" />
            </Pressable>
          </View>
          {loading ? <ActivityIndicator color="#2F6B49" style={styles.loader} /> : (
            <DrinkCalendar
              month={month}
              checkins={checkins}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        </View>

        <View style={styles.recordsBand}>
          <View style={styles.recordsHeader}>
            <Text style={styles.sectionTitle}>{selectedDate.slice(5).replace("-", " 月 ")} 日</Text>
            <Text style={styles.recordCount}>{selectedRecords.length} 杯</Text>
          </View>
          {selectedRecords.length === 0 ? <Text style={styles.emptyText}>当日暂无饮记</Text> : null}
          {selectedRecords.map((checkin) => (
            <View key={checkin.id} style={styles.recordCard}>
              <Image source={{ uri: checkin.image_url }} style={styles.recordImage} alt={`${checkin.drink_name}照片`} />
              <View style={styles.recordCopy}>
                <Text style={styles.recordDrink} numberOfLines={1}>{checkin.drink_name}</Text>
                <Text style={styles.recordBrand} numberOfLines={1}>{checkin.brand_name}{checkin.store_name ? ` · ${checkin.store_name}` : ""}</Text>
                <View style={styles.recordMetaRow}>
                  <Text style={styles.recordMeta}>{CATEGORY_LABELS[checkin.category] ?? checkin.category}</Text>
                  <Ionicons name={checkin.visibility === "public" ? "earth-outline" : "lock-closed-outline"} size={13} color="#7A847D" />
                  <Text style={styles.recordMeta}>{checkin.visibility === "public" ? "公开" : "私密"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.accountBand}>
          <Text style={styles.sectionTitle}>账号</Text>
          <Pressable onPress={() => void handleSignOut()} style={styles.accountRow}>
            <Ionicons name="log-out-outline" size={21} color="#24332A" />
            <Text style={styles.accountText}>退出登录</Text>
            <Ionicons name="chevron-forward" size={17} color="#9AA39D" />
          </Pressable>
          <Pressable onPress={confirmDeleteAccount} disabled={deleting} style={styles.accountRow}>
            <Ionicons name="trash-outline" size={21} color="#A34D3F" />
            <Text style={styles.deleteText}>{deleting ? "正在删除..." : "删除账号"}</Text>
            {deleting ? <ActivityIndicator size="small" color="#A34D3F" /> : <Ionicons name="chevron-forward" size={17} color="#B98980" />}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F4F0" },
  content: { paddingBottom: 34 },
  identityBand: { minHeight: 104, paddingHorizontal: 18, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center" },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#DCE9DF", alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#2F6B49", fontSize: 23, fontWeight: "900" },
  identityCopy: { flex: 1, minWidth: 0, marginLeft: 14 },
  displayName: { fontSize: 19, fontWeight: "900", color: "#24332A" },
  accountLabel: { marginTop: 5, fontSize: 12, color: "#7A847D" },
  metricsBand: { height: 86, backgroundColor: "#FFFFFF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E2E6E1", flexDirection: "row", alignItems: "center" },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { height: 29, fontSize: 23, fontWeight: "900", color: "#24332A" },
  metricValueSmall: { height: 29, maxWidth: 90, fontSize: 16, lineHeight: 29, fontWeight: "900", color: "#24332A" },
  metricLabel: { marginTop: 3, fontSize: 11, fontWeight: "700", color: "#7A847D" },
  metricDivider: { width: StyleSheet.hairlineWidth, height: 36, backgroundColor: "#DDE2DC" },
  calendarBand: { marginTop: 10, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 18, backgroundColor: "#FFFFFF" },
  monthHeader: { height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthTitle: { fontSize: 16, fontWeight: "900", color: "#24332A" },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  loader: { marginVertical: 80 },
  error: { marginTop: 10, color: "#A34D3F", fontSize: 12, lineHeight: 18 },
  recordsBand: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 18, backgroundColor: "#FFFFFF" },
  recordsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "900", color: "#24332A" },
  recordCount: { fontSize: 11, fontWeight: "700", color: "#7A847D" },
  emptyText: { paddingVertical: 28, textAlign: "center", color: "#8A948D", fontSize: 13 },
  recordCard: { height: 100, marginBottom: 10, borderWidth: 1, borderColor: "#DDE2DC", backgroundColor: "#FFFFFF", flexDirection: "row" },
  recordImage: { width: 98, height: 98, backgroundColor: "#E3E7E2" },
  recordCopy: { flex: 1, minWidth: 0, paddingHorizontal: 12, justifyContent: "center" },
  recordDrink: { fontSize: 15, fontWeight: "900", color: "#24332A" },
  recordBrand: { marginTop: 4, fontSize: 11, fontWeight: "700", color: "#59645D" },
  recordMetaRow: { marginTop: 9, flexDirection: "row", alignItems: "center", gap: 5 },
  recordMeta: { fontSize: 10, color: "#7A847D" },
  accountBand: { marginTop: 10, paddingHorizontal: 16, paddingTop: 18, backgroundColor: "#FFFFFF" },
  accountRow: { height: 58, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E2E6E1", flexDirection: "row", alignItems: "center", gap: 10 },
  accountText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#24332A" },
  deleteText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#A34D3F" },
});
