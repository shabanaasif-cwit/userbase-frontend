"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validation
    if (!name || !email || !message) {
      setErrorMessage("All fields are required.");
      return;
    }

    // Save form data to localStorage
    const formData = {
      name,
      email,
      message,
    };

    // Temporarily store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("contactFormData", JSON.stringify(formData));
    }

    // Reset form fields
    setName("");
    setEmail("");
    setMessage("");

    // Show success message
    setErrorMessage(""); // Clear any previous error message
    setSuccessMessage("Your message has been submitted successfully!");

    // Hide success message after 5 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
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
          {/* Contact details */}
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

        {/* Contact Form */}
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

            {/* Error and Success Messages */}
            {errorMessage && (
              <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="mt-4 text-sm text-green-500">{successMessage}</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
