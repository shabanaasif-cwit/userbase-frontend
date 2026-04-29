"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  mergeWithPersistedReadState,
  NOTIFICATION_READ_UPDATED_EVENT,
} from "@/lib/notification-read-persistence"
import { isReminderReadForSession } from "@/lib/reminder-read-session"
import {
  fetchReminders,
  fetchNotificationsForUser,
  type ReminderItem,
  wasNotificationEdited,
} from "@/lib/notifications-api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type NotificationItem = {
  _id: string
  title: string
  message: string
  startsAt?: string | null
  endsAt?: string | null
  createdAt?: string
  updatedAt?: string
  isRead?: boolean
}

const activity = [
  { name: "Ayesha Khan", action: "Role updated", time: "2m ago" },
  { name: "Dev Team", action: "New invite", time: "18m ago" },
  { name: "Ops Admin", action: "Password reset", time: "1h ago" },
  { name: "Marketing", action: "Access approved", time: "3h ago" },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isReady, role, accessToken } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState("")
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([])
  const [reminderSummary, setReminderSummary] = useState({ total: 0, unread: 0 })

  const loadNotifications = useCallback(async () => {
    if (!user?.email) {
      setNotifications([])
      setIsLoadingNotifications(false)
      setNotificationError("")
      return
    }

    setIsLoadingNotifications(true)
    setNotificationError("")

    const { ok, items, error } = await fetchNotificationsForUser(
      accessToken,
      { page: 1, limit: 20 }
    )

    setIsLoadingNotifications(false)

    if (!ok) {
      setNotificationError(error ?? "Could not load notifications")
      setNotifications([])
      return
    }

    setNotifications(mergeWithPersistedReadState(items, user.email))
  }, [accessToken, user?.email])

  const loadReminderSummary = useCallback(async () => {
    if (!user?.email) {
      setReminderSummary({ total: 0, unread: 0 })
      return
    }

    let total = 0
    let unread = 0
    let page = 1
    let totalPages = 1

    do {
      const { ok, items, meta } = await fetchReminders(accessToken, {
        page,
        limit: 100,
      })

      if (!ok) return

      const eligibleItems = items.filter(
        (item: ReminderItem) => item.isRecipient !== false
      )

      total += eligibleItems.length
      unread += eligibleItems.filter(
        (item) => !isReminderReadForSession(item, user.email)
      ).length
      totalPages = meta.totalPages
      page += 1
    } while (page <= totalPages)

    setReminderSummary({ total, unread })
  }, [accessToken, user?.email])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (cancelled) return
      await loadNotifications()
      if (cancelled) return
      await loadReminderSummary()
    })()
    return () => {
      cancelled = true
    }
  }, [loadNotifications, loadReminderSummary, role])

  const activeNotification = useMemo(() => {
    return notifications.find(
      (item) =>
        !item.isRead && !dismissedNotificationIds.includes(item._id)
    ) || null
  }, [notifications, dismissedNotificationIds])

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead),
    [notifications]
  )
  const statsNotificationSummary = useMemo(() => {
    const total = notifications.length
    const read = notifications.filter((item) => item.isRead).length
    return { total, read }
  }, [notifications])
  const totalNotifications = statsNotificationSummary.total
  const readNotifications = statsNotificationSummary.read
  const totalReminders = reminderSummary.total
  const readReminders = totalReminders - reminderSummary.unread

  const stats = [
    {
      label: "Total Notifications",
      value: String(totalNotifications),
      note: `${unreadNotifications.length} unread`,
    },
    {
      label: "Read Notifications",
      value: String(readNotifications),
      note: `${totalNotifications} total`,
    },
    {
      label: "Total reminders",
      value: String(totalReminders),
      note: `${reminderSummary.unread} unread`,
    },
    {
      label: "Read Reminders",
      value: String(readReminders),
      note: `${totalReminders} total`,
    },
  ]

  useEffect(() => {
    if (!isReady) return
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [isReady, isAuthenticated, router])

  useEffect(() => {
    if (!activeNotification) return
    const timer = window.setTimeout(() => {
      setDismissedNotificationIds((prev) =>
        prev.includes(activeNotification._id)
          ? prev
          : [...prev, activeNotification._id]
      )
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [activeNotification])

  useEffect(() => {
    if (!user?.email) return

    const syncNotifications = () => {
      void loadNotifications()
    }

    const syncReminders = () => {
      void loadReminderSummary()
    }

    window.addEventListener(NOTIFICATION_READ_UPDATED_EVENT, syncNotifications)
    window.addEventListener("reminder-count-updated", syncReminders)
    window.addEventListener("storage", syncNotifications)
    window.addEventListener("storage", syncReminders)

    return () => {
      window.removeEventListener(NOTIFICATION_READ_UPDATED_EVENT, syncNotifications)
      window.removeEventListener("reminder-count-updated", syncReminders)
      window.removeEventListener("storage", syncNotifications)
      window.removeEventListener("storage", syncReminders)
    }
  }, [loadNotifications, loadReminderSummary, user?.email])

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        {notificationError && (
          <Alert className="mb-6 border-amber-500/30 bg-amber-500/10 text-amber-100">
            <AlertTitle>Notifications</AlertTitle>
            <AlertDescription>{notificationError}</AlertDescription>
          </Alert>
        )}

        {isLoadingNotifications ? (
          <Alert className="mb-6 border-white/10 bg-white/5 text-white">
            <AlertTitle>Notifications</AlertTitle>
            <AlertDescription>Loading updates...</AlertDescription>
          </Alert>
        ) : activeNotification ? (
          <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
            <AlertTitle>{activeNotification.title}</AlertTitle>
            <AlertDescription>{activeNotification.message}</AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-white/10 bg-white/5 text-white">
            <AlertTitle>Notifications</AlertTitle>
            <AlertDescription>No new updates right now.</AlertDescription>
          </Alert>
        )}

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-8 py-14 shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Welcome
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                User Management System
              </h1>
              <p className="mt-4 text-lg text-zinc-300">
                Orchestrate users, roles, and permissions with a calm, focused
                interface built for clarity.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Get Started
                </Link>
                
                <Dialog>
                  <DialogTrigger
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "lg" }),
                        "cursor-pointer"
                    )}
                  >
                    Quick tour
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 text-white">
                    <DialogHeader>
                      <DialogTitle>Quick tour</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        A 30-second overview of the core workflow.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-zinc-300">
                      <p>1. Invite users and assign a default role.</p>
                      <p>2. Configure access rules per team.</p>
                      <p>3. Review activity in real time.</p>
                    </div>
                    <DialogFooter>
                      <DialogClose
                        className={cn(
                          buttonVariants({ variant: "secondary"}),
                            "cursor-pointer"
                        )}
                      >
                        Got it
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              {stats.map((item) => (
                <Card
                  key={item.label}
                  className="border-white/10 bg-white/5 text-white"
                >
                  <CardHeader>
                    <CardDescription className="text-zinc-400">
                      {item.label}
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold">
                      {item.value}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-emerald-300">
                    {item.note}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-1">
          <Card className="border-white/10 bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-emerald-500/20 text-white">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription className="text-zinc-300">
                Updates tailored to your role, groups, and account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-zinc-200">
              {isLoadingNotifications ? (
                <p className="text-zinc-300">Loading updates...</p>
              ) : unreadNotifications.length === 0 ? (
                <p className="text-zinc-300">No notifications available.</p>
              ) : (
                unreadNotifications.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <p className="text-base font-medium text-white">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-zinc-200">
                      {item.message}
                    </p>
                    {wasNotificationEdited(
                      item.createdAt,
                      item.updatedAt
                    ) && (
                      <span className="mt-2 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                        Edited
                      </span>
                    )}
                  </div>
                ))
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={role === "admin" ? "/admin/notifications" : "/notifications"}
                  className={cn(
                    "text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline underline-offset-4"
                  )}
                >
                  View all
                </Link>
                <Link
                  href="/support"
                  className={cn(buttonVariants({ variant: "secondary" }))}
                >
                  Need help?
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
