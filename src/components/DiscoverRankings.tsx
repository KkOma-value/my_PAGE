/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Map, ChevronDown, Filter, Flame, TrendingUp, Sparkles, Check, BookmarkPlus } from "lucide-react";
import { CityRankingItem, DrinkCategory } from "../types";
import { CITY_RANKINGS, CITIES } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface DiscoverRankingsProps {
  onQuickCheckIn: (item: { drinkName: string; shopName: string; cityName: string; districtName?: string; category: DrinkCategory; imageUrl: string }) => void;
}

export default function DiscoverRankings({ onQuickCheckIn }: DiscoverRankingsProps) {
  const [selectedCity, setSelectedCity] = useState<string>("Shanghai");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const citiesWithRankings = Object.keys(CITY_RANKINGS);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
  };

  // Filter rankings list by active category filter
  const originalRankings = CITY_RANKINGS[selectedCity] || [];
  const filteredRankings = activeCategoryFilter === "全部" || activeCategoryFilter === "All"
    ? originalRankings
    : originalRankings.filter(item => item.category === activeCategoryFilter);

  // Quick log helper
  const handleQuickLog = (item: CityRankingItem) => {
    onQuickCheckIn({
      drinkName: item.drinkName,
      shopName: item.shopName,
      cityName: item.cityName,
      districtName: item.districtName,
      category: item.category,
      imageUrl: item.imageUrl
    });

    setToastMessage(`已将“${item.drinkName}”添加到您的个人足迹中！请到“足迹地图”中查看。`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
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

      {/* 1. Header & Location Filter Controls */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <p className="text-brand-secondary font-sans text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <Map className="w-3.5 h-3.5 text-brand-secondary" />
            热门推荐榜
          </p>

          <div className="flex items-center gap-2 mt-1 relative">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight leading-none">
              {CITIES.find(c => c.name === selectedCity)?.displayName || selectedCity}
            </h2>
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="bg-brand-surface hover:bg-brand-surface/85 transition-colors p-2 rounded-full flex items-center justify-center text-brand-primary cursor-pointer active:scale-95"
            >
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isCityDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Premium Custom City Selector Dropdown */}
            <AnimatePresence>
              {isCityDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsCityDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-14 left-0 bg-white border border-brand-surface rounded-2xl shadow-xl p-2 min-w-[200px] z-40"
                  >
                    <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider px-3 py-1.5 block">
                      选择城市
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
          <p className="text-brand-text-muted font-sans text-sm font-medium mt-2">
            探索今日打卡最多、最受欢迎的宝藏饮品。
          </p>
        </div>

        {/* Filter Trigger Button */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className={`px-5 py-3 rounded-full font-sans text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              showFilterOptions || activeCategoryFilter !== "All"
                ? "bg-brand-primary text-white"
                : "bg-white text-brand-text-muted border border-brand-surface"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>筛选</span>
            {activeCategoryFilter !== "All" && (
              <span className="bg-white text-brand-primary w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ml-1">
                1
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Category Inline Filters Row */}
      <AnimatePresence>
        {(showFilterOptions || activeCategoryFilter !== "All") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-brand-surface-low border border-brand-surface p-4 rounded-2xl"
          >
            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block mb-2">
              按品类筛选
            </span>
            <div className="flex flex-wrap gap-2">
              {["全部", ...Object.values(DrinkCategory)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const internalVal = cat === "全部" ? "All" : cat;
                    setActiveCategoryFilter(internalVal);
                    if (cat === "全部") setShowFilterOptions(false);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                    activeCategoryFilter === (cat === "全部" ? "All" : cat)
                      ? "bg-brand-primary text-white"
                      : "bg-white text-brand-text-muted border border-brand-surface hover:bg-brand-surface"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Rankings Cards List */}
      {filteredRankings.length === 0 ? (
        <div className="bg-white border border-brand-surface rounded-2xl p-12 text-center shadow-sm">
          <Sparkles className="w-8 h-8 text-brand-outline mx-auto mb-2 animate-pulse" />
          <h3 className="text-sm font-bold text-brand-text mb-1">未找到符合该品类的饮品</h3>
          <p className="text-xs text-brand-text-muted">请尝试选择其他筛选条件或切换到别的城市。</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRankings.map((item, idx) => {
            // Apply staggered styles like mockup (Rank 1 standard, Rank 2 offset-top, Rank 3 more offset-top)
            let offsetClass = "";
            if (idx === 1) offsetClass = "sm:mt-4 md:mt-8";
            if (idx === 2) offsetClass = "sm:mt-8 md:mt-16";

            // Rank visual assets
            let rankColorClass = "bg-brand-surface-low text-brand-text-muted";
            if (item.rank === 1) rankColorClass = "bg-brand-secondary text-white";
            if (item.rank === 2) rankColorClass = "bg-brand-primary text-white";
            if (item.rank === 3) rankColorClass = "bg-brand-tertiary text-white";

            return (
              <motion.article
                layout
                key={item.drinkName}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-2xl p-4 pb-6 border border-brand-surface shadow-[0_4px_12px_rgba(121,87,63,0.06)] group hover:-translate-y-1.5 transition-all duration-300 relative ${offsetClass}`}
              >
                {/* Ranking Badge Circle */}
                <div className={`absolute -top-3.5 -left-3.5 w-11 h-11 rounded-full flex items-center justify-center font-display font-extrabold text-base shadow-md border-4 border-brand-bg z-10 ${rankColorClass}`}>
                  {item.rank}
                </div>

                {/* Drink Image Aspect [4/5] */}
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-brand-surface mb-4 relative group shadow-inner">
                  <img
                    src={item.imageUrl}
                    alt={item.drinkName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 flex gap-1">
                    <span className="bg-white/95 backdrop-blur-sm text-brand-text-muted px-2.5 py-1 rounded-full font-sans text-[10px] font-bold shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  {/* Bookmark quick addition overlay */}
                  <div className="absolute inset-0 bg-brand-text/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleQuickLog(item)}
                      className="bg-white text-brand-primary p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer font-sans text-xs font-bold"
                    >
                      <BookmarkPlus className="w-4 h-4 text-brand-secondary" /> 一键打卡
                    </button>
                  </div>
                </div>

                {/* Details text */}
                <div className="space-y-1">
                  <h3 className="text-base font-display font-extrabold text-brand-text truncate leading-tight group-hover:text-brand-primary transition-colors">
                    {item.drinkName}
                  </h3>
                  <p className="text-xs text-brand-text-muted font-sans font-semibold">
                    {item.shopName} • {item.districtName}
                  </p>

                  <div className="flex items-center gap-4 text-brand-secondary font-sans text-[11px] font-bold pt-2 border-t border-brand-surface/40 mt-3">
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 text-brand-secondary fill-brand-secondary/10" />
                      今日打卡 {item.sipsToday} 次
                    </span>
                    {item.isTrending && (
                      <span className="flex items-center gap-0.5 text-emerald-700">
                        <TrendingUp className="w-3.5 h-3.5" />
                        人气飙升
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {/* 3. View Full Rankings Block */}
      <div className="mt-16 text-center">
        <button
          onClick={() => {
            const cityObj = CITIES.find(c => c.name === selectedCity);
            const cityNameStr = cityObj ? cityObj.displayName : selectedCity;
            alert(`正在查看 ${cityNameStr} 最受欢迎的精选饮品榜！我们每天根据社区打卡数据动态刷新。`);
          }}
          className="border-2 border-brand-secondary hover:bg-brand-secondary/5 text-brand-secondary px-8 py-3 rounded-full font-sans text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-2"
        >
          查看完整榜单
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
