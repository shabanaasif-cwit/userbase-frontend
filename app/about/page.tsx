

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const revalidate = 86400

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              About
            </p>
            <CardTitle className="text-3xl">
              About the User Management System
            </CardTitle>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              The User Management System helps organizations manage users, roles,
              and access with clarity, speed, and security.
            </p>
          </CardHeader>
        </Card>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <Card className="group cursor-pointer border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg group-hover:underline underline-offset-4">
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

          <Card className="group cursor-pointer border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg group-hover:underline underline-offset-4">
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

          <Card className="group cursor-pointer border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg group-hover:underline underline-offset-4">
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

        <Card className="mt-10 border-zinc-200 bg-gradient-to-r from-sky-100 via-emerald-100 to-amber-100 text-zinc-900 dark:border-zinc-800 dark:from-sky-900 dark:via-emerald-900 dark:to-amber-900 dark:text-white">
          <CardHeader>
            <CardTitle className="text-xl">Built for modern teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              Whether you are a startup or an enterprise, the platform adapts to
              your organization with flexible role management and auditable
              activity tracking.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
