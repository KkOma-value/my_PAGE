import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { LocationSelector } from "@/components/LocationSelector";
import { RecognitionSuggestionBar } from "@/components/RecognitionSuggestionBar";
import { SelectionSheet } from "@/components/SelectionSheet";
import { VisibilitySelector } from "@/components/VisibilitySelector";
import {
  canPublishDraft,
  mergeRecognitionSuggestion,
  type DraftFormValues,
} from "@/lib/draft-form";
import {
  createDraft,
  deleteDraft,
  getDraft,
  listDrafts,
  publishDraft,
  retryRecognition,
  updateDraft,
  uploadDraftImage,
} from "@/lib/drafts";
import { suggestLocationFromDevice } from "@/lib/location";
import { fetchLocations } from "@/lib/locations";
import type { CheckInDraft, CityOption, DrinkCategoryKey } from "@/types/app";

const EMPTY_FORM: DraftFormValues = {
  drinkName: "",
  brandName: "",
  storeName: "",
  category: "coffee",
  flavorTags: [],
  caption: "",
  visibility: "public",
  cityId: "",
  regionId: "",
};

const CATEGORIES: Array<{ id: DrinkCategoryKey; label: string }> = [
  { id: "coffee", label: "咖啡" },
  { id: "pour_over", label: "手冲" },
  { id: "milk_tea", label: "奶茶" },
  { id: "fruit_tea", label: "果茶" },
  { id: "tea", label: "原叶茶" },
  { id: "matcha", label: "抹茶" },
  { id: "other", label: "其他" },
];

function formFromDraft(draft: CheckInDraft, fallback: DraftFormValues) {
  const payload = draft.draft_payload as Partial<DraftFormValues>;
  return {
    ...fallback,
    ...payload,
    flavorTags: Array.isArray(payload.flavorTags) ? payload.flavorTags : fallback.flavorTags,
  };
}

export default function CheckInScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState<CheckInDraft | null>(null);
  const [form, setForm] = useState<DraftFormValues>(EMPTY_FORM);
  const [editedFields, setEditedFields] = useState<string[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [localImageUri, setLocalImageUri] = useState("");
  const [categorySheet, setCategorySheet] = useState(false);
  const [locating, setLocating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchLocations(), listDrafts()])
      .then(([locationOptions, savedDrafts]) => {
        if (!mounted) return;
        setCities(locationOptions);
        const saved = savedDrafts[0];
        if (saved) {
          const restored = formFromDraft(saved, EMPTY_FORM);
          setDraft(saved);
          setEditedFields(saved.user_edited_fields ?? []);
          setForm(
            saved.recognition_status === "ready"
              ? mergeRecognitionSuggestion(restored, saved.user_edited_fields ?? [], saved.recognition_suggestions)
              : restored,
          );
        } else if (locationOptions[0]) {
          setForm((current) => ({
            ...current,
            cityId: locationOptions[0].id,
            regionId: locationOptions[0].regions[0]?.id ?? "",
          }));
        }
      })
      .catch((error) => {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : "草稿加载失败");
      })
      .finally(() => {
        if (mounted) setLoadingDraft(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const draftId = draft?.id;
    const status = draft?.recognition_status;
    if (!draftId || (status !== "uploading" && status !== "recognizing")) return;
    const timer = setInterval(() => {
      getDraft(draftId)
        .then((nextDraft) => {
          setDraft(nextDraft);
          if (nextDraft.recognition_status === "ready") {
            setForm((current) =>
              mergeRecognitionSuggestion(current, nextDraft.user_edited_fields ?? [], nextDraft.recognition_suggestions),
            );
          }
        })
        .catch((error) => setErrorMessage(error instanceof Error ? error.message : "识别状态更新失败"));
    }, 1600);
    return () => clearInterval(timer);
  }, [draft?.id, draft?.recognition_status]);

  const categoryLabel = useMemo(
    () => CATEGORIES.find((item) => item.id === form.category)?.label ?? "选择类别",
    [form.category],
  );
  const imageUri = localImageUri || draft?.image_url || "";
  const publishReady = canPublishDraft(draft, form);

  function persist(nextForm = form, nextEdited = editedFields) {
    if (!draft) return;
    void updateDraft(draft.id, nextForm, nextEdited).catch((error) =>
      setErrorMessage(error instanceof Error ? error.message : "草稿保存失败"),
    );
  }

  function editText(field: "drinkName" | "brandName" | "storeName" | "caption", value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setEditedFields((current) => (current.includes(field) ? current : [...current, field]));
  }

  function updateChoice(next: Partial<DraftFormValues>, editedField?: string) {
    const nextForm = { ...form, ...next };
    const nextEdited = editedField && !editedFields.includes(editedField)
      ? [...editedFields, editedField]
      : editedFields;
    setForm(nextForm);
    setEditedFields(nextEdited);
    persist(nextForm, nextEdited);
  }

  async function startUpload(asset: ImagePicker.ImagePickerAsset) {
    setLocalImageUri(asset.uri);
    setErrorMessage("");
    try {
      let activeDraft = draft;
      if (!activeDraft) {
        activeDraft = await createDraft(Crypto.randomUUID(), form);
        setDraft(activeDraft);
      }
      setDraft({ ...activeDraft, image_upload_status: "uploading", recognition_status: "uploading" });
      const uploaded = await uploadDraftImage(activeDraft.id, asset);
      setDraft(uploaded);
      if (uploaded.recognition_status === "ready") {
        setForm((current) =>
          mergeRecognitionSuggestion(current, uploaded.user_edited_fields ?? [], uploaded.recognition_suggestions),
        );
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "照片上传失败");
      setDraft((current) => current ? { ...current, image_upload_status: "failed", recognition_status: "failed" } : current);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("需要相机权限", "请在系统设置中允许 SipNotes 使用相机。");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.85 });
    if (!result.canceled && result.assets[0]) void startUpload(result.assets[0]);
  }

  async function choosePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);
    if (!permission.granted) {
      Alert.alert("需要照片权限", "请在系统设置中允许 SipNotes 访问照片。");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.85 });
    if (!result.canceled && result.assets[0]) void startUpload(result.assets[0]);
  }

  async function retry() {
    if (!draft) return;
    try {
      setErrorMessage("");
      setDraft(await retryRecognition(draft.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "识别重试失败");
    }
  }

  function applySuggestion() {
    if (!draft) return;
    const next = mergeRecognitionSuggestion(form, editedFields, draft.recognition_suggestions, true);
    setForm(next);
    persist(next, editedFields);
  }

  async function useLocation() {
    try {
      setLocating(true);
      const matched = await suggestLocationFromDevice(cities);
      if (!matched) {
        Alert.alert("未匹配城市", "当前位置不在首批城市中，请手动选择。");
        return;
      }
      const selectedCity = cities.find((item) => item.id === matched.cityId);
      updateChoice({
        cityId: matched.cityId,
        regionId: matched.regionId ?? selectedCity?.regions[0]?.id ?? "",
      });
    } catch (error) {
      Alert.alert("定位未完成", error instanceof Error ? error.message : "请手动选择城市和区域");
    } finally {
      setLocating(false);
    }
  }

  async function clearCurrentDraft() {
    if (draft) await deleteDraft(draft.id).catch(() => undefined);
    setDraft(null);
    setForm({
      ...EMPTY_FORM,
      cityId: cities[0]?.id ?? "",
      regionId: cities[0]?.regions[0]?.id ?? "",
    });
    setEditedFields([]);
    setLocalImageUri("");
    setErrorMessage("");
  }

  async function publish() {
    if (!draft || !publishReady) return;
    try {
      setPublishing(true);
      setErrorMessage("");
      await updateDraft(draft.id, form, editedFields);
      const created = await publishDraft(draft.id, form, draft.recognition_suggestions.confidence);
      await clearCurrentDraft();
      Alert.alert(
        created.moderation_status === "pending_review" ? "已提交审核" : "打卡成功",
        form.visibility === "public" ? "这杯已加入公开饮记。" : "这杯只保存在你的个人记录中。",
        [{ text: "查看记录", onPress: () => router.push("/profile") }],
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "发布失败");
    } finally {
      setPublishing(false);
    }
  }

  if (loadingDraft) {
    return <View style={styles.loading}><ActivityIndicator color="#2F6B49" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={92}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.imageStage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" alt="所选饮品照片" />
            ) : (
              <View style={styles.imageEmpty}>
                <Ionicons name="image-outline" size={38} color="#869087" />
                <Text style={styles.imageEmptyText}>添加饮品照片</Text>
              </View>
            )}
          </View>
          <View style={styles.photoToolbar}>
            <Pressable onPress={takePhoto} style={styles.photoAction}>
              <Ionicons name="camera-outline" size={21} color="#2F6B49" />
              <Text style={styles.photoActionText}>相机</Text>
            </Pressable>
            <Pressable onPress={choosePhoto} style={styles.photoAction}>
              <Ionicons name="images-outline" size={21} color="#2F6B49" />
              <Text style={styles.photoActionText}>相册</Text>
            </Pressable>
            {draft ? (
              <Pressable accessibilityLabel="删除草稿" onPress={clearCurrentDraft} style={styles.deleteAction}>
                <Ionicons name="trash-outline" size={20} color="#A34D3F" />
              </Pressable>
            ) : null}
          </View>

          <RecognitionSuggestionBar
            status={draft?.recognition_status ?? "idle"}
            suggestion={draft?.recognition_suggestions ?? {}}
            onApply={applySuggestion}
            onRetry={retry}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>饮品信息</Text>
            <Text style={styles.label}>饮品名称</Text>
            <TextInput
              value={form.drinkName}
              onChangeText={(value) => editText("drinkName", value)}
              onBlur={() => persist()}
              placeholder="例如：冰拿铁"
              placeholderTextColor="#9AA19C"
              style={styles.input}
            />
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={styles.label}>品牌</Text>
                <TextInput
                  value={form.brandName}
                  onChangeText={(value) => editText("brandName", value)}
                  onBlur={() => persist()}
                  placeholder="品牌名称"
                  placeholderTextColor="#9AA19C"
                  style={styles.input}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>门店</Text>
                <TextInput
                  value={form.storeName}
                  onChangeText={(value) => editText("storeName", value)}
                  onBlur={() => persist()}
                  placeholder="门店名称"
                  placeholderTextColor="#9AA19C"
                  style={styles.input}
                />
              </View>
            </View>
            <Text style={styles.label}>类别</Text>
            <Pressable onPress={() => setCategorySheet(true)} style={styles.selectField}>
              <Text style={styles.selectText}>{categoryLabel}</Text>
              <Ionicons name="chevron-down" size={17} color="#7A847D" />
            </Pressable>
            <Text style={styles.label}>风味标签</Text>
            <TextInput
              value={form.flavorTags.join("、")}
              onChangeText={(value) => {
                const tags = value.split(/[、,，]/).map((item) => item.trim()).filter(Boolean).slice(0, 10);
                updateChoice({ flavorTags: tags }, "flavorTags");
              }}
              placeholder="坚果香、奶香"
              placeholderTextColor="#9AA19C"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>地点</Text>
            <LocationSelector
              cities={cities}
              cityId={form.cityId}
              regionId={form.regionId}
              locating={locating}
              onUseLocation={useLocation}
              onChange={(cityId, regionId) => updateChoice({ cityId, regionId })}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>饮记</Text>
            <TextInput
              value={form.caption}
              onChangeText={(value) => editText("caption", value)}
              onBlur={() => persist()}
              multiline
              maxLength={500}
              placeholder="写下味道和当时的心情"
              placeholderTextColor="#9AA19C"
              style={styles.captionInput}
            />
            <Text style={styles.label}>可见范围</Text>
            <VisibilitySelector value={form.visibility} onChange={(visibility) => updateChoice({ visibility })} />
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <Pressable
            onPress={publish}
            disabled={!publishReady || publishing}
            style={({ pressed }) => [styles.publishButton, (!publishReady || publishing) && styles.publishDisabled, pressed && styles.publishPressed]}
          >
            {publishing ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark-circle" size={21} color="#FFFFFF" />}
            <Text style={styles.publishText}>发布打卡</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectionSheet
        visible={categorySheet}
        title="饮品类别"
        selectedId={form.category}
        items={CATEGORIES.map((item) => ({ id: item.id, label: item.label }))}
        onClose={() => setCategorySheet(false)}
        onSelect={(item) => {
          updateChoice({ category: item.id as DrinkCategoryKey }, "category");
          setCategorySheet(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F4F0" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F2F4F0" },
  content: { paddingBottom: 34 },
  imageStage: { width: "100%", aspectRatio: 4 / 3, backgroundColor: "#DDE3DD" },
  image: { width: "100%", height: "100%" },
  imageEmpty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 9 },
  imageEmptyText: { color: "#6C756F", fontSize: 14, fontWeight: "700" },
  photoToolbar: { height: 58, backgroundColor: "#FFFFFF", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#DDE2DC", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  photoAction: { height: 40, paddingHorizontal: 14, borderWidth: 1, borderColor: "#CBD2CC", flexDirection: "row", alignItems: "center", gap: 7 },
  photoActionText: { color: "#2F6B49", fontSize: 13, fontWeight: "800" },
  deleteAction: { marginLeft: "auto", width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  section: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 18, backgroundColor: "#FFFFFF" },
  sectionTitle: { marginBottom: 16, fontSize: 16, fontWeight: "900", color: "#24332A" },
  label: { marginTop: 11, marginBottom: 7, fontSize: 12, fontWeight: "800", color: "#59645D" },
  input: { height: 48, borderWidth: 1, borderColor: "#CBD2CC", backgroundColor: "#FAFBF9", paddingHorizontal: 12, fontSize: 15, color: "#24332A" },
  captionInput: { minHeight: 96, borderWidth: 1, borderColor: "#CBD2CC", backgroundColor: "#FAFBF9", paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, lineHeight: 21, color: "#24332A", textAlignVertical: "top" },
  twoColumns: { flexDirection: "row", gap: 10 },
  column: { flex: 1, minWidth: 0 },
  selectField: { height: 48, borderWidth: 1, borderColor: "#CBD2CC", backgroundColor: "#FAFBF9", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: "#24332A", fontSize: 15, fontWeight: "700" },
  error: { marginHorizontal: 16, marginTop: 14, color: "#A34D3F", fontSize: 13, lineHeight: 18 },
  publishButton: { marginHorizontal: 16, marginTop: 18, height: 54, backgroundColor: "#2F6B49", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  publishDisabled: { opacity: 0.4 },
  publishPressed: { opacity: 0.75 },
  publishText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});
