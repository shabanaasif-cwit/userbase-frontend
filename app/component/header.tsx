"use client";

import { FC, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellRing, UserRoundKey, CircleUserRound, LayoutDashboard, Images, Info, PhoneCall,LogIn, LogOut   } from 'lucide-react';

interface HeaderProps {
  role: string;
  isAuthenticated: boolean;
  onLogout: () => void;
}

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
};

const Header: FC<HeaderProps> = ({ role, isAuthenticated, onLogout }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [activeNotification, setActiveNotification] =
    useState<NotificationItem | null>(null);

  const handleLogout = () => {
    onLogout();
    router.push("/login");
    setIsMenuOpen(false);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    setIsNotificationsOpen(false);
    setIsMenuOpen(false);
    router.push(path);
  };

  const navLinkClass =
    "hover:text-gray-400 hover:underline underline-offset-4 transition-all duration-200";

  const notificationCount = notifications.filter((item) => !item.isRead).length;
  const viewAllPath = role === "admin" ? "/admin/notifications" : "/dashboard";
  const displayCount = useMemo(() => {
    if (notificationCount <= 0) return "0";
    if (notificationCount > 9) return "9+";
    return String(notificationCount);
  }, [notificationCount]);

  const handleOpenNotification = (item: NotificationItem) => {
    setActiveNotification(item);
    setNotifications((prev) =>
      prev.map((notice) =>
        notice._id === item._id ? { ...notice, isRead: true } : notice
      )
    );
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="flex items-center justify-between md:flex-row md:items-center md:justify-between">
        <div className="text-2xl font-bold">
          <Link href="/" className="flex items-center gap-3 text-white" onClick={handleMenuClose}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 text-white"
              >
                <path
                  fill="currentColor"
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.86 0-7 2-7 4.5V20h14v-1.5c0-2.5-3.14-4.5-7-4.5z"
                />
              </svg>
            </span>
            UMS
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
                      aria-label="Admin dashboard"
                      title="Admin dashboard"
                    >
                      <LayoutDashboard />

                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      href="/dashboard"
                      className={navLinkClass}
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
                    aria-label="About"
                    title="About"
                  >
                    <Info />
                  </Link>
                </li>
                <li className="relative">
                  <button
                    type="button"
                    className="relative inline-flex items-center gap-2"
                    onClick={() => setIsNotificationsOpen((prev) => !prev)}
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <BellRing className="cursor-pointer" />
                    {notificationCount > 0 && (
                      <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                        {displayCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 rounded-xl border border-white/10 bg-slate-950 p-4 text-sm text-slate-200 shadow-xl">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Notifications
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="cursor-pointer text-xs text-slate-400 hover:text-white"
                        >
                          Close
                        </button>
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
                          notifications.slice(0, 3).map((item) => (
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

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                        <button
                          type="button"
                          onClick={() => handleNavigate(viewAllPath)}
                          className="text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                        >
                          View all
                        </button>
                        {role === "admin" && (
                          <button
                            type="button"
                            onClick={() => handleNavigate("/admin/notifications")}
                            className="text-slate-300 hover:text-white hover:underline underline-offset-4"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className={navLinkClass}
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

        <div className="hidden md:flex justify-center md:justify-end">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="cursor-pointer bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut />
            </button>
          ) : (
            <div className="flex w-full items-center justify-center gap-3 md:w-auto md:justify-end">
              <Link
                href="/login"
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                aria-label="Login"
                title="Login"
              >
                <LogIn />
              </Link>
              <Link
                href="/signup"
                className="bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700"
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
                      className={navLinkClass}
                      onClick={handleMenuClose}
                      aria-label="Profile"
                      title="Profile"
                    >
                      <CircleUserRound  className="h-4 w-4" />
                    </Link>
                  </li>
                  {role === "admin" ? (
                    <li>
                      <Link
                        href="/admin/dashboard"
                        className={navLinkClass}
                        onClick={handleMenuClose}
                        aria-label="Admin dashboard"
                        title="Admin dashboard"
                      >
                      <LayoutDashboard />

                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link
                        href="/dashboard"
                        className={navLinkClass}
                        onClick={handleMenuClose}
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
                      onClick={handleMenuClose}
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
                      onClick={handleMenuClose}
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
                      onClick={handleMenuClose}
                      aria-label="About"
                      title="About"
                    >
                      <Info />
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-left"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                    >
                      <BellRing className="cursor-pointer" />
                      <span>Notifications</span>
                      {notificationCount > 0 && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {displayCount}
                        </span>
                      )}
                    </button>
                    {isNotificationsOpen && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-slate-950 p-4 text-xs text-slate-200">
                        {notificationError && (
                          <p className="text-rose-300">{notificationError}</p>
                        )}
                        {isLoadingNotifications ? (
                          <p className="text-slate-300">Loading updates...</p>
                        ) : notificationCount === 0 ? (
                          <p className="text-slate-300">No new notifications.</p>
                        ) : (
                          <div className="space-y-3">
                            {notifications.slice(0, 3).map((item) => (
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
                            className="text-sky-300 hover:text-sky-200 hover:underline underline-offset-4 text-left"
                          >
                            View all
                          </button>
                          {role === "admin" && (
                            <button
                              type="button"
                              onClick={() => handleNavigate("/admin/notifications")}
                              className="text-slate-300 hover:text-white hover:underline underline-offset-4 text-left"
                            >
                              Manage notifications
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                </>
              ) : (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className={navLinkClass}
                    onClick={handleMenuClose}
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
                    onClick={handleMenuClose}
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
                    onClick={handleMenuClose}
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
                    onClick={handleMenuClose}
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

          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="cursor-pointer bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                aria-label="Logout"
                title="Logout"
              >
                    <LogOut />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
                  onClick={handleMenuClose}
                  aria-label="Login"
                  title="Login"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 text-center"
                  onClick={handleMenuClose}
                  aria-label="Sign up"
                  title="Sign up"
                >
                  <UserRoundKey />
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
