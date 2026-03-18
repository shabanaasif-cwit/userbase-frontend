"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./header";
import Footer from "./footer";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("user");
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: "include",
        });
        if (!response.ok) {
          setIsAuthenticated(false);
          setRole("user");
          return;
        }
        const data = await response.json();
        if (!data?.authenticated) {
          setIsAuthenticated(false);
          setRole("user");
          return;
        }
        setIsAuthenticated(true);
        setRole(data?.role || "user");
      } catch (error) {
        setIsAuthenticated(false);
        setRole("user");
      }
    };

    loadSession();
  }, [apiBaseUrl, pathname]);

  const handleLogout = async () => {
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // ignore logout errors
    }
    setIsAuthenticated(false);
    setRole("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header role={role} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
