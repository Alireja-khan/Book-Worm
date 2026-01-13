import React from "react"

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Book Details: {params.id}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Book description, details and reviews.</p>
    </div>
  )
}
