import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PageShell from "../component/page-shell"
import { Target, Layers, Shield, Users } from "lucide-react"

export const revalidate = 86400

export const metadata = {
  title: "About | Userbase",
  description:
    "About the User Management System. We help organizations manage users, roles, and access with clarity, speed, and security.",
}

export default function AboutPage() {
  return (
    <PageShell variant="light" maxWidth="default">
      <Card className="overflow-hidden border-sky-200/60 bg-white shadow-lg shadow-sky-500/5 dark:border-sky-800/40 dark:bg-zinc-900 dark:shadow-sky-500/5">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
            About
          </p>
          <CardTitle className="text-3xl text-zinc-900 dark:text-white">
            About the User Management System
          </CardTitle>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            The User Management System helps organizations manage users, roles,
            and access with clarity, speed, and security.
          </p>
        </CardHeader>
      </Card>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <Card className="group cursor-pointer overflow-hidden border-sky-200/70 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 dark:border-sky-800/50 dark:bg-zinc-900 dark:hover:shadow-sky-500/10">
          <div className="h-1 w-full bg-sky-500/80 group-hover:bg-sky-500" />
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
              <Target className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-zinc-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Make user administration simple, secure, and scalable for teams
              of every size.
            </p>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer overflow-hidden border-emerald-200/70 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 dark:border-emerald-800/50 dark:bg-zinc-900 dark:hover:shadow-emerald-500/10">
          <div className="h-1 w-full bg-emerald-500/80 group-hover:bg-emerald-500" />
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-zinc-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
              What We Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Centralize user data, role assignments, and access controls in
              one modern interface.
            </p>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer overflow-hidden border-amber-200/70 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 dark:border-amber-800/50 dark:bg-zinc-900 dark:hover:shadow-amber-500/10">
          <div className="h-1 w-full bg-amber-500/80 group-hover:bg-amber-500" />
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-zinc-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
              Why It Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Reduce onboarding time, improve security posture, and give teams
              confidence in access management.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-10 overflow-hidden border-violet-200/60 bg-gradient-to-r from-sky-100 via-emerald-100 to-amber-100 shadow-lg dark:border-violet-800/40 dark:from-sky-900/80 dark:via-emerald-900/80 dark:to-amber-900/80">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-violet-600 shadow-sm dark:bg-zinc-800/80 dark:text-violet-400">
            <Users className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl text-zinc-900 dark:text-white">
            Built for modern teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-700 dark:text-zinc-200">
            Whether you are a startup or an enterprise, the platform adapts to
            your organization with flexible role management and auditable
            activity tracking.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  )
}
