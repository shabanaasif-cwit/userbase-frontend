"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, ImageIcon } from "lucide-react"

const INITIAL_VISIBLE = 6

export type GalleryItem = {
  title: string
  description: string
  image: string
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="cursor-pointer overflow-hidden border-white/10 bg-slate-800/55 shadow-sm transition hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm">
      <div className="relative h-48 w-full overflow-hidden bg-slate-900/70">
        {imageError ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-900 via-emerald-900 to-amber-900"
            aria-hidden
          >
            <ImageIcon className="h-12 w-12 text-zinc-500" />
          </div>
        ) : (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized
          />
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg text-white">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-300">{item.description}</p>
      </CardContent>
    </Card>
  )
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? items : items.slice(0, INITIAL_VISIBLE)
  const hasMore = items.length > INITIAL_VISIBLE

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Gallery
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Highlights &amp; Moments
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            A quick look at the capabilities and experiences shaped by the User
            Management System.
          </p>
        </div>
        {hasMore && (
          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View all ({items.length} items) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </header>
      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <GalleryCard key={item.title} item={item} />
        ))}
      </section>
    </>
  )
}
