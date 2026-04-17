"use client";

export default function Maintenance() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-zinc-950 to-slate-900 font-sans text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Badge */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Scheduled Maintenance
          </div>

          {/* Heading */}
          <div className="mt-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              We&apos;ll be back shortly
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              We&apos;re currently improving the platform to make your experience
              faster, smoother, and more reliable. Some features may be
              temporarily unavailable.
            </p>
          </div>

          {/* Status panel */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-left shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Current Status
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Maintenance is in progress. Our team is actively working to
                  restore all services as soon as possible.
                </p>
              </div>
              <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                In Progress
              </div>
            </div>   
          </div>

          {/* Footer note */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-slate-400">
              Thank you for your patience. We&apos;re working hard to get things
              back online.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}