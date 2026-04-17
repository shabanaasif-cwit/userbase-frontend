import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import AppShell from "./component/app-shell";
import Maintenance from "@/app/component/maintenance";
import { isApiReachable } from "@/lib/api-config";

export const metadata: Metadata = {
  title: "Userbase",
  description: "Userbase frontend",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiUp = await isApiReachable();

  return (
    <html lang="en">
      <body>
        {apiUp ? (
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        ) : (
          <Maintenance />
        )}
      </body>
    </html>
  );
}
