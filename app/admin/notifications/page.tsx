"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminNotificationsPage() {
  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <main className="mx-auto w-full max-w-6xl px-6 py-20">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-8 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Manage Notifications
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Create and manage notifications for users. This page is only
            accessible to admins.
          </p>
        </section>

        <Card className="mt-10 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription className="text-slate-300">
              List and manage notifications (UI placeholder; connect to
              backend when available).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">
              No notifications yet. Backend integration can be added here.
            </p>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/admin/dashboard" className="text-sky-400 hover:underline">
            ← Back to Admin Dashboard
          </Link>
        </p>
      </main>
    </div>
  );
}
