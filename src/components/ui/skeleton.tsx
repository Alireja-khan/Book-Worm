import React from "react"

export default function Skeleton({ className = "h-4 w-full bg-gray-200 rounded" }: { className?: string }) {
  return <div className={className} />
}
