interface CityRow {
  id: string;
  sort_order: number;
  [key: string]: unknown;
}

interface RegionRow {
  city_id: string;
  [key: string]: unknown;
}

export function groupLocationOptions<TCity extends CityRow, TRegion extends RegionRow>(
  cities: TCity[],
  regions: TRegion[],
) {
  return [...cities]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((city) => ({ ...city, regions: regions.filter((region) => region.city_id === city.id) }));
}
