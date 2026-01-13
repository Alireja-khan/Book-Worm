import React from "react"

export default function Badge({ children }: { children?: React.ReactNode }) {
  return <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-xs">{children}</span>
}
