/**
 * Notifications via Express API (MongoDB). Bearer + credentials for refresh cookie.
 */

import { API_BASE, authHeaders, readJsonSafe } from "./api-config";

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

export type UserNotification = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
};

type ErrorResponse = { message?: string; error?: string };

/** Backend uses `body`; UI/store uses `message`. */
function textFromApi(raw: Record<string, unknown>): string {
  return String(raw.body ?? raw.message ?? "");
}

function pickId(raw: Record<string, unknown>): string {
  const id = raw._id ?? raw.id;
  if (typeof id === "string") return id;
  if (id && typeof id === "object" && "toString" in id) return String(id);
  return "";
}

function mapApiToStored(raw: Record<string, unknown>): StoredNotification | null {
  const id = pickId(raw);
  if (!id) return null;
  const targetType = (raw.targetType as string)?.toLowerCase();
  const tt: NotificationTargetType =
    targetType === "role"
      ? "role"
      : targetType === "users"
        ? "users"
        : "all";
  return {
    id,
    title: String(raw.title ?? ""),
    message: textFromApi(raw),
    targetType: tt,
    targetRole:
      typeof raw.targetRole === "string" ? raw.targetRole : undefined,
    targetUserIds: Array.isArray(raw.targetUserIds)
      ? (raw.targetUserIds as string[])
      : undefined,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

function mapApiToUserNotification(
  raw: Record<string, unknown>
): UserNotification | null {
  const id = pickId(raw);
  if (!id) return null;
  return {
    _id: id,
    title: String(raw.title ?? ""),
    message: textFromApi(raw),
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    isRead: Boolean(raw.isRead ?? raw.read),
  };
}

function extractList(json: Record<string, unknown> | null): unknown[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  const n = json.notifications ?? json.items ?? json.data ?? json.results;
  return Array.isArray(n) ? n : [];
}

export async function fetchNotificationsForUser(
  accessToken: string | null,
  params?: { page?: number; limit?: number; search?: string; read?: boolean }
): Promise<{ ok: boolean; items: UserNotification[]; error?: string }> {
  try {
    const q = new URLSearchParams();
    q.set("page", String(params?.page ?? 1));
    q.set("limit", String(params?.limit ?? 50));
    if (params?.search) q.set("search", params.search);
    if (params?.read !== undefined) {
      q.set("read", params.read ? "true" : "false");
    }
    const res = await fetch(
      `${API_BASE}/api/notifications?${q.toString()}`,
      {
        method: "GET",
        headers: authHeaders(accessToken),
        credentials: "include",
      }
    );
    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        items: [],
        error: err?.message ?? err?.error ?? "Failed to load notifications",
      };
    }
    const json = (await readJsonSafe<Record<string, unknown>>(res)) ?? {};
    const rows = extractList(json);
    const items: UserNotification[] = [];
    for (const row of rows) {
      if (row && typeof row === "object") {
        const m = mapApiToUserNotification(row as Record<string, unknown>);
        if (m) items.push(m);
      }
    }
    return { ok: true, items };
  } catch {
    return {
      ok: false,
      items: [],
      error: "Cannot reach notifications API",
    };
  }
}

/** Admin: list all (large page). */
export async function fetchNotificationsAdmin(
  accessToken: string | null,
  params?: { page?: number; limit?: number; search?: string }
): Promise<{ ok: boolean; items: StoredNotification[]; error?: string }> {
  try {
    const q = new URLSearchParams();
    q.set("page", String(params?.page ?? 1));
    q.set("limit", String(params?.limit ?? 200));
    if (params?.search) q.set("search", params.search);
    const res = await fetch(`${API_BASE}/api/notifications?${q.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        items: [],
        error: err?.message ?? err?.error ?? "Failed to load notifications",
      };
    }
    const json = (await readJsonSafe<Record<string, unknown>>(res)) ?? {};
    const rows = extractList(json);
    const items: StoredNotification[] = [];
    for (const row of rows) {
      if (row && typeof row === "object") {
        const m = mapApiToStored(row as Record<string, unknown>);
        if (m) items.push(m);
      }
    }
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return { ok: true, items };
  } catch {
    return {
      ok: false,
      items: [],
      error: "Cannot reach notifications API",
    };
  }
}

/** Wire store shape → API (MongoDB expects `title` + `body`). */
function toNotificationApiBody(
  input: Omit<StoredNotification, "id" | "createdAt" | "updatedAt">
): Record<string, unknown> {
  return {
    title: input.title,
    body: input.message,
    targetType: input.targetType,
    ...(input.targetType === "role" &&
      input.targetRole && { targetRole: input.targetRole }),
    ...(input.targetType === "users" &&
      input.targetUserIds?.length && { targetUserIds: input.targetUserIds }),
  };
}

function toNotificationPatchBody(
  input: Partial<Omit<StoredNotification, "id" | "createdAt">>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (input.title !== undefined) out.title = input.title;
  if (input.message !== undefined) out.body = input.message;
  if (input.targetType !== undefined) out.targetType = input.targetType;
  if (input.targetRole !== undefined) out.targetRole = input.targetRole;
  if (input.targetUserIds !== undefined)
    out.targetUserIds = input.targetUserIds;
  return out;
}

export async function createNotificationApi(
  accessToken: string | null,
  body: Omit<StoredNotification, "id" | "createdAt" | "updatedAt">
): Promise<{ ok: boolean; item?: StoredNotification; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      method: "POST",
      headers: authHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(toNotificationApiBody(body)),
    });
    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        error: err?.message ?? err?.error ?? "Create failed",
      };
    }
    const json = (await readJsonSafe<Record<string, unknown>>(res)) ?? {};
    const raw =
      (json.notification as Record<string, unknown>) ??
      (json.data as Record<string, unknown>) ??
      json;
    const item = mapApiToStored(raw);
    return item ? { ok: true, item } : { ok: true };
  } catch {
    return { ok: false, error: "Create request failed" };
  }
}

export async function updateNotificationApi(
  accessToken: string | null,
  id: string,
  body: Partial<
    Omit<StoredNotification, "id" | "createdAt">
  >
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE}/api/notifications/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: authHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify(toNotificationPatchBody(body)),
      }
    );
    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        error: err?.message ?? err?.error ?? "Update failed",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Update request failed" };
  }
}

export async function deleteNotificationApi(
  accessToken: string | null,
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE}/api/notifications/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: authHeaders(accessToken),
        credentials: "include",
      }
    );
    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        error: err?.message ?? err?.error ?? "Delete failed",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Delete request failed" };
  }
}

/**
 * Mark notifications as read — matches backend:
 * PATCH /api/notifications/{notificationId}/read
 */
export async function markNotificationsReadApi(
  accessToken: string | null,
  notificationIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  if (!notificationIds.length) return { ok: true };
  try {
    for (const id of notificationIds) {
      const res = await fetch(
        `${API_BASE}/api/notifications/${encodeURIComponent(id)}/read`,
        {
          method: "PATCH",
          headers: authHeaders(accessToken),
          credentials: "include",
        }
      );
      if (!res.ok && res.status !== 204) {
        const err = await readJsonSafe<ErrorResponse>(res);
        return {
          ok: false,
          error: err?.message ?? err?.error ?? "Mark read failed",
        };
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Mark read request failed" };
  }
}

/**
 * Send reminder from a notification — matches backend:
 * POST /api/notifications/{notificationId}/remind
 */
export async function sendReminderApi(
  accessToken: string | null,
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE}/api/notifications/${encodeURIComponent(id)}/remind`,
      {
        method: "POST",
        headers: authHeaders(accessToken),
        credentials: "include",
      }
    );
    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        error: err?.message ?? err?.error ?? "Reminder failed",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Reminder request failed" };
  }
}

/** GET /api/reminders — use when you add a reminders UI. */
export async function fetchReminders(
  accessToken: string | null
): Promise<{ ok: boolean; items: unknown[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reminders`, {
      method: "GET",
      headers: authHeaders(accessToken),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        items: [],
        error: err?.message ?? err?.error ?? "Failed to load reminders",
      };
    }
    const json = (await readJsonSafe<Record<string, unknown>>(res)) ?? {};
    const rows = extractList(json);
    return { ok: true, items: rows };
  } catch {
    return { ok: false, items: [], error: "Reminders request failed" };
  }
}

/** PATCH /api/reminders/{reminderId}/read */
export async function markReminderReadApi(
  accessToken: string | null,
  reminderId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE}/api/reminders/${encodeURIComponent(reminderId)}/read`,
      {
        method: "PATCH",
        headers: authHeaders(accessToken),
        credentials: "include",
      }
    );
    if (!res.ok && res.status !== 204) {
      const err = await readJsonSafe<ErrorResponse>(res);
      return {
        ok: false,
        error: err?.message ?? err?.error ?? "Mark reminder read failed",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Mark reminder read request failed" };
  }
}

export function getTargetSummary(notification: StoredNotification): string {
  switch (notification.targetType) {
    case "all":
      return "All users";
    case "role":
      return notification.targetRole
        ? `Role: ${notification.targetRole}`
        : "Role (not set)";
    case "users": {
      const count = notification.targetUserIds?.length ?? 0;
      return count ? `${count} user(s)` : "No users selected";
    }
    default:
      return "—";
  }
}
