"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  }

  // Initialize theme from cookie or localStorage
  useEffect(() => {
    setMounted(true)
    
    // Try to get theme from localStorage
    const storedTheme = localStorage.getItem("theme") as Theme
    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
      setThemeState(storedTheme)
    }
  }, [])

  // Update resolved theme when theme changes
  useEffect(() => {
    if (!mounted) return

    let resolved: "light" | "dark"
    if (theme === "system") {
      resolved = getSystemTheme()
    } else {
      resolved = theme
    }

    setResolvedTheme(resolved)
    
    // Apply theme to document
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(resolved)
    
    // Store in localStorage
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light")
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, mounted])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)

    // Try to update in database if user is logged in
    try {
      await fetch("/api/user/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      })
    } catch {
      // Ignore errors - theme is already saved locally
    }
  }

  // Always provide context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
