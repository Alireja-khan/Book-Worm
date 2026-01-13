import { useState, useEffect } from "react"

export function useReviews() {
  const [reviews, setReviews] = useState([])
  useEffect(() => {
    // Fetch reviews placeholder
  }, [])
  return { reviews }
}
