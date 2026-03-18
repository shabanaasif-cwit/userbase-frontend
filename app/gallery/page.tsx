import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import { ArrowRight } from 'lucide-react';

const galleryItems = [
  {
    title: "Team Collaboration",
    description: "Organize teams and assign roles with clarity.",
  },
  {
    title: "Secure Access",
    description: "Role-based permissions keep data protected.",
  },
  {
    title: "User Profiles",
    description: "Centralize employee and member profiles.",
  },
  {
    title: "Audit Insights",
    description: "Track activity and keep an audit trail.",
  },
  {
    title: "Fast Onboarding",
    description: "Invite users and get them started quickly.",
  },
  {
    title: "Workflow Control",
    description: "Manage approvals and access in one hub.",
  },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Gallery
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Highlights &amp; Moments
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
              A quick look at the capabilities and experiences shaped by the
              User Management System.
            </p>
          </div>
          <Button className="cursor-pointer" variant="outline">View all</Button>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <Card
              key={item.title}
              className="overflow-hidden border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
            >
              <div className="h-40 w-full bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 dark:from-sky-900 dark:via-emerald-900 dark:to-amber-900" />
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {item.description}
                </p>
                <Button variant="ghost"  className="px-0 text-white hover:text-sky-300 hover:bg-slate-900 transition-all duration-300">
                  Explore <ArrowRight />
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
