import { useState, useEffect } from "react"

export function useUser() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    // Fetch user placeholder
  }, [])
  return { user }
}
