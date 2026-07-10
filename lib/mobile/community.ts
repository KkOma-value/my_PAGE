interface BlockRow {
  blocker_id: string;
  blocked_id: string;
}

export function collectBlockedUserIds(rows: BlockRow[], currentUserId: string) {
  const ids = new Set<string>();
  for (const row of rows) {
    if (row.blocker_id === currentUserId) ids.add(row.blocked_id);
    if (row.blocked_id === currentUserId) ids.add(row.blocker_id);
  }
  return Array.from(ids);
}

export function decorateCommunityRows<T extends { id: string }>(
  rows: T[],
  likedCheckinIds: string[],
  favoritedCheckinIds: string[],
) {
  const liked = new Set(likedCheckinIds);
  const favorited = new Set(favoritedCheckinIds);
  return rows.map((row) => ({
    ...row,
    liked_by_me: liked.has(row.id),
    favorited_by_me: favorited.has(row.id),
  }));
}
