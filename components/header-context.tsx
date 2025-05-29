"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type HeaderState = {
  customStatus?: string
  // Add more fields as needed
}

interface HeaderContextType {
  headerState: HeaderState
  setHeaderState: (state: HeaderState) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerState, setHeaderState] = useState<HeaderState>({})
  return (
    <HeaderContext.Provider value={{ headerState, setHeaderState }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error("useHeader must be used within HeaderProvider")
  return ctx
}
