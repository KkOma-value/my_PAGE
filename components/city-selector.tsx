"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Search, X } from "lucide-react";
import type { CityInfo } from "@/types";

interface CitySelectorProps {
  cities: CityInfo[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export default function CitySelector({
  cities,
  selectedCode,
  onSelect,
}: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCity = useMemo(
    () => cities.find((c) => c.code === selectedCode),
    [cities, selectedCode]
  );

  const groupedCities = useMemo(() => {
    const filtered = search
      ? cities.filter(
          (c) =>
            c.name.includes(search) || c.province.includes(search)
        )
      : cities;

    const groups: Record<string, CityInfo[]> = {};
    for (const city of filtered) {
      const province = city.province || "其他";
      if (!groups[province]) {
        groups[province] = [];
      }
      groups[province].push(city);
    }
    return groups;
  }, [cities, search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-background-soft px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background-muted transition-colors"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span>{selectedCity?.name ?? "选择城市"}</span>
        <ChevronDown
          className={`h-4 w-4 text-foreground-subtle transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-white shadow-md">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-foreground-subtle" />
            <input
              type="text"
              placeholder="搜索城市..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="shrink-0"
              >
                <X className="h-4 w-4 text-foreground-subtle" />
              </button>
            )}
          </div>

          {/* City list grouped by province */}
          <div className="max-h-64 overflow-y-auto p-2">
            {Object.keys(groupedCities).length === 0 ? (
              <p className="py-4 text-center text-sm text-foreground-muted">
                未找到匹配的城市
              </p>
            ) : (
              Object.entries(groupedCities).map(([province, provinceCities]) => (
                <div key={province} className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-foreground-subtle">
                    {province}
                  </p>
                  {provinceCities.map((city) => (
                    <button
                      key={city.code}
                      type="button"
                      onClick={() => {
                        onSelect(city.code);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        selectedCode === city.code
                          ? "bg-primary-soft text-primary font-medium"
                          : "text-foreground hover:bg-background-soft"
                      }`}
                    >
                      <span>{city.name}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
