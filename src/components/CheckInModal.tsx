/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Star, Sparkles, MapPin, Coffee, Tag, Calendar, MessageSquare, Image as ImageIcon } from "lucide-react";
import { DrinkCategory, SipRecord } from "../types";
import { CITIES, PRESET_DRINK_IMAGES } from "../data";
import { motion, AnimatePresence } from "motion/react";



interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<SipRecord, "id">) => void;
}

export default function CheckInModal({ isOpen, onClose, onSave }: CheckInModalProps) {
  const [drinkName, setDrinkName] = useState("");
  const [shopName, setShopName] = useState("");
  const [cityName, setCityName] = useState("Shanghai");
  const [districtName, setDistrictName] = useState("");
  const [category, setCategory] = useState<DrinkCategory>(DrinkCategory.Coffee);
  const [selectedImage, setSelectedImage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Pre-configured flavor tags
  const availableTags = ["草木香", "果香", "清甜", "花香", "奶香", "微苦", "坚果香", "辛香", "清爽", "浓郁"];
  const [flavorTags, setFlavorTags] = useState<string[]>([]);

  // Automatically update selected image to category preset if empty
  React.useEffect(() => {
    const presets = PRESET_DRINK_IMAGES[category];
    if (presets && presets.length > 0) {
      setSelectedImage(presets[0]);
    }
  }, [category]);

  if (!isOpen) return null;

  const handleTagToggle = (tag: string) => {
    if (flavorTags.includes(tag)) {
      setFlavorTags(flavorTags.filter((t) => t !== tag));
    } else {
      setFlavorTags([...flavorTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drinkName || !shopName) return;

    onSave({
      drinkName,
      shopName,
      cityName,
      districtName,
      category,
      date,
      flavorTags,
      imageUrl: selectedImage,
      rating,
      comment
    });

    // Reset state
    setDrinkName("");
    setShopName("");
    setCityName("Shanghai");
    setDistrictName("");
    setCategory(DrinkCategory.Coffee);
    setFlavorTags([]);
    setRating(5);
    setComment("");
    onClose();
  };

  const currentPresets = PRESET_DRINK_IMAGES[category] || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-text/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-brand-bg w-full max-w-lg rounded-3xl shadow-2xl border border-brand-surface overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-brand-surface bg-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
              <h2 className="text-lg font-display font-extrabold text-brand-primary">记录新饮品</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-brand-surface-low text-brand-text-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
            {/* Photo Selection Gallery - At the very top */}
            <div>
              <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-brand-secondary" /> 选择饮品照片
              </label>
              <p className="text-[11px] text-brand-text-muted mb-2">
                为当前品类挑选一张艺术感氛围插图：
              </p>

              {/* Preset Gallery Grid */}
              <div className="grid grid-cols-4 gap-2">
                {currentPresets.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                    }}
                    className={`aspect-square rounded-xl overflow-hidden border-2 relative cursor-pointer transition-all ${
                      selectedImage === img
                        ? "border-brand-primary scale-95 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-brand-primary/10 flex items-center justify-center">
                        <span className="text-[10px] bg-brand-primary text-white rounded px-1.5 font-bold">已选择</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Drink Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  饮品类别
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DrinkCategory)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-brand-surface focus:outline-none focus:border-brand-primary text-sm font-medium"
                >
                  {Object.values(DrinkCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  饮品名称 *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-outline">
                    <Coffee className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="如：生椰拿铁"
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-brand-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Shop Name & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  咖啡馆 / 茶饮店 *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-outline">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="如：Manner 咖啡"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-brand-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 打卡日期
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-brand-surface focus:outline-none focus:border-brand-primary text-sm font-medium"
                />
              </div>
            </div>

            {/* City & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  所在城市
                </label>
                <select
                  value={cityName}
                  onChange={(e) => {
                    setCityName(e.target.value);
                    setDistrictName("");
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-brand-surface focus:outline-none focus:border-brand-primary text-sm font-medium"
                >
                  {CITIES.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  具体区/商圈 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="如：徐汇区、南沙区、三里屯"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-brand-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 推荐指数 / 评分
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        (hoveredRating !== null ? star <= hoveredRating : star <= rating)
                          ? "fill-yellow-400 stroke-yellow-400"
                          : "stroke-yellow-400 fill-transparent"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Tags */}
            <div>
              <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-brand-primary" /> 风味印象 / 标签
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {availableTags.map((tag) => {
                  const isSelected = flavorTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? "bg-brand-primary text-white shadow-sm font-semibold"
                          : "bg-white text-brand-text-muted border border-brand-surface hover:bg-brand-surface-low"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description/Comments */}
            <div>
              <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> 品饮评语与体验
              </label>
              <textarea
                placeholder="描述一下它的香气、甜度、回甘或所处店面的惬意氛围吧..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-brand-surface focus:outline-none focus:border-brand-primary text-sm font-medium"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white hover:bg-brand-surface-low border border-brand-surface font-sans text-sm font-bold rounded-full transition-colors cursor-pointer text-brand-text-muted"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-sans text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                保存打卡
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
