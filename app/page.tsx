"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const highlights = [
  {
    title: "Clear roles, fewer surprises",
    description:
      "Design access levels, approvals, and responsibilities without chaos.",
  },
  {
    title: "Onboard in minutes",
    description:
      "Invite teammates, assign roles, and keep them productive from day one.",
  },
  {
    title: "Stay audit-ready",
    description:
      "Track changes and understand who has access, always up to date.",
  },
]

const quickLinks = [
  { label: "About the platform", href: "/about" },
  { label: "Support center", href: "/support" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
]

export default function WelcomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleViewDashboard = () => {
    router.push(isAuthenticated ? "/dashboard" : "/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-zinc-950 to-slate-900 font-sans text-white">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-16 lg:py-24">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-zinc-950 px-8 py-14 shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                Welcome
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Build calm, confident user access
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                Start with the essentials, scale as you grow, and keep every
                team aligned with the right level of access.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" })
                  )}
                >
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={handleViewDashboard}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" })
                  )}
                >
                  View dashboard
                </button>
              </div>
            </div>

            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">First 10 minutes</CardTitle>
                <CardDescription className="text-slate-300">
                  A simple path to a clean launch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 cursor-pointer">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Step 01
                  </p>
                  <p className="mt-2 text-base text-white">
                    Invite your core team
                  </p>
                  <p className="mt-2">
                    Add admins and the leads who manage access.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 cursor-pointer">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Step 02
                  </p>
                  <p className="mt-2 text-base text-white">
                    Define roles and rules
                  </p>
                  <p className="mt-2">
                    Keep permissions small and expand intentionally.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 cursor-pointer">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Step 03
                  </p>
                  <p className="mt-2 text-base text-white">
                    Review the dashboard
                  </p>
                  <p className="mt-2">
                    Track invites, approvals, and activity at a glance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle>Why teams choose us</CardTitle>
              <CardDescription className="text-slate-300">
                Built for clarity, designed for momentum.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <p className="text-base font-medium text-white">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-slate-900 text-white">
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
              <CardDescription className="text-slate-200">
                Everything you need to explore next.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
