import { Button } from "@/components/tiptap-ui-primitive/button"
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon"
import { SunIcon } from "@/components/tiptap-icons/sun-icon"
import { useEffect, useState } from "react"

const THEME_STORAGE_KEY = "theme"
type StoredTheme = "light" | "dark"

// Singleton theme manager
class ThemeManager {
  private static instance: ThemeManager
  private listeners: Set<(isDark: boolean) => void> = new Set()
  private _isDark: boolean = false
  private initialized: boolean = false

  private constructor() {
    this.initialize()
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  private initialize() {
    if (this.initialized) return
    this.initialized = true

    // Set initial theme (localStorage -> existing DOM -> system preference)
    const storedTheme = this.getStoredTheme()
    if (storedTheme) {
      this._isDark = storedTheme === "dark"
    } else if (document.documentElement.classList.contains("dark")) {
      this._isDark = true
    } else {
      this._isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    }

    // Only persist if the user already made an explicit choice.
    this.applyTheme(this._isDark, Boolean(storedTheme))
  }

  private getStoredTheme(): StoredTheme | null {
    try {
      const value = window.localStorage.getItem(THEME_STORAGE_KEY)
      return value === "dark" || value === "light" ? value : null
    } catch {
      return null
    }
  }

  private applyTheme(isDark: boolean, persist: boolean) {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Keep UA widgets (scrollbars, form controls) consistent.
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"

    // Ensure a color-scheme meta exists for better defaults.
    let metaTag = document.querySelector<HTMLMetaElement>(
      'meta[name="color-scheme"]'
    )
    if (!metaTag && document.head) {
      metaTag = document.createElement("meta")
      metaTag.setAttribute("name", "color-scheme")
      document.head.appendChild(metaTag)
    }
    metaTag?.setAttribute("content", isDark ? "dark" : "light")

    if (persist) {
      // Persist user choice.
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light")
      } catch {
        // ignore storage failures
      }
    }
  }

  subscribe(listener: (isDark: boolean) => void): () => void {
    this.listeners.add(listener)
    // Immediately notify with current state
    listener(this._isDark)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  toggle() {
    this._isDark = !this._isDark
    this.applyTheme(this._isDark, true)
    this.listeners.forEach(listener => listener(this._isDark))
  }

  get isDark() {
    return this._isDark
  }
}

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const manager = ThemeManager.getInstance()
    const unsubscribe = manager.subscribe(setIsDarkMode)
    return unsubscribe
  }, [])

  const toggleDarkMode = () => {
    ThemeManager.getInstance().toggle()
  }

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      data-style="ghost"
    >
      {/* Show the *target* theme icon (what clicking will switch to). */}
      {isDarkMode ? (
        <SunIcon className="tiptap-button-icon" />
      ) : (
        <MoonStarIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}