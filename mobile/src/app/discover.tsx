import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommunityActions } from "@/components/CommunityActions";
import { SelectionSheet } from "@/components/SelectionSheet";
import { fetchCommunityCheckIns } from "@/lib/checkins";
import { fetchLocations } from "@/lib/locations";
import { fetchDiscoverSnapshot } from "@/lib/recommendations";
import type { CityOption, PublishedCheckIn, SnapshotResponse } from "@/types/app";

type DiscoverTab = "city" | "season" | "personal";
type SeasonKey = "spring" | "summer" | "autumn" | "winter";

const SEASONS: Array<{ id: SeasonKey; label: string }> = [
  { id: "spring", label: "春季" },
  { id: "summer", label: "夏季" },
  { id: "autumn", label: "秋季" },
  { id: "winter", label: "冬季" },
];

const CATEGORY_LABELS: Record<string, string> = {
  coffee: "咖啡",
  pour_over: "手冲",
  milk_tea: "奶茶",
  fruit_tea: "果茶",
  tea: "原叶茶",
  matcha: "抹茶",
  other: "其他",
};

export default function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<DiscoverTab>("city");
  const [locations, setLocations] = useState<CityOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<SeasonKey>("summer");
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [community, setCommunity] = useState<PublishedCheckIn[]>([]);
  const [selectionSheet, setSelectionSheet] = useState<"city" | "season" | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    fetchLocations()
      .then((items) => {
        if (!mounted) return;
        setLocations(items);
        setSelectedCityId((current) => current || items[0]?.id || "");
      })
      .catch((error) => {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "城市加载失败");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loadSnapshot = useCallback(async () => {
    if (activeTab === "city" && !selectedCityId) return;
    const scopeId = activeTab === "city" ? selectedCityId : activeTab === "season" ? selectedSeason : "";
    try {
      setErrorMessage("");
      setSnapshot(await fetchDiscoverSnapshot(activeTab, scopeId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "推荐加载失败");
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCityId, selectedSeason]);

  const loadCommunity = useCallback(async () => {
    try {
      setCommunity(await fetchCommunityCheckIns());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "公开饮记加载失败");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadSnapshot();
  }, [loadSnapshot]));

  useFocusEffect(useCallback(() => {
    void loadCommunity();
  }, [loadCommunity]));

  const selectedCity = useMemo(
    () => locations.find((city) => city.id === selectedCityId),
    [locations, selectedCityId],
  );
  const selectedSeasonLabel = SEASONS.find((season) => season.id === selectedSeason)?.label ?? "夏季";

  function switchTab(tab: DiscoverTab) {
    setLoading(true);
    setSnapshot(null);
    setActiveTab(tab);
  }

  function refresh() {
    setRefreshing(true);
    void Promise.all([loadSnapshot(), loadCommunity()]).finally(() => setRefreshing(false));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#2F6B49" />}
      >
        <View style={styles.tabBand}>
          {([
            { id: "city" as const, label: "城市" },
            { id: "season" as const, label: "季节" },
            { id: "personal" as const, label: "为你推荐" },
          ]).map((tab) => (
            <Pressable key={tab.id} onPress={() => switchTab(tab.id)} style={[styles.tab, activeTab === tab.id && styles.activeTab]}>
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        {activeTab !== "personal" ? (
          <View style={styles.filterBand}>
            <Pressable onPress={() => setSelectionSheet(activeTab)} style={styles.filterButton}>
              <Ionicons name={activeTab === "city" ? "location-outline" : "calendar-outline"} size={19} color="#2F6B49" />
              <Text style={styles.filterText}>{activeTab === "city" ? selectedCity?.display_name ?? "选择城市" : selectedSeasonLabel}</Text>
              <Ionicons name="chevron-down" size={16} color="#7A847D" />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeTab === "personal" ? "你的口味" : "本期推荐"}</Text>
            <Text style={styles.sectionMeta}>{snapshot?.source_version === "seed" ? "种子库" : snapshot?.generated_at ? "每日更新" : ""}</Text>
          </View>
          {loading ? <ActivityIndicator color="#2F6B49" style={styles.loader} /> : null}
          {!loading && (snapshot?.payload.length ?? 0) === 0 ? <Text style={styles.emptyText}>暂无推荐</Text> : null}
          {snapshot?.payload.map((item, index) => (
            <View key={`${item.brandName}-${item.drinkName}-${index}`} style={styles.recommendationCard}>
              {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.recommendationImage} alt={`${item.drinkName}照片`} /> : <View style={styles.recommendationImage} />}
              <View style={styles.recommendationCopy}>
                <View style={styles.rankRow}>
                  <Text style={styles.rank}>{String(index + 1).padStart(2, "0")}</Text>
                  <Text style={styles.category}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
                </View>
                <Text style={styles.drinkName} numberOfLines={1}>{item.drinkName}</Text>
                <Text style={styles.brandName} numberOfLines={1}>{item.brandName}</Text>
                {item.description ? <Text style={styles.description} numberOfLines={2}>{item.description}</Text> : null}
              </View>
            </View>
          ))}
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        </View>

        <View style={styles.communitySection}>
          <View style={[styles.sectionHeader, styles.communityHeader]}>
            <Text style={styles.sectionTitle}>大家刚喝</Text>
            <Ionicons name="people-outline" size={21} color="#2F6B49" />
          </View>
          {community.length === 0 ? <Text style={styles.emptyText}>暂无公开饮记</Text> : null}
          {community.map((checkin) => (
            <View key={checkin.id} style={styles.communityCard}>
              <View style={styles.authorRow}>
                <View style={styles.avatarFallback}><Text style={styles.avatarLetter}>{checkin.profiles?.display_name?.slice(0, 1) || "S"}</Text></View>
                <View style={styles.authorCopy}>
                  <Text style={styles.authorName}>{checkin.profiles?.display_name ?? "SipNotes 用户"}</Text>
                  <Text style={styles.locationText}>{[checkin.cities?.display_name, checkin.city_regions?.display_name].filter(Boolean).join(" · ")}</Text>
                </View>
                <Text style={styles.dateText}>{checkin.consumed_on.slice(5)}</Text>
              </View>
              <Image source={{ uri: checkin.image_url }} style={styles.communityImage} alt={`${checkin.drink_name}照片`} />
              <View style={styles.communityCopy}>
                <Text style={styles.communityDrink}>{checkin.drink_name}</Text>
                <Text style={styles.communityBrand}>{checkin.brand_name}{checkin.store_name ? ` · ${checkin.store_name}` : ""}</Text>
                {checkin.caption ? <Text style={styles.caption}>{checkin.caption}</Text> : null}
                <CommunityActions checkin={checkin} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <SelectionSheet
        visible={selectionSheet === "city"}
        title="选择城市"
        selectedId={selectedCityId}
        items={locations.map((city) => ({ id: city.id, label: city.display_name, subtitle: city.province }))}
        onClose={() => setSelectionSheet(null)}
        onSelect={(item) => {
          setLoading(true);
          setSnapshot(null);
          setSelectedCityId(item.id);
          setSelectionSheet(null);
        }}
      />
      <SelectionSheet
        visible={selectionSheet === "season"}
        title="选择季节"
        selectedId={selectedSeason}
        items={SEASONS}
        onClose={() => setSelectionSheet(null)}
        onSelect={(item) => {
          setLoading(true);
          setSnapshot(null);
          setSelectedSeason(item.id as SeasonKey);
          setSelectionSheet(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F4F0" },
  content: { paddingBottom: 32 },
  tabBand: { height: 54, backgroundColor: "#FFFFFF", padding: 5, flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#2F6B49" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#7A847D" },
  activeTabText: { color: "#2F6B49", fontWeight: "900" },
  filterBand: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#FFFFFF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E2E6E1" },
  filterButton: { height: 44, borderWidth: 1, borderColor: "#CBD2CC", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  filterText: { flex: 1, fontSize: 14, fontWeight: "800", color: "#24332A" },
  section: { marginTop: 10, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 18 },
  communitySection: { marginTop: 10, paddingVertical: 18 },
  communityHeader: { marginHorizontal: 16 },
  sectionHeader: { paddingHorizontal: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "900", color: "#24332A" },
  sectionMeta: { fontSize: 11, color: "#7A847D", fontWeight: "700" },
  loader: { marginVertical: 30 },
  emptyText: { paddingVertical: 28, textAlign: "center", color: "#8A948D", fontSize: 13 },
  recommendationCard: { minHeight: 124, marginBottom: 10, borderWidth: 1, borderColor: "#DDE2DC", backgroundColor: "#FFFFFF", flexDirection: "row" },
  recommendationImage: { width: 112, minHeight: 122, backgroundColor: "#E3E7E2" },
  recommendationCopy: { flex: 1, minWidth: 0, padding: 12 },
  rankRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rank: { fontSize: 11, fontWeight: "900", color: "#2F6B49" },
  category: { fontSize: 10, fontWeight: "700", color: "#7A847D" },
  drinkName: { marginTop: 7, fontSize: 16, fontWeight: "900", color: "#24332A" },
  brandName: { marginTop: 3, fontSize: 12, fontWeight: "700", color: "#59645D" },
  description: { marginTop: 7, fontSize: 11, lineHeight: 16, color: "#7A847D" },
  error: { marginTop: 8, color: "#A34D3F", fontSize: 12, lineHeight: 18 },
  communityCard: { marginHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: "#DDE2DC", backgroundColor: "#FFFFFF" },
  authorRow: { height: 58, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  avatarFallback: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#DCE9DF", alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#2F6B49", fontSize: 14, fontWeight: "900" },
  authorCopy: { flex: 1, minWidth: 0, marginLeft: 9 },
  authorName: { fontSize: 13, fontWeight: "800", color: "#24332A" },
  locationText: { marginTop: 2, fontSize: 10, color: "#7A847D" },
  dateText: { fontSize: 10, color: "#8A948D" },
  communityImage: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#E3E7E2" },
  communityCopy: { paddingHorizontal: 12, paddingTop: 12 },
  communityDrink: { fontSize: 17, fontWeight: "900", color: "#24332A" },
  communityBrand: { marginTop: 3, fontSize: 12, fontWeight: "700", color: "#59645D" },
  caption: { marginTop: 10, fontSize: 13, lineHeight: 19, color: "#4F5C54" },
});
