"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, authValidation, isAdmin } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isReady, role } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace(isAdmin(role) ? "/admin/dashboard" : "/dashboard");
    }
  }, [isReady, isAuthenticated, role, router]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }
    if (!authValidation.emailFormat(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }
    if (password.length < authValidation.passwordMinLength) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (authValidation.passwordInvalidChars.test(password)) {
      setErrorMessage(
        "Password cannot contain commas, brackets, parentheses, spaces, or backtick (`)."
      );
      return;
    }
    if (!authValidation.passwordHasSymbol(password)) {
      setErrorMessage("Password must include at least one special symbol.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard");
        return;
      }
      setErrorMessage("Login failed. Please check your email and password.");
    } catch {
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-sans text-white">
      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-16 lg:py-24">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Welcome back
              </p>
              <CardTitle className="text-4xl">Sign in</CardTitle>
              <p className="text-base text-slate-300">
                Access your dashboard to manage users, roles, and permissions.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-base text-slate-300">
                <li>Secure authentication</li>
                <li>Role-based access</li>
                <li>Activity visibility</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 text-base"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 pr-10 text-base"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    Remember me
                  </label>
                  <Link
                    href="/support"
                    className="text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                  >
                    Need help?
                  </Link>
                </div>

                <Button
                  className="h-11 w-full text-base"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                <p className="text-center text-sm text-slate-400">
                  New here?{" "}
                  <Link
                    href="/signup"
                    className="text-sky-300 hover:text-sky-200 hover:underline underline-offset-4"
                  >
                    Create an account
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
