"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAdmin } from "@/lib/auth-context";

/**
 * Admin layout: restrict access to role === 'admin'.
 * Redirects unauthenticated users to /login and non-admins to /dashboard.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, role, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isAdmin(role)) {
      router.replace("/dashboard");
    }
  }, [isReady, isAuthenticated, role, router]);

  if (!isReady || !isAuthenticated || !isAdmin(role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        <p>Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
