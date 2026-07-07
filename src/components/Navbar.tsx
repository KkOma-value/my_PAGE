/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Map, Compass, User, Camera, Settings, ArrowLeft } from "lucide-react";

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
  userAvatar
}: NavbarProps) {
  return (
    <>
      {/* 1. Desktop Top Bar (Hidden on Mobile) */}
      <header className="hidden md:flex justify-between items-center px-6 md:px-12 xl:px-24 h-16 w-full z-50 sticky top-0 bg-brand-bg/85 backdrop-blur-md border-b border-brand-surface/30">
        <div className="flex items-center gap-2 text-brand-primary">
          <Map className="w-6 h-6" />
          <h1 className="text-xl font-display font-extrabold tracking-tight">SipNotes</h1>
        </div>

        <nav className="flex gap-2">
          <button
            onClick={onCheckInClick}
            className="text-brand-text-muted hover:bg-brand-surface-low transition-colors px-4 py-2 rounded-full font-sans text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-brand-secondary" />
            饮品打卡
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`transition-all px-4 py-2 rounded-full font-sans text-sm font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "discover"
                ? "bg-brand-primary/10 text-brand-primary font-bold"
                : "text-brand-text-muted hover:bg-brand-surface-low"
            }`}
          >
            <Compass className="w-4 h-4" />
            发现热门
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`transition-all px-4 py-2 rounded-full font-sans text-sm font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "map"
                ? "bg-brand-primary/10 text-brand-primary font-bold"
                : "text-brand-text-muted hover:bg-brand-surface-low"
            }`}
          >
            <Map className="w-4 h-4" />
            足迹地图
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`transition-all px-4 py-2 rounded-full font-sans text-sm font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "profile"
                ? "bg-brand-primary/10 text-brand-primary font-bold"
                : "text-brand-text-muted hover:bg-brand-surface-low"
            }`}
          >
            <User className="w-4 h-4" />
            个人主页
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-primary/20 shadow-sm cursor-pointer hover:scale-105 transition-transform">
            <img
              src={userAvatar}
              alt="User Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* 2. Mobile Top App Bar (Different title based on screen) */}
      <header className="md:hidden flex justify-between items-center px-4 h-16 w-full z-40 sticky top-0 bg-brand-bg/85 backdrop-blur-md border-b border-brand-surface/20">
        <div className="flex items-center gap-2">
          {activeTab !== "map" && (
            <button
              onClick={() => setActiveTab("map")}
              className="p-1 rounded-full text-brand-primary hover:bg-brand-surface"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="text-xl font-display font-bold text-brand-primary">
            {activeTab === "map" ? "SipNotes 饮迹" : activeTab === "discover" ? "发现热门" : "个人主页"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "profile" ? (
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-surface hover:bg-brand-surface/80 text-brand-text-muted">
              <Settings className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("profile")}
              className="w-8 h-8 rounded-full overflow-hidden shadow-sm active:scale-95 transition-all"
            >
              <img
                src={userAvatar}
                alt="用户头像"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>
      </header>

      {/* 3. Mobile Navigation Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-4px_16px_rgba(121,87,63,0.08)] border-t border-brand-surface/20 z-50 flex justify-around items-center px-2 pb-safe rounded-t-xl">
        <button
          onClick={onCheckInClick}
          className="flex flex-col items-center justify-center text-brand-text-muted opacity-75 hover:opacity-100 py-1 px-3 cursor-pointer"
        >
          <Camera className="w-5 h-5 mb-0.5 text-brand-secondary" />
          <span className="text-[10px] font-medium font-sans">打卡</span>
        </button>

        <button
          onClick={() => setActiveTab("discover")}
          className={`flex flex-col items-center justify-center py-1 px-3 cursor-pointer transition-all ${
            activeTab === "discover"
              ? "text-brand-primary scale-105"
              : "text-brand-text-muted opacity-75 hover:opacity-100"
          }`}
        >
          <Compass className={`w-5 h-5 mb-0.5 ${activeTab === "discover" ? "fill-brand-primary/20" : ""}`} />
          <span className={`text-[10px] font-sans ${activeTab === "discover" ? "font-bold text-brand-primary" : "font-medium"}`}>
            发现
          </span>
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center justify-center py-1 px-3 cursor-pointer transition-all ${
            activeTab === "map"
              ? "text-brand-primary scale-105"
              : "text-brand-text-muted opacity-75 hover:opacity-100"
          }`}
        >
          <Map className={`w-5 h-5 mb-0.5 ${activeTab === "map" ? "fill-brand-primary/20" : ""}`} />
          <span className={`text-[10px] font-sans ${activeTab === "map" ? "font-bold text-brand-primary" : "font-medium"}`}>
            足迹
          </span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center py-1 px-3 cursor-pointer transition-all ${
            activeTab === "profile"
              ? "text-brand-primary scale-105"
              : "text-brand-text-muted opacity-75 hover:opacity-100"
          }`}
        >
          <User className={`w-5 h-5 mb-0.5 ${activeTab === "profile" ? "fill-brand-primary/20" : ""}`} />
          <span className={`text-[10px] font-sans ${activeTab === "profile" ? "font-bold text-brand-primary" : "font-medium"}`}>
            我的
          </span>
        </button>
      </nav>
    </>
  );
}
