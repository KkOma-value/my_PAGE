interface HeatCheckIn {
  city_id: string;
  region_id: string;
}

function countBy(rows: HeatCheckIn[], key: "city_id" | "region_id") {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function buildHeatCounts(rows: HeatCheckIn[]) {
  return {
    cities: countBy(rows, "city_id").map(([cityId, count]) => ({ cityId, count })),
    regions: countBy(rows, "region_id").map(([regionId, count]) => ({ regionId, count })),
  };
}
