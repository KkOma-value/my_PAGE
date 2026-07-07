"use client";

import type { CategoryType } from "@/types";

interface CategoryTabsProps {
  selected: CategoryType | "all";
  onChange: (cat: CategoryType | "all") => void;
}

interface TabItem {
  value: CategoryType | "all";
  label: string;
}

const tabs: TabItem[] = [
  { value: "all", label: "全部" },
  { value: "milk_tea", label: "奶茶" },
  { value: "coffee", label: "咖啡" },
  { value: "fruit_tea", label: "果茶" },
];

export default function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-2">
      {tabs.map((tab) => {
        const isActive = selected === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors active:scale-95 ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-background-muted text-foreground-muted hover:bg-background-soft"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
