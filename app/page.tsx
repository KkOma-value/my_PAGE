"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";
import FootprintMap from "@/components/footprint-map";
import DiscoverRankings from "@/components/discover-rankings";
import UserProfileView from "@/components/user-profile-view";
import CheckInModal from "@/components/check-in-modal";
import { DrinkCategory, SipRecord } from "@/types";
import { INITIAL_SIPS } from "../external/my_PAGE/src/data";
import { Loader2 } from "lucide-react";

const USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-VXJ6BlpMihIC-BGTCROuLA3D26wwxVoW78lt-V-WaxgWgdq8OrJJTZJ06skGwpK0p1V6exKUT79hijpUFtqHsjZmvoq9QgyObNWS7a8aGBmaAUdQoD8AJpyWVXW7AmGm9hmEzrhXDD8lV6jhcy8btTVWi1IXi7hvDQlVynub4Gqm6fWqFPU26uYrzNhDJpNqrdLp_zR5-TvU0H951pfkCUjOKozmcmHkVTewaaqlrx5HCcCSYCh6nWQQB4w3--YfloITnlPlqP9W";

type CheckInApiItem = {
  id: string;
  caption?: string | null;
  locationName?: string | null;
  date: string;
  cardUrl?: string | null;
  imageUrl: string;
  city?: {
    code?: string | null;
  } | null;
  drink?: {
    name?: string | null;
    brand?: {
      name?: string | null;
    } | null;
    category?: {
      name?: string | null;
    } | null;
  } | null;
};

// Helper: Map DB city code to Mock city name
function dbCityCodeToMockName(code: string): string {
  const mapping: Record<string, string> = {
    shanghai: "Shanghai",
    beijing: "Beijing",
    chengdu: "Chengdu",
    guangzhou: "Guangzhou",
    shenzhen: "Shenzhen",
    hangzhou: "Hangzhou",
    suzhou: "Suzhou",
    chongqing: "Chongqing",
    xian: "Xi'an",
    wuhan: "Wuhan",
    nanjing: "Nanjing",
    changsha: "Changsha",
  };
  return mapping[code.toLowerCase()] || code;
}

// Helper: Map Mock city name to DB city code
function mockNameToDbCityCode(name: string): string {
  return name.toLowerCase().replace("'", "");
}

// Helper: Map Frontend DrinkCategory to DB Category Name
function mapCategoryToDbName(cat: DrinkCategory): string {
  switch (cat) {
    case DrinkCategory.Coffee:
    case DrinkCategory.PourOver:
      return "coffee";
    case DrinkCategory.MilkTea:
      return "milk_tea";
    case DrinkCategory.FruitTea:
      return "fruit_tea";
    default:
      return "other";
  }
}

// Helper: Map DB Category Name to Frontend DrinkCategory
function dbCategoryToFrontend(name: string): DrinkCategory {
  switch (name) {
    case "coffee":
      return DrinkCategory.Coffee;
    case "milk_tea":
      return DrinkCategory.MilkTea;
    case "fruit_tea":
      return DrinkCategory.FruitTea;
    default:
      return DrinkCategory.Tea;
  }
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"map" | "discover" | "profile">("map");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [sips, setSips] = useState<SipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch checkins on mount
  const fetchSips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkins?userId=demo-user-001&limit=100");
      const json = await res.json();
      
      if (json.success && Array.isArray(json.data)) {
        if (json.data.length === 0) {
          // If DB has no records, fallback to INITIAL_SIPS from the mock data to populate view beautifully
          setSips(INITIAL_SIPS);
        } else {
          // Map DB check-ins to front-end SipRecords
          const mapped: SipRecord[] = (json.data as CheckInApiItem[]).map((ci) => {
            let comment = ci.caption || "";
            let flavorTags: string[] = [];
            
            // Extract flavor tags if serialized in caption
            if (comment.includes(" | ")) {
              const parts = comment.split(" | ");
              flavorTags = parts[0].split("，").map((t: string) => t.trim());
              comment = parts[1];
            }

            return {
              id: ci.id,
              drinkName: ci.drink?.name || "未知饮品",
              shopName: ci.drink?.brand?.name || "未知店铺",
              cityName: dbCityCodeToMockName(ci.city?.code || "shanghai"),
              districtName: ci.locationName || undefined,
              date: ci.date,
              category: dbCategoryToFrontend(ci.drink?.category?.name || "other"),
              flavorTags: flavorTags,
              imageUrl: ci.cardUrl || ci.imageUrl,
              rating: 5, // Default rating
              comment: comment,
            };
          });
          setSips(mapped);
        }
      } else {
        setSips(INITIAL_SIPS);
      }
    } catch (err) {
      console.error("Failed to load sips from DB, using mock data", err);
      setSips(INITIAL_SIPS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSips();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchSips]);

  // Create new check-in
  const handleSaveSip = async (
    record: Omit<SipRecord, "id">,
    options?: { aiSuggested?: boolean; aiConfidence?: number }
  ) => {
    try {
      const caption =
        record.flavorTags.length > 0
          ? `${record.flavorTags.join("，")} | ${record.comment || ""}`
          : record.comment || "";

      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user-001",
          customDrinkName: record.drinkName,
          brandName: record.shopName,
          categoryName: mapCategoryToDbName(record.category),
          cityCode: mockNameToDbCityCode(record.cityName),
          imageUrl: record.imageUrl,
          caption,
          locationName: record.districtName,
          aiSuggested: options?.aiSuggested || false,
          aiConfidence: options?.aiConfidence,
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Reload check-ins from database and return to Footprint Map to see the new record!
        await fetchSips();
        setActiveTab("map");
      } else {
        alert(`打卡失败: ${json.error?.message || "未知原因"}`);
      }
    } catch (err) {
      console.error("Failed to save check-in:", err);
      alert("网络请求失败，请稍后重试");
    }
  };

  // Delete check-in
  const handleDeleteSip = async (id: string) => {
    // If it's a mock sip (id like "sip-1"), just delete from local state
    if (id.startsWith("sip-")) {
      setSips((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    try {
      const res = await fetch(`/api/checkins/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        await fetchSips();
      } else {
        alert(`删除失败: ${json.error?.message || "未知原因"}`);
      }
    } catch (err) {
      console.error("Failed to delete check-in:", err);
      alert("网络请求失败，请稍后重试");
    }
  };

  // Quick check-in from Discover Rankings
  const handleQuickCheckIn = async (item: {
    drinkName: string;
    shopName: string;
    cityName: string;
    districtName?: string;
    category: DrinkCategory;
    imageUrl: string;
  }) => {
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user-001",
          customDrinkName: item.drinkName,
          brandName: item.shopName,
          categoryName: mapCategoryToDbName(item.category),
          cityCode: mockNameToDbCityCode(item.cityName),
          imageUrl: item.imageUrl,
          caption: "通过 SipNotes 城市人气排行榜一键打卡推荐！",
          locationName: item.districtName || "热门商圈",
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchSips();
        setActiveTab("map"); // Automatically transition to map to view it
      }
    } catch (err) {
      console.error("Quick check-in failed:", err);
    }
  };

  return (
    <div className="bg-[#edeae1] min-h-screen flex items-center justify-center p-0 md:p-6 select-none font-sans antialiased text-brand-text">
      {/* Immersive Mobile-first Centered Viewport Container */}
      <div className="w-full h-screen md:w-[412px] md:h-[840px] md:max-h-[92vh] md:rounded-[36px] md:shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-brand-bg relative flex flex-col overflow-hidden md:border md:border-brand-surface">
        
        {/* Navigation Top Header & Bottom Tab Bar Wrapper */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCheckInClick={() => setIsCheckInOpen(true)}
          userAvatar={USER_AVATAR}
        />

        {/* Main Dynamic View Page (Scrollable) */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20 scrollbar-thin bg-brand-bg">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <span className="text-sm text-brand-text-muted font-bold">同步数据库中...</span>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {activeTab === "map" && (
                <FootprintMap
                  sips={sips}
                  onDeleteSip={handleDeleteSip}
                  onCheckInClick={() => setIsCheckInOpen(true)}
                />
              )}

              {activeTab === "discover" && (
                <DiscoverRankings onQuickCheckIn={handleQuickCheckIn} sips={sips} />
              )}

              {activeTab === "profile" && (
                <UserProfileView sips={sips} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Check-In Modal Overlay */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSave={handleSaveSip}
      />
    </div>
  );
}
