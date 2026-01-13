import React from "react"

export default function Table({ children }: { children?: React.ReactNode }) {
  return <div className="overflow-auto">{children}</div>
}
