import { useState, useEffect } from "react"

export function useBooks() {
  const [books, setBooks] = useState([])
  useEffect(() => {
    // Fetch books placeholder
  }, [])
  return { books }
}
