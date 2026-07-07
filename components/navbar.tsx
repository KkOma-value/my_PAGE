"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Map, Compass, User, Camera, Settings } from "lucide-react";

interface NavbarProps {
  activeTab: "map" | "discover" | "profile";
  setActiveTab: (tab: "map" | "discover" | "profile") => void;
  onCheckInClick: () => void;
  userAvatar: string;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onCheckInClick,
  userAvatar,
}: NavbarProps) {
  const getPageTitle = () => {
    switch (activeTab) {
      case "discover":
        return "发现热门";
      case "profile":
        return "个人主页";
      default:
        return "SipNotes 饮迹";
    }
  };

  return (
    <>
      {/* Top Mobile-style Branding Title Header */}
      <header className="w-full h-14 bg-brand-bg border-b border-brand-surface flex justify-between items-center px-5 shrink-0 z-40 select-none">
        <div className="flex items-center gap-2 text-brand-primary">
          <Map className="w-5 h-5" />
          <span className="font-display font-black text-sm tracking-tight">{getPageTitle()}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {activeTab === "profile" ? (
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-surface text-brand-text-muted hover:bg-brand-surface/80 transition-colors cursor-pointer">
              <Settings className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="w-7 h-7 rounded-full overflow-hidden border border-brand-primary/20 shadow-sm cursor-pointer hover:scale-105 transition-transform">
              <img
                src={userAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </header>

      {/* Bottom App Navigation Bar (Optimized for mobile app perspective) */}
      <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-brand-surface z-40 flex justify-around items-center px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] select-none shrink-0">
        {/* 1. 饮品打卡 Button (opens modal) */}
        <button
          onClick={onCheckInClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-brand-text-muted hover:bg-brand-surface-low transition-all cursor-pointer font-sans text-xs font-bold shrink-0"
        >
          <Camera className="w-4 h-4 text-brand-secondary" />
          <span>饮品打卡</span>
        </button>

        {/* 2. 发现热门 Tab */}
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-sans text-xs font-bold shrink-0 ${
            activeTab === "discover"
              ? "bg-[#eeeeea] text-brand-primary font-black animate-scale-up"
              : "text-brand-text-muted hover:bg-brand-surface-low"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>发现热门</span>
        </button>

        {/* 3. 足迹地图 Tab */}
        <button
          onClick={() => setActiveTab("map")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-sans text-xs font-bold shrink-0 ${
            activeTab === "map"
              ? "bg-[#eeeeea] text-brand-primary font-black animate-scale-up"
              : "text-brand-text-muted hover:bg-brand-surface-low"
          }`}
        >
          <Map className="w-4 h-4" />
          <span>足迹地图</span>
        </button>

        {/* 4. 个人主页 Tab */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-sans text-xs font-bold shrink-0 ${
            activeTab === "profile"
              ? "bg-[#eeeeea] text-brand-primary font-black animate-scale-up"
              : "text-brand-text-muted hover:bg-brand-surface-low"
          }`}
        >
          <User className="w-4 h-4" />
          <span>个人主页</span>
        </button>
      </nav>
    </>
  );
}
