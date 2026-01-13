import { useState, useEffect } from "react"

export function useLibrary() {
  const [library, setLibrary] = useState([])
  useEffect(() => {
    // Fetch library placeholder
  }, [])
  return { library }
}
