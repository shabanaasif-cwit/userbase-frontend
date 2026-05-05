"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Client-only CTA block for the welcome page (auth-dependent "View dashboard").
 * Keeps the rest of the home page as a server component for better initial load.
 */
export default function WelcomeCTA() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleViewDashboard = () => {
    router.push(isAuthenticated ? "/dashboard" : "/login")
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {!isAuthenticated && (
        <>
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
            Create account
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Sign in
          </Link>
        </>
      )}
      <button
        type="button"
        onClick={handleViewDashboard}
        className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
      >
        View dashboard
      </button>
    </div>
  )
}
