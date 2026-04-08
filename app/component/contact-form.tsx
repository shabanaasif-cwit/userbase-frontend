"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { API_BASE } from "@/lib/api-config"

/**
 * Contact form — submits to backend API (MongoDB). No localStorage.
 */
export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")

    if (!name || !email || !message) {
      setErrorMessage("All fields are required.")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setErrorMessage(
          typeof err?.message === "string"
            ? err.message
            : "Could not send message. Try again later."
        )
        return
      }

      setName("")
      setEmail("")
      setMessage("")
      setSuccessMessage("Your message has been submitted successfully!")
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setSuccessMessage(""), 5000)
    } catch {
      setErrorMessage("Cannot reach server. Is the API running?")
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <Card className="mt-10 overflow-hidden border-sky-200/60 bg-white shadow-lg shadow-sky-500/5 dark:border-sky-800/40 dark:bg-zinc-900 dark:shadow-sky-500/5">
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 dark:from-sky-500 dark:via-sky-500 dark:to-emerald-500" />
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
          Send a message
        </CardTitle>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Fill in the form below and we’ll get back to you.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-1">
            <Input
              placeholder="Your Name Here"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-zinc-200 focus-visible:ring-sky-500 dark:border-zinc-700 dark:focus-visible:ring-sky-400"
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-zinc-200 focus-visible:ring-sky-500 dark:border-zinc-700 dark:focus-visible:ring-sky-400"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label
                htmlFor="message"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                Message <span className="text-red-500">*</span>
              </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="How can we help?"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="border-zinc-200 focus-visible:ring-sky-500 dark:border-zinc-700 dark:focus-visible:ring-sky-400"
            />
          </div>
          <div className="md:col-span-2">
            <Button
              className="w-full bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-500/25 hover:from-sky-500 hover:to-sky-400 dark:from-sky-500 dark:to-sky-600 dark:shadow-sky-500/20 dark:hover:from-sky-400 dark:hover:to-sky-500"
              type="submit"
            >
              Send message
            </Button>
          </div>
        </form>
        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {successMessage}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
