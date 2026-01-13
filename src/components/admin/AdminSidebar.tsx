import React from "react"

export default function AdminSidebar() {
  return (
    <aside className="w-64 p-4 border-r">
      <h2 className="font-semibold">Admin Menu</h2>
      <ul className="mt-4 space-y-2 text-sm">
        <li>Dashboard</li>
        <li>Books</li>
        <li>Genres</li>
        <li>Users</li>
        <li>Reviews</li>
        <li>Tutorials</li>
      </ul>
    </aside>
  )
}
