import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface SelectionItem {
  id: string;
  label: string;
  subtitle?: string;
}

interface Props {
  visible: boolean;
  title: string;
  items: SelectionItem[];
  selectedId?: string;
  onSelect(item: SelectionItem): void;
  onClose(): void;
}

export function SelectionSheet({ visible, title, items, selectedId, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable accessibilityLabel="关闭" onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={22} color="#24332A" />
          </Pressable>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.copy}>
                <Text style={styles.label}>{item.label}</Text>
                {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
              </View>
              {selectedId === item.id ? <Ionicons name="checkmark" size={21} color="#2F6B49" /> : null}
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8F5" },
  header: {
    height: 58,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDE2DC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#24332A" },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  row: {
    minHeight: 62,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDE2DC",
    flexDirection: "row",
    alignItems: "center",
  },
  rowPressed: { opacity: 0.55 },
  copy: { flex: 1, paddingVertical: 12 },
  label: { fontSize: 16, fontWeight: "700", color: "#24332A" },
  subtitle: { marginTop: 3, fontSize: 12, color: "#6C756F" },
});
