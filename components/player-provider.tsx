"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"

type PlayerLevel = {
  level: number
  currentXP: number
  requiredXP: number
}

type PlayerContextType = {
  playerName: string
  setPlayerName: (name: string) => void
  playerLevel: PlayerLevel
  addExperience: (xp: number) => void
  isAIChatVisible: boolean
  toggleAIChat: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

const calculateRequiredXP = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1))

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerName, setPlayerName] = useState("Rookie Detective")
  const [playerLevel, setPlayerLevel] = useState<PlayerLevel>({
    level: 1,
    currentXP: 0,
    requiredXP: 100,
  })
  const [isAIChatVisible, setIsAIChatVisible] = useState(true)

  // Load player data from localStorage on mount
  useEffect(() => {
    const savedPlayerData = localStorage.getItem("mafiaGamePlayerData")
    if (savedPlayerData) {
      try {
        const { name, level, currentXP } = JSON.parse(savedPlayerData)
        setPlayerName(name || "Rookie Detective")
        setPlayerLevel({
          level: level || 1,
          currentXP: currentXP || 0,
          requiredXP: calculateRequiredXP(level || 1),
        })
      } catch (error) {
        console.error("Error loading player data:", error)
      }
    }
  }, [])

  // Save player data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      "mafiaGamePlayerData",
      JSON.stringify({
        name: playerName,
        level: playerLevel.level,
        currentXP: playerLevel.currentXP,
      }),
    )
  }, [playerName, playerLevel])

  const addExperience = (xp: number) => {
    setPlayerLevel((prev) => {
      let newXP = prev.currentXP + xp
      let newLevel = prev.level
      let requiredXP = prev.requiredXP

      // Level up if enough XP
      while (newXP >= requiredXP) {
        newXP -= requiredXP
        newLevel++
        requiredXP = calculateRequiredXP(newLevel)
      }

      return {
        level: newLevel,
        currentXP: newXP,
        requiredXP,
      }
    })
  }

  const toggleAIChat = () => {
    setIsAIChatVisible((prev) => !prev)
  }

  return (
    <PlayerContext.Provider
      value={{
        playerName,
        setPlayerName,
        playerLevel,
        addExperience,
        isAIChatVisible,
        toggleAIChat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}
