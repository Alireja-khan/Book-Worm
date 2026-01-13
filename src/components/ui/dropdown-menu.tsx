"use client"
import React from "react"

export default function DropdownMenu({ children }: { children?: React.ReactNode }) {
  return <div className="dropdown-menu">{children}</div>
}
