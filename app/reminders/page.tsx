"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchReminders,
  markReminderReadApi,
  type ReminderItem,
} from "@/lib/notifications-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlarmClock, CheckCheck, LayoutDashboard } from "lucide-react";

function formatRelative(time?: string) {
  if (!time) return "";
  const d = new Date(time);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString(undefined, { dateStyle: "short" });
}

export default function RemindersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isReady, accessToken } = useAuth();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  const load = useCallback(async () => {
    setLoadError("");
    const { ok, items, error } = await fetchReminders(accessToken);
    if (!ok) {
      setLoadError(error ?? "Failed to load reminders");
      setReminders([]);
      return;
    }
    setReminders(items);
  }, [accessToken]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    load();
  }, [isReady, isAuthenticated, load]);

  const handleMarkRead = async (id: string) => {
    setBusyId(id);
    const res = await markReminderReadApi(accessToken, id);
    setBusyId(null);
    if (!res.ok) {
      setLoadError(res.error ?? "Could not mark as read");
      return;
    }
    setReminders((prev) =>
      prev.map((r) => (r._id === id ? { ...r, isRead: true } : r))
    );
  };

  const handleMarkAllRead = async () => {
    const unread = reminders.filter((r) => !r.isRead);
    for (const r of unread) {
      setBusyId(r._id);
      const res = await markReminderReadApi(accessToken, r._id);
      if (!res.ok) {
        setBusyId(null);
        setLoadError(res.error ?? "Could not mark all as read");
        return;
      }
    }
    setBusyId(null);
    setReminders((prev) => prev.map((r) => ({ ...r, isRead: true })));
  };

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
          <p className="text-sm text-zinc-500">Loading reminders...</p>
        </div>
      </div>
    );
  }

  const unreadCount = reminders.filter((r) => !r.isRead).length;

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-950/98 to-zinc-900" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.08),transparent)]" />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/30 via-amber-500/20 to-orange-500/15 text-amber-300 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/20">
                <AlarmClock className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Your reminders
                </h1>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-400">
                  Items sent when an admin uses &quot;Send reminder&quot; on a
                  notification. Mark them read when you are done.
                </p>
                {loadError && (
                  <p className="mt-2 text-sm text-red-400">{loadError}</p>
                )}
                {unreadCount > 0 && (
                  <span className="mt-3 inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/25">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>
            {reminders.some((r) => !r.isRead) && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 cursor-pointer border-white/10 bg-white/5 font-medium text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-200"
                onClick={handleMarkAllRead}
                disabled={busyId !== null}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </header>

        <Card className="mt-8 overflow-hidden border-white/[0.06] bg-zinc-900/60 shadow-xl shadow-black/20 backdrop-blur-sm">
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-5 sm:px-8">
            <CardTitle className="text-lg font-semibold text-white">
              All reminders
            </CardTitle>
            <CardDescription className="mt-0.5 text-sm text-zinc-500">
              {reminders.length} reminder{reminders.length !== 1 ? "s" : ""}
              {user?.email ? ` · ${user.email}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
                <AlarmClock className="h-8 w-8 text-zinc-500" />
                <p className="mt-5 text-base font-medium text-zinc-300">
                  No reminders yet
                </p>
                <p className="mt-1.5 max-w-xs text-sm text-zinc-500">
                  When an admin sends a reminder from a notification, it will
                  appear here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {reminders.map((item) => (
                  <li
                    key={item._id}
                    className={`rounded-xl border px-4 py-4 sm:px-5 ${
                      item.isRead
                        ? "border-white/[0.04] bg-white/[0.02]"
                        : "border-l-4 border-l-amber-500/60 border-white/[0.06] bg-amber-500/[0.06]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {item.title || "Reminder"}
                        </p>
                        {item.body ? (
                          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                            {item.body}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-zinc-500">
                          {formatRelative(item.createdAt)}
                        </p>
                      </div>
                      {!item.isRead && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="shrink-0 cursor-pointer"
                          disabled={busyId === item._id}
                          onClick={() => handleMarkRead(item._id)}
                        >
                          {busyId === item._id ? "Saving…" : "Mark read"}
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="mt-10 flex justify-center gap-4">
          <Link
            href="/notifications"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Notifications
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
