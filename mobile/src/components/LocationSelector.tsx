import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { CityOption } from "../types/app";
import { SelectionSheet } from "./SelectionSheet";

interface Props {
  cities: CityOption[];
  cityId: string;
  regionId: string;
  locating: boolean;
  onChange(cityId: string, regionId: string): void;
  onUseLocation(): void;
}

export function LocationSelector({ cities, cityId, regionId, locating, onChange, onUseLocation }: Props) {
  const [sheet, setSheet] = useState<"city" | "region" | null>(null);
  const city = useMemo(() => cities.find((item) => item.id === cityId), [cities, cityId]);
  const region = useMemo(() => city?.regions.find((item) => item.id === regionId), [city, regionId]);

  return (
    <>
      <View style={styles.row}>
        <Pressable onPress={() => setSheet("city")} style={styles.selector}>
          <Ionicons name="business-outline" size={18} color="#2F6B49" />
          <Text style={styles.value} numberOfLines={1}>{city?.display_name ?? "选择城市"}</Text>
          <Ionicons name="chevron-down" size={16} color="#7A847D" />
        </Pressable>
        <Pressable onPress={() => setSheet("region")} disabled={!city} style={styles.selector}>
          <Ionicons name="navigate-outline" size={18} color="#2F6B49" />
          <Text style={styles.value} numberOfLines={1}>{region?.display_name ?? "选择区域"}</Text>
          <Ionicons name="chevron-down" size={16} color="#7A847D" />
        </Pressable>
        <Pressable accessibilityLabel="使用当前位置" onPress={onUseLocation} disabled={locating} style={styles.locationButton}>
          {locating ? <ActivityIndicator size="small" color="#2F6B49" /> : <Ionicons name="locate" size={21} color="#2F6B49" />}
        </Pressable>
      </View>

      <SelectionSheet
        visible={sheet === "city"}
        title="选择城市"
        selectedId={cityId}
        items={cities.map((item) => ({ id: item.id, label: item.display_name, subtitle: item.province }))}
        onClose={() => setSheet(null)}
        onSelect={(item) => {
          const nextCity = cities.find((cityItem) => cityItem.id === item.id);
          onChange(item.id, nextCity?.regions[0]?.id ?? "");
          setSheet(null);
        }}
      />
      <SelectionSheet
        visible={sheet === "region"}
        title="选择区域"
        selectedId={regionId}
        items={(city?.regions ?? []).map((item) => ({ id: item.id, label: item.display_name }))}
        onClose={() => setSheet(null)}
        onSelect={(item) => {
          onChange(cityId, item.id);
          setSheet(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  selector: { flex: 1, minWidth: 0, height: 48, borderWidth: 1, borderColor: "#CBD2CC", backgroundColor: "#FFFFFF", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  value: { flex: 1, color: "#24332A", fontSize: 14, fontWeight: "700" },
  locationButton: { width: 48, height: 48, borderWidth: 1, borderColor: "#CBD2CC", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});
