export interface HeatInput {
  id: string;
  count: number;
}

export function heatOpacity(count: number, maxCount: number) {
  if (maxCount <= 0) return 0.16;
  return Math.min(1, 0.16 + (Math.max(0, count) / maxCount) * 0.84);
}

export function indexHeat(items: HeatInput[]) {
  const maxCount = Math.max(0, ...items.map((item) => item.count));
  return new Map(
    items.map((item) => [item.id, { count: item.count, opacity: heatOpacity(item.count, maxCount) }]),
  );
}
