import React from "react"

export default function EmptyState({ message }: { message?: string }) {
  return (
    <div className="text-center text-sm text-muted-foreground">
      {message ?? "No items to show"}
    </div>
  )
}
