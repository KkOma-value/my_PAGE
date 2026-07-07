/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, ArrowRight, Star, Heart, Calendar, Coffee, Sparkles, Trash2 } from "lucide-react";
import { SipRecord, CityInfo, DrinkCategory } from "../types";
import { CITIES, CHINA_MAP_IMAGE, INITIAL_SIPS } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface FootprintMapProps {
  sips: SipRecord[];
  onDeleteSip: (id: string) => void;
  onCheckInClick: () => void;
}

export default function FootprintMap({ sips, onDeleteSip, onCheckInClick }: FootprintMapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeDetailSip, setActiveDetailSip] = useState<SipRecord | null>(null);
  const [favorites, setFavorites] = useState<string[]>(["sip-1", "sip-3"]);

  // Calculate dynamic statistics based on mockup base values
  // Mockup has 12 cities visited and 156 total drinks
  const baseCities = new Set(INITIAL_SIPS.map(s => s.cityName));
  const currentCities = new Set(sips.map(s => s.cityName));
  const newCitiesCount = Array.from(currentCities).filter(c => !baseCities.has(c)).length;
  
  const citiesCount = 12 + newCitiesCount;
  const totalDrinksCount = 156 + (sips.length - INITIAL_SIPS.length);

  // Filter sips by selected city
  const filteredSips = selectedCity
    ? sips.filter((s) => s.cityName === selectedCity)
    : sips;

  // Find latest logged drink
  const latestSip = sips[0] || null;

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        // e.g. 2026-07-06
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[parseInt(parts[1]) - 1];
        const day = parts[2];
        return `${month} ${day}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Dynamic Statistics Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-sans text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 饮品足迹
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-brand-primary tracking-tight leading-none mb-2">
            我的足迹地图
          </h1>
          <p className="text-base text-brand-text-muted font-sans font-medium">
            寻迹神州饮品，用味蕾记录每一杯美好。
          </p>
        </div>

        {/* Bento Statistics Cards */}
        <div className="flex gap-4">
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-4 px-6 border border-brand-surface shadow-[0_4px_12px_rgba(121,87,63,0.06)] flex flex-col items-center min-w-[120px]"
          >
            <span className="text-3xl font-display font-extrabold text-brand-primary">
              {citiesCount}
            </span>
            <span className="text-[10px] font-sans font-bold text-brand-text-muted uppercase tracking-wider mt-1">
              打卡城市
            </span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-4 px-6 border border-brand-surface shadow-[0_4px_12px_rgba(121,87,63,0.06)] flex flex-col items-center min-w-[120px]"
          >
            <span className="text-3xl font-display font-extrabold text-brand-secondary">
              {totalDrinksCount}
            </span>
            <span className="text-[10px] font-sans font-bold text-brand-text-muted uppercase tracking-wider mt-1">
              打卡杯数
            </span>
          </motion.div>
        </div>
      </div>

      {/* 2. Interactive Map of China */}
      <div className="map-container w-full h-[380px] md:h-[480px] bg-[#eef1ed] rounded-3xl relative overflow-hidden border border-brand-surface">
        {/* Simulated China Map Image */}
        <img
          src={CHINA_MAP_IMAGE}
          alt="Map of China"
          className="w-full h-full object-cover opacity-85 select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Overlay Map Details (Top Left Panel) */}
        <div className="map-overlay absolute top-4 left-4 p-4 pr-6 hidden sm:flex flex-col gap-1 z-20">
          <span className="text-[10px] font-sans font-bold text-brand-text-muted uppercase tracking-wider">
            {selectedCity ? `当前城市：${CITIES.find(c => c.name === selectedCity)?.displayName || selectedCity}` : "最新打卡"}
          </span>
          {selectedCity ? (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
              <MapPin className="w-4 h-4" />
              <span>{CITIES.find(c => c.name === selectedCity)?.displayName || selectedCity} • {filteredSips.length} 次饮记</span>
              <button 
                onClick={() => setSelectedCity(null)}
                className="ml-2 text-xs text-brand-secondary hover:underline"
              >
                清除
              </button>
            </div>
          ) : latestSip ? (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-text">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
              <span>{CITIES.find(c => c.name === latestSip.cityName)?.displayName || latestSip.cityName} • {latestSip.drinkName}</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-brand-text-muted">暂无打卡记录</span>
          )}
        </div>

        {/* Render Map Pin Markers */}
        {CITIES.map((city) => {
          // Check if this city has logs in current sips
          const citySips = sips.filter((s) => s.cityName === city.name);
          const hasLogs = citySips.length > 0;
          if (!hasLogs) return null;

          const isSelected = selectedCity === city.name;
          const isCoffeeTop = citySips[0]?.category === DrinkCategory.Coffee || citySips[0]?.category === DrinkCategory.PourOver;
          const isTeaTop = citySips[0]?.category === DrinkCategory.Tea || citySips[0]?.category === DrinkCategory.FruitTea;

          let pinColorClass = "map-pin-coffee"; // default roast brown
          if (citySips[0]?.category === DrinkCategory.Matcha) {
            pinColorClass = ""; // default brand-primary matcha green
          } else if (isTeaTop) {
            pinColorClass = "map-pin-tea"; // oolong mustard yellow
          }

          return (
            <button
              key={city.name}
              onClick={() => setSelectedCity(isSelected ? null : city.name)}
              className={`map-pin ${pinColorClass} ${isSelected ? "map-pin-active scale-110" : ""}`}
              style={{ top: `${city.y}%`, left: `${city.x}%` }}
              title={`${city.name}: ${citySips.length} drinks`}
            />
          );
        })}

        {/* Map Floating Clear Selector Helper */}
        {selectedCity && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => setSelectedCity(null)}
              className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-brand-primary/95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              仅显示：{CITIES.find(c => c.name === selectedCity)?.displayName || selectedCity} <MapPin className="w-3 h-3" /> (点击重置)
            </button>
          </div>
        )}
      </div>

      {/* 3. Recent Memories Gallery Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display font-extrabold text-brand-text tracking-tight">
              近期美好记忆
            </h2>
            {selectedCity && (
              <span className="bg-brand-primary/10 text-brand-primary text-xs px-2.5 py-0.5 rounded-full font-bold">
                {CITIES.find(c => c.name === selectedCity)?.displayName || selectedCity}
              </span>
            )}
          </div>
          <button 
            onClick={onCheckInClick}
            className="text-brand-primary hover:text-brand-primary-container text-xs font-bold flex items-center gap-1 transition-all group"
          >
            打卡下一杯 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {filteredSips.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-brand-surface rounded-2xl p-12 text-center">
            <Coffee className="w-10 h-10 text-brand-outline mx-auto mb-3" />
            <h3 className="text-sm font-bold text-brand-text mb-1">该城市暂无记录</h3>
            <p className="text-xs text-brand-text-muted mb-4">快点击打卡，开始记录你的第一杯美好吧！</p>
            <button 
              onClick={onCheckInClick}
              className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:bg-brand-primary/90 transition-all"
            >
              去打卡
            </button>
          </div>
        ) : (
          /* Bento Polaroid Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredSips.map((sip, idx) => (
              <motion.div
                layout
                key={sip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveDetailSip(sip)}
                // Offset matching mockup's organic feel on second and fourth items in desktop rows
                className={`polaroid cursor-pointer ${
                  idx % 2 === 1 ? "md:mt-4" : ""
                }`}
              >
                {/* Polaroid Image Box */}
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-brand-surface-low relative group">
                  <img
                    src={sip.imageUrl}
                    alt={sip.drinkName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="bg-white/90 backdrop-blur-sm text-brand-text-muted text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase shadow-sm">
                      {sip.category}
                    </span>
                  </div>
                </div>

                {/* Polaroid Text Wrapper */}
                <div className="px-1 flex flex-col gap-1">
                  <span className="text-sm font-display font-extrabold text-brand-text truncate leading-tight">
                    {sip.drinkName}
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-medium text-brand-text-muted flex items-center gap-0.5 truncate max-w-[65%]">
                      <MapPin className="w-3 h-3 text-brand-outline shrink-0" />
                      <span className="truncate">
                        {CITIES.find(c => c.name === sip.cityName)?.displayName || sip.cityName}
                        {sip.districtName ? ` · ${sip.districtName}` : ""}
                      </span>
                    </span>
                    <span className="text-[10px] font-sans font-medium text-brand-outline shrink-0">
                      {formatDate(sip.date)}
                    </span>
                  </div>

                  {/* Flavor Pills */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {sip.flavorTags.slice(0, 2).map((tag) => {
                      let tagColor = "bg-brand-primary-container/20 text-brand-primary";
                      if (tag === "果香" || tag === "清甜") {
                        tagColor = "bg-brand-secondary-container/30 text-brand-secondary";
                      } else if (tag === "花香") {
                        tagColor = "bg-brand-tertiary-container/30 text-brand-tertiary";
                      }
                      return (
                        <span key={tag} className={`${tagColor} text-[9px] px-2 py-0.5 rounded-full font-semibold`}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Polaroid Details Pop-up Modal */}
      <AnimatePresence>
        {activeDetailSip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetailSip(null)}
              className="fixed inset-0 bg-brand-text/50 backdrop-blur-sm"
            />

            {/* Custom Polaroid Card Detail pop up */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-brand-surface overflow-hidden z-10 flex flex-col relative"
            >
              {/* Image Box */}
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-brand-surface relative mb-4 shadow-inner">
                <img
                  src={activeDetailSip.imageUrl}
                  alt={activeDetailSip.drinkName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => toggleFavorite(activeDetailSip.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md text-brand-secondary hover:scale-115 transition-all cursor-pointer"
                >
                  <Heart
                    className={`w-4.5 h-4.5 ${
                      favorites.includes(activeDetailSip.id) ? "fill-brand-secondary stroke-brand-secondary" : "stroke-brand-secondary"
                    }`}
                  />
                </button>
              </div>

              {/* Title & Shop Details */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xl font-display font-extrabold text-brand-text">
                    {activeDetailSip.drinkName}
                  </h3>
                  <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {activeDetailSip.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-brand-text-muted font-sans font-semibold">
                  <span className="flex items-center gap-1 text-brand-primary">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeDetailSip.shopName} ({CITIES.find(c => c.name === activeDetailSip.cityName)?.displayName || activeDetailSip.cityName}
                    {activeDetailSip.districtName ? ` · ${activeDetailSip.districtName}` : ""})
                  </span>
                  <span className="flex items-center gap-1 text-brand-outline">
                    <Calendar className="w-3.5 h-3.5" />
                    {activeDetailSip.date}
                  </span>
                </div>
              </div>

              {/* Star rating display */}
              <div className="flex items-center gap-1.5 mb-3.5">
                <span className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">品味评价：</span>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4.5 h-4.5 ${
                        i < activeDetailSip.rating ? "fill-yellow-400 stroke-yellow-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Flavor tags row */}
              {activeDetailSip.flavorTags.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-sans font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">
                    风味特征印象：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDetailSip.flavorTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-brand-surface-low text-brand-text-muted border border-brand-surface text-xs px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasting notes comment description */}
              {activeDetailSip.comment && (
                <div className="bg-brand-bg rounded-2xl p-3.5 mb-4 border border-brand-surface/40">
                  <span className="text-[10px] font-sans font-bold text-brand-text-muted uppercase tracking-wider block mb-1">
                    品饮体验心得：
                  </span>
                  <p className="text-xs text-brand-text-muted leading-relaxed font-sans font-medium italic">
                    "{activeDetailSip.comment}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveDetailSip(null)}
                  className="flex-1 py-2.5 bg-brand-surface hover:bg-brand-surface-low border border-brand-surface/30 text-brand-text-muted font-sans text-xs font-bold rounded-full transition-colors cursor-pointer text-center"
                >
                  合上照片
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("您确定要删除这杯饮品的打卡记录吗？")) {
                      onDeleteSip(activeDetailSip.id);
                      setActiveDetailSip(null);
                    }
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-sans text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="删除记录"
                >
                  <Trash2 className="w-4 h-4" /> 删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
