/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Sparkles, Award, Heart, ShieldCheck, Coffee, Flame, Settings, Edit3, Share2, ArrowRight, UserCheck, Bookmark, Eye } from "lucide-react";
import { SipRecord, UserProfile, Badge, DrinkCategory } from "../types";
import { INITIAL_PROFILE, CITIES } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface UserProfileViewProps {
  sips: SipRecord[];
}

export default function UserProfileView({ sips }: UserProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);

  // Expanded options sections state
  const [activeSection, setActiveSection] = useState<"none" | "collection" | "preferences" | "community">("none");

  // Dynamic statistics calculations
  const totalSipsCount = 142 + (sips.length - 4); // matching mockup base of 142
  
  // Calculate top category from user logs
  const getTopCategory = () => {
    if (sips.length === 0) return "None";
    const counts: Record<string, number> = {};
    sips.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    let topCat = "Coffee";
    let maxCount = 0;
    Object.entries(counts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCat = cat;
      }
    });
    return topCat;
  };

  const topCategory = getTopCategory();
  const dayStreak = 15 + Math.floor((sips.length - 4) / 2); // incremental mock streak matching mockup

  // Calculate favorite flavor notes frequency
  const getFlavorNoteFrequency = () => {
    const counts: Record<string, number> = {};
    sips.forEach(s => {
      s.flavorTags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const flavorFrequencies = getFlavorNoteFrequency();

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...profile,
      name: editName,
      bio: editBio
    });
    setIsEditing(false);
  };

  // Mock friends data
  const friends = [
    { name: "Moka Max", handle: "@moka_max", sip: "Matcha Cortado", city: "Shanghai", time: "1h ago" },
    { name: "Coco Chen", handle: "@cocotea", sip: "Tieguanyin Macchiato", city: "Guangzhou", time: "3h ago" },
    { name: "Coffee Ryan", handle: "@ryan_brews", sip: "Geisha Pour Over", city: "Beijing", time: "1d ago" }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header / Bio Section with Profile Editor */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-brand-surface shadow-[0_4px_12px_rgba(121,87,63,0.04)] relative">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left"
            >
              {/* Profile Avatar Frame */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-brand-bg shadow-md bg-brand-surface shrink-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-extrabold text-brand-text tracking-tight flex items-center justify-center sm:justify-start gap-2">
                    {profile.name}
                    <ShieldCheck className="w-5 h-5 text-brand-primary fill-brand-primary/10" />
                  </h2>
                  <p className="text-xs font-sans font-bold text-brand-outline">{profile.handle}</p>
                </div>

                <p className="text-sm font-sans font-medium text-brand-text-muted italic max-w-md">
                  "{profile.bio}"
                </p>

                {/* Badges Tags Row */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-sans text-xs font-bold border border-brand-primary-container/20">
                    <Sparkles className="w-3 h-3 mr-1" /> 创世体验官
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary font-sans text-xs font-bold border border-brand-secondary-container/20">
                    <Coffee className="w-3 h-3 mr-1" /> 咖啡发烧友
                  </span>
                </div>
              </div>

              {/* Actions Header Buttons */}
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none bg-brand-primary hover:bg-brand-primary/95 text-white font-sans text-xs font-bold px-5 py-2.5 rounded-full shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> 编辑资料
                </button>
                <button
                  onClick={() => {
                    alert("足迹数据卡片已复制到剪贴板！快和别的小伙伴分享吧！");
                  }}
                  className="flex-1 sm:flex-none border border-brand-outline text-brand-text-muted hover:bg-brand-surface-low font-sans text-xs font-bold px-5 py-2.5 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> 分享名片
                </button>
              </div>
            </motion.div>
          ) : (
            /* Editing State Form */
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSaveProfile}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">编辑个人资料卡</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">显示昵称</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg rounded-xl border border-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-sans text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted uppercase mb-1">个性签名 / 简介</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg rounded-xl border border-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-primary font-sans text-sm font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-text-muted hover:underline cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary text-white px-5 py-2 rounded-full text-xs font-bold shadow-md hover:bg-brand-primary/95 cursor-pointer"
                >
                  保存资料
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>

      {/* 2. Stats Rows Bento Grid */}
      <section className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-brand-surface shadow-[0_4px_12px_rgba(104,94,49,0.06)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-brand-primary/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <span className="font-display font-extrabold text-3xl md:text-4xl text-brand-primary">{totalSipsCount}</span>
          <span className="font-sans text-[10px] md:text-xs font-bold text-brand-text-muted mt-1 uppercase tracking-wider">累计饮品</span>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-brand-surface shadow-[0_4px_12px_rgba(104,94,49,0.06)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-brand-secondary/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <Coffee className="w-6 h-6 text-brand-secondary mb-1" />
          <span className="font-display font-extrabold text-sm md:text-base text-brand-text leading-none">{topCategory}</span>
          <span className="font-sans text-[9px] md:text-[10px] font-bold text-brand-text-muted mt-1 uppercase tracking-wider">最爱品类</span>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-brand-surface shadow-[0_4px_12px_rgba(104,94,49,0.06)] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary/5 to-transparent" />
          <span className="font-display font-extrabold text-3xl md:text-4xl text-brand-tertiary flex items-center justify-center gap-0.5">
            {dayStreak}
            <Flame className="w-5 h-5 text-brand-tertiary fill-brand-tertiary/10" />
          </span>
          <span className="font-sans text-[10px] md:text-xs font-bold text-brand-text-muted mt-1 uppercase tracking-wider">连续打卡</span>
        </div>
      </section>

      {/* 3. Achievements / Badges Snap Horizontal Scroll */}
      <section className="space-y-3">
        <div className="flex justify-between items-end px-2">
          <h3 className="font-display font-extrabold text-lg text-brand-text tracking-tight">近期获得勋章</h3>
          <span className="font-sans text-xs font-bold text-brand-primary">左右滑动查看 ({profile.badges.length})</span>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 pt-1 px-1 hide-scrollbar snap-x">
          {profile.badges.map((badge, bIdx) => {
            // Apply fun tilt rotations similar to mockup Polaroid vibe
            const tilts = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2"];
            const tilt = tilts[bIdx % tilts.length];

            // Render specific background gradient based on color scheme
            let gradient = "from-brand-secondary-container to-brand-bg";
            if (badge.icon === "map") gradient = "from-emerald-100 to-teal-50/40";
            if (badge.icon === "verified") gradient = "from-brand-primary-container/20 to-brand-bg";

            return (
              <div
                key={badge.id}
                className={`snap-start shrink-0 w-44 bg-white p-2.5 pb-5 rounded-2xl shadow-[0_4px_12px_rgba(121,87,63,0.06)] border border-brand-surface flex flex-col items-center transform ${tilt} hover:rotate-0 hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Decorative Visual Circle */}
                <div className="w-full aspect-square rounded-xl bg-brand-surface-low flex items-center justify-center mb-3.5 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${gradient}`} />
                  <Award className="w-12 h-12 text-brand-secondary relative z-10 drop-shadow-sm animate-pulse" />
                </div>
                <span className="font-display font-extrabold text-xs text-brand-text text-center truncate w-full">
                  {badge.name}
                </span>
                <span className="font-sans text-[10px] text-brand-text-muted text-center mt-1 leading-snug">
                  {badge.description}
                </span>
              </div>
            );
          })}

          {/* Locked Empty Slot Badges Indicator */}
          <div className="snap-start shrink-0 w-44 bg-brand-surface-low/40 p-3 pb-5 rounded-2xl border-2 border-dashed border-brand-outline/30 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center mb-3 text-brand-outline">
              <Award className="w-6 h-6 stroke-brand-outline/40" />
            </div>
            <span className="font-display font-extrabold text-xs text-brand-outline">持续解锁中</span>
            <span className="font-sans text-[10px] text-brand-outline/60 mt-1 text-center">满 160 杯品饮解锁下一个里程碑</span>
          </div>
        </div>
      </section>

      {/* 4. Interactive Lists / Submenus */}
      <section className="bg-white rounded-3xl shadow-[0_4px_12px_rgba(104,94,49,0.03)] border border-brand-surface overflow-hidden">
        <ul className="flex flex-col">
          {/* List Item 1: Taste Preferences Chart & Analytics */}
          <li className="border-b border-brand-surface">
            <button
              onClick={() => setActiveSection(activeSection === "preferences" ? "none" : "preferences")}
              className="w-full flex items-center justify-between p-4 px-5 hover:bg-brand-surface-low transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-sans text-sm font-semibold text-brand-text">风味偏好洞察</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-brand-text-muted font-sans font-semibold">
                  {activeSection === "preferences" ? "收起" : "展开洞察"}
                </span>
                <ArrowRight className={`w-4 h-4 text-brand-outline group-hover:text-brand-primary transition-all ${activeSection === "preferences" ? "rotate-90 text-brand-primary" : ""}`} />
              </div>
            </button>

            {/* Expandable Preferences Block */}
            <AnimatePresence>
              {activeSection === "preferences" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-bg/50 px-5 pb-6 border-t border-brand-surface/40 pt-4 overflow-hidden space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Flavor Notes Frequency Progress Bars */}
                    <div>
                      <h4 className="text-xs font-bold text-brand-text uppercase mb-2">已记录的风味印象分布</h4>
                      {flavorFrequencies.length === 0 ? (
                        <p className="text-xs text-brand-text-muted font-sans font-medium">记录更多饮品以解锁风味洞察。</p>
                      ) : (
                        <div className="space-y-2">
                          {flavorFrequencies.slice(0, 4).map(([tag, count]) => {
                            const pct = Math.max(15, Math.min(100, (count / sips.length) * 100));
                            return (
                              <div key={tag} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-brand-text-muted">
                                  <span>{tag}</span>
                                  <span>{count} 次记录</span>
                                </div>
                                <div className="w-full h-1.5 bg-brand-surface rounded-full overflow-hidden">
                                  <div className="bg-brand-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Insight Paragraph */}
                    <div className="bg-white p-4 rounded-2xl border border-brand-surface">
                      <h4 className="text-xs font-bold text-brand-secondary uppercase mb-1">{profile.name} 的口味画像</h4>
                      <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
                        根据您近期在全国记录的 {sips.length} 次饮品体验，您对 <span className="font-bold text-brand-primary">咖啡</span> 和传统 <span className="font-bold text-brand-primary">茶饮</span> 展现出强烈的偏好，其中优质的风味标签组合成为了您最独特的舌尖印记。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {/* List Item 2: Saved Favorites / My Collection */}
          <li className="border-b border-brand-surface">
            <button
              onClick={() => setActiveSection(activeSection === "collection" ? "none" : "collection")}
              className="w-full flex items-center justify-between p-4 px-5 hover:bg-brand-surface-low transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                  <Bookmark className="w-4 h-4" />
                </div>
                <span className="font-sans text-sm font-semibold text-brand-text">我的珍藏</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRight className={`w-4 h-4 text-brand-outline group-hover:text-brand-secondary transition-all ${activeSection === "collection" ? "rotate-90 text-brand-secondary" : ""}`} />
              </div>
            </button>

            {/* Expandable Favorites/Bookmarks Block */}
            <AnimatePresence>
              {activeSection === "collection" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-bg/50 px-5 pb-6 border-t border-brand-surface/40 pt-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {sips.slice(0, 2).map((item) => (
                      <div key={item.id} className="bg-white p-2 rounded-xl border border-brand-surface flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <img src={item.imageUrl} alt={item.drinkName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-brand-text truncate">{item.drinkName}</p>
                          <p className="text-[10px] text-brand-text-muted truncate">
                            {item.shopName} ({CITIES.find(c => c.name === item.cityName)?.displayName || item.cityName}
                            {item.districtName ? ` · ${item.districtName}` : ""})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {/* List Item 3: Friends & Community */}
          <li>
            <button
              onClick={() => setActiveSection(activeSection === "community" ? "none" : "community")}
              className="w-full flex items-center justify-between p-4 px-5 hover:bg-brand-surface-low transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-tertiary/10 text-brand-tertiary flex items-center justify-center group-hover:bg-brand-tertiary group-hover:text-white transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="font-sans text-sm font-semibold text-brand-text">好友与社区</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRight className={`w-4 h-4 text-brand-outline group-hover:text-brand-tertiary transition-all ${activeSection === "community" ? "rotate-90 text-brand-tertiary" : ""}`} />
              </div>
            </button>

            {/* Expandable Friends Block */}
            <AnimatePresence>
              {activeSection === "community" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-brand-bg/50 px-5 pb-5 border-t border-brand-surface/40 pt-4 overflow-hidden space-y-3"
                >
                  {friends.map((friend) => (
                    <div key={friend.handle} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-brand-surface shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-brand-surface flex items-center justify-center text-xs font-bold text-brand-primary">
                          {friend.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-text">{friend.name}</p>
                          <p className="text-[10px] text-brand-text-muted leading-tight">
                            刚记录了：<span className="text-brand-secondary font-semibold">{friend.sip}</span> 位于 {friend.city}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-brand-outline bg-brand-surface-low px-2 py-0.5 rounded-full shrink-0">
                        {friend.time}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        </ul>
      </section>
    </div>
  );
}
