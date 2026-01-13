import React from "react"

export default function ErrorMessage({ children }: { children?: React.ReactNode }) {
  return <div className="text-red-600">{children ?? "An error occurred"}</div>
}
