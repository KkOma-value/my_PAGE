import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DrinkCategory, SipRecord } from '../types';
import { CITIES, PRESET_DRINK_IMAGES } from '../data';
import { API_BASE, API_URL } from '@/constants/Config';

const { height, width } = Dimensions.get('window');

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

// Helper: Map Frontend DrinkCategory to DB Category Name
function mapCategoryToDbName(cat: DrinkCategory): string {
  switch (cat) {
    case DrinkCategory.Coffee:
    case DrinkCategory.PourOver:
      return 'coffee';
    case DrinkCategory.MilkTea:
      return 'milk_tea';
    case DrinkCategory.FruitTea:
      return 'fruit_tea';
    default:
      return 'other';
  }
}

// Helper: Map Mock city name to DB city code
function mockNameToDbCityCode(name: string): string {
  return name.toLowerCase().replace("'", "");
}

export default function CheckInModal({ isOpen, onClose, onSave }: CheckInModalProps) {
  const [drinkName, setDrinkName] = useState('');
  const [shopName, setShopName] = useState('');
  const [cityName, setCityName] = useState('Shanghai');
  const [districtName, setDistrictName] = useState('');
  const [category, setCategory] = useState<DrinkCategory>(DrinkCategory.Coffee);
  const [selectedImage, setSelectedImage] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [flavorTags, setFlavorTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [aiSuggestion, setAiSuggestion] = useState<{
    category: DrinkCategory;
    confidence: number;
    reason: string;
  } | null>(null);

  const availableTags = ['草木香', '果香', '清甜', '花香', '奶香', '微苦', '坚果香', '辛香', '清爽', '浓郁'];

  // Handle Preset Images when category changes
  useEffect(() => {
    if (!selectedImage || selectedImage.startsWith('https://')) {
      const presets = PRESET_DRINK_IMAGES[category];
      if (presets && presets.length > 0) {
        setSelectedImage(presets[0]);
      }
    }
  }, [category]);

  const handleTagToggle = (tag: string) => {
    if (flavorTags.includes(tag)) {
      setFlavorTags(flavorTags.filter((t) => t !== tag));
    } else {
      setFlavorTags([...flavorTags, tag]);
    }
  };

  // Select photo from library or take camera shot
  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('权限请求', '需要相机权限以拍摄照片');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('权限请求', '需要相册权限以选择照片');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        uploadImage(localUri);
      }
    } catch (err) {
      console.log('Error picking image:', err);
    }
  };

  // Upload image to Next.js backend
  const uploadImage = async (localUri: string) => {
    setUploading(true);
    setAiSuggestion(null);
    try {
      const filename = localUri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
        name: filename,
        type: type,
      } as any);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const json = await res.json();
      if (json.success && json.url) {
        // Resolve backend path relative to API_URL if it is relative
        let resolvedUrl = json.url;
        if (!resolvedUrl.startsWith('http')) {
          resolvedUrl = `${API_URL}${resolvedUrl}`;
        }
        setSelectedImage(resolvedUrl);

        // Run AI Classification on the uploaded image URL
        classifyImage(resolvedUrl);
      } else {
        Alert.alert('上传失败', json.error?.message || '未知上传错误');
      }
    } catch (err) {
      console.log('Upload error:', err);
      Alert.alert('上传失败', '网络请求失败，请检查后端服务是否启动且网络通畅');
    } finally {
      setUploading(false);
    }
  };

  // Classify uploaded image using AI
  const classifyImage = async (imageUrl: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const classifiedCat = json.data.category as DrinkCategory;
        const confidence = json.data.confidence;
        const reason = json.data.rationale || 'AI 智能识别';

        setAiSuggestion({
          category: classifiedCat,
          confidence: confidence,
          reason: reason,
        });

        // Auto update selected category based on AI suggestion
        setCategory(classifiedCat);
      }
    } catch (err) {
      console.log('AI classification failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit check-in
  const handleSave = async () => {
    if (!drinkName.trim()) {
      Alert.alert('提示', '请输入饮品名称');
      return;
    }
    if (!shopName.trim()) {
      Alert.alert('提示', '请输入店铺品牌');
      return;
    }

    setSubmitting(true);
    try {
      const caption =
        flavorTags.length > 0
          ? `${flavorTags.join('，')} | ${comment}`
          : comment;

      const body = {
        userId: 'demo-user-001',
        customDrinkName: drinkName,
        brandName: shopName,
        categoryName: mapCategoryToDbName(category),
        cityCode: mockNameToDbCityCode(cityName),
        imageUrl: selectedImage,
        caption: caption,
        locationName: districtName || undefined,
        aiSuggested: aiSuggestion ? true : false,
        aiConfidence: aiSuggestion?.confidence,
      };

      const res = await fetch(`${API_BASE}/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        // Clear form
        setDrinkName('');
        setShopName('');
        setDistrictName('');
        setComment('');
        setFlavorTags([]);
        setAiSuggestion(null);
        setSelectedImage('');

        // Trigger parent callback and close modal
        await onSave();
        onClose();
      } else {
        Alert.alert('打卡失败', json.error?.message || '未知错误');
      }
    } catch (err) {
      console.log('Save failed:', err);
      Alert.alert('打卡失败', '网络请求失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>打卡新饮品</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#78716c" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollForm}>
            {/* Image Selector Area */}
            <View style={styles.imageSelectorContainer}>
              {selectedImage ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImg} />
                  <TouchableOpacity
                    onPress={() => setSelectedImage('')}
                    style={styles.removeImageBtn}
                  >
                    <Ionicons name="trash" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  {uploading ? (
                    <ActivityIndicator size="large" color="#43664d" />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={32} color="#a8a29e" />
                      <Text style={styles.imagePickerText}>拍摄打卡照开启 AI 识别</Text>
                      <View style={styles.pickerBtnRow}>
                        <TouchableOpacity
                          onPress={() => handlePickImage(false)}
                          style={styles.pickerBtn}
                        >
                          <Ionicons name="images-outline" size={12} color="#43664d" />
                          <Text style={styles.pickerBtnText}>相册选择</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handlePickImage(true)}
                          style={styles.pickerBtn}
                        >
                          <Ionicons name="camera-outline" size={12} color="#43664d" />
                          <Text style={styles.pickerBtnText}>拍照打卡</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* AI Suggestion Banner */}
            {aiLoading && (
              <View style={styles.aiLoadingBanner}>
                <ActivityIndicator size="small" color="#43664d" style={{ marginRight: 6 }} />
                <Text style={styles.aiLoadingText}>Gemini 正在分析饮品并为您分类...</Text>
              </View>
            )}

            {aiSuggestion && (
              <View style={styles.aiBanner}>
                <View style={styles.aiBannerHeader}>
                  <Ionicons name="sparkles" size={16} color="#43664d" />
                  <Text style={styles.aiBannerTitle}>
                    AI 智能识别结果: {aiSuggestion.category} ({Math.round(aiSuggestion.confidence * 100)}% 置信度)
                  </Text>
                </View>
                <Text style={styles.aiBannerReason}>{aiSuggestion.reason}</Text>
              </View>
            )}

            {/* Form Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>饮品名称 *</Text>
              <TextInput
                style={styles.textInput}
                value={drinkName}
                onChangeText={setDrinkName}
                placeholder="例如：生椰拿铁、白桃乌龙"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>店铺品牌 *</Text>
              <TextInput
                style={styles.textInput}
                value={shopName}
                onChangeText={setShopName}
                placeholder="例如：瑞幸咖啡、喜茶"
              />
            </View>

            <View style={styles.inputGroupRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>打卡城市</Text>
                <TextInput
                  style={styles.textInput}
                  value={cityName}
                  onChangeText={setCityName}
                  placeholder="例如：Shanghai"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>详细地标 (选填)</Text>
                <TextInput
                  style={styles.textInput}
                  value={districtName}
                  onChangeText={setDistrictName}
                  placeholder="例如：徐汇区永嘉路"
                />
              </View>
            </View>

            {/* Drink Category selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>品类标签</Text>
              <View style={styles.categorySelectRow}>
                {([
                  DrinkCategory.Coffee,
                  DrinkCategory.MilkTea,
                  DrinkCategory.FruitTea,
                  DrinkCategory.Matcha,
                  DrinkCategory.Tea,
                ] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryBadgeBtn,
                      category === cat && styles.categoryBadgeBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        category === cat && styles.categoryBadgeTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Flavor Tags */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>风味特征 (多选)</Text>
              <View style={styles.tagSelectRow}>
                {availableTags.map((tag) => {
                  const isSelected = flavorTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => handleTagToggle(tag)}
                      style={[styles.tagBadgeBtn, isSelected && styles.tagBadgeBtnActive]}
                    >
                      <Text style={[styles.tagBadgeText, isSelected && styles.tagBadgeTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Star Rating */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>我的评分</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Ionicons
                      name={s <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color="#eab308"
                      style={{ marginRight: 6 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>品饮心得 (选填)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={comment}
                onChangeText={setComment}
                placeholder="记录这杯饮品带给你的瞬间美味心情..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Form Actions Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={[styles.footerBtn, styles.cancelFooterBtn]}>
              <Text style={styles.cancelFooterBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.footerBtn, styles.saveFooterBtn]}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveFooterBtnText}>发布打卡</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#faf9f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: height * 0.88,
    paddingTop: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomColor: '#eeeeea',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#43664d',
  },
  closeBtn: {
    padding: 4,
  },
  scrollForm: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  imageSelectorContainer: {
    height: 160,
    backgroundColor: '#eeeeea',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716c',
    marginTop: 6,
  },
  pickerBtnRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#43664d',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  selectedImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiLoadingBanner: {
    backgroundColor: '#eef1ed',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  aiLoadingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#43664d',
  },
  aiBanner: {
    backgroundColor: '#eef1ed',
    borderRadius: 16,
    borderColor: '#43664d',
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
  },
  aiBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#43664d',
  },
  aiBannerReason: {
    fontSize: 11,
    color: '#4a4a4a',
    marginTop: 4,
    lineHeight: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputGroupRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#43664d',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#2c2c2c',
  },
  multilineInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadgeBtn: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  categoryBadgeBtnActive: {
    backgroundColor: '#43664d',
    borderColor: '#43664d',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#78716c',
  },
  categoryBadgeTextActive: {
    color: '#ffffff',
  },
  tagSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadgeBtn: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tagBadgeBtnActive: {
    backgroundColor: '#79573f',
    borderColor: '#79573f',
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#78716c',
    fontWeight: '600',
  },
  tagBadgeTextActive: {
    color: '#ffffff',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 15,
    borderTopColor: '#eeeeea',
    borderTopWidth: 1,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelFooterBtn: {
    backgroundColor: '#eeeeea',
  },
  cancelFooterBtnText: {
    fontSize: 14,
    color: '#78716c',
    fontWeight: 'bold',
  },
  saveFooterBtn: {
    backgroundColor: '#43664d',
  },
  saveFooterBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
