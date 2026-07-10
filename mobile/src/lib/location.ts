import type { CityOption } from "../types/app";

interface LocationAddress {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
}

function normalizePlace(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("zh-CN")
    .replace(/\s+/g, "")
    .replace(/(特别行政区|自治州|地区|市|区|县)$/u, "");
}

function placeMatches(candidate: string | null | undefined, values: Array<string | undefined>) {
  const normalizedCandidate = normalizePlace(candidate);
  return normalizedCandidate.length > 0 && values.some((value) => normalizePlace(value) === normalizedCandidate);
}

export function matchLocationAddress(address: LocationAddress, cities: CityOption[]) {
  const cityCandidates = [address.city, address.subregion, address.region];
  const city = cities.find((item) =>
    cityCandidates.some((candidate) => placeMatches(candidate, [item.display_name, item.name, item.code])),
  );
  if (!city) return null;

  const regionCandidates = [address.district, address.subregion];
  const region = city.regions.find((item) =>
    regionCandidates.some((candidate) => placeMatches(candidate, [item.display_name, item.name, item.code])),
  );
  return { cityId: city.id, regionId: region?.id ?? null };
}

export async function suggestLocationFromDevice(cities: CityOption[]) {
  const Location = await import("expo-location");
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") throw new Error("定位权限未开启，可手动选择城市和区域");
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const addresses = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });
  return addresses[0] ? matchLocationAddress(addresses[0], cities) : null;
}
