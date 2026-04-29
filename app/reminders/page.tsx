"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  fetchReminders,
  markReminderReadApi,
  type ReminderItem,
  type ReminderListMeta,
} from "@/lib/notifications-api";
import {
  isReminderReadForSession,
  rememberReadReminderId,
} from "@/lib/reminder-read-session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlarmClock,
  ArrowLeft,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
} from "lucide-react";

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

const DEFAULT_PAGINATION: ReminderListMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

function isReminderRead(reminder: ReminderItem, userEmail?: string | null) {
  return isReminderReadForSession(reminder, userEmail);
}

export default function RemindersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isReady, accessToken } = useAuth();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [pagination, setPagination] =
    useState<ReminderListMeta>(DEFAULT_PAGINATION);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">(
    "all"
  );
  const limit = 10;
  
  const updateReminderCount = useCallback(async () => {
    if (!isAuthenticated || !user?.email) {
      setTotalUnreadCount(0);
      localStorage.setItem("reminderUnreadCount", "0");
      window.dispatchEvent(
        new CustomEvent("reminder-count-updated", {
          detail: { count: 0 },
        })
      );
      return;
    }

    let unread = 0;
    let currentPage = 1;
    let totalPages = 1;

    do {
      const { ok, items, meta } = await fetchReminders(accessToken, {
        page: currentPage,
        limit: 100,
      });

      if (!ok) return;

      unread += items.filter(
        (r) => r.isRecipient !== false && !isReminderRead(r, user.email)
      ).length;
      totalPages = meta.totalPages;
      currentPage += 1;
    } while (currentPage <= totalPages);

    setTotalUnreadCount(unread);
    localStorage.setItem("reminderUnreadCount", String(unread));
    window.dispatchEvent(
      new CustomEvent("reminder-count-updated", {
        detail: { count: unread },
      })
    );
  }, [accessToken, isAuthenticated, user?.email]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoadError("");
    setIsLoading(true);
  
    const { ok, items, meta, error } = await fetchReminders(accessToken, {
      page,
      limit,
      search: search || undefined,
      read:
        readFilter === "all" ? undefined : readFilter === "read" ? true : false,
    });
  
    setIsLoading(false);
  
    if (!ok) {
      setLoadError(error ?? "Failed to load reminders");
      setReminders([]);
      setPagination(meta);
      return;
    }
  
    setReminders(items);
    setPagination(meta);
  }, [accessToken, limit, page, readFilter, search]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    void load();
  }, [isReady, isAuthenticated, load]);

  useEffect(() => {
    if (page <= pagination.totalPages) return;
    setPage(pagination.totalPages);
  }, [page, pagination.totalPages]);

  useEffect(() => {
    void updateReminderCount();
  }, [reminders, updateReminderCount]);

  const handleMarkRead = async (id: string) => {
  setBusyId(id);
  const res = await markReminderReadApi(accessToken, id);
  setBusyId(null);

  if (!res.ok) {
    setLoadError(res.error ?? "Could not mark as read");
    return;
  }
  rememberReadReminderId(id, user?.email);

  setReminders((prev) =>
    prev.map((item) =>
      item._id === id ? { ...item, isRead: true } : item
    )
  );
  };

  const handleMarkAllRead = async () => {
    const unread = reminders.filter((r) => !isReminderRead(r, user?.email));

    for (const r of unread) {
      setBusyId(r._id);
      const res = await markReminderReadApi(accessToken, r._id);

      if (!res.ok) {
        setBusyId(null);
        setLoadError(res.error ?? "Could not mark all as read");
        return;
      }
      rememberReadReminderId(r._id, user?.email);
    }

    setBusyId(null);
    await load();
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

  const resultLabel =
    pagination.total === 1 ? "1 reminder" : `${pagination.total} reminders`;

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-950/98 to-zinc-900" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.08),transparent)]" />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
            <div className="flex items-start gap-5">
               <Link
                href="/dashboard"
                className="mb-0 mt-1 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-300/20 bg-white/10">
                  <ArrowLeft className="h-5.0 w-5.5 inline-block ml-0" />
                </span>
              </Link>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/30 via-amber-500/20 to-orange-500/15 text-amber-300 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/20">
                <AlarmClock className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Your Reminders
                </h1>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-400">
                  Items sent when an admin uses "Send reminder" on a
                  notification. Search, filter, and page through them here.
                </p>
                {loadError && (
                  <p className="mt-2 text-sm text-red-400">{loadError}</p>
                )}
                {totalUnreadCount > 0 && (
                  <span className="mt-3 inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/25">
                    {totalUnreadCount} total unread reminders
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <Card className="mt-8 overflow-hidden border-white/[0.06] bg-zinc-900/60 shadow-xl shadow-black/20 backdrop-blur-sm">
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-5 sm:px-8">
            <CardTitle className="text-lg font-semibold text-white">
              All Reminders
            </CardTitle>
            <CardDescription className="mt-0.5 text-sm text-zinc-500">
              {resultLabel}
              {user?.email ? ` - ${user.email}` : ""}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Reminders..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-500/40 focus:bg-white/10"
                />
              </div>

              <select
                value={readFilter}
                onChange={(e) => {
                  setPage(1);
                  setReadFilter(e.target.value as "all" | "unread" | "read");
                }}
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-amber-500/40 focus:bg-white/10"
              >
                <option value="all">All Reminders</option>
                <option value="unread">Unread only</option>
                <option value="read">Read only</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
                  <p className="text-sm text-zinc-500">Loading reminders...</p>
                </div>
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
                <AlarmClock className="h-8 w-8 text-zinc-500" />
                <p className="mt-5 text-base font-medium text-zinc-300">
                  No reminders found
                </p>
                <p className="mt-1.5 max-w-xs text-sm text-zinc-500">
                  {search || readFilter !== "all"
                    ? "Try adjusting the search or filter to see more results."
                    : "When an admin sends a reminder from a notification, it will appear here."}
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {reminders.map((item) => (
                    <li
                      key={item._id}
                      className={`rounded-xl border px-4 py-4 sm:px-5 ${
                        isReminderRead(item, user?.email)
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

                          {user?.role?.toLowerCase() === "admin" && item.createdBy ? (
                            <p className="mt-2 text-xs text-zinc-500">
                              Created by: {item.createdBy}
                            </p>
                          ) : null}

                          <p className="mt-2 text-xs text-zinc-500">
                            {formatRelative(item.createdAt)}
                          </p>
                        </div>

                        {item.isRecipient !== false && !isReminderRead(item, user?.email) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="shrink-0 cursor-pointer"
                              disabled={busyId === item._id}
                              onClick={() => void handleMarkRead(item._id)}
                            >
                              {busyId === item._id ? "Saving..." : "Mark read"}
                            </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Page {pagination.page} of {pagination.totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10"
                      disabled={page <= 1 || isLoading}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10"
                      disabled={page >= pagination.totalPages || isLoading}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(pagination.totalPages, current + 1)
                        )
                      }
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card> 
      </main>
    </div>
  );
}
