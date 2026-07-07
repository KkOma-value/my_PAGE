import { Trophy } from "lucide-react";
import type { CategoryType } from "@/types";

interface RankingCardProps {
  rank: number;
  drinkName: string;
  brandName: string;
  count: number;
  likes: number;
  category: CategoryType;
  onClick?: () => void;
}

const categoryColorMap: Record<CategoryType, string> = {
  milk_tea: "bg-category-milk-tea",
  coffee: "bg-category-coffee",
  fruit_tea: "bg-category-fruit-tea",
  other: "bg-category-other",
};

function getMedalColor(rank: number): string {
  switch (rank) {
    case 1:
      return "text-[#D4AF37]";
    case 2:
      return "text-[#A8A8A8]";
    case 3:
      return "text-[#CD7F32]";
    default:
      return "text-foreground-subtle";
  }
}

export default function RankingCard({
  rank,
  drinkName,
  brandName,
  count,
  likes,
  category,
  onClick,
}: RankingCardProps) {
  const isFirst = rank === 1;
  const categoryDot = categoryColorMap[category] ?? "bg-category-other";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition-colors active:bg-background-muted ${
        isFirst ? "bg-primary-soft" : "bg-background-soft"
      }`}
    >
      {/* Category dot */}
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${categoryDot}`}
      />

      {/* Rank */}
      <span className="flex w-10 shrink-0 items-center justify-center">
        {rank <= 3 ? (
          <Trophy className={`h-5 w-5 ${getMedalColor(rank)}`} />
        ) : (
          <span className="text-base font-semibold text-foreground-muted">
            {rank}
          </span>
        )}
      </span>

      {/* Drink info */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold ${
            isFirst ? "text-lg" : "text-base"
          }`}
        >
          {drinkName}
        </p>
        <p className="truncate text-sm text-foreground-muted">
          {brandName}
          <span className="mx-1 text-foreground-subtle">·</span>
          {count}杯打卡
        </p>
      </div>

      {/* Likes */}
      <span className="shrink-0 text-sm text-foreground-subtle">
        {likes} 赞
      </span>
    </button>
  );
}
