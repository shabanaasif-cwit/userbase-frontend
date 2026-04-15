"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  mergeWithPersistedReadState,
  persistReadNotificationIds,
} from "@/lib/notification-read-persistence";
import {
  fetchNotificationsForUser,
  markNotificationsReadApi,
  wasNotificationEdited,
} from "@/lib/notifications-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  LayoutDashboard,
  X,
} from "lucide-react";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
};

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

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isReady, role, accessToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadError, setLoadError] = useState("");
  const [activeNotification, setActiveNotification] =
    useState<NotificationItem | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
  }, [isReady, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.email) {
      setNotifications([]);
      return;
    }
    let cancelled = false;
    setLoadError("");
    (async () => {
      const { ok, items, error } = await fetchNotificationsForUser(
        accessToken,
        { page: 1, limit: 100 }
      );
      if (cancelled) return;
      if (!ok) {
        setLoadError(error ?? "Failed to load");
        setNotifications([]);
        return;
      }
      setNotifications(mergeWithPersistedReadState(items, user.email));
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email, role, accessToken]);

  const handleReadAll = async () => {
    if (user?.email && unreadNotifications.length > 0) {
      const ids = unreadNotifications.map((n) => n._id);
      if (ids.length) {
        await markNotificationsReadApi(accessToken, ids);
        persistReadNotificationIds(user.email, ids);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    }
  };

  const handleOpenNotification = async (item: NotificationItem) => {
    if (user?.email && !item.isRead) {
      await markNotificationsReadApi(accessToken, [item._id]);
      persistReadNotificationIds(user.email, [item._id]);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
      );
    }
    setActiveNotification({ ...item, isRead: true });
  };

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400" />
          <p className="text-sm text-zinc-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-950/98 to-zinc-900" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.08),transparent)]" />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-500/30 via-sky-500/20 to-indigo-500/15 text-sky-300 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/20">
                <Bell className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Your notifications
                </h1>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-400">
                  Stay updated. Open any item to view details or mark everything
                  as read below.
                </p>
                {loadError && (
                  <p className="mt-2 text-sm text-red-400">{loadError}</p>
                )}
                {unreadCount > 0 && (
                  <span className="mt-3 inline-flex items-center rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 shadow-inner ring-1 ring-sky-500/25">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>
            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer shrink-0 border-white/10 bg-white/5 font-medium text-zinc-300 shadow-sm transition hover:border-sky-500/40 hover:bg-sky-500/15 hover:text-sky-200"
                onClick={handleReadAll}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </header>

        {/* List */}
        <Card className="mt-8 overflow-hidden border-white/[0.06] bg-zinc-900/60 shadow-xl shadow-black/20 backdrop-blur-sm">
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-5 sm:px-8">
            <CardTitle className="text-lg font-semibold text-white">
              All notifications
            </CardTitle>
            <CardDescription className="mt-0.5 text-sm text-zinc-500">
              {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-500 ring-1 ring-white/5">
                  <Bell className="h-8 w-8" strokeWidth={1.5} />
                </div>
                <p className="mt-5 text-base font-medium text-zinc-300">
                  No notifications yet
                </p>
                <p className="mt-1.5 max-w-xs text-sm text-zinc-500">
                  When admins send you notifications, they’ll show up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((item) => (
                  <li key={item._id}>
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(item)}
                      className={`
                        group relative flex w-full cursor-pointer items-start gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200
                        sm:px-5
                        ${
                          item.isRead
                            ? "border-white/[0.04] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]"
                            : "border-l-4 border-l-sky-500/60 border-white/[0.06] bg-sky-500/[0.06] hover:border-l-sky-400/80 hover:bg-sky-500/10 hover:shadow-md hover:shadow-sky-500/5"
                        }
                      `}
                    >
                      <span
                        className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                          item.isRead
                            ? "bg-zinc-500"
                            : "bg-sky-400 shadow-sm shadow-sky-400/50"
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                          {item.message}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {wasNotificationEdited(
                            item.createdAt,
                            item.updatedAt
                          ) && (
                            <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 ring-1 ring-amber-500/20">
                              Edited
                            </span>
                          )}
                          <span className="text-xs text-zinc-500">
                            {formatRelative(
                              item.createdAt || item.updatedAt
                            )}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-500 transition-all group-hover:translate-x-0.5 group-hover:text-sky-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/reminders"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200"
          >
            Reminders
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </p>
      </main>

      {/* Detail modal */}
      {activeNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-title"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.02] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Notification
                </p>
                <h2
                  id="notification-title"
                  className="mt-1.5 text-xl font-semibold leading-tight text-white"
                >
                  {activeNotification.title}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 cursor-pointer rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white"
                onClick={() => setActiveNotification(null)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-zinc-300">
                {activeNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}