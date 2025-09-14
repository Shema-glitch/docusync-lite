"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const THEMES = ["light", "dark", "system", "light-orange", "dark-orange", "light-violet", "dark-violet"];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider themes={THEMES} {...props}>{children}</NextThemesProvider>
}
