"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import Header from "./header";
import Footer from "./footer";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        role={role}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
