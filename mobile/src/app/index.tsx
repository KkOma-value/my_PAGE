import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CITIES, CHINA_MAP_IMAGE, INITIAL_SIPS } from '../data';
import { SipRecord, DrinkCategory } from '../types';
import { API_BASE } from '@/constants/Config';
import CheckInModal from '@/components/CheckInModal';

const { width } = Dimensions.get('window');

// Helper: Map DB city code to Mock city name
function dbCityCodeToMockName(code: string): string {
  const mapping: Record<string, string> = {
    shanghai: 'Shanghai',
    beijing: 'Beijing',
    chengdu: 'Chengdu',
    guangzhou: 'Guangzhou',
    shenzhen: 'Shenzhen',
    hangzhou: 'Hangzhou',
    suzhou: 'Suzhou',
    chongqing: 'Chongqing',
    xian: "Xi'an",
    wuhan: 'Wuhan',
    nanjing: 'Nanjing',
    changsha: 'Changsha',
  };
  return mapping[code.toLowerCase()] || code;
}

// Helper: Map DB Category Name to Frontend DrinkCategory
function dbCategoryToFrontend(name: string): DrinkCategory {
  switch (name) {
    case 'coffee':
      return DrinkCategory.Coffee;
    case 'milk_tea':
      return DrinkCategory.MilkTea;
    case 'fruit_tea':
      return DrinkCategory.FruitTea;
    default:
      return DrinkCategory.Tea;
  }
}

export default function FootprintMapScreen() {
  const [sips, setSips] = useState<SipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['sip-1', 'sip-3']);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Fetch checkins from backend
  const fetchSips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checkins?userId=demo-user-001&limit=100`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        if (json.data.length === 0) {
          setSips(INITIAL_SIPS);
        } else {
          // Map DB check-ins to front-end SipRecords
          const mapped: SipRecord[] = json.data.map((ci: any) => {
            let comment = ci.caption || '';
            let flavorTags: string[] = [];

            if (comment.includes(' | ')) {
              const parts = comment.split(' | ');
              flavorTags = parts[0].split('，').map((t: string) => t.trim());
              comment = parts[1];
            }

            return {
              id: ci.id,
              drinkName: ci.drink?.name || '未知饮品',
              shopName: ci.drink?.brand?.name || '未知店铺',
              cityName: dbCityCodeToMockName(ci.city?.code || 'shanghai'),
              districtName: ci.locationName || undefined,
              date: ci.date,
              category: dbCategoryToFrontend(ci.drink?.category?.name || 'other'),
              flavorTags: flavorTags,
              imageUrl: ci.cardUrl || ci.imageUrl,
              rating: 5,
              comment: comment,
            };
          });
          setSips(mapped);
        }
      } else {
        setSips(INITIAL_SIPS);
      }
    } catch (err) {
      console.log('Failed to load sips from DB, using mock data:', err);
      setSips(INITIAL_SIPS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSips();
  }, [fetchSips]);

  // Statistics calculation
  const baseCities = new Set(INITIAL_SIPS.map((s) => s.cityName));
  const currentCities = new Set(sips.map((s) => s.cityName));
  const newCitiesCount = Array.from(currentCities).filter((c) => !baseCities.has(c)).length;
  const citiesCount = 12 + newCitiesCount;
  const totalDrinksCount = 156 + (sips.length - INITIAL_SIPS.length);

  // Filter sips by selected city
  const filteredSips = selectedCity
    ? sips.filter((s) => s.cityName.toLowerCase() === selectedCity.toLowerCase())
    : sips;

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Delete check-in
  const handleDeleteSip = async (id: string) => {
    if (id.startsWith('sip-')) {
      setSips((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/checkins/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchSips();
      } else {
        Alert.alert('删除失败', json.error?.message || '未知原因');
      }
    } catch (err) {
      console.log('Failed to delete check-in:', err);
      Alert.alert('删除失败', '网络请求失败，请稍后重试');
    }
  };

  const getPinColor = (category: DrinkCategory) => {
    if (category === DrinkCategory.Matcha) return '#4c6444'; // brand matcha
    if (category === DrinkCategory.Tea || category === DrinkCategory.FruitTea) return '#c89d3c'; // oolong mustard yellow
    return '#79573f'; // roast brown
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredSips}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header section */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Ionicons name="sparkles" size={16} color="#43664d" />
                <Text style={styles.headerSub}> 饮品足迹</Text>
              </View>
              <View style={styles.statsLayout}>
                <View>
                  <Text style={styles.headerTitle}>足迹地图</Text>
                  <Text style={styles.headerDesc}>寻迹神州饮品，用味蕾记录每一杯美好。</Text>
                </View>

                {/* Bento Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statsCard}>
                    <Text style={[styles.statsNum, { color: '#43664d' }]}>{citiesCount}</Text>
                    <Text style={styles.statsLabel}>打卡城市</Text>
                  </View>
                  <View style={styles.statsCard}>
                    <Text style={[styles.statsNum, { color: '#79573f' }]}>{totalDrinksCount}</Text>
                    <Text style={styles.statsLabel}>打卡杯数</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Interactive Map */}
            <View style={styles.mapContainer}>
              <Image
                source={{ uri: CHINA_MAP_IMAGE }}
                style={styles.mapImage}
                resizeMode="cover"
              />

              {/* City Selection Hint Overlay */}
              <View style={styles.mapOverlay}>
                <Text style={styles.mapOverlayLabel}>
                  {selectedCity
                    ? `当前城市：${CITIES.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase())?.displayName || selectedCity}`
                    : '点击地图标记筛选城市'}
                </Text>
                {selectedCity && (
                  <TouchableOpacity onPress={() => setSelectedCity(null)}>
                    <Text style={styles.clearBtn}>清除筛选</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Render Map Pin Markers */}
              {CITIES.map((city) => {
                const citySips = sips.filter(
                  (s) => s.cityName.toLowerCase() === city.name.toLowerCase()
                );
                const hasLogs = citySips.length > 0;
                if (!hasLogs || city.x === undefined || city.y === undefined) return null;

                const isSelected = selectedCity?.toLowerCase() === city.name.toLowerCase();
                const topCategory = citySips[0]?.category || DrinkCategory.Coffee;
                const pinColor = getPinColor(topCategory);

                return (
                  <TouchableOpacity
                    key={city.name}
                    onPress={() => setSelectedCity(isSelected ? null : city.name)}
                    style={[
                      styles.mapPin,
                      {
                        top: `${city.y}%`,
                        left: `${city.x}%`,
                        backgroundColor: pinColor,
                        borderColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                        transform: [{ scale: isSelected ? 1.3 : 1.0 }],
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Log Header */}
            <View style={styles.logHeaderRow}>
              <Text style={styles.logSectionTitle}>
                {selectedCity
                  ? `${CITIES.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase())?.displayName || selectedCity} 饮记 (${filteredSips.length})`
                  : `最新饮记 (${filteredSips.length})`}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const isFav = favorites.includes(item.id);
          const cityDisplayName = CITIES.find(
            (c) => c.name.toLowerCase() === item.cityName.toLowerCase()
          )?.displayName || item.cityName;

          return (
            <View style={styles.sipCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.sipImage} />
              <View style={styles.sipContent}>
                <View style={styles.sipHeaderRow}>
                  <Text style={styles.sipDrinkName} numberOfLines={1}>
                    {item.drinkName}
                  </Text>
                  <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFav ? '#dc2626' : '#78716c'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sipShopName}>{item.shopName}</Text>

                <View style={styles.sipMetaRow}>
                  <View style={styles.sipMetaTag}>
                    <Ionicons name="location-outline" size={12} color="#78716c" />
                    <Text style={styles.sipMetaText}>
                      {cityDisplayName}
                      {item.districtName ? ` · ${item.districtName}` : ''}
                    </Text>
                  </View>
                  <View style={styles.sipMetaTag}>
                    <Ionicons name="calendar-outline" size={12} color="#78716c" />
                    <Text style={styles.sipMetaText}>{item.date}</Text>
                  </View>
                </View>

                {item.flavorTags.length > 0 && (
                  <View style={styles.tagContainer}>
                    {item.flavorTags.map((tag, idx) => (
                      <View key={idx} style={styles.flavorTag}>
                        <Text style={styles.flavorTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {item.comment ? <Text style={styles.sipComment}>{item.comment}</Text> : null}

                <View style={styles.sipCardFooter}>
                  {/* Rating Stars */}
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name={s <= item.rating ? 'star' : 'star-outline'}
                        size={14}
                        color="#eab308"
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('删除确认', '确定要删除这条打卡记录吗？', [
                        { text: '取消', style: 'cancel' },
                        { text: '删除', style: 'destructive', onPress: () => handleDeleteSip(item.id) },
                      ])
                    }
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            {loading ? (
              <ActivityIndicator size="large" color="#43664d" />
            ) : (
              <>
                <Ionicons name="cafe-outline" size={48} color="#a8a29e" />
                <Text style={styles.emptyText}>当前城市暂无打卡记录</Text>
              </>
            )}
          </View>
        }
        contentContainerStyle={styles.scrollList}
      />

      {/* Floating Action Button */}
      <TouchableOpacity onPress={() => setIsCheckInOpen(true)} style={styles.fab}>
        <Ionicons name="sparkles" size={20} color="#ffffff" style={{ marginRight: 4 }} />
        <Text style={styles.fabText}>打卡新饮品</Text>
      </TouchableOpacity>

      {/* Check In Modal Overlay */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSave={fetchSips}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f5',
  },
  scrollList: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#43664d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  statsLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#43664d',
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: 13,
    color: '#78716c',
    maxWidth: width * 0.5,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#79573f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statsNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  statsLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#78716c',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  mapContainer: {
    marginHorizontal: 16,
    height: 350,
    backgroundColor: '#eef1ed',
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: '#eeeeea',
    borderWidth: 1,
    position: 'relative',
    marginVertical: 15,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(250, 249, 245, 0.9)',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  mapOverlayLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#78716c',
  },
  clearBtn: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#79573f',
  },
  mapPin: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    marginLeft: -6,
    marginTop: -6,
  },
  logHeaderRow: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  logSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#43664d',
  },
  sipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderColor: '#eeeeea',
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    flexDirection: 'row',
    shadowColor: '#79573f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sipImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  sipContent: {
    flex: 1,
    marginLeft: 14,
  },
  sipHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sipDrinkName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2c2c2c',
    flex: 1,
    marginRight: 8,
  },
  sipShopName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716c',
    marginTop: 2,
  },
  sipMetaRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  sipMetaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sipMetaText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#78716c',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  flavorTag: {
    backgroundColor: '#eeeeea',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  flavorTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#78716c',
  },
  sipComment: {
    fontSize: 12,
    color: '#4a4a4a',
    backgroundColor: '#faf9f5',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    lineHeight: 16,
  },
  sipCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopColor: '#f5f5f5',
    borderTopWidth: 1,
  },
  starRow: {
    flexDirection: 'row',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyView: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a8a29e',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#43664d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
