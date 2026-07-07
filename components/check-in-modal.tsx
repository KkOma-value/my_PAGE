"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { X, Star, Sparkles, MapPin, Coffee, Tag, Calendar, MessageSquare, Image as ImageIcon, Loader2, Camera } from "lucide-react";
import { DrinkCategory, SipRecord } from "@/types";
import { CITIES, PRESET_DRINK_IMAGES } from "../external/my_PAGE/src/data";
import { motion, AnimatePresence } from "motion/react";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<SipRecord, "id">, options?: { aiSuggested?: boolean; aiConfidence?: number }) => Promise<void>;
}

export default function CheckInModal({ isOpen, onClose, onSave }: CheckInModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Photo uploading states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Classification states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: DrinkCategory;
    confidence: number;
    reason: string;
  } | null>(null);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  // Pre-configured flavor tags
  const availableTags = ["草木香", "果香", "清甜", "花香", "奶香", "微苦", "坚果香", "辛香", "清爽", "浓郁"];
  const [flavorTags, setFlavorTags] = useState<string[]>([]);

  // Automatically update selected image to category preset if empty
  useEffect(() => {
    if (!selectedImage || selectedImage.startsWith("https://")) {
      const presets = PRESET_DRINK_IMAGES[category];
      if (presets && presets.length > 0) {
        setSelectedImage(presets[0]);
      }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setAiSuggestion(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        setSelectedImage(json.data.url);
        // Trigger AI classification
        triggerAiClassify(json.data.url);
      } else {
        setUploadError(json.error?.message ?? "图片上传失败");
      }
    } catch (err) {
      setUploadError("网络请求失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const triggerAiClassify = async (imageUrl: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const json = await res.json();
      if (json.success && json.data && json.data.confidence >= 0.6) {
        // Map backend category names to DrinkCategory enum
        let mappedCat = DrinkCategory.Coffee;
        const backendCat = json.data.category;
        if (backendCat === "milk_tea") mappedCat = DrinkCategory.MilkTea;
        else if (backendCat === "fruit_tea") mappedCat = DrinkCategory.FruitTea;
        else if (backendCat === "coffee") mappedCat = DrinkCategory.Coffee;
        else if (backendCat === "other") mappedCat = DrinkCategory.Tea;

        setAiSuggestion({
          category: mappedCat,
          confidence: json.data.confidence,
          reason: json.data.reason || ""
        });
      }
    } catch (err) {
      // Non-critical, ignore
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAi = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
    }
    setAiSuggestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drinkName || !shopName || submitting) return;

    setSubmitting(true);
    try {
      const isAiSuggested = aiSuggestion === null && selectedImage.startsWith("/uploads/");
      await onSave({
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
      }, {
        aiSuggested: isAiSuggested,
        aiConfidence: aiSuggestion?.confidence ?? undefined
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
      setSelectedImage("");
      setAiSuggestion(null);
      onClose();
    } catch (err) {
      // Handled by parent
    } finally {
      setSubmitting(false);
    }
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
            {/* Custom Photo Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-brand-secondary" /> 上传打卡照片 / 选择插图
              </label>
              
              <div className="grid grid-cols-5 gap-2 items-center">
                {/* Real File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`aspect-square rounded-xl overflow-hidden border-2 border-dashed border-brand-outline/40 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-brand-surface-low transition-all relative ${
                    selectedImage.startsWith("/uploads/") ? "border-brand-primary border-solid bg-brand-primary/5" : ""
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                  ) : selectedImage.startsWith("/uploads/") ? (
                    <>
                      <img src={selectedImage} alt="Uploaded" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-brand-primary/10 flex items-center justify-center">
                        <span className="text-[8px] bg-brand-primary text-white rounded px-1 font-bold">已上传</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-brand-secondary mb-1" />
                      <span className="text-[9px] font-bold text-brand-text-muted">拍照上传</span>
                    </>
                  )}
                </button>

                {/* Preset Gallery Grid */}
                {currentPresets.slice(0, 4).map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                      setAiSuggestion(null);
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
                        <span className="text-[8px] bg-brand-primary text-white rounded px-1.5 font-bold">已选择</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {uploadError && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{uploadError}</p>
              )}
            </div>

            {/* AI suggestion banner */}
            <AnimatePresence>
              {aiLoading && (
                <div className="flex items-center gap-2 rounded-xl bg-brand-surface-low px-4 py-3 text-xs text-brand-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                  AI 正在努力识别饮品类别...
                </div>
              )}
              {aiSuggestion && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 flex flex-col gap-2"
                >
                  <p className="text-xs text-brand-text-muted leading-relaxed font-sans font-medium">
                    ✨ AI 识别这是一杯 
                    <span className="mx-1 font-bold text-brand-primary">
                      {aiSuggestion.category}
                    </span>
                    ，可信度高达 {(aiSuggestion.confidence * 100).toFixed(0)}%。
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAcceptAi}
                      className="rounded-lg bg-brand-primary text-white px-3 py-1 text-xs font-bold transition-colors cursor-pointer hover:bg-brand-primary/90"
                    >
                      采纳品类
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion(null)}
                      className="rounded-lg border border-brand-surface bg-white text-brand-text-muted px-3 py-1 text-xs font-bold transition-colors cursor-pointer hover:bg-brand-surface-low"
                    >
                      忽略
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                disabled={submitting}
                className="flex-1 py-3 bg-white hover:bg-brand-surface-low border border-brand-surface font-sans text-sm font-bold rounded-full transition-colors cursor-pointer text-brand-text-muted text-center"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || !drinkName || !shopName}
                className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-sans text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在打卡...
                  </>
                ) : (
                  "保存打卡"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
