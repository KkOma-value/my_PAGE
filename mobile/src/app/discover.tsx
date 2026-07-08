import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CITIES, CITY_RANKINGS } from '../data';
import { SipRecord, DrinkCategory } from '../types';
import { API_BASE } from '@/constants/Config';

const { width } = Dimensions.get('window');

// Handcrafted regional specialties (mock data copied from Next.js implementation)
const CITY_SPECIALS: Record<string, {
  drinkName: string;
  shopName: string;
  category: DrinkCategory;
  imageUrl: string;
  badge: string;
  description: string;
  sipsToday: string;
}[]> = {
  'Shanghai': [
    {
      drinkName: '西尾浓抹茶拿铁',
      shopName: '芋泥咖啡屋',
      category: DrinkCategory.Matcha,
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
      badge: '海派创意',
      description: '纯正西尾抹茶，搭配鲜牛乳与沙糯芋泥，口感层叠，如江南烟雨般细腻滑顺。',
      sipsToday: '1.1k'
    },
    {
      drinkName: '生椰拿铁',
      shopName: 'Manner 咖啡',
      category: DrinkCategory.Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      badge: '魔都顶流',
      description: '经典生椰乳撞上极富坚果香的Espresso，清爽滑溜，魔都夏日续命神器。',
      sipsToday: '1.5k'
    }
  ],
  'Beijing': [
    {
      drinkName: '经典老北京茉莉花茶',
      shopName: '吴裕泰茶庄',
      category: DrinkCategory.Tea,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      badge: '百年非遗',
      description: '传承非遗窨制工艺，茶汤清澈，香气极高。大碗冰镇，喝一口满嘴花香。',
      sipsToday: '1.4k'
    },
    {
      drinkName: '糖葫芦特调美式',
      shopName: '红砖咖啡厅',
      category: DrinkCategory.Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&fit=crop&q=80',
      badge: '京韵特调',
      description: '手制糖葫芦山楂酱，巧妙融入浅烘椰香冰浓缩中，咸甜带酸，地道京韵。',
      sipsToday: '820'
    }
  ],
  'Chengdu': [
    {
      drinkName: '盖碗竹叶青',
      shopName: '蜀茶坊',
      category: DrinkCategory.Tea,
      imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80',
      badge: '巴蜀名茶',
      description: '峨眉高山核心产区独芽，带有纯正板栗豆香。宽窄巷子树荫下盖碗慢品。',
      sipsToday: '1.2k'
    },
    {
      drinkName: '花椒风味可可拿铁',
      shopName: 'UID 咖啡',
      category: DrinkCategory.Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      badge: '川味创意',
      description: '红花椒香气在黑巧可可的包裹下爆开，微麻微甜的多层次感官体验。',
      sipsToday: '710'
    }
  ],
  'Guangzhou': [
    {
      drinkName: '老广陈皮红豆沙拿铁',
      shopName: '大同酒家茶室',
      category: DrinkCategory.Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&fit=crop&q=80',
      badge: '岭南温润',
      description: '新会十年老陈皮细沙红豆，撞入香滑鲜奶及浓坚果深烘咖啡，老广的浪漫。',
      sipsToday: '940'
    },
    {
      drinkName: '爆打香水柠檬红茶',
      shopName: '荔湾茶档',
      category: DrinkCategory.FruitTea,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      badge: '街边茶歇',
      description: '广东香水柠檬现打出精油清香，撞击醇厚锡兰红茶，酸爽至极，解辣解腻。',
      sipsToday: '1.3k'
    }
  ]
};

const SEASON_RECOMMENDATIONS = {
  'Spring': [
    {
      drinkName: '春日燕麦抹茶拿铁',
      shopName: '草木间茶寮',
      category: DrinkCategory.Matcha,
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '春樱暖阳',
      description: '早春鲜石磨宇治抹茶，搭配植物燕麦奶，口感清新绵密，唤醒春日慵懒意境。'
    },
    {
      drinkName: '樱花白桃乌龙',
      shopName: '茶百道',
      category: DrinkCategory.FruitTea,
      imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '踏青限定',
      description: '甘醇白桃乌龙茶底融合浪漫樱花晶球，粉嫩高颜值，清新舒爽直扑口鼻。'
    }
  ],
  'Summer': [
    {
      drinkName: '盛夏百香果冰茶',
      shopName: '茶与她',
      category: DrinkCategory.FruitTea,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '极度冰爽',
      description: '高酸度百香果籽果肉撞入高山毛峰绿茶，碎冰激爽，瞬间降温5度。'
    },
    {
      drinkName: '椰椰沙冰美式',
      shopName: 'Peet\'s Coffee',
      category: DrinkCategory.Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '海岛椰香',
      description: '现开生椰水冰沙气泡冲入冷萃咖啡中，椰香四溢，口感清澈，微甜舒爽。'
    }
  ],
  'Autumn': [
    {
      drinkName: '金秋桂花酒酿奶茶',
      shopName: '古茗茶饮',
      category: DrinkCategory.MilkTea,
      imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '满城尽带桂花香',
      description: '桂花蜜伴入软糯米酒酿，佐以滑润红茶奶茶，金秋温暖，落落大方。'
    },
    {
      drinkName: '板栗香厚乳燕麦拿铁',
      shopName: '瑞幸咖啡',
      category: DrinkCategory.Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '秋日暖胃',
      description: '温润细沙的糖炒栗子泥，融入香醇的热浓缩与燕麦奶，带来丰硕甜香。'
    }
  ],
  'Winter': [
    {
      drinkName: '手熬黑糖波波鲜奶',
      shopName: '老虎堂',
      category: DrinkCategory.MilkTea,
      imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '冬日醇厚',
      description: '纯手工古法熬制温热黑糖，挂壁虎纹，融合冰醇鲜奶与Q弹波波，冬日醇香。'
    },
    {
      drinkName: '烤椰香焦糖玛奇朵',
      shopName: '星巴克',
      category: DrinkCategory.Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      seasonBadge: '融雪炉火',
      description: '香甜焦糖与微苦意式浓缩，伴随烘烤椰子脆片的坚果焦香，暖流直抵心间。'
    }
  ]
};

export default function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<'city' | 'season' | 'preference'>('city');
  const [selectedCity, setSelectedCity] = useState('Shanghai');
  const [selectedSeason, setSelectedSeason] = useState<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Summer');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [sips, setSips] = useState<SipRecord[]>([]);

  // Fetch checkins to identify user preference
  useEffect(() => {
    const fetchUserSips = async () => {
      try {
        const res = await fetch(`${API_BASE}/checkins?userId=demo-user-001&limit=100`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Parse db data
          const mapped = json.data.map((ci: any) => ({
            id: ci.id,
            category: dbCategoryToFrontend(ci.drink?.category?.name || 'other')
          }));
          setSips(mapped);
        }
      } catch (err) {
        console.log('Failed to fetch user checkins for discover preference', err);
      }
    };
    fetchUserSips();
  }, []);

  // Helper: map db category name to frontend
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

  // Calculate User Favorite Category & Persona
  const getUserPersona = () => {
    if (sips.length === 0) {
      return {
        category: DrinkCategory.Coffee,
        badge: '🌟 寻味探索大师',
        desc: '您拥有一条极富探险精神的多元化味蕾，每一种特色的饮品都想品味一番。'
      };
    }

    const counts: Record<string, number> = {};
    sips.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });

    let favCategory: DrinkCategory = DrinkCategory.Coffee;
    let maxCount = 0;
    for (const cat of Object.keys(counts)) {
      if (counts[cat] > maxCount) {
        maxCount = counts[cat];
        favCategory = cat as DrinkCategory;
      }
    }

    switch (favCategory as DrinkCategory) {
      case DrinkCategory.Matcha:
        return {
          category: DrinkCategory.Matcha,
          badge: '🍵 东方青绿茶客',
          desc: '你钟情于那一抹悠长微苦的茶香与回甘，崇尚天然、克制、又有风骨的美学体验。'
        };
      case DrinkCategory.Coffee:
        return {
          category: DrinkCategory.Coffee,
          badge: '☕️ 每日咖啡觉醒者',
          desc: '咖啡已融入你的血液，无论是清晨续命还是下午茶悠闲，Espresso 或拿铁永远是首选。'
        };
      case DrinkCategory.FruitTea:
        return {
          category: DrinkCategory.FruitTea,
          badge: '🍓 鲜活果味探险家',
          desc: '您热衷于爆汁水果与清甜花香在舌尖的猛烈撞击，活力无限，阳光消暑。'
        };
      case DrinkCategory.MilkTea:
        return {
          category: DrinkCategory.MilkTea,
          badge: '🥛 快乐奶茶守护者',
          desc: '温润顺滑的牛乳遇上持久悠长红绿茶底，带给您满满的能量和日常小确幸。'
        };
      case DrinkCategory.PourOver:
        return {
          category: DrinkCategory.PourOver,
          badge: '🫖 精品手冲极客',
          desc: '您是绝对的品质玩家，追求单品咖啡豆最干净本真的花香果酸，手冲仪式感满分。'
        };
      default:
        return {
          category: DrinkCategory.Tea,
          badge: '🌟 寻味探索大师',
          desc: '您拥有一条极富探险精神的多元化味蕾，每一种特色的饮品都想品味一番。'
        };
    }
  };

  const persona = getUserPersona();

  // Handle Quick Check In
  const handleQuickCheckIn = async (item: {
    drinkName: string;
    shopName: string;
    cityName: string;
    category: DrinkCategory;
    imageUrl: string;
  }) => {
    try {
      const cityCode = item.cityName.toLowerCase().replace("'", "");
      const mapCategoryToDbName = (cat: DrinkCategory) => {
        if (cat === DrinkCategory.Coffee || cat === DrinkCategory.PourOver) return 'coffee';
        if (cat === DrinkCategory.MilkTea) return 'milk_tea';
        if (cat === DrinkCategory.FruitTea) return 'fruit_tea';
        return 'tea';
      };

      const res = await fetch(`${API_BASE}/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user-001',
          customDrinkName: item.drinkName,
          brandName: item.shopName,
          categoryName: mapCategoryToDbName(item.category),
          cityCode: cityCode,
          imageUrl: item.imageUrl,
          caption: '通过 SipNotes 城市人气排行榜一键打卡推荐！',
          locationName: '热门商圈',
        }),
      });

      const json = await res.json();
      if (json.success) {
        Alert.alert('打卡成功', `一键打卡“${item.drinkName}”成功！可前往“我的足迹”查看。`);
      } else {
        Alert.alert('打卡失败', json.error?.message || '未知错误');
      }
    } catch (err) {
      console.log('Failed to execute quick check-in', err);
      Alert.alert('打卡失败', '网络请求失败，请检查后端服务是否启动');
    }
  };

  const currentRankings = CITY_RANKINGS[selectedCity as keyof typeof CITY_RANKINGS] || [];
  const currentSpecials = CITY_SPECIALS[selectedCity] || [];
  const seasonalDrinks = SEASON_RECOMMENDATIONS[selectedSeason] || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Segmented Controller Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          onPress={() => setActiveTab('city')}
          style={[styles.tabItem, activeTab === 'city' && styles.tabItemActive]}
        >
          <Ionicons name="compass" size={16} color={activeTab === 'city' ? '#ffffff' : '#78716c'} />
          <Text style={[styles.tabItemText, activeTab === 'city' && styles.tabItemTextActive]}>
            地域特色
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('season')}
          style={[styles.tabItem, activeTab === 'season' && styles.tabItemActive]}
        >
          <Ionicons name="calendar" size={16} color={activeTab === 'season' ? '#ffffff' : '#78716c'} />
          <Text style={[styles.tabItemText, activeTab === 'season' && styles.tabItemTextActive]}>
            季节变化
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('preference')}
          style={[styles.tabItem, activeTab === 'preference' && styles.tabItemActive]}
        >
          <Ionicons name="heart" size={16} color={activeTab === 'preference' ? '#ffffff' : '#78716c'} />
          <Text style={[styles.tabItemText, activeTab === 'preference' && styles.tabItemTextActive]}>
            个人偏好
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* --- 1. CITY RECOMMENDATIONS TAB --- */}
        {activeTab === 'city' && (
          <View style={styles.tabContent}>
            {/* Header with City Picker */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionSub}>城市探索</Text>
                <Text style={styles.sectionTitle}>
                  {CITIES.find((c) => c.name === selectedCity)?.displayName || selectedCity}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                style={styles.cityPickerBtn}
              >
                <Text style={styles.cityPickerBtnText}>切换城市</Text>
                <Ionicons name="chevron-down" size={14} color="#43664d" />
              </TouchableOpacity>
            </View>

            {/* City Selection Dropdown (Simulated Overlay) */}
            {isCityDropdownOpen && (
              <View style={styles.dropdown}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dropdownScroll}>
                  {CITIES.map((city) => (
                    <TouchableOpacity
                      key={city.name}
                      onPress={() => {
                        setSelectedCity(city.name);
                        setIsCityDropdownOpen(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        selectedCity === city.name && styles.dropdownItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedCity === city.name && styles.dropdownItemTextActive,
                        ]}
                      >
                        {city.displayName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* City Rankings */}
            <View style={styles.cardContainer}>
              <Text style={styles.cardHeaderTitle}>🔥 城市人气排行榜</Text>
              {currentRankings.map((item, idx) => (
                <View key={idx} style={styles.rankingItem}>
                  <View
                    style={[
                      styles.rankNumberCircle,
                      idx === 0
                        ? { backgroundColor: '#eab308' }
                        : idx === 1
                        ? { backgroundColor: '#cbd5e1' }
                        : { backgroundColor: '#b45309' },
                    ]}
                  >
                    <Text style={styles.rankNumberText}>{item.rank}</Text>
                  </View>
                  <Image source={{ uri: item.imageUrl }} style={styles.rankingImg} />
                  <View style={styles.rankingInfo}>
                    <Text style={styles.rankingDrinkName} numberOfLines={1}>
                      {item.drinkName}
                    </Text>
                    <Text style={styles.rankingShopName}>{item.shopName}</Text>
                    <Text style={styles.rankingStats}>今日打卡 {item.sipsToday} 次</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleQuickCheckIn(item)}
                    style={styles.quickCheckInBtn}
                  >
                    <Ionicons name="sparkles-outline" size={12} color="#43664d" />
                    <Text style={styles.quickCheckInText}>一键打卡</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* City Specialties */}
            {currentSpecials.length > 0 && (
              <View style={[styles.cardContainer, { marginTop: 15 }]}>
                <Text style={styles.cardHeaderTitle}>✨ 城市特色手作推荐</Text>
                {currentSpecials.map((item, idx) => (
                  <View key={idx} style={styles.specialCard}>
                    <Image source={{ uri: item.imageUrl }} style={styles.specialCardImg} />
                    <View style={styles.specialCardBadge}>
                      <Text style={styles.specialCardBadgeText}>{item.badge}</Text>
                    </View>
                    <View style={styles.specialCardContent}>
                      <Text style={styles.specialCardDrinkName}>{item.drinkName}</Text>
                      <Text style={styles.specialCardShopName}>{item.shopName}</Text>
                      <Text style={styles.specialCardDesc}>{item.description}</Text>
                      <View style={styles.specialCardFooter}>
                        <Text style={styles.specialCardStats}>今日人气 {item.sipsToday}</Text>
                        <TouchableOpacity
                          onPress={() => handleQuickCheckIn({ ...item, cityName: selectedCity })}
                          style={styles.specialCheckInBtn}
                        >
                          <Text style={styles.specialCheckInText}>立刻品尝</Text>
                          <Ionicons name="arrow-forward" size={12} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* --- 2. SEASON RECOMMENDATIONS TAB --- */}
        {activeTab === 'season' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionSub}>季节限定</Text>
                <Text style={styles.sectionTitle}>
                  {selectedSeason === 'Spring'
                    ? '温暖春日推荐'
                    : selectedSeason === 'Summer'
                    ? '炎炎夏日推荐'
                    : selectedSeason === 'Autumn'
                    ? '金秋暖风推荐'
                    : '冬日融雪推荐'}
                </Text>
              </View>

              {/* Season Selector */}
              <View style={styles.seasonPicker}>
                {(['Spring', 'Summer', 'Autumn', 'Winter'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSeason(s)}
                    style={[
                      styles.seasonPickerBtn,
                      selectedSeason === s && styles.seasonPickerBtnActive,
                    ]}
                  >
                    <Ionicons
                      name={
                        s === 'Spring'
                          ? 'leaf-outline'
                          : s === 'Summer'
                          ? 'sunny-outline'
                          : s === 'Autumn'
                          ? 'cloud-outline'
                          : 'snow-outline'
                      }
                      size={14}
                      color={selectedSeason === s ? '#ffffff' : '#78716c'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Render Curated Seasonal recommendations */}
            <View style={styles.cardContainer}>
              {seasonalDrinks.map((item, idx) => (
                <View key={idx} style={[styles.specialCard, { marginBottom: 15 }]}>
                  <Image source={{ uri: item.imageUrl }} style={styles.specialCardImg} />
                  <View style={[styles.specialCardBadge, { backgroundColor: '#79573f' }]}>
                    <Text style={styles.specialCardBadgeText}>{item.seasonBadge}</Text>
                  </View>
                  <View style={styles.specialCardContent}>
                    <Text style={styles.specialCardDrinkName}>{item.drinkName}</Text>
                    <Text style={styles.specialCardShopName}>{item.shopName}</Text>
                    <Text style={styles.specialCardDesc}>{item.description}</Text>
                    <View style={styles.specialCardFooter}>
                      <TouchableOpacity
                        onPress={() =>
                          handleQuickCheckIn({
                            ...item,
                            cityName: 'Shanghai', // default fallback
                          })
                        }
                        style={[styles.specialCheckInBtn, { backgroundColor: '#79573f' }]}
                      >
                        <Text style={styles.specialCheckInText}>一键打卡</Text>
                        <Ionicons name="sparkles" size={12} color="#ffffff" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* --- 3. PERSONAL PREFERENCE TAB --- */}
        {activeTab === 'preference' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionSub}>智能分析</Text>
                <Text style={styles.sectionTitle}>个人偏好推荐</Text>
              </View>
            </View>

            {/* Persona Bento Card */}
            <View style={[styles.cardContainer, { backgroundColor: '#faf9f5', borderColor: '#43664d', borderWidth: 1.5 }]}>
              <View style={styles.personaHeader}>
                <Ionicons name="ribbon-outline" size={24} color="#43664d" />
                <Text style={styles.personaBadge}>{persona.badge}</Text>
              </View>
              <Text style={styles.personaDesc}>{persona.desc}</Text>
            </View>

            {/* Custom generated recommendations based on category */}
            <View style={[styles.cardContainer, { marginTop: 15 }]}>
              <Text style={styles.cardHeaderTitle}>💡 专属定制口味推荐</Text>
              <View style={styles.preferenceRow}>
                <Ionicons name="cafe-outline" size={20} color="#79573f" />
                <View style={styles.preferenceTextCol}>
                  <Text style={styles.preferenceTitle}>
                    {persona.category === DrinkCategory.Coffee
                      ? '云南保山 小粒瑰夏小种'
                      : '大红袍爆打手打柠檬茶'}
                  </Text>
                  <Text style={styles.preferenceDescSub}>
                    {persona.category === DrinkCategory.Coffee
                      ? '精品浅烘焙，带有茉莉花香与柑橘酸调，极其干净的口感，适合偏爱高雅坚果香的你。'
                      : '浓厚木质香岩茶底搭配爆打香柠檬，酸爽回甘解油腻，极具夏日风味。'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f5',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#eeeeea',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 3,
    borderColor: '#eeeeea',
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: '#43664d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#78716c',
  },
  tabItemTextActive: {
    color: '#ffffff',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#78716c',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#43664d',
    marginTop: 2,
  },
  cityPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeea',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  cityPickerBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#43664d',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dropdownScroll: {
    flexDirection: 'row',
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  dropdownItemActive: {
    backgroundColor: '#43664d',
  },
  dropdownItemText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#78716c',
  },
  dropdownItemTextActive: {
    color: '#ffffff',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#79573f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#43664d',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#f5f5f5',
    borderBottomWidth: 1,
  },
  rankNumberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankNumberText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rankingImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  rankingInfo: {
    flex: 1,
    marginLeft: 10,
  },
  rankingDrinkName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2c2c2c',
  },
  rankingShopName: {
    fontSize: 11,
    color: '#78716c',
    marginTop: 1,
  },
  rankingStats: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#43664d',
    marginTop: 2,
  },
  quickCheckInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef1ed',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 2,
  },
  quickCheckInText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#43664d',
  },
  specialCard: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: '#eeeeea',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  specialCardImg: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  specialCardBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#43664d',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  specialCardBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  specialCardContent: {
    padding: 12,
  },
  specialCardDrinkName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2c2c2c',
  },
  specialCardShopName: {
    fontSize: 11,
    color: '#78716c',
    marginTop: 2,
  },
  specialCardDesc: {
    fontSize: 12,
    color: '#4a4a4a',
    marginTop: 6,
    lineHeight: 16,
  },
  specialCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopColor: '#f5f5f5',
    borderTopWidth: 1,
  },
  specialCardStats: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#78716c',
  },
  specialCheckInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#43664d',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  specialCheckInText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  seasonPicker: {
    flexDirection: 'row',
    backgroundColor: '#eeeeea',
    borderRadius: 16,
    padding: 2,
  },
  seasonPickerBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonPickerBtnActive: {
    backgroundColor: '#79573f',
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  personaBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#43664d',
  },
  personaDesc: {
    fontSize: 12,
    color: '#4a4a4a',
    lineHeight: 18,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 6,
  },
  preferenceTextCol: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2c2c2c',
  },
  preferenceDescSub: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 4,
    lineHeight: 16,
  },
});
