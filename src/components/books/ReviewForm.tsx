import React from "react"

export default function ReviewForm() {
  return (
    <form className="space-y-2">
      <textarea placeholder="Write your review..." className="w-full rounded border p-2" />
      <button className="btn">Submit</button>
    </form>
  )
}
