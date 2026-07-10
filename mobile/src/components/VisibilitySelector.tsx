import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CheckInVisibility } from "../types/app";

interface Props {
  value: CheckInVisibility;
  onChange(value: CheckInVisibility): void;
}

export function VisibilitySelector({ value, onChange }: Props) {
  return (
    <View style={styles.control}>
      {([
        { id: "public" as const, label: "公开", icon: "earth-outline" as const },
        { id: "private" as const, label: "私密", icon: "lock-closed-outline" as const },
      ]).map((item) => {
        const selected = item.id === value;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.id)}
            style={[styles.option, selected && styles.selected]}
          >
            <Ionicons name={item.icon} size={17} color={selected ? "#FFFFFF" : "#59645D"} />
            <Text style={[styles.label, selected && styles.selectedLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  control: { height: 44, padding: 3, backgroundColor: "#E8ECE7", flexDirection: "row" },
  option: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  selected: { backgroundColor: "#2F6B49" },
  label: { color: "#59645D", fontWeight: "700", fontSize: 14 },
  selectedLabel: { color: "#FFFFFF" },
});
