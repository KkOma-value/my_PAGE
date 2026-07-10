import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";
import { blockUser, reportCheckIn, toggleFavorite, toggleLike } from "@/lib/checkins";
import type { PublishedCheckIn } from "@/types/app";

export function CommunityActions({ checkin }: { checkin: PublishedCheckIn }) {
  const [liked, setLiked] = useState(Boolean(checkin.liked_by_me));
  const [favorited, setFavorited] = useState(Boolean(checkin.favorited_by_me));
  const [busyAction, setBusyAction] = useState("");

  async function run(action: string, operation: () => Promise<void>) {
    try {
      setBusyAction(action);
      await operation();
    } catch (error) {
      Alert.alert("操作失败", error instanceof Error ? error.message : "请稍后重试");
    } finally {
      setBusyAction("");
    }
  }

  function report() {
    Alert.alert("举报饮记", "请选择原因", [
      { text: "取消", style: "cancel" },
      { text: "垃圾内容", onPress: () => void run("report", async () => { await reportCheckIn(checkin.id, "spam"); }) },
      { text: "不当内容", style: "destructive", onPress: () => void run("report", async () => { await reportCheckIn(checkin.id, "inappropriate"); }) },
    ]);
  }

  function block() {
    const authorId = checkin.profiles?.id;
    if (!authorId) return;
    Alert.alert("屏蔽用户", "屏蔽后将不再看到该用户的公开饮记。", [
      { text: "取消", style: "cancel" },
      { text: "屏蔽", style: "destructive", onPress: () => void run("block", async () => { await blockUser(authorId); }) },
    ]);
  }

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel={liked ? "取消点赞" : "点赞"}
        onPress={() => void run("like", async () => setLiked((await toggleLike(checkin.id)).liked))}
        style={styles.iconButton}
      >
        {busyAction === "like" ? <ActivityIndicator size="small" color="#2F6B49" /> : <Ionicons name={liked ? "heart" : "heart-outline"} size={21} color={liked ? "#B44C4C" : "#59645D"} />}
      </Pressable>
      <Pressable
        accessibilityLabel={favorited ? "取消收藏" : "收藏"}
        onPress={() => void run("favorite", async () => setFavorited((await toggleFavorite(checkin.id)).favorited))}
        style={styles.iconButton}
      >
        {busyAction === "favorite" ? <ActivityIndicator size="small" color="#2F6B49" /> : <Ionicons name={favorited ? "bookmark" : "bookmark-outline"} size={21} color="#59645D" />}
      </Pressable>
      <View style={styles.spacer} />
      <Pressable accessibilityLabel="举报" onPress={report} style={styles.iconButton}>
        <Ionicons name="flag-outline" size={20} color="#7A847D" />
      </Pressable>
      {checkin.profiles?.id ? (
        <Pressable accessibilityLabel="屏蔽用户" onPress={block} style={styles.iconButton}>
          <Ionicons name="person-remove-outline" size={20} color="#7A847D" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 46, flexDirection: "row", alignItems: "center", gap: 2 },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  spacer: { flex: 1 },
});
