/**
 * Frontend-only notifications store (localStorage).
 * Replace with API calls when backend exists.
 */

const STORAGE_KEY = "userbase-admin-notifications";
const READ_BY_USER_KEY = "userbase-notifications-read";

export type NotificationTargetType = "all" | "role" | "users";

export type StoredNotification = {
  id: string;
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetRole?: string;
  targetUserIds?: string[];
  createdAt: string;
  updatedAt?: string;
};

function loadNotifications(): StoredNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(list: StoredNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getNotifications(): StoredNotification[] {
  return loadNotifications().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addNotification(
  data: Omit<StoredNotification, "id" | "createdAt">
): StoredNotification {
  const list = loadNotifications();
  const item: StoredNotification = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(item);
  saveNotifications(list);
  return item;
}

/**
 * When a notification is edited, clear its read status for all users
 * so it appears as "new" again to everyone who had read it.
 */
function clearReadStatusForNotification(notificationId: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = getReadByUserMap();
    let changed = false;
    for (const email of Object.keys(map)) {
      const ids = map[email].filter((id) => id !== notificationId);
      if (ids.length !== map[email].length) {
        map[email] = ids;
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(READ_BY_USER_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}

export function updateNotification(
  id: string,
  data: Partial<Omit<StoredNotification, "id" | "createdAt">>
): StoredNotification | null {
  const list = loadNotifications();
  const index = list.findIndex((n) => n.id === id);
  if (index === -1) return null;
  const updated: StoredNotification = {
    ...list[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  list[index] = updated;
  saveNotifications(list);
  clearReadStatusForNotification(id);
  return list[index];
}

export function deleteNotification(id: string): boolean {
  const list = loadNotifications().filter((n) => n.id !== id);
  if (list.length === loadNotifications().length) return false;
  saveNotifications(list);
  return true;
}

export function getTargetSummary(notification: StoredNotification): string {
  switch (notification.targetType) {
    case "all":
      return "All users";
    case "role":
      return notification.targetRole ? `Role: ${notification.targetRole}` : "Role (not set)";
    case "users":
      const count = notification.targetUserIds?.length ?? 0;
      return count ? `${count} user(s)` : "No users selected";
    default:
      return "—";
  }
}

/** User-facing shape for display in header, profile, dashboard */
export type UserNotification = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
};

function getReadByUserMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(READ_BY_USER_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function getReadNotificationIds(userEmail: string): string[] {
  const email = userEmail.trim().toLowerCase();
  const map = getReadByUserMap();
  const ids = map[email];
  return Array.isArray(ids) ? ids : [];
}

/**
 * Persist that the given user has read the given notification IDs.
 * Call when user clicks "Read all" or opens a single notification.
 */
export function markNotificationsAsRead(
  userEmail: string,
  notificationIds: string[]
): void {
  if (typeof window === "undefined" || !notificationIds.length) return;
  const email = userEmail.trim().toLowerCase();
  if (!email) return;
  try {
    const map = getReadByUserMap();
    const existing = map[email] ?? [];
    const set = new Set([...existing, ...notificationIds]);
    map[email] = Array.from(set);
    localStorage.setItem(READ_BY_USER_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Returns notifications that apply to the given user (for display in user UI).
 * Filters by target: "all" -> everyone; "role" -> user's role; "users" -> user's email in list.
 * isRead is set from persisted per-user read state so it survives login/refresh.
 */
export function getNotificationsForUser(
  userEmail: string,
  userRole: string
): UserNotification[] {
  const list = getNotifications();
  const email = userEmail.trim().toLowerCase();
  const role = userRole?.toLowerCase() ?? "";
  const readIds = getReadNotificationIds(email);

  return list
    .filter((n) => {
      switch (n.targetType) {
        case "all":
          return true;
        case "role":
          return n.targetRole?.toLowerCase() === role;
        case "users":
          return n.targetUserIds?.some((id) => id.trim().toLowerCase() === email) ?? false;
        default:
          return false;
      }
    })
    .map((n) => ({
      _id: n.id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      isRead: readIds.includes(n.id),
    }));
}
