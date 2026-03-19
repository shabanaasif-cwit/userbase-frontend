import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PageShell from "../component/page-shell"

export const revalidate = 604800

export const metadata = {
  title: "Terms of Service | Userbase",
  description:
    "Terms and conditions for the User Management System. Acceptable use, account security, and service availability.",
}

export default function TermsPage() {
  return (
    <PageShell variant="dark" maxWidth="narrow">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Terms of Service
            </p>
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            <p className="text-slate-300">
              These terms govern your use of the User Management System. By using
              the service, you agree to comply with these terms.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Acceptable Use</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    Use the platform responsibly and do not attempt to disrupt,
                    reverse engineer, or misuse any part of the service.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Account Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    You are responsible for keeping your credentials secure and
                    for all activity that occurs under your account.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Service Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    We aim to keep the service available, but we do not guarantee
                    uninterrupted access and may perform maintenance as needed.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Termination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    We may suspend or terminate access if these terms are violated
                    or if required for security or legal reasons.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8 border-white/10 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-emerald-500/20 text-white">
              <CardHeader>
                <CardTitle className="text-base">Effective date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-medium">March 10, 2026</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
    </PageShell>
  )
}
