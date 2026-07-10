import type { MapHeatResponse, SnapshotResponse } from "../types/app";
import { apiRequest } from "./api";

export function fetchDiscoverSnapshot(
  type: "city" | "region" | "season" | "personal",
  scopeId = "",
) {
  const query = new URLSearchParams({ type, scopeId });
  return apiRequest<SnapshotResponse | null>(`/discover?${query.toString()}`);
}

export function fetchMapHeat() {
  return apiRequest<MapHeatResponse>("/map-heat");
}
