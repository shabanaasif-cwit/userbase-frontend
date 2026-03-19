"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**
 * Client-only contact form (state, validation, localStorage).
 * Page shell stays server-rendered for faster initial paint.
 */
export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name || !email || !message) {
      setErrorMessage("All fields are required.")
      return
    }

    const formData = { name, email, message }
    if (typeof window !== "undefined") {
      localStorage.setItem("contactFormData", JSON.stringify(formData))
    }

    setName("")
    setEmail("")
    setMessage("")
    setErrorMessage("")
    setSuccessMessage("Your message has been submitted successfully!")

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setSuccessMessage(""), 5000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <Card className="mt-10 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-xl">Send a message</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-1">
            <Label className="text-zinc-700 dark:text-zinc-200">Name</Label>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label className="text-zinc-700 dark:text-zinc-200">Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-zinc-700 dark:text-zinc-200">Message</Label>
            <Textarea
              placeholder="How can we help?"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Button className="w-full" type="submit">
              Send message
            </Button>
          </div>
        </form>
        {errorMessage && (
          <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="mt-4 text-sm text-green-500">{successMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
