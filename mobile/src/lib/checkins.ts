import type { PublishedCheckIn } from "../types/app";
import { apiRequest } from "./api";

export function fetchMyCheckIns() {
  return apiRequest<PublishedCheckIn[]>("/checkins?scope=mine");
}

export function fetchCommunityCheckIns() {
  return apiRequest<PublishedCheckIn[]>("/checkins?scope=community");
}

export function toggleLike(checkinId: string) {
  return apiRequest<{ liked: boolean }>(`/checkins/${checkinId}/like`, { method: "POST" });
}

export function toggleFavorite(checkinId: string) {
  return apiRequest<{ favorited: boolean }>(`/checkins/${checkinId}/favorite`, { method: "POST" });
}

export function reportCheckIn(checkinId: string, reason: string) {
  return apiRequest<{ reported: boolean }>(`/checkins/${checkinId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason, details: "" }),
  });
}

export function blockUser(userId: string) {
  return apiRequest<{ blocked: boolean }>(`/users/${userId}/block`, { method: "POST" });
}
