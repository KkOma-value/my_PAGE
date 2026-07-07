/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import FootprintMap from "./components/FootprintMap";
import DiscoverRankings from "./components/DiscoverRankings";
import UserProfileView from "./components/UserProfileView";
import CheckInModal from "./components/CheckInModal";
import { SipRecord, DrinkCategory } from "./types";
import { INITIAL_SIPS } from "./data";
import { Sparkles, MapPin } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "discover" | "profile">("map");
  const [sips, setSips] = useState<SipRecord[]>([]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    try {
      const storedSips = localStorage.getItem("sipnotes_user_sips");
      if (storedSips) {
        setSips(JSON.parse(storedSips));
      } else {
        setSips(INITIAL_SIPS);
        localStorage.setItem("sipnotes_user_sips", JSON.stringify(INITIAL_SIPS));
      }
    } catch (e) {
      console.error("Failed to load sips from localStorage", e);
      setSips(INITIAL_SIPS);
    }
  }, []);

  // Sync sips with localStorage
  const saveSips = (newSips: SipRecord[]) => {
    setSips(newSips);
    try {
      localStorage.setItem("sipnotes_user_sips", JSON.stringify(newSips));
    } catch (e) {
      console.error("Failed to save sips to localStorage", e);
    }
  };

  // Add new checked in sip
  const handleAddSip = (record: Omit<SipRecord, "id">) => {
    const newSip: SipRecord = {
      ...record,
      id: `sip-${Date.now()}`
    };
    const updated = [newSip, ...sips];
    saveSips(updated);
    setActiveTab("map"); // auto transition to map to see new visual pin!
  };

  // Delete sip log
  const handleDeleteSip = (id: string) => {
    const updated = sips.filter((s) => s.id !== id);
    saveSips(updated);
  };

  // Quick log from Rankings List
  const handleQuickCheckIn = (item: {
    drinkName: string;
    shopName: string;
    cityName: string;
    districtName?: string;
    category: DrinkCategory;
    imageUrl: string;
  }) => {
    const newSip: SipRecord = {
      id: `sip-${Date.now()}`,
      drinkName: item.drinkName,
      shopName: item.shopName,
      cityName: item.cityName,
      districtName: item.districtName,
      date: new Date().toISOString().split("T")[0],
      category: item.category,
      flavorTags: ["Trending", "Popular"],
      imageUrl: item.imageUrl,
      rating: 5,
      comment: "通过 SipNotes 城市人气排行榜一键打卡推荐！"
    };
    const updated = [newSip, ...sips];
    saveSips(updated);
  };

  // Profile avatar
  const jasmineAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuB-VXJ6BlpMihIC-BGTCROuLA3D26wwxVoW78lt-V-WaxgWgdq8OrJJTZJ06skGwpK0p1V6exKUT79hijpUFtqHsjZmvoq9QgyObNWS7a8aGBmaAUdQoD8AJpyWVXW7AmGm9hmEzrhXDD8lV6jhcy8btTVWi1IXi7hvDQlVynub4Gqm6fWqFPU26uYrzNhDJpNqrdLp_zR5-TvU0H951pfkCUjOKozmcmHkVTewaaqlrx5HCcCSYCh6nWQQB4w3--YfloITnlPlqP9W";

  return (
    <div className="bg-brand-bg min-h-screen text-brand-text font-sans antialiased flex flex-col">
      {/* Responsive Header Navigation System */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCheckInClick={() => setIsCheckInOpen(true)}
        userAvatar={jasmineAvatar}
      />

      {/* Main Container Stage */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 md:px-12 xl:px-24 pt-6 pb-24 md:pb-12">
        <div className="w-full">
          {activeTab === "map" && (
            <FootprintMap
              sips={sips}
              onDeleteSip={handleDeleteSip}
              onCheckInClick={() => setIsCheckInOpen(true)}
            />
          )}

          {activeTab === "discover" && (
            <DiscoverRankings onQuickCheckIn={handleQuickCheckIn} />
          )}

          {activeTab === "profile" && (
            <UserProfileView sips={sips} />
          )}
        </div>
      </main>

      {/* Floating Action Buttons or help indicators for immersive feel */}
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsCheckInOpen(true)}
          className="bg-brand-primary text-white p-4 rounded-full shadow-2xl hover:bg-brand-primary/95 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer font-sans text-sm font-bold"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> 打卡新饮品
        </button>
      </div>

      {/* Sip Logging Form Overlay Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSave={handleAddSip}
      />
    </div>
  );
}
