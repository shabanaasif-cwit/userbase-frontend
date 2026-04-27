"use client";

import { FC, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  mergeWithPersistedReadState,
  persistReadNotificationIds,
} from "@/lib/notification-read-persistence";
import {
  fetchNotificationsForUser,
  fetchReminders,
  markNotificationsReadApi,
} from "@/lib/notifications-api";
import { isReminderReadForSession } from "@/lib/reminder-read-session";
import {
  ShieldUser,
  BellRing,
  AlarmClock,
  UserRoundKey,
  CircleUserRound,
  LayoutDashboard,
  Images,
  Info,
  PhoneCall,
  LogIn,
  LogOut,
} from "lucide-react";

interface HeaderProps {
  role: string;
  isAuthenticated: boolean;
  userEmail?: string | null;
  accessToken: string | null;
  onLogout: () => void;
}

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
};

const Header: FC<HeaderProps> = ({
  role,
  isAuthenticated,
  userEmail,
  accessToken,
  onLogout,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [activeNotification, setActiveNotification] =
    useState<NotificationItem | null>(null);
  const [reminderCount, setReminderCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !userEmail) {
      setNotifications([]);
      setIsLoadingNotifications(false);
      setNotificationError("");
      return;
    }

    setIsLoadingNotifications(true);
    setNotificationError("");
    const { ok, items, error } = await fetchNotificationsForUser(accessToken, {
      page: 1,
      limit: 30,
    });
    setIsLoadingNotifications(false);

    if (!ok) {
      setNotificationError(error ?? "Could not load notifications");
      setNotifications([]);
      return;
    }

    setNotifications(mergeWithPersistedReadState(items, userEmail));
  }, [accessToken, isAuthenticated, userEmail]);

  const loadReminderCount = useCallback(async () => {
    if (!isAuthenticated || !userEmail) {
      setReminderCount(0);
      return;
    }

    let unread = 0;
    let page = 1;
    let totalPages = 1;

    do {
      const { ok, items, meta } = await fetchReminders(accessToken, {
        page,
        limit: 100,
      });

      if (!ok) return;

      unread += items.filter(
        (item) =>
          item.isRecipient !== false && !isReminderReadForSession(item, userEmail)
      ).length;
      totalPages = meta.totalPages;
      page += 1;
    } while (page <= totalPages);

    localStorage.setItem("reminderUnreadCount", String(unread));
    setReminderCount(unread);
  }, [accessToken, isAuthenticated, userEmail]);

  const handleLogout = () => {
    onLogout();
    router.push("/login");
    setIsMenuOpen(false);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleHeaderItemClick = () => {
    setIsNotificationsOpen(false);
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    setIsNotificationsOpen(false);
    setIsMenuOpen(false);
    router.push(path);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await loadNotifications();
      await loadReminderCount();
    })();

    return () => {
      cancelled = true;
    };
  }, [loadNotifications, loadReminderCount, role]);

  useEffect(() => {
    if (!isAuthenticated || !userEmail) return;
    void loadNotifications();
  }, [isAuthenticated, isNotificationsOpen, loadNotifications, pathname, userEmail]);

  useEffect(() => {
    if (!isAuthenticated || !userEmail) return;
    void loadReminderCount();
  }, [isAuthenticated, loadReminderCount, pathname, userEmail]);

  useEffect(() => {
    const titleByPath: Record<string, string> = {
      "/": "Userbase",
      "/profile": "Profile | Userbase",
      "/dashboard": "Dashboard | Userbase",
      "/notifications": "Notifications | Userbase",
      "/reminders": "Reminders | Userbase",
      "/login": "Login | Userbase",
      "/signup": "Sign Up | Userbase",
      "/admin/dashboard": "Admin Dashboard | Userbase",
      "/admin/users": "Admin Users | Userbase",
      "/admin/notifications": "Admin Notifications | Userbase",
      "/about": "About | Userbase",
      "/gallery": "Gallery | Userbase",
      "/contact": "Contact | Userbase",
      "/support": "Support | Userbase",
      "/privacy": "Privacy Policy | Userbase",
      "/terms": "Terms of Service | Userbase",
    };

    document.title = titleByPath[pathname] ?? "Userbase";
  }, [pathname]);

  useEffect(() => {
    const syncReminderCount = () => {
      const saved = localStorage.getItem("reminderUnreadCount");
      setReminderCount(Number(saved || 0));
    };

    const handleReminderCountUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ count: number }>;
      setReminderCount(customEvent.detail?.count || 0);
    };

    syncReminderCount();

    window.addEventListener("reminder-count-updated", handleReminderCountUpdate);
    window.addEventListener("storage", syncReminderCount);

    return () => {
      window.removeEventListener(
        "reminder-count-updated",
        handleReminderCountUpdate
      );
      window.removeEventListener("storage", syncReminderCount);
    };
  }, []);

  const navLinkClass =
    "inline-flex items-center justify-center transition-all duration-200 hover:scale-110 hover:text-gray-400 hover:underline underline-offset-4";

  const mobileNavItemClass =
    "inline-flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/10";

  const unreadNotifications = notifications.filter((item) => !item.isRead);
  const notificationCount = unreadNotifications.length;
  const viewAllPath = "/notifications";

  const displayCount = useMemo(() => {
    if (notificationCount <= 0) return "0";
    if (notificationCount > 99) return "99+";
    return String(notificationCount);
  }, [notificationCount]);

  const handleOpenNotification = async (item: NotificationItem) => {
    if (userEmail && !item.isRead) {
      await markNotificationsReadApi(accessToken, [item._id]);
      persistReadNotificationIds(userEmail, [item._id]);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
      );
    }

    setActiveNotification({ ...item, isRead: true });
  };

  const handleReadAll = async () => {
    if (userEmail && unreadNotifications.length > 0) {
      const ids = unreadNotifications.map((n) => n._id);
      if (ids.length) {
        await markNotificationsReadApi(accessToken, ids);
        persistReadNotificationIds(userEmail, ids);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    }

    setIsNotificationsOpen(false);
  };

  return (
    <header className="relative z-50 bg-gray-800 p-4 text-white">
      <div className="flex items-center justify-between md:flex-row md:items-center md:justify-between">
        <div className="text-2xl font-bold">
          <Link
            href="/"
            className="flex items-center gap-3 text-white"
            onClick={handleHeaderItemClick}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <ShieldUser className="h-7 w-7 text-white" />
            </span>
            User Management System
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <nav className="hidden md:block">
          <ul className="flex flex-wrap items-center justify-center gap-4 md:justify-start md:gap-6">
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="Profile"
                    title="Profile"
                  >
                    <CircleUserRound className="h-6 w-6" />
                  </Link>
                </li>

                {role === "admin" ? (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className={navLinkClass}
                      onClick={handleHeaderItemClick}
                      aria-label="Admin Dashboard"
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard />
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      href="/dashboard"
                      className={navLinkClass}
                      onClick={handleHeaderItemClick}
                      aria-label="Dashboard"
                      title="Dashboard"
                    >
                      <LayoutDashboard />
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    href="/gallery"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="Gallery"
                    title="Gallery"
                  >
                    <Images />
                  </Link>
                </li>

                <li>
                  <Link
                    href="/contact"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="Contact"
                    title="Contact"
                  >
                    <PhoneCall />
                  </Link>
                </li>

                <li>
                  <Link
                    href="/about"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="About"
                    title="About"
                  >
                    <Info />
                  </Link>
                </li>

                <li className="relative">
                  {/* desktop only */}
                      <button
                        type="button"
                        className={`${navLinkClass} relative`}
                        onClick={() => setIsNotificationsOpen((prev) => !prev)}
                        aria-label="Notifications"
                        title="Notifications"
                      >
                        <span className="relative inline-flex items-center justify-center">
                          <BellRing className="cursor-pointer" />
                          {notificationCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                              {displayCount}
                            </span>
                          )}
                        </span>
                      </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 z-[100] mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-white/15 bg-[#0f172a] p-4 text-sm text-slate-200 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Notifications
                        </p>
                        <div className="flex items-center gap-3">
                          {unreadNotifications.length > 0 && (
                            <button
                              type="button"
                              onClick={handleReadAll}
                              className="cursor-pointer text-xs text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                            >
                              Read all
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="cursor-pointer text-xs text-slate-400 hover:text-white"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-3">
                        {notificationError && (
                          <p className="text-xs text-rose-300">
                            {notificationError}
                          </p>
                        )}

                        {isLoadingNotifications ? (
                          <p className="text-xs text-slate-300">
                            Loading updates...
                          </p>
                        ) : notificationCount === 0 ? (
                          <p className="text-xs text-slate-300">
                            No new notifications.
                          </p>
                        ) : (
                          unreadNotifications.slice(0, 3).map((item) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => handleOpenNotification(item)}
                              className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                            >
                              <p className="text-sm font-semibold text-white">
                                {item.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-300">
                                {item.message}
                              </p>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                        <button
                          type="button"
                          onClick={() => handleNavigate(viewAllPath)}
                          className="cursor-pointer text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                        >
                          View all
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavigate("/reminders")}
                          className="cursor-pointer text-amber-300 hover:text-amber-200 hover:underline underline-offset-4"
                        >
                          Reminders
                        </button>

                        {role === "admin" && (
                          <button
                            type="button"
                            onClick={() => handleNavigate("/admin/notifications")}
                            className="cursor-pointer text-slate-300 hover:text-white hover:underline underline-offset-4"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>

                <li>
                  <Link
                    href="/reminders"
                    className={`${navLinkClass} relative`}
                    onClick={handleHeaderItemClick}
                    aria-label="Reminders"
                    title="Reminders"
                  >
                    <AlarmClock />
                    {reminderCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                        {reminderCount > 99 ? "99+" : reminderCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="Dashboard"
                    title="Dashboard"
                  >
                    <LayoutDashboard />
                  </Link>
                </li>

                <li>
                  <Link
                    href="/gallery"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="Gallery"
                    title="Gallery"
                  >
                    <Images />
                  </Link>
                </li>

                <li>
                  <Link
                    href="/contact"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="Contact"
                    title="Contact"
                  >
                    <PhoneCall />
                  </Link>
                </li>

                <li>
                  <Link
                    href="/about"
                    className={navLinkClass}
                    onClick={handleHeaderItemClick}
                    aria-label="About"
                    title="About"
                  >
                    <Info />
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="hidden justify-center md:flex md:justify-end">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut />
            </button>
          ) : (
            <div className="flex w-full items-center justify-center gap-3 md:w-auto md:justify-end">
              <Link
                href="/login"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                aria-label="Login"
                title="Login"
              >
                <LogIn />
              </Link>
              <Link
                href="/signup"
                className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                aria-label="Sign up"
                title="Sign up"
              >
                <UserRoundKey />
              </Link>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="mt-4 space-y-4 md:hidden">
          <nav>
            <ul className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="Profile"
                      title="Profile"
                    >
                      <CircleUserRound className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </li>

                  {role === "admin" ? (
                    <li>
                      <Link
                        href="/admin/dashboard"
                        className={mobileNavItemClass}
                        onClick={handleMenuClose}
                        aria-label="Admin Dashboard"
                        title="Admin Dashboard"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link
                        href="/dashboard"
                        className={mobileNavItemClass}
                        onClick={handleMenuClose}
                        aria-label="Dashboard"
                        title="Dashboard"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      href="/gallery"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="Gallery"
                      title="Gallery"
                    >
                      <Images className="h-4 w-4" />
                      <span>Gallery</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/contact"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="Contact"
                      title="Contact"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Contact</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/about"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="About"
                      title="About"
                    >
                      <Info className="h-4 w-4" />
                      <span>About</span>
                    </Link>
                  </li>

                  <li>
                   {/* mobile only */}
                    <button
                      type="button"
                      className="inline-flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:border-white/20 hover:bg-white/10"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                    >
                      <span className="relative inline-flex items-center justify-center">
                        <BellRing className="h-4 w-4 cursor-pointer" />
                        {notificationCount > 0 && (
                          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                            {displayCount}
                          </span>
                        )}
                      </span>
                      <span>Notifications</span>
                    </button>   

                    {isNotificationsOpen && (
                      <div className="relative z-[100] mt-3 rounded-xl border border-white/15 bg-[#0f172a] p-4 text-xs text-slate-200 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                        <div className="flex items-center justify-between gap-2 pb-2">
                          <span className="text-slate-400">Notifications</span>
                          <div className="flex items-center gap-3">
                            {unreadNotifications.length > 0 && (
                              <button
                                type="button"
                                onClick={handleReadAll}
                                className="cursor-pointer text-xs text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                              >
                                Read all
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setIsNotificationsOpen(false)}
                              className="cursor-pointer text-xs text-slate-400 hover:text-white"
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        {notificationError && (
                          <p className="text-rose-300">{notificationError}</p>
                        )}

                        {isLoadingNotifications ? (
                          <p className="text-slate-300">Loading updates...</p>
                        ) : notificationCount === 0 ? (
                          <p className="text-slate-300">No new notifications.</p>
                        ) : (
                          <div className="space-y-3">
                            {unreadNotifications.slice(0, 3).map((item) => (
                              <button
                                key={item._id}
                                type="button"
                                onClick={() => handleOpenNotification(item)}
                                className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                              >
                                <p className="text-sm font-semibold text-white">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-300">
                                  {item.message}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex flex-col gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => handleNavigate(viewAllPath)}
                            className="text-left text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                          >
                            View all
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNavigate("/reminders")}
                            className="text-left text-amber-300 hover:text-amber-200 hover:underline underline-offset-4"
                          >
                            Reminders
                          </button>

                          {role === "admin" && (
                            <button
                              type="button"
                              onClick={() => handleNavigate("/admin/notifications")}
                              className="text-left text-slate-300 hover:text-white hover:underline underline-offset-4"
                            >
                              Manage notifications
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>

                  <li>
                    {/* mobile only */}
                    <Link
                      href="/reminders"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="Reminders"
                      title="Reminders"
                    >
                      <span className="relative inline-flex items-center justify-center">
                        <AlarmClock className="h-4 w-4" />
                        {reminderCount > 0 && (
                          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                            {reminderCount > 99 ? "99+" : reminderCount}
                          </span>
                        )}
                      </span>

                      <span>Reminders</span>
                    </Link>
                  </li>   
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/dashboard"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="Dashboard"
                      title="Dashboard"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/gallery"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="Gallery"
                      title="Gallery"
                    >
                      <Images className="h-4 w-4" />
                      <span>Gallery</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/contact"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="Contact"
                      title="Contact"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Contact</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/about"
                      className={mobileNavItemClass}
                      onClick={handleMenuClose}
                      aria-label="About"
                      title="About"
                    >
                      <Info className="h-4 w-4" />
                      <span>About</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
                  onClick={handleMenuClose}
                  aria-label="Login"
                  title="Login"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2 text-center text-white hover:bg-emerald-700"
                  onClick={handleMenuClose}
                  aria-label="Sign up"
                  title="Sign up"
                >
                  <UserRoundKey className="h-4 w-4" />
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

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

              <button
                type="button"
                onClick={() => setActiveNotification(null)}
                className="cursor-pointer rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              {activeNotification.message}
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
