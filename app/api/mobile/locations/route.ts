import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { groupLocationOptions } from "@/lib/mobile/locations";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const admin = getSupabaseAdmin();
    const [cities, regions] = await Promise.all([
      admin.from("cities").select("*").eq("active", true).order("sort_order", { ascending: true }),
      admin.from("city_regions").select("*").eq("active", true).order("display_name", { ascending: true }),
    ]);
    if (cities.error) return jsonError("CITIES_READ_FAILED", cities.error.message, 500);
    if (regions.error) return jsonError("REGIONS_READ_FAILED", regions.error.message, 500);
    return jsonOk(groupLocationOptions(cities.data ?? [], regions.data ?? []));
  } catch (error) {
    const details = errorDetails(error, "LOCATIONS_READ_FAILED", "Locations read failed");
    return jsonError(details.code, details.message, details.status);
  }
}
