/**
 * Client-side read state for user notifications, keyed by email.
 * Merges with API `isRead` so the header and /notifications stay consistent across refetches and sessions.
 */

const READ_NOTIFICATION_IDS_KEY = "userbase:notification-read-ids:";

export function persistedReadIdsStorageKey(userEmail: string): string {
  return `${READ_NOTIFICATION_IDS_KEY}${encodeURIComponent(userEmail.trim().toLowerCase())}`;
}

export function loadPersistedReadNotificationIds(userEmail: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(persistedReadIdsStorageKey(userEmail));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function persistReadNotificationIds(
  userEmail: string,
  ids: string[]
): void {
  if (typeof window === "undefined" || !userEmail.trim() || !ids.length) return;
  try {
    const existing = loadPersistedReadNotificationIds(userEmail);
    ids.forEach((id) => existing.add(id));
    localStorage.setItem(
      persistedReadIdsStorageKey(userEmail),
      JSON.stringify([...existing])
    );
  } catch {
    /* quota or private mode */
  }
}

export type NotificationReadMergeFields = {
  _id: string;
  isRead?: boolean;
};

export function mergeWithPersistedReadState<T extends NotificationReadMergeFields>(
  items: T[],
  userEmail: string | null | undefined
): T[] {
  if (!userEmail?.trim()) return items;
  const persisted = loadPersistedReadNotificationIds(userEmail);
  if (persisted.size === 0) return items;
  return items.map((n) => ({
    ...n,
    isRead: Boolean(n.isRead || persisted.has(n._id)),
  }));
}