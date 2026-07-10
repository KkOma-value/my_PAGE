import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { buildHeatCounts } from "@/lib/recommendations/heat";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const admin = getSupabaseAdmin();
    const [checkins, cities, regions] = await Promise.all([
      admin
        .from("checkins")
        .select("city_id,region_id")
        .eq("user_id", userId)
        .eq("publish_status", "published"),
      admin.from("cities").select("id,code,display_name,map_x,map_y").eq("active", true),
      admin.from("city_regions").select("id,city_id,code,display_name,map_x,map_y").eq("active", true),
    ]);
    if (checkins.error) return jsonError("MAP_HEAT_FAILED", checkins.error.message, 500);
    if (cities.error) return jsonError("CITIES_READ_FAILED", cities.error.message, 500);
    if (regions.error) return jsonError("REGIONS_READ_FAILED", regions.error.message, 500);

    const counts = buildHeatCounts(checkins.data ?? []);
    const cityCounts = new Map(counts.cities.map((item) => [item.cityId, item.count]));
    const regionCounts = new Map(counts.regions.map((item) => [item.regionId, item.count]));
    return jsonOk({
      cities: (cities.data ?? []).map((city) => ({ ...city, count: cityCounts.get(city.id) ?? 0 })),
      regions: (regions.data ?? []).map((region) => ({ ...region, count: regionCounts.get(region.id) ?? 0 })),
    });
  } catch (error) {
    const details = errorDetails(error, "MAP_HEAT_FAILED", "Map heat failed");
    return jsonError(details.code, details.message, details.status);
  }
}
