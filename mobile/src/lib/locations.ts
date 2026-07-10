import type { CityOption } from "../types/app";
import { apiRequest } from "./api";

export function fetchLocations() {
  return apiRequest<CityOption[]>("/locations");
}
