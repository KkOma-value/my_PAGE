import { useCallback, useMemo, useState } from "react";
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
import { CHINA_MAP_IMAGE } from "../constants/map-assets";
import { indexHeat } from "../lib/map";
import { fetchMapHeat } from "../lib/recommendations";
import type { MapHeatResponse } from "../types/app";

const EMPTY_HEAT: MapHeatResponse = { cities: [], regions: [] };

export default function FootprintMapScreen() {
  const [heat, setHeat] = useState<MapHeatResponse>(EMPTY_HEAT);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadHeat = useCallback(async () => {
    try {
      setErrorMessage("");
      const result = await fetchMapHeat();
      setHeat(result);
      setSelectedCityId((current) => current || result.cities.find((city) => city.count > 0)?.id || "");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "地图加载失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadHeat();
  }, [loadHeat]));

  const cityIndex = useMemo(
    () => indexHeat(heat.cities.map((city) => ({ id: city.id, count: city.count }))),
    [heat.cities],
  );
  const activeCities = useMemo(
    () => [...heat.cities].filter((city) => city.count > 0).sort((a, b) => b.count - a.count),
    [heat.cities],
  );
  const selectedCity = heat.cities.find((city) => city.id === selectedCityId);
  const selectedRegions = heat.regions
    .filter((region) => region.city_id === selectedCityId && region.count > 0)
    .sort((a, b) => b.count - a.count);
  const totalCheckIns = heat.cities.reduce((sum, city) => sum + city.count, 0);
  const maxRegionCount = Math.max(1, ...selectedRegions.map((region) => region.count));

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadHeat(); }} tintColor="#2F6B49" />}
      >
        <View style={styles.metricsBand}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{activeCities.length}</Text>
            <Text style={styles.metricLabel}>打卡城市</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{totalCheckIns}</Text>
            <Text style={styles.metricLabel}>累计杯数</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{selectedRegions.length}</Text>
            <Text style={styles.metricLabel}>当前区域</Text>
          </View>
        </View>

        <View style={styles.mapStage}>
          <Image source={{ uri: CHINA_MAP_IMAGE }} style={styles.mapImage} resizeMode="cover" alt="中国饮品足迹地图" />
          <View style={styles.mapShade} />
          {activeCities.map((city) => {
            const indexed = cityIndex.get(city.id);
            const selected = city.id === selectedCityId;
            const size = 14 + Math.min(18, city.count * 2);
            return (
              <Pressable
                key={city.id}
                accessibilityLabel={`${city.display_name}${city.count}次打卡`}
                onPress={() => setSelectedCityId(city.id)}
                style={[
                  styles.pin,
                  {
                    left: `${city.map_x}%`,
                    top: `${city.map_y}%`,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    opacity: selected ? 1 : indexed?.opacity ?? 0.16,
                    transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
                  },
                  selected && styles.pinSelected,
                ]}
              />
            );
          })}
          {loading ? <View style={styles.mapLoading}><ActivityIndicator color="#2F6B49" /></View> : null}
        </View>

        {activeCities.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityStrip}>
            {activeCities.map((city) => {
              const selected = city.id === selectedCityId;
              return (
                <Pressable key={city.id} onPress={() => setSelectedCityId(city.id)} style={[styles.cityItem, selected && styles.cityItemSelected]}>
                  <Text style={[styles.cityName, selected && styles.cityNameSelected]}>{city.display_name}</Text>
                  <Text style={[styles.cityCount, selected && styles.cityNameSelected]}>{city.count} 杯</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{selectedCity?.display_name ?? "区域足迹"}</Text>
              <Text style={styles.sectionSubtitle}>{selectedRegions.length} 个有记录区域</Text>
            </View>
            <Ionicons name="layers-outline" size={21} color="#2F6B49" />
          </View>
          {selectedRegions.map((region) => (
            <View key={region.id} style={styles.regionRow}>
              <Text style={styles.regionName}>{region.display_name}</Text>
              <View style={styles.regionTrack}>
                <View style={[styles.regionFill, { width: `${Math.max(12, (region.count / maxRegionCount) * 100)}%` }]} />
              </View>
              <Text style={styles.regionCount}>{region.count}</Text>
            </View>
          ))}
          {!loading && selectedRegions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={30} color="#8A948D" />
              <Text style={styles.emptyTitle}>还没有区域足迹</Text>
              <Text style={styles.emptyText}>暂无区域数据</Text>
            </View>
          ) : null}
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F4F0" },
  content: { paddingBottom: 30 },
  metricsBand: { height: 82, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16 },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { fontSize: 23, fontWeight: "900", color: "#24332A" },
  metricLabel: { marginTop: 3, fontSize: 11, fontWeight: "700", color: "#7A847D" },
  metricDivider: { width: StyleSheet.hairlineWidth, height: 34, backgroundColor: "#DDE2DC" },
  mapStage: { width: "100%", aspectRatio: 1.25, overflow: "hidden", backgroundColor: "#DDE3DD", position: "relative" },
  mapImage: { width: "100%", height: "100%" },
  mapShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(247,248,245,0.18)" },
  pin: { position: "absolute", backgroundColor: "#2F6B49", borderWidth: 2, borderColor: "rgba(255,255,255,0.8)" },
  pinSelected: { borderColor: "#FFFFFF", shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.28, shadowRadius: 4 },
  mapLoading: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(247,248,245,0.72)", alignItems: "center", justifyContent: "center" },
  cityStrip: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, backgroundColor: "#FFFFFF" },
  cityItem: { height: 48, minWidth: 76, paddingHorizontal: 13, borderWidth: 1, borderColor: "#CBD2CC", alignItems: "center", justifyContent: "center" },
  cityItemSelected: { backgroundColor: "#2F6B49", borderColor: "#2F6B49" },
  cityName: { fontSize: 13, fontWeight: "800", color: "#24332A" },
  cityCount: { marginTop: 2, fontSize: 10, color: "#7A847D" },
  cityNameSelected: { color: "#FFFFFF" },
  section: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 18, backgroundColor: "#FFFFFF" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "900", color: "#24332A" },
  sectionSubtitle: { marginTop: 3, fontSize: 11, color: "#7A847D" },
  regionRow: { height: 44, flexDirection: "row", alignItems: "center", gap: 10 },
  regionName: { width: 78, fontSize: 13, fontWeight: "700", color: "#4F5C54" },
  regionTrack: { flex: 1, height: 9, backgroundColor: "#E8ECE7", overflow: "hidden" },
  regionFill: { height: "100%", backgroundColor: "#2F6B49" },
  regionCount: { width: 24, textAlign: "right", fontSize: 12, fontWeight: "800", color: "#24332A" },
  emptyState: { minHeight: 150, alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 10, fontSize: 15, fontWeight: "800", color: "#4F5C54" },
  emptyText: { marginTop: 4, fontSize: 12, color: "#8A948D" },
  error: { color: "#A34D3F", fontSize: 12, lineHeight: 18 },
});
