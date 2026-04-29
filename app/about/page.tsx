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
    <PageShell
      variant="dark"
      maxWidth="default"
      className="bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.18),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(56,189,248,0.16),_transparent_45%),linear-gradient(160deg,_#020617,_#0f172a_45%,_#020617)]"
    >
      <Card className="overflow-hidden border-white/10 bg-slate-900/70 shadow-lg shadow-sky-500/5 backdrop-blur-sm">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
            About
          </p>
          <CardTitle className="text-3xl text-white">
            About the User Management System
          </CardTitle>
          <p className="text-lg text-zinc-300">
            The User Management System helps organizations manage users, roles,
            and access with clarity, speed, and security.
          </p>
        </CardHeader>
      </Card>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <Card className="group cursor-pointer overflow-hidden border-white/10 bg-slate-800/55 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 backdrop-blur-sm">
          <div className="h-1 w-full bg-sky-500/80 group-hover:bg-sky-500" />
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-900/50 text-sky-400">
              <Target className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-white group-hover:text-sky-400">
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300">
              Make user administration simple, secure, and scalable for teams
              of every size.
            </p>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer overflow-hidden border-white/10 bg-slate-800/55 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 backdrop-blur-sm">
          <div className="h-1 w-full bg-emerald-500/80 group-hover:bg-emerald-500" />
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900/50 text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-white group-hover:text-emerald-400">
              What We Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300">
              Centralize user data, role assignments, and access controls in
              one modern interface.
            </p>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer overflow-hidden border-white/10 bg-slate-800/55 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-sm">
          <div className="h-1 w-full bg-amber-500/80 group-hover:bg-amber-500" />
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-900/50 text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-white group-hover:text-amber-400">
              Why It Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300">
              Reduce onboarding time, improve security posture, and give teams
              confidence in access management.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-10 overflow-hidden border-white/10 bg-gradient-to-r from-slate-800/70 via-slate-800/60 to-slate-900/70 shadow-lg backdrop-blur-sm">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/70 text-violet-400 shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl text-white">
            Built for modern teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-200">
            Whether you are a startup or an enterprise, the platform adapts to
            your organization with flexible role management and auditable
            activity tracking.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  )
}
