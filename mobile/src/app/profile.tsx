import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { INITIAL_PROFILE, CITIES } from '../data';
import { SipRecord, UserProfile, DrinkCategory } from '../types';
import { API_BASE } from '@/constants/Config';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [sips, setSips] = useState<SipRecord[]>([]);

  // Fetch checkins to display stats and favorite list
  const fetchSips = async () => {
    try {
      const res = await fetch(`${API_BASE}/checkins?userId=demo-user-001&limit=100`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((ci: any) => ({
          id: ci.id,
          drinkName: ci.drink?.name || '未知饮品',
          shopName: ci.drink?.brand?.name || '未知店铺',
          cityName: ci.city?.code || 'shanghai',
          date: ci.date,
          category: dbCategoryToFrontend(ci.drink?.category?.name || 'other'),
          imageUrl: ci.cardUrl || ci.imageUrl,
          rating: 5,
        }));
        setSips(mapped);
      }
    } catch (err) {
      console.log('Failed to fetch user checkins for profile', err);
    }
  };

  useEffect(() => {
    fetchSips();
  }, []);

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

  // Dynamic statistics calculations
  const totalSipsCount = 142 + (sips.length - 4); // base 142
  const dayStreak = 15 + Math.floor((sips.length - 4) / 2); // base 15

  const getTopCategoryLabel = () => {
    if (sips.length === 0) return '精品咖啡';
    const counts: Record<string, number> = {};
    sips.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    let topCat = 'coffee';
    let maxCount = 0;
    Object.entries(counts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCat = cat;
      }
    });

    const mapping: Record<string, string> = {
      [DrinkCategory.Coffee]: '精品咖啡',
      [DrinkCategory.PourOver]: '精品手冲',
      [DrinkCategory.MilkTea]: '奶茶特饮',
      [DrinkCategory.FruitTea]: '鲜果茶饮',
      [DrinkCategory.Matcha]: '西尾抹茶',
      [DrinkCategory.Tea]: '传统茗茶',
    };
    return mapping[topCat] || '特色饮品';
  };

  // Save profile changes
  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('提示', '姓名不能为空');
      return;
    }
    setProfile({
      ...profile,
      name: editName,
      bio: editBio,
    });
    setIsEditing(false);
    Alert.alert('成功', '个人资料已更新');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          
          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="名称"
              />
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="个性签名"
                multiline
              />
              <View style={styles.editBtnRow}>
                <TouchableOpacity
                  onPress={() => {
                    setEditName(profile.name);
                    setEditBio(profile.bio);
                    setIsEditing(false);
                  }}
                  style={[styles.editFormBtn, styles.cancelBtn]}
                >
                  <Text style={styles.cancelBtnText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={[styles.editFormBtn, styles.saveBtn]}
                >
                  <Text style={styles.saveBtnText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfoCol}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Ionicons name="create-outline" size={16} color="#43664d" />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileHandle}>{profile.handle}</Text>
              <Text style={styles.profileBio}>{profile.bio}</Text>
            </View>
          )}
        </View>

        {/* Dynamic Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalSipsCount}</Text>
            <Text style={styles.statLbl}>累计打卡</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{dayStreak}天</Text>
            <Text style={styles.statLbl}>连续天数</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{getTopCategoryLabel()}</Text>
            <Text style={styles.statLbl}>最爱类别</Text>
          </View>
        </View>

        {/* Badges Earned */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>🏆 获得的成就勋章 ({profile.badges.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
            {profile.badges.map((badge) => {
              let badgeColor = '#43664d';
              if (badge.id === 'badge-coffee') badgeColor = '#79573f';
              if (badge.id === 'badge-citrus') badgeColor = '#c89d3c';

              return (
                <View key={badge.id} style={[styles.badgeCard, { borderColor: badgeColor }]}>
                  <Ionicons
                    name={
                      badge.icon === 'verified'
                        ? 'checkmark-circle-outline'
                        : badge.icon === 'local_cafe'
                        ? 'cafe-outline'
                        : badge.icon === 'explore'
                        ? 'compass-outline'
                        : 'map-outline'
                    }
                    size={24}
                    color={badgeColor}
                  />
                  <Text style={[styles.badgeName, { color: badgeColor }]}>{badge.name}</Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Favorite Drinks List */}
        <View style={[styles.sectionContainer, { marginTop: 10 }]}>
          <Text style={styles.sectionHeaderTitle}>❤️ 收藏的经典饮记 ({sips.length})</Text>
          {sips.map((item) => (
            <View key={item.id} style={styles.favDrinkItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.favDrinkImg} />
              <View style={styles.favDrinkInfo}>
                <Text style={styles.favDrinkName} numberOfLines={1}>
                  {item.drinkName}
                </Text>
                <Text style={styles.favDrinkShop}>{item.shopName}</Text>
              </View>
              <Ionicons name="heart" size={16} color="#dc2626" />
            </View>
          ))}
          {sips.length === 0 && (
            <Text style={styles.noFavText}>暂无收藏的饮记，赶紧去地图打卡吧！</Text>
          )}
        </View>

        {/* Settings Menu Options */}
        <View style={styles.settingsMenu}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={18} color="#78716c" />
              <Text style={styles.menuItemText}>我的偏好设置</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#a8a29e" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="share-social-outline" size={18} color="#78716c" />
              <Text style={styles.menuItemText}>分享足迹图给好友</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#a8a29e" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#79573f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 20,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#43664d',
  },
  profileHandle: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 2,
    fontWeight: 'bold',
  },
  profileBio: {
    fontSize: 12,
    color: '#4a4a4a',
    marginTop: 8,
    lineHeight: 16,
  },
  editForm: {
    flex: 1,
    marginLeft: 20,
  },
  input: {
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#2c2c2c',
    marginBottom: 8,
  },
  bioInput: {
    height: 50,
    textAlignVertical: 'top',
  },
  editBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editFormBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: '#eeeeea',
  },
  cancelBtnText: {
    fontSize: 11,
    color: '#78716c',
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#43664d',
  },
  saveBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#79573f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#43664d',
  },
  statLbl: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#78716c',
    marginTop: 4,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#43664d',
    marginBottom: 10,
  },
  badgesScroll: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  badgeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    width: 110,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 8,
    color: '#78716c',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 10,
  },
  favDrinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
  },
  favDrinkImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  favDrinkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  favDrinkName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2c2c2c',
  },
  favDrinkShop: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 2,
  },
  noFavText: {
    fontSize: 12,
    color: '#a8a29e',
    textAlign: 'center',
    paddingVertical: 20,
  },
  settingsMenu: {
    backgroundColor: '#ffffff',
    borderColor: '#eeeeea',
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomColor: '#f5f5f5',
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c2c2c',
  },
});
