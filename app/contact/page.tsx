import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ContactForm from "../component/contact-form"
import PageShell from "../component/page-shell"

export const metadata = {
  title: "Contact | Userbase",
  description:
    "Contact the Userbase team. Have a question or need support? We are here to help.",
}

export default function ContactPage() {
  return (
    <PageShell variant="light" maxWidth="default">
      <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Contact
            </p>
            <CardTitle className="text-3xl">Contact Us</CardTitle>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              Have a question or need support? We are here to help.
            </p>
          </CardHeader>
        </Card>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="group border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg group-hover:underline underline-offset-4">
                Email
              </CardTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Reach out to our support team anytime.
              </p>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@example.com"
                className="text-sm font-medium text-sky-600 hover:text-sky-500 hover:underline underline-offset-4 dark:text-sky-300 dark:hover:text-sky-200"
              >
                support@example.com
              </a>
            </CardContent>
          </Card>

          <Card className="group border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg group-hover:underline underline-offset-4">
                Phone
              </CardTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Monday to Friday, 9am – 6pm.
              </p>
            </CardHeader>
            <CardContent>
              <a
                href="tel:+15551234567"
                className="text-sm font-medium text-zinc-800 hover:underline hover:text-zinc-600 underline-offset-4 dark:text-zinc-200 dark:hover:text-zinc-300"
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
            <Card className="group border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg group-hover:underline underline-offset-4">
                  Office
                </CardTitle>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  123 Access Lane, Suite 400
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Lahore, Pakistan
                </p>
              </CardContent>
            </Card>
          </a>
        </section>

      <ContactForm />
    </PageShell>
  )
}
