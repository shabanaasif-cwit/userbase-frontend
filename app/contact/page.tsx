import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PageShell from "../component/page-shell"
import { Mail, Phone, MapPin } from "lucide-react"

export const metadata = {
  title: "Contact | Userbase",
  description:
    "Contact the Userbase team. Have a question or need support? We are here to help.",
}

export default function ContactPage() {
  return (
    <PageShell
      variant="dark"
      maxWidth="default"
      className="bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.18),_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(56,189,248,0.16),_transparent_45%),linear-gradient(160deg,_#020617,_#0f172a_45%,_#020617)]"
    >
      <Card className="overflow-hidden border-white/10 bg-slate-900/70 shadow-lg shadow-sky-500/5 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
            Contact
          </p>
          <CardTitle className="mt-2 text-3xl font-bold text-white">
            Contact Us
          </CardTitle>
          <p className="mt-2 text-lg text-zinc-300">
            Have a question or need support? We are here to help.
          </p>
        </CardHeader>
      </Card>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="group overflow-hidden border-white/10 bg-slate-800/55 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/5 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-sky-400" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-sky-300">
              <Mail className="h-5 w-5 text-sky-400" />
              Email
            </CardTitle>
            <p className="text-sm text-zinc-400">
              Reach out to our support team anytime.
            </p>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:support@example.com"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-400 hover:text-sky-300"
            >
              support@example.com
            </a>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-white/10 bg-slate-800/55 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-300">
              <Phone className="h-5 w-5 text-emerald-400" />
              Phone
            </CardTitle>
            <p className="text-sm text-zinc-400">
              Monday to Friday, 9am - 6pm.
            </p>
          </CardHeader>
          <CardContent>
            <a
              href="tel:+15551234567"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              +1 (555) 123-4567
            </a>
          </CardContent>
        </Card>

        <a
          href="https://www.google.com/maps/search/?api=1&query=123+Access+Lane,+Suite+400,+Lahore,+Pakistan"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="group h-full overflow-hidden border-white/10 bg-slate-800/55 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 backdrop-blur-sm">
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-amber-400" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-amber-300">
                <MapPin className="h-5 w-5 text-amber-400" />
                Office
              </CardTitle>
              <p className="text-sm text-zinc-400">
                123 Access Lane, Suite 400
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-amber-400">
                Lahore, Pakistan
              </p>
            </CardContent>
          </Card>
        </a>
      </section>
    </PageShell>
  )
}
