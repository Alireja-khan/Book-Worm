import React from "react"

export default function AdminEditBookPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit Book: {params.id}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Edit book details and metadata.</p>
    </div>
  )
}
