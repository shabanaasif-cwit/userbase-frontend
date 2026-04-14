"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, authValidation, isAdmin } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup, logout, isAuthenticated, isReady, role: userRole } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace(isAdmin(userRole) ? "/admin/dashboard" : "/dashboard");
    }
  }, [isReady, isAuthenticated, userRole, router]);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  //const [phone, setPhone] = useState(""); // Phone number state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(""); // Initially empty
  const [adminKey, setAdminKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false); // Toast visibility state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~]/.test(password);

  // Regular expression to disallow commas, brackets, and spaces
  const invalidPasswordChars = /[,\[\]\(\)\s`]/;

  let passwordMessage = "";
  if (password.length > 0) {
    if (invalidPasswordChars.test(password)) {
      passwordMessage = "Password cannot contain commas, brackets, parentheses, spaces, or backtick (`).";
    } else if (!hasMinLength && !hasSymbol) {
      passwordMessage = "Password must be at least 8 characters and include a special symbol.";
    } else if (!hasMinLength) {
      passwordMessage = "Password must be at least 8 characters.";
    } else if (!hasSymbol) {
      passwordMessage = "Password must include at least one special symbol.";
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("First name and last name are required.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }
   {/* if (!phone.trim()) {
      setErrorMessage("Phone number is required.");
      return;
    }
    if (phone.length !== 11 || !/^\d{11}$/.test(phone)) {
      setErrorMessage("Phone number must be exactly 11 digits.");
      return;
    }}  */} 
    if (!password.trim()) {
      setErrorMessage("Password is required.");
      return;
    }
    if (!confirmPassword.trim()) {
      setErrorMessage("Confirm password is required.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!role) {
      setErrorMessage("Role is required.");
      return;
    }
    if (role === "admin" && !adminKey.trim()) {
      setErrorMessage("Admin key is required for admin signup.");
      return;
    }
    if (invalidPasswordChars.test(password)) {
      setErrorMessage(
        "Password cannot contain commas, brackets, parentheses, spaces, or backtick (`)."
      );
      return;
    }
    if (!hasMinLength || !hasSymbol) {
      setErrorMessage(
        "Password must be at least 8 characters and include a special symbol."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        role,
        adminKey: role === "admin" ? adminKey : undefined,
      });
      if (result.success) {
        setErrorMessage("");
        setSuccessMessage("Account created successfully.");
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), 5000);
        await logout();
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setErrorMessage(result.error ?? "Signup failed. Please try again.");
      }
    } catch {
      setErrorMessage("Signup failed. Please try again.");
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
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Create account</p>
              <CardTitle className="text-3xl">Sign up</CardTitle>
              <p className="text-sm text-slate-300">
                Join the User Management System to manage profiles, roles, and secure access.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>Role-based access controls</li>
                <li>Secure authentication flows</li>
                <li>Quick onboarding for teams</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-xl">Create account</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-200">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-200">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
               { /* <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-200">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="input-field"
                    maxLength={11} // Limit to 11 characters
                  />
                </div>  */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pr-10 input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordMessage && <p className="text-sm text-red-400">{passwordMessage}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pr-10 input-field"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password !== confirmPassword && confirmPassword && (
                    <p className="text-sm text-red-400">Passwords do not match.</p>
                  )}
                </div>

                {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
                {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-200">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-8 w-full rounded-lg border border-white/10 bg-slate-950/40 px-2.5 text-sm text-white focus:border-sky-400 focus:outline-none"
                    required
                  >
                    <option value="">Select a role</option> {/* Placeholder option */}
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {role === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="adminKey" className="text-slate-200">
                      Admin Key <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="adminKey"
                      type="password"
                      placeholder="Enter admin signup key"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      required
                      className="input-field"
                    />
                  </div>
                )}
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create account"}
                </Button>
                <p className="text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-sky-300 hover:text-sky-200 hover:underline underline-offset-4">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Toast-style Notification for Success */}
      {isToastVisible && (
        <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-md bg-green-500 p-4 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <p className="text-lg">{successMessage}</p>
            <button
              onClick={() => setIsToastVisible(false)} // Close the toast
              className="text-white font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}