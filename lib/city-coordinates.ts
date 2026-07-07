/**
 * Static city coordinate lookup for the footprint map.
 * Maps city.code (lowercase) to percentage-based { x, y } positions
 * on the China map image.
 *
 * Source: external/my_PAGE/src/data.ts CITIES array
 * Names are normalized to match our city codes.
 */

export interface CityCoordinate {
  x: number;
  y: number;
}

export const CITY_COORDINATES: Record<string, CityCoordinate> = {
  // Direct matches from source CITIES (name -> x/y), mapped by normalized code
  shanghai: { x: 70, y: 40 },
  beijing: { x: 65, y: 30 },
  chengdu: { x: 60, y: 60 },
  guangzhou: { x: 68, y: 75 },
  shenzhen: { x: 67, y: 78 },
  hangzhou: { x: 70, y: 46 },
  suzhou: { x: 69, y: 43 },
  chongqing: { x: 52, y: 62 },
  xian: { x: 48, y: 45 },
  wuhan: { x: 61, y: 52 },
  nanjing: { x: 68, y: 41 },
  changsha: { x: 59, y: 61 },
};

export function getCityCoordinate(cityCode: string): CityCoordinate {
  return CITY_COORDINATES[cityCode.toLowerCase()] ?? { x: 50, y: 50 };
}
