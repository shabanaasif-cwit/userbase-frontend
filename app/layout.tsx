import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./component/app-shell";

export const metadata: Metadata = {
  title: "Userbase",
  description: "Userbase frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
