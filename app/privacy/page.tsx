import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-sans text-white">
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Trust and Transparency
            </p>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-slate-300">
              This Privacy Policy explains how we collect, use, and protect your
              information when you use the User Management System.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Information We Collect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    We collect only what is necessary to provide and improve the
                    service, such as account details and usage data.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">How We Use Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    Data is used to operate the platform, maintain security, and
                    enhance user experience. We do not sell personal information.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Policy Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    We may update this policy from time to time. Changes will be
                    posted here with an updated effective date.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    Questions about privacy? Reach out to support and we will help
                    you.
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
      </main>
    </div>
  )
}
