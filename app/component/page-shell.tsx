import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageShellVariant = "light" | "dark"
type PageShellMaxWidth = "narrow" | "default" | "wide"

const variantStyles: Record<PageShellVariant, string> = {
  light:
    "bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50",
  dark: "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-sans text-white",
}

const maxWidthStyles: Record<PageShellMaxWidth, string> = {
  narrow: "max-w-4xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
}

interface PageShellProps {
  children: ReactNode
  variant?: PageShellVariant
  maxWidth?: PageShellMaxWidth
  className?: string
}

/**
 * Reusable server-rendered layout for content pages (about, terms, privacy, support, gallery).
 * Keeps consistent max-width, padding, and background variants.
 */
export default function PageShell({
  children,
  variant = "light",
  maxWidth = "default",
  className,
}: PageShellProps) {
  return (
    <div
      className={cn("min-h-screen", variantStyles[variant], className)}
    >
      <main
        className={cn(
          "mx-auto w-full px-6 py-16",
          maxWidthStyles[maxWidth]
        )}
      >
        {children}
      </main>
    </div>
  )
}
