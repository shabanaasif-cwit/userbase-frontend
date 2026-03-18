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

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <main className="mx-auto w-full max-w-6xl px-6 py-20">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-8 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Manage users, roles, and system settings. This area is only visible
            to users with the admin role.
          </p>
          {user?.email && (
            <p className="mt-2 text-sm text-zinc-400">
              Signed in as <span className="text-white">{user.email}</span>
              {user.name && ` (${user.name})`}
            </p>
          )}
        </section>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription className="text-slate-300">
                Manage and send notifications to users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/notifications"
                className="text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline"
              >
                Go to Notifications →
              </Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>User management</CardTitle>
              <CardDescription className="text-slate-300">
                View and manage user accounts: roles and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/users"
                className="text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline"
              >
                Go to User management →
              </Link>
            </CardContent>
          </Card>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/dashboard" className="text-sky-400 hover:underline">
            ← Back to Dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
