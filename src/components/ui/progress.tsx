import React from "react"

export default function Progress({ value = 0 }: { value?: number }) {
  return (
    <div className="w-full bg-gray-200 h-2 rounded">
      <div className="bg-primary h-2 rounded" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
