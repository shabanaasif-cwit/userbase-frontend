"use client";

import type { ReminderItem } from "./notifications-api";

const KEY_PREFIX = "sessionReadReminderIds";

function getStorageKey(userEmail?: string | null) {
  return `${KEY_PREFIX}:${(userEmail ?? "").trim().toLowerCase()}`;
}

function readIds(userEmail?: string | null): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(getStorageKey(userEmail));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function rememberReadReminderId(
  reminderId: string,
  userEmail?: string | null
) {
  if (typeof window === "undefined" || !reminderId) return;

  const ids = new Set(readIds(userEmail));
  ids.add(reminderId);
  sessionStorage.setItem(getStorageKey(userEmail), JSON.stringify([...ids]));
}

export function isReminderReadForSession(
  reminder: ReminderItem,
  userEmail?: string | null
) {
  return reminder.isRead || readIds(userEmail).includes(reminder._id);
}

export function clearReadReminderSession(userEmail?: string | null) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(getStorageKey(userEmail));
}
