"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, isAdmin } from "@/lib/auth-context";
import {
  fetchNotificationsForUser,
  markNotificationsReadApi,
} from "@/lib/notifications-api";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
};

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Label from the email local part; never returns "" when the address has a non-empty local part. */
function getNameFromEmail(email?: string | null) {
  const trimmed = email?.trim();
  if (!trimmed) return "";
  const at = trimmed.indexOf("@");
  const localPart =
    at >= 0 ? trimmed.slice(0, at).trim() : trimmed;
  if (!localPart) return "";
  const spaced = localPart.replace(/[._-]+/g, " ").trim();
  const fromSpaced = spaced ? toTitleCase(spaced) : "";
  if (fromSpaced) return fromSpaced;
  return toTitleCase(localPart);
}

function getDisplayName(name?: string | null, email?: string | null) {
  if (name?.trim()) return toTitleCase(name.trim());

  const fromEmail = getNameFromEmail(email);
  if (fromEmail) return fromEmail;
  return "User";
}

function getInitials(name?: string | null, email?: string | null) {
  const displayName = getDisplayName(name, email);
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return "U";
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isReady, role, accessToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeNotification, setActiveNotification] =
    useState<NotificationItem | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setNotifications([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { ok, items } = await fetchNotificationsForUser(accessToken, {
        page: 1,
        limit: 20,
      });
      if (!cancelled && ok) setNotifications(items);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email, role, accessToken]);

  const profile = user
    ? { id: "", firstName: user.firstName ?? "", lastName: user.lastName ?? "", email: user.email, role }
    : null;
  const admin = isAdmin(role);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <p>Loading...</p>
      </div>
    );
  }

  const initials = getInitials(profile?.firstName || profile?.lastName, profile?.email);
   // Use firstName and lastName if available
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : getDisplayName(profile?.firstName || profile?.lastName, profile?.email);  // Fallback to the old method if firstName/lastName are not available.

  const viewAllPath = admin ? "/admin/notifications" : "/notifications";
  const unreadNotifications = notifications.filter((item) => !item.isRead);


  return (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.18),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(56,189,248,0.16),_transparent_45%),linear-gradient(160deg,_#020617,_#0f172a_45%,_#020617)] font-sans text-white">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_35px_120px_-70px_rgba(56,189,248,0.8)]">
          <div className="pointer-events-none absolute -top-20 right-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 left-4 h-56 w-56 rounded-full bg-emerald-400/20 blur-[90px]" />
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
            User Profile
          </p>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/90 via-sky-400/80 to-emerald-300/80 text-2xl font-semibold text-slate-900 shadow-lg shadow-cyan-400/40">
                  {initials}
                </div>
                <div>
                  <CardTitle className="text-3xl">
                    {displayName}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-300">
                    {profile
                      ? `${profile.role} · ${profile.email}`
                      : "A modern snapshot of who you are and what you do."}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[{ label: "Active workspaces", value: "04" }, { label: "Automation score", value: "92%" }, { label: "Focus streak", value: "18 days" }].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                Verified identity
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                {["Zero-trust ready", "SLA: 99.9%", "SOC2 aligned"].map((badge) => (
                  <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{badge}</span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button className="cursor-pointer bg-cyan-400 text-slate-900 hover:bg-cyan-300">Jump to dashboard</Button>
                </Link>
                {admin && (
                  <Link href="/admin/dashboard">
                    <Button className="cursor-pointer" variant="secondary">Admin dashboard</Button>
                  </Link>
                )}
                <Link href="/support">
                  <Button className="cursor-pointer" variant="secondary">Request support</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
                Signal feed
              </p>
              <CardTitle className="text-2xl">Recent Activity</CardTitle>
              <p className="text-sm text-slate-300">
                The pulse of your workspace, surfaced in one view.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Notifications
                  </p>
                  {unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!user?.email) return;
                        const ids = unreadNotifications.map((n) => n._id);
                        if (ids.length) {
                          await markNotificationsReadApi(accessToken, ids);
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, isRead: true }))
                          );
                        }
                      }}
                      className="text-xs cursor-pointer text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                    >
                      Read all
                    </button>
                  )}
                </div>
                {unreadNotifications.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-300">
                    No new notifications yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {unreadNotifications.slice(0, 3).map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={async () => {
                          if (user?.email && !item.isRead) {
                            await markNotificationsReadApi(accessToken, [
                              item._id,
                            ]);
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n._id === item._id ? { ...n, isRead: true } : n
                              )
                            );
                          }
                          setActiveNotification({ ...item, isRead: true });
                        }}
                        className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                      >
                        <p className="text-sm font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          {item.message}
                        </p>
                        {item.updatedAt && (
                          <span className="mt-1.5 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                            Edited
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-right mt-4">
                  <Link href={viewAllPath}>
                    <Button className="cursor-pointer" variant="secondary">View all</Button>
                  </Link>
                </div>
              </div>
              {[
                {
                  title: "Security posture updated",
                  detail: "New MFA policy applied to all admin roles.",
                  time: "2 hours ago",
                },
                {
                  title: "Team access approved",
                  detail: "Onboarded to Product Ops with editor rights.",
                  time: "Yesterday",
                },
                {
                  title: "Audit exported",
                  detail: "Compliance report generated and shared.",
                  time: "Last week",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                Profile status
              </p>
              <CardTitle className="text-2xl">Account overview</CardTitle>
              <p className="text-sm text-slate-300">
                Clarity on your identity, preferences, and access.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              {profile ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Identity
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="text-sm text-slate-300">{profile.email}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Role:{" "}
                      <span className="text-emerald-200 capitalize">
                        {profile.role}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Preferences
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Weekly digest", "Beta features", "Audit alerts"].map(
                        (pref) => (
                          <span
                            key={pref}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs"
                          >
                            {pref}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Please log in to view your profile.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {activeNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Notification
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {activeNotification.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (user?.email && notifications.length > 0) {
                      const ids = notifications
                        .filter((n) => !n.isRead)
                        .map((n) => n._id);
                      if (ids.length) {
                        await markNotificationsReadApi(accessToken, ids);
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, isRead: true }))
                        );
                      }
                    }
                    setActiveNotification(null);
                  }}
                  className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-sky-400/20 px-3 py-1 text-xs font-medium leading-none text-sky-300 transition hover:border-sky-300/40 hover:text-sky-200"
                >
                  Read all
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNotification(null)}
                  className="cursor-pointer rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              {activeNotification.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}