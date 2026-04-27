"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Bell, Users, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/dashboard"
          className="mb-2 mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.18)] transition hover:border-emerald-300/30 hover:bg-emerald-500/15 hover:text-emerald-100"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-300/20 bg-white/10">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          Back to Dashboard
        </Link>
        {/* Hero: compact and modern */}
        <header className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-800/90 via-zinc-900/50 to-transparent px-6 py-10 sm:px-8 sm:py-12">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative">
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/10 blur-3xl" />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-zinc-500">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-base text-zinc-400">
              Manage users, roles, and system settings. This area is only
              visible to users with the admin role.
            </p>
            {user?.email && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Signed in as{" "}
                <Link
                  href="/profile"
                  className="cursor-pointer font-medium text-white transition hover:text-sky-300"
                >
                  {user.email}
                </Link>
              </p>
            )}
          </div>
        </header>

        {/* Two primary actions: bento-style cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href="/admin/notifications"
            className="group block transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <Card className="h-full border-white/10 bg-white/[0.03] transition-all duration-200 hover:border-sky-500/30 hover:bg-white/[0.06]">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
                  <Bell className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg text-white group-hover:text-sky-200">
                    Notifications
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-zinc-400">
                    Manage and send notifications to users.
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-sky-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-sm font-medium text-sky-400 group-hover:text-sky-300">
                  Go to Notifications <ArrowRight className="h-4 w-4 inline-block ml-0"/>
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/admin/users"
            className="group block transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <Card className="h-full border-white/10 bg-white/[0.03] transition-all duration-200 hover:border-emerald-500/30 hover:bg-white/[0.06]">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                  <Users className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg text-white group-hover:text-emerald-200">
                    User management
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-zinc-400">    
                    View and manage user accounts: Roles and Status.
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                  Go to User management <ArrowRight className="h-4 w-4 inline-block ml-0"/>
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>

      </main>
    </div>
  );
}
