"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Map, 
  ChevronDown, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Check, 
  BookmarkPlus, 
  Calendar, 
  Heart, 
  Compass, 
  Sun, 
  Leaf, 
  Snowflake,
  Coffee,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { SipRecord, DrinkCategory } from "@/types";
import { CITIES, CITY_RANKINGS } from "../external/my_PAGE/src/data";
import { motion, AnimatePresence } from "motion/react";

// Handcrafted regional specialties for major cities
const CITY_SPECIALS: Record<string, {
  drinkName: string;
  shopName: string;
  category: DrinkCategory;
  imageUrl: string;
  badge: string;
  description: string;
  sipsToday: string;
}[]> = {
  "Shanghai": [
    {
      drinkName: "西尾浓抹茶拿铁",
      shopName: "芋泥咖啡屋",
      category: DrinkCategory.Matcha,
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      badge: "海派创意",
      description: "纯正西尾抹茶，搭配鲜牛乳与沙糯芋泥，口感层叠，如江南烟雨般细腻滑顺。",
      sipsToday: "1.1k"
    },
    {
      drinkName: "生椰拿铁",
      shopName: "Manner 咖啡",
      category: DrinkCategory.Coffee,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      badge: "魔都顶流",
      description: "经典生椰乳撞上极富坚果香的Espresso，清爽滑溜，魔都夏日续命神器。",
      sipsToday: "1.5k"
    }
  ],
  "Beijing": [
    {
      drinkName: "经典老北京茉莉花茶",
      shopName: "吴裕泰茶庄",
      category: DrinkCategory.Tea,
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      badge: "百年非遗",
      description: "传承非遗窨制工艺，茶汤清澈，香气极高。大碗冰镇，喝一口满嘴花香。",
      sipsToday: "1.4k"
    },
    {
      drinkName: "糖葫芦特调美式",
      shopName: "红砖咖啡厅",
      category: DrinkCategory.Coffee,
      imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&fit=crop&q=80",
      badge: "京韵特调",
      description: "手制糖葫芦山楂酱，巧妙融入浅烘椰香冰浓缩中，咸甜带酸，地道京韵。",
      sipsToday: "820"
    }
  ],
  "Chengdu": [
    {
      drinkName: "盖碗竹叶青",
      shopName: "蜀茶坊",
      category: DrinkCategory.Tea,
      imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80",
      badge: "巴蜀名茶",
      description: "峨眉高山核心产区独芽，带有纯正板栗豆香。宽窄巷子树荫下盖碗慢品。",
      sipsToday: "1.2k"
    },
    {
      drinkName: "花椒风味可可拿铁",
      shopName: "UID 咖啡",
      category: DrinkCategory.Coffee,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      badge: "川味创意",
      description: "红花椒香气在黑巧可可的包裹下爆开，微麻微甜的多层次感官体验。",
      sipsToday: "710"
    }
  ],
  "Guangzhou": [
    {
      drinkName: "老广陈皮红豆沙拿铁",
      shopName: "大同酒家茶室",
      category: DrinkCategory.Coffee,
      imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&fit=crop&q=80",
      badge: "岭南温润",
      description: "新会十年老陈皮细沙红豆，撞入香滑鲜奶及浓坚果深烘咖啡，老广的浪漫。",
      sipsToday: "940"
    },
    {
      drinkName: "爆打香水柠檬红茶",
      shopName: "荔湾茶档",
      category: DrinkCategory.FruitTea,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
      badge: "街边茶歇",
      description: "广东香水柠檬现打出精油清香，撞击醇厚锡兰红茶，酸爽至极，解辣解腻。",
      sipsToday: "1.3k"
    }
  ]
};

// Seasonal curated drink recommendations
const SEASON_RECOMMENDATIONS = {
  "Spring": [
    {
      drinkName: "春日燕麦抹茶拿铁",
      shopName: "草木间茶寮",
      category: DrinkCategory.Matcha,
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "春樱暖阳",
      description: "早春鲜石磨宇治抹茶，搭配植物燕麦奶，口感清新绵密，唤醒春日慵懒意境。"
    },
    {
      drinkName: "樱花白桃乌龙",
      shopName: "茶百道",
      category: DrinkCategory.FruitTea,
      imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "踏青限定",
      description: "甘醇白桃乌龙茶底融合浪漫樱花晶球，粉嫩高颜值，清新舒爽直扑口鼻。"
    }
  ],
  "Summer": [
    {
      drinkName: "盛夏百香果冰茶",
      shopName: "茶与她",
      category: DrinkCategory.FruitTea,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "极度冰爽",
      description: "高酸度百香果籽果肉撞入高山毛峰绿茶，碎冰激爽，瞬间降温5度。"
    },
    {
      drinkName: "椰椰沙冰美式",
      shopName: "Peet's Coffee",
      category: DrinkCategory.Coffee,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "海岛椰香",
      description: "现开生椰水冰沙缓缓冲入埃塞冷萃咖啡中，椰香四溢，口感清澈，微甜舒爽。"
    }
  ],
  "Autumn": [
    {
      drinkName: "金秋桂花酒酿奶茶",
      shopName: "古茗茶饮",
      category: DrinkCategory.MilkTea,
      imageUrl: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "满城尽带桂花香",
      description: "桂花蜜伴入软糯米酒酿，佐以滑润红茶奶茶，金秋温暖，落落大方。"
    },
    {
      drinkName: "板栗香厚乳燕麦拿铁",
      shopName: "瑞幸咖啡",
      category: DrinkCategory.Coffee,
      imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "秋日暖胃",
      description: "温润细沙的糖炒栗子泥，融入香醇的热浓缩与燕麦奶，带来丰硕甜香。"
    }
  ],
  "Winter": [
    {
      drinkName: "暖姜黑糖老牛乳茶",
      shopName: "阿嬷手作",
      category: DrinkCategory.MilkTea,
      imageUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "冬日驱寒",
      description: "手熬辛温老姜与焦香黑糖，激撞入厚醇热牛乳，一口喝下红润暖意涌遍全身。"
    },
    {
      drinkName: "经典香草焦糖拿铁",
      shopName: "Seesaw 咖啡",
      category: DrinkCategory.Coffee,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      seasonBadge: "暖手香润",
      description: "现磨极细阿拉比卡，搭配细腻热蒸奶泡，焦糖香草气息萦绕，治愈冰冷冬天。"
    }
  ]
};

// Handcrafted personalization recommendations matching each favorite category
const PERSONAL_RECOMMENDATIONS: Record<DrinkCategory, {
  drinkName: string;
  shopName: string;
  imageUrl: string;
  badge: string;
  description: string;
}[]> = {
  [DrinkCategory.Coffee]: [
    {
      drinkName: "手调冰滴瑰夏",
      shopName: "UID 咖啡",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
      badge: "神级瑰夏",
      description: "顶级巴拿马瑰夏，缓慢冰滴24小时，释放出高雅茉莉与香甜水蜜桃风味。"
    },
    {
      drinkName: "燕麦 Dirty",
      shopName: "Seesaw 咖啡",
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      badge: "冰火撞击",
      description: "杯底冰镇香甜燕麦奶，直接承接滚烫热浓缩咖啡，入口即是冷热极致交织。"
    }
  ],
  [DrinkCategory.Matcha]: [
    {
      drinkName: "手工点五十铃纯抹茶",
      shopName: "山本茶铺",
      imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
      badge: "极致手作",
      description: "手筅击拂，产生极为密实的嫩绿泡沫，海苔清气逼人，抹茶控的极致追求。"
    },
    {
      drinkName: "玄米抹茶冰冰乐",
      shopName: "辻利茶铺",
      imageUrl: "https://images.unsplash.com/photo-1515822360251-2a3b67f3007f?w=600&auto=format&fit=crop&q=80",
      badge: "炒香玄米",
      description: "焙烤微焦玄米粒，混合甘苦抹茶冰沙，一口嚼出多层谷物香与清凉抹茶韵。"
    }
  ],
  [DrinkCategory.Tea]: [
    {
      drinkName: "高山冷泡冻顶乌龙",
      shopName: "山中岁月",
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      badge: "兰花回甘",
      description: "中烘焙发酵乌龙，低温纯水冷萃24小时，汤色橙黄澄亮，落喉甜香生津。"
    },
    {
      drinkName: "炭焙肉桂岩茶",
      shopName: "传统古茶社",
      imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80",
      badge: "辛香岩韵",
      description: "炭火反复焙火的肉桂岩茶，干茶香气霸烈，带有一抹奇妙辛香，岩韵醇厚悠长。"
    }
  ],
  [DrinkCategory.FruitTea]: [
    {
      drinkName: "多肉黑提芝士",
      shopName: "喜茶",
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
      badge: "爆多果肉",
      description: "手剥新鲜大颗无籽黑提，铺满杯底，融入清新茉莉茶汤与绵密厚奶盖，超值大满足。"
    },
    {
      drinkName: "超大杯爆柠四季春",
      shopName: "林里茶饮",
      imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80",
      badge: "超值消暑",
      description: "高香四季春茶底配合一整颗爆打海南香水柠檬，解暑效果直击灵魂。"
    }
  ],
  [DrinkCategory.MilkTea]: [
    {
      drinkName: "声声乌龙",
      shopName: "茶颜悦色",
      imageUrl: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80",
      badge: "清甜不腻",
      description: "蜜桃风味乌龙茶底撞入优质脱脂牛奶，口感极其轻盈甘爽，淡淡花果香萦绕。"
    },
    {
      drinkName: "芋泥厚牛乳波波",
      shopName: "喜茶",
      imageUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=80",
      badge: "沙糯软粘",
      description: "手捣巨多沙软荔浦芋泥，裹上Q弹黑糖珍珠，倒入温热香浓鲜牛乳，绝绝子。"
    }
  ],
  [DrinkCategory.PourOver]: [
    {
      drinkName: "埃塞单品手冲",
      shopName: "格网咖啡",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
      badge: "柑橘柠檬",
      description: "经典耶加雪菲浅烘，带有极其干净柠檬柑橘与白色茉莉花香，极致清透。"
    },
    {
      drinkName: "冰冷萃手冲肯尼亚",
      shopName: "Lokal 咖啡",
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
      badge: "莓果风暴",
      description: "肯尼亚AA级咖啡，冷水滴慢滤，爆出标志性的黑加仑与小番茄酸甜多汁果香。"
    }
  ]
};

interface DiscoverRankingsProps {
  onQuickCheckIn: (item: { drinkName: string; shopName: string; cityName: string; districtName?: string; category: DrinkCategory; imageUrl: string }) => void;
  sips?: SipRecord[];
}

export default function DiscoverRankings({ onQuickCheckIn, sips = [] }: DiscoverRankingsProps) {
  const [activeTab, setActiveTab] = useState<"city" | "season" | "preference">("city");
  const [selectedCity, setSelectedCity] = useState<string>("Shanghai");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<"Spring" | "Summer" | "Autumn" | "Winter">(( ) => {
    const month = new Date().getMonth(); // 0-11
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Autumn";
    return "Winter";
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const citiesWithRankings = Object.keys(CITY_RANKINGS);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  // Quick check in helper
  const handleQuickLog = (item: { drinkName: string; shopName: string; category: DrinkCategory; imageUrl: string; districtName?: string }) => {
    onQuickCheckIn({
      drinkName: item.drinkName,
      shopName: item.shopName,
      cityName: selectedCity,
      districtName: item.districtName,
      category: item.category,
      imageUrl: item.imageUrl
    });
    showSuccessToast(`已将“${item.drinkName}”添加到您的个人足迹中！`);
  };

  // Helper to retrieve specials for the selected city
  const getCitySpecials = (city: string) => {
    if (CITY_SPECIALS[city]) return CITY_SPECIALS[city];
    
    // Fallback: build dynamically from CITY_RANKINGS to save tokens while keeping full functionality
    const rankings = CITY_RANKINGS[city] || CITY_RANKINGS["Shanghai"];
    return rankings.slice(0, 2).map((item, idx) => ({
      drinkName: item.drinkName,
      shopName: item.shopName,
      category: item.category,
      imageUrl: item.imageUrl,
      badge: idx === 0 ? "地域特色" : "城市限定",
      description: `精选本地广受赞誉的“${item.drinkName}”，带有本地咖啡师精心调配 of 独特魅力风味，非常值得品鉴。`,
      sipsToday: item.sipsToday
    }));
  };

  // Calculate User Preferences
  const hasSips = sips.length > 0;
  const categoryCounts: Record<string, number> = {};
  Object.values(DrinkCategory).forEach(cat => {
    categoryCounts[cat] = 0;
  });
  sips.forEach(s => {
    if (s.category) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    }
  });

  // Find user's favorite category
  let favoriteCategory: DrinkCategory = DrinkCategory.Coffee;
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteCategory = cat as DrinkCategory;
    }
  });

  const getPersonalBadgeInfo = (cat: DrinkCategory) => {
    switch (cat) {
      case DrinkCategory.Coffee:
        return { badge: "☕️ 重度咖啡成瘾者", desc: "您钟爱清香微苦、坚果可可味十足的精制手磨或香浓拿铁咖啡，提神又饱含质感。" };
      case DrinkCategory.Matcha:
        return { badge: "🍵 抹茶治愈系学家", desc: "您深深迷恋那一抹翠绿，对独特的草本微涩、浓郁海苔风味欲罢不能。" };
      case DrinkCategory.Tea:
        return { badge: "🎋 东方禅意茶客", desc: "您钟情于山野气息、天然岩韵的高山原叶冷萃或盖碗中慢跑出来的传统名茶。" };
      case DrinkCategory.FruitTea:
        return { badge: "🍓 鲜活果味探险家", desc: "您热衷于爆汁水果与清甜花香在舌尖的猛烈撞击，活力无限，阳光消暑。" };
      case DrinkCategory.MilkTea:
        return { badge: "🥛 快乐奶茶守护者", desc: "温润顺滑的牛乳遇上持久悠长红绿茶底，带给您满满的能量和日常小确幸。" };
      case DrinkCategory.PourOver:
        return { badge: "🫖 精品手冲极客", desc: "您是绝对的品质玩家，追求单品咖啡豆最干净本真 of 花香果酸，手冲仪式感满分。" };
      default:
        return { badge: "🌟 寻味探索大师", desc: "您拥有一条极富探险精神 of 多元化味蕾，每一种精彩 of 特色饮品都想品味一番。" };
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Dynamic Action Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-brand-primary text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl border border-brand-primary-container/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Discovery Tabs Selector */}
      <div className="grid grid-cols-3 gap-2 bg-brand-surface-low/80 p-1.5 rounded-2xl border border-brand-surface/40 max-w-lg mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab("city")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "city"
              ? "bg-brand-primary text-white shadow-md"
              : "text-brand-text-muted hover:text-brand-text hover:bg-white/50"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>地域特色推荐</span>
        </button>
        <button
          onClick={() => setActiveTab("season")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "season"
              ? "bg-brand-primary text-white shadow-md"
              : "text-brand-text-muted hover:text-brand-text hover:bg-white/50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>季节变化推荐</span>
        </button>
        <button
          onClick={() => setActiveTab("preference")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "preference"
              ? "bg-brand-primary text-white shadow-md"
              : "text-brand-text-muted hover:text-brand-text hover:bg-white/50"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>个人偏好推荐</span>
        </button>
      </div>

      {/* --- 1. CITY TAB CONTENT --- */}
      {activeTab === "city" && (
        <motion.div
          key="city-tab"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-brand-secondary font-sans text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> 城市特色饮品
              </span>
              <div className="flex items-center gap-2 mt-1 relative">
                <h2 className="text-4xl font-display font-extrabold text-brand-text tracking-tight">
                  {CITIES.find(c => c.name === selectedCity)?.displayName || selectedCity}
                </h2>
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="bg-brand-surface hover:bg-brand-surface/80 p-2 rounded-full text-brand-primary cursor-pointer active:scale-95 transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${isCityDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* City Dropdown Menu */}
                <AnimatePresence>
                  {isCityDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsCityDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-12 left-0 bg-white border border-brand-surface rounded-2xl shadow-2xl p-2 min-w-[200px] z-40 max-h-64 overflow-y-auto"
                      >
                        <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider px-3 py-1.5 block">
                          切换城市
                        </span>
                        {citiesWithRankings.map((city) => {
                          const cityObj = CITIES.find(c => c.name === city);
                          return (
                            <button
                              key={city}
                              onClick={() => handleCityChange(city)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer ${
                                selectedCity === city
                                  ? "bg-brand-primary/10 text-brand-primary"
                                  : "hover:bg-brand-surface-low text-brand-text-muted"
                              }`}
                            >
                              <span>{cityObj ? cityObj.displayName : city}</span>
                              {selectedCity === city && <Check className="w-4 h-4 text-brand-primary" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-brand-text-muted text-xs font-semibold mt-1">
                探索极富地域限定、非遗手艺或老字号沉淀的代表性特色饮品。
              </p>
            </div>
          </div>

          {/* Specialties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getCitySpecials(selectedCity).map((item, idx) => (
              <div 
                key={item.drinkName}
                className="bg-white border border-brand-surface rounded-3xl p-5 shadow-[0_4px_16px_rgba(121,87,63,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-5 relative group"
              >
                {/* Image */}
                <div className="w-full sm:w-44 h-44 shrink-0 rounded-2xl overflow-hidden bg-brand-surface relative shadow-inner">
                  <img src={item.imageUrl} alt={item.drinkName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <span className="absolute top-3 left-3 bg-brand-secondary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="inline-block bg-brand-surface-low text-brand-text-muted text-[9px] font-extrabold px-2 py-0.5 rounded-lg border border-brand-surface/60">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-display font-extrabold text-brand-text leading-tight">
                      {item.drinkName}
                    </h3>
                    <p className="text-xs text-brand-primary font-bold">
                      📍 {item.shopName}
                    </p>
                    <p className="text-xs text-brand-text-muted font-sans font-medium line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-brand-surface/40 mt-3 sm:mt-0">
                    <span className="text-[10px] text-brand-secondary font-extrabold flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 text-brand-secondary" />
                      人气指数: {item.sipsToday || "900+"} 打卡/日
                    </span>
                    <button
                      onClick={() => handleQuickLog(item)}
                      className="bg-brand-primary hover:bg-brand-primary-container text-white px-4 py-2 rounded-full font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" /> 一键打卡
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Regular City Popularity Standings */}
          <div className="pt-8 border-t border-brand-surface/50">
            <h4 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider mb-4 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-brand-primary animate-pulse" /> 本市热度大盘（人气榜单）
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(CITY_RANKINGS[selectedCity] || []).map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white/60 hover:bg-white border border-brand-surface/60 rounded-2xl p-4 shadow-sm hover:shadow transition-all flex items-center gap-3 relative group"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-surface flex items-center justify-center font-display font-extrabold text-xs text-brand-secondary shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-brand-text truncate leading-tight group-hover:text-brand-primary transition-colors">
                      {item.drinkName}
                    </p>
                    <p className="text-[10px] text-brand-text-muted font-bold truncate">
                      {item.shopName} · {item.districtName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickLog(item)}
                    className="text-brand-secondary hover:text-brand-primary p-1.5 rounded-full hover:bg-brand-surface-low transition-colors cursor-pointer shrink-0"
                    title="一键打卡"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* --- 2. SEASON TAB CONTENT --- */}
      {activeTab === "season" && (
        <motion.div
          key="season-tab"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="text-brand-secondary font-sans text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 岁时轮转 • 节令特调
            </span>
            <h2 className="text-3xl font-display font-extrabold text-brand-text">
              时令季节推荐
            </h2>
            <p className="text-xs text-brand-text-muted max-w-md mx-auto">
              春茶、夏冰、秋温、冬护。随气候变化，饮最适宜的茶，感受自然的流转。
            </p>
          </div>

          {/* Season Button Group Selector */}
          <div className="flex justify-center gap-2 max-w-sm mx-auto">
            {(["Spring", "Summer", "Autumn", "Winter"] as const).map((season) => {
              const labelMap = { Spring: "🌸 迎春", Summer: "☀️ 盛夏", Autumn: "🍁 金秋", Winter: "❄️ 暖冬" };
              const currentMonth = new Date().getMonth();
              const isCurrentSeason = 
                (season === "Spring" && currentMonth >= 2 && currentMonth <= 4) ||
                (season === "Summer" && currentMonth >= 5 && currentMonth <= 7) ||
                (season === "Autumn" && currentMonth >= 8 && currentMonth <= 10) ||
                (season === "Winter" && (currentMonth === 11 || currentMonth <= 1));

              return (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    selectedSeason === season
                      ? "bg-brand-secondary text-white shadow-md"
                      : "bg-white text-brand-text-muted border border-brand-surface hover:bg-brand-surface-low"
                  }`}
                >
                  {labelMap[season]}
                  {isCurrentSeason && (
                    <span className="absolute -top-1.5 -right-1 bg-brand-primary text-white text-[8px] px-1 rounded-md font-extrabold scale-90 border border-white animate-pulse">
                      当季
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Season Prompt Banner */}
          <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 max-w-lg mx-auto">
            {selectedSeason === "Summer" && <Sun className="w-5 h-5 text-amber-500 shrink-0" />}
            {selectedSeason === "Spring" && <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />}
            {selectedSeason === "Autumn" && <Leaf className="w-5 h-5 text-orange-500 shrink-0" />}
            {selectedSeason === "Winter" && <Snowflake className="w-5 h-5 text-sky-500 shrink-0" />}
            <div className="text-xs">
              <span className="font-bold text-brand-text block">
                {selectedSeason === "Summer" && "💡 酷暑当前，消夏冰爽茶饮大赏："}
                {selectedSeason === "Spring" && "🌸 万物新生，春季清心嫩芽："}
                {selectedSeason === "Autumn" && "🍁 金风渐爽，秋季温润酒酿："}
                {selectedSeason === "Winter" && "❄️ 瑞雪兆丰，冬季御寒暖身红茶："}
              </span>
              <p className="text-brand-text-muted mt-0.5">
                精选极富滋味和契合当季微气候的推荐组合，滋润身心。
              </p>
            </div>
          </div>

          {/* Season Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {SEASON_RECOMMENDATIONS[selectedSeason].map((item) => (
              <div 
                key={item.drinkName}
                className="bg-white border border-brand-surface rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 group"
              >
                <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-brand-surface relative shadow-inner">
                  <img src={item.imageUrl} alt={item.drinkName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                    {item.seasonBadge}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-brand-text leading-snug group-hover:text-brand-primary transition-colors">
                      {item.drinkName}
                    </h3>
                    <p className="text-[11px] text-brand-text-muted font-bold">
                      🏢 {item.shopName}
                    </p>
                    <p className="text-[11px] text-brand-text-muted line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleQuickLog(item)}
                      className="bg-brand-surface hover:bg-brand-primary hover:text-white text-brand-secondary border border-brand-surface px-3 py-1.5 rounded-full font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" /> 一键打卡
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* --- 3. PREFERENCE TAB CONTENT --- */}
      {activeTab === "preference" && (
        <motion.div
          key="preference-tab"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="text-brand-secondary font-sans text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5" /> 品味基因 • 专属画像
            </span>
            <h2 className="text-3xl font-display font-extrabold text-brand-text">
              个人偏好推荐
            </h2>
            <p className="text-xs text-brand-text-muted max-w-md mx-auto">
              基于您在 “足迹地图” 中累计的真实打卡纪录，全方位解析您的品饮习惯与喜好。
            </p>
          </div>

          {!hasSips ? (
            /* Empty State / onboarding */
            <div className="max-w-md mx-auto bg-white border border-brand-surface rounded-3xl p-8 text-center shadow-md space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center mx-auto text-brand-primary">
                <Heart className="w-8 h-8 animate-pulse text-brand-secondary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-brand-text">暂无个人足迹数据</h3>
                <p className="text-xs text-brand-text-muted">
                  您还没有在 SipNotes 记录任何饮品呢！在主页“打卡新饮品”，即可自动解锁本板块的专属风味基因和偏好精准算法。
                </p>
              </div>

              {/* Onboarding flight recommendations */}
              <div className="bg-brand-surface-low/50 p-4 rounded-2xl text-left border border-brand-surface/40">
                <span className="text-[10px] font-extrabold text-brand-secondary uppercase block mb-3">
                  🎁 新手尝鲜推荐首发打卡（一键记录）：
                </span>
                <div className="space-y-3">
                  {[
                    { drinkName: "生椰拿铁", shopName: "Manner 咖啡", category: DrinkCategory.Coffee, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZklPHlylUA1GeuGhm7n-ZehJ_tmtcSyUvVb4jg-dp9RKnEwUQYS2CMVrj98e-NRAy4gP6Kr9p1PL6Odm7mHFa9BoAdaSH2msUrDCEPEEoc6m-ydO6Y8TL0nv4b3uuVtE59VVZJew6Lq2_r60pt8hBT1pUmpcmvsbRLaK0cyMLL34mB22SiIq1C-TjqRXOdnCQ40Jf_wTPjMekBSJGOGmFAjf5J2MQN3O8pDhWXiQV_Pt1qYl-1eCccdiUqFjIChOBxDSstcMfj4-n" },
                    { drinkName: "西尾浓抹茶拿铁", shopName: "芋泥咖啡屋", category: DrinkCategory.Matcha, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFG-DAPah6FLNQSUJK0eTFOBbl4mImA2Yc89sGhE951fU6LIF_b_ZPsxBuFRF-OTMZmF_LZh_sQynT5Dtlm3nSdXKmwOAYq_05LK8mHg0qrgXISS3NcK4DoUHGIsjiA_E_Bh7lDqIfs9yQTQ5l2U_AM1ocj_p-5LGIXwZLWrr8ooPEYpbGwNZ3Y4zjtsU2xWpuKLRkOGbbQMjCIexpZGAB9pfdlrgcohgQKBq9OnTx3clfpZcBIaUvUgzNUdwMFriKQUOySiPo4Dqg" }
                  ].map((classic) => (
                    <div key={classic.drinkName} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-brand-surface shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <img src={classic.imageUrl} alt={classic.drinkName} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-brand-text truncate leading-tight">{classic.drinkName}</p>
                          <p className="text-[10px] text-brand-text-muted truncate">{classic.shopName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickLog(classic)}
                        className="bg-brand-primary text-white p-1.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active report based on sips counts */
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Character Badge Panel */}
                <div className="md:col-span-2 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-3xl p-6 text-center flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="space-y-4">
                    <span className="text-[10px] font-extrabold text-brand-secondary uppercase tracking-widest block">
                      🧬 您的专属饮品基因
                    </span>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-md border-4 border-white">
                      {(favoriteCategory as string) === DrinkCategory.Coffee && <Coffee className="w-10 h-10 text-brand-secondary" />}
                      {(favoriteCategory as string) === DrinkCategory.Matcha && <span className="text-3xl">🍵</span>}
                      {(favoriteCategory as string) === DrinkCategory.Tea && <span className="text-3xl">🎋</span>}
                      {(favoriteCategory as string) === DrinkCategory.FruitTea && <span className="text-3xl">🍓</span>}
                      {(favoriteCategory as string) === DrinkCategory.MilkTea && <span className="text-3xl">🥛</span>}
                      {(favoriteCategory as string) === DrinkCategory.PourOver && <span className="text-3xl">🫖</span>}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-display font-extrabold text-brand-text leading-tight">
                        {getPersonalBadgeInfo(favoriteCategory).badge}
                      </h3>
                      <p className="text-xs text-brand-text-muted leading-relaxed font-sans font-medium px-2">
                        {getPersonalBadgeInfo(favoriteCategory).desc}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border border-brand-surface rounded-2xl p-3.5 text-left mt-6 shadow-sm">
                    <span className="text-[10px] font-extrabold text-brand-text-muted uppercase block">
                      📊 累计足迹统计：
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-center bg-brand-surface-low rounded-xl p-2 border border-brand-surface/40">
                        <span className="text-lg font-display font-black text-brand-secondary">{sips.length}</span>
                        <p className="text-[8px] text-brand-text-muted font-bold uppercase mt-0.5">总打卡次数</p>
                      </div>
                      <div className="text-center bg-brand-surface-low rounded-xl p-2 border border-brand-surface/40">
                        <span className="text-lg font-display font-black text-brand-primary">
                          {Array.from(new Set(sips.map(s => s.cityName))).length}
                        </span>
                        <p className="text-[8px] text-brand-text-muted font-bold uppercase mt-0.5">打卡城市</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bars / Category proportions list */}
                <div className="md:col-span-3 bg-white border border-brand-surface rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-brand-text-muted uppercase tracking-widest block">
                        📈 足迹品类分布比重 (Sip Breakdown)
                      </span>
                      <p className="text-xs text-brand-text-muted">
                        这代表了您在所有打卡中，不同类型饮料的倾斜比例：
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {Object.values(DrinkCategory).map((cat) => {
                        const count = categoryCounts[cat] || 0;
                        const percentage = sips.length > 0 ? Math.round((count / sips.length) * 100) : 0;
                        
                        // Select customized progress bar color matching categories
                        let progressColor = "bg-brand-primary";
                        if (cat === DrinkCategory.Matcha) progressColor = "bg-emerald-600";
                        if (cat === DrinkCategory.Tea) progressColor = "bg-teal-700";
                        if (cat === DrinkCategory.FruitTea) progressColor = "bg-amber-500";
                        if (cat === DrinkCategory.MilkTea) progressColor = "bg-brand-secondary";

                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold text-brand-text">
                              <span className="flex items-center gap-1">
                                {cat === DrinkCategory.Coffee && "☕️ "}
                                {cat === DrinkCategory.Matcha && "🍵 "}
                                {cat === DrinkCategory.Tea && "🎋 "}
                                {cat === DrinkCategory.FruitTea && "🍓 "}
                                {cat === DrinkCategory.MilkTea && "🥛 "}
                                {cat === DrinkCategory.PourOver && "🫖 "}
                                {cat}
                              </span>
                              <span className="text-brand-text-muted font-display">{count} 次 ({percentage}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-brand-surface-low rounded-full overflow-hidden border border-brand-surface/40">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full ${progressColor} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Craft Recommendations List */}
              <div className="pt-4 space-y-4">
                <h4 className="text-sm font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-secondary" /> 基于您的基因，精准匹配以下高级饮品：
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PERSONAL_RECOMMENDATIONS[favoriteCategory]?.map((item) => (
                    <div 
                      key={item.drinkName}
                      className="bg-white border border-brand-surface rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 group"
                    >
                      <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-brand-surface relative shadow-inner">
                        <img src={item.imageUrl} alt={item.drinkName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 right-2 bg-brand-primary text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                          {item.badge}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <h5 className="text-sm font-extrabold text-brand-text leading-snug group-hover:text-brand-primary transition-colors">
                            {item.drinkName}
                          </h5>
                          <p className="text-[10px] text-brand-secondary font-bold">
                            🏢 {item.shopName}
                          </p>
                          <p className="text-[11px] text-brand-text-muted line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleQuickLog({ ...item, category: favoriteCategory })}
                            className="bg-brand-surface hover:bg-brand-primary hover:text-white text-brand-secondary border border-brand-surface px-3 py-1.5 rounded-full font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" /> 一键打卡
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* View Full Rankings Block */}
      <div className="mt-16 text-center">
        <button
          onClick={() => {
            const currentTabStr = 
              activeTab === "city" ? "地域特色饮品" : 
              activeTab === "season" ? "岁令时节饮品" : "个人偏好推荐";
            alert(`正在通过 SipNotes 精准推荐引擎探索“${currentTabStr}”维度！打卡记录越多，计算出的味觉模型越精准。`);
          }}
          className="border-2 border-brand-secondary hover:bg-brand-secondary/5 text-brand-secondary px-8 py-3 rounded-full font-sans text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-2"
        >
          查看完整动态推荐池
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
