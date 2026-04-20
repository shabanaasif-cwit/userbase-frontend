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
import {
  useAuth,
  authValidation,
  isAdmin,
  ROLES,
} from "@/lib/auth-context";

/** Maps backend “unknown email” errors to a single user-facing message. */
function isEmailNotFoundApiMessage(message: string): boolean {
  const m = message.toLowerCase();
  if (m.includes("password") || m.includes("credential")) return false;

  if (m.includes("email") || m.includes("username") || m.includes("user name")) {
    return (
      m.includes("not found") ||
      m.includes("could not find") ||
      m.includes("couldn't find") ||
      m.includes("no user") ||
      m.includes("unknown") ||
      m.includes("does not exist") ||
      m.includes("doesn't exist") ||
      m.includes("not registered") ||
      m.includes("is not registered") ||
      m.includes("invalid")
    );
  }

  if (
    m.includes("user not found") ||
    m.includes("no user found") ||
    m.includes("account not found")
  ) {
    return true;
  }

  return false;
}

/** Maps backend role-mismatch errors to a single user-facing message. */
function isRoleMismatchApiMessage(message: string): boolean {
  const m = message.toLowerCase();
  if (!m.includes("role")) return false;

  return (
    m.includes("not found") ||
    m.includes("could not find") ||
    m.includes("couldn't find") ||
    m.includes("no user") ||
    m.includes("wrong role") ||
    m.includes("incorrect role") ||
    m.includes("invalid role") ||
    m.includes("role mismatch") ||
    m.includes("mismatch") ||
    (m.includes("find") && m.includes("user"))
  );
}

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
  /** Sent to API — backend expects `role` on login body */
  const [loginRole, setLoginRole] = useState<string>(ROLES.USER);

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

    if (!loginRole) {
      setErrorMessage("Role is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password, loginRole);

      if (result.success) {
        router.push("/profile");
        return;
      }

      const err = (result.error ?? "").trim();

      if (err.startsWith("Cannot reach. Please try again later.")) {
        setErrorMessage(err);
      } else if (isRoleMismatchApiMessage(err)) {
        setErrorMessage("Could not find the user with this role.");
      } else {
        setErrorMessage("Email or password is incorrect.");
      }
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
      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
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
                    autoComplete="email"
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
                      autoComplete="current-password"
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

                <div className="space-y-2">
                  <Label htmlFor="login-role" className="text-slate-200">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="login-role"
                    value={loginRole}
                    onChange={(e) => setLoginRole(e.target.value)}
                    className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/40 px-2.5 text-base text-white focus:border-sky-400 focus:outline-none"
                    required
                    aria-label="Account role"
                  >
                    <option value={ROLES.USER}>User</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                  <p className="text-xs text-slate-500">
                    Choose the role that matches your account. It must match how
                    you were registered.
                  </p>
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