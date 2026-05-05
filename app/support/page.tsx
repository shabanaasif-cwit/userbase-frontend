import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PageShell from "../component/page-shell"

export const metadata = {
  title: "Support | Userbase",
  description:
    "Support center for the User Management System. Get help with account access, usage, and troubleshooting.",
}

export default function SupportPage() {
  return (
    <PageShell variant="dark" maxWidth="default">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              We are here to help
            </p>
            <CardTitle className="text-3xl">Support Center</CardTitle>
            <p className="text-slate-300">
              Get help with account access, system usage, or troubleshooting.
              Reach out to our team and we will respond as soon as possible.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Email Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">
                    Send us a message and include your username and issue
                    details.
                  </p>
                  <a
                    href="mailto:support@example.com"
                    className="text-sm font-medium text-sky-300 hover:text-sky-200"
                  >
                    support@example.com
                  </a>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Knowledge Base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">
                    Browse guides and answers to common questions.
                  </p>
                  <Button variant="secondary">View articles</Button>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Status Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">
                    Check if any services are experiencing issues.
                  </p>
                  <Button variant="secondary">System status</Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-base">
                    Typical Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    We respond within 1 business day for most inquiries.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-base">Security Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    For urgent security concerns, contact us immediately and
                    mark the message as high priority.
                  </p>
                </CardContent>
              </Card>
            </div>
              <Card className="mt-8 border-white/10 bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-emerald-500/20 text-white">
                <CardHeader>
                  <CardTitle className="text-base">Office hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium">Mon–Fri, 9:00–18:00</p>
                </CardContent>
              </Card>
            </CardContent>
        </Card>
    </PageShell>
  )
}
