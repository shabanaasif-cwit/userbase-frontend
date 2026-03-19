"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getNotificationsForUser, markNotificationsAsRead } from "@/lib/notifications-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isReady, role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
  }, [isReady, isAuthenticated, router]);

  useEffect(() => {
    if (user?.email) {
      setNotifications(getNotificationsForUser(user.email, role));
    } else {
      setNotifications([]);
    }
  }, [user?.email, role]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-400">
        <p>Loading...</p>
      </div>
    );
  }

  const handleReadAll = () => {
    if (user?.email && notifications.length > 0) {
      markNotificationsAsRead(user.email, notifications.map((n) => n._id));
      setNotifications(getNotificationsForUser(user.email, role));
    }
  };

  const handleOpenNotification = (item: NotificationItem) => {
    if (user?.email) {
      markNotificationsAsRead(user.email, [item._id]);
      setNotifications(getNotificationsForUser(user.email, role));
    }
    setActiveNotification(item);
  };

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6 py-10 sm:px-8 sm:py-12">
          <div className="flex items-center gap-2 text-zinc-400">
            <Bell className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">
              Notifications
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your notifications
          </h1>
          <p className="mt-2 max-w-lg text-zinc-400">
            All notifications for your account. Mark as read or open to view details.
          </p>
        </section>

        <Card className="mt-10 border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-white">All notifications</CardTitle>
              <CardDescription className="text-zinc-400">
                {notifications.length} notification(s)
              </CardDescription>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
                onClick={handleReadAll}
              >
                Read all
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-white/5 py-12 text-center text-zinc-400">
                No notifications yet.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleOpenNotification(item)}
                    className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                  >
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-300 line-clamp-2">
                      {item.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.updatedAt && (
                        <span className="inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                          Edited
                        </span>
                      )}
                      {item.isRead && (
                        <span className="text-xs text-zinc-500">Read</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-sm text-zinc-500">
          <Link href="/dashboard" className="cursor-pointer text-sky-400 hover:underline">
            ← Back to Dashboard
          </Link>
        </p>
      </main>

      {activeNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Notification
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {activeNotification.title}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-zinc-400 hover:text-white"
                onClick={() => setActiveNotification(null)}
              >
                Close
              </Button>
            </div>
            <p className="mt-4 text-sm text-zinc-300">
              {activeNotification.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
