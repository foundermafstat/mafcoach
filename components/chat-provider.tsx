"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

type ChatContextType = {
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  isLoading: boolean
  clearChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const WELCOME_MESSAGE = {
  id: "welcome-message",
  role: "assistant" as const,
  content: "Hello! I'm your Mafia game assistant. How can I help you learn about the game today?",
  timestamp: Date.now(),
}

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages)
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
      }
    }
  }, [])

  // Save chat history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages))
  }, [messages])

  const addMessage = async (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, newMessage])

    if (message.role === "user") {
      setIsLoading(true)
      try {
        // Try to call the sensay.io API
        try {
          const response = await fetch("https://api.sensay.io/v1/replicas/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Add any auth headers if required
              // "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              message: message.content,
              history: messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          })

          if (response.ok) {
            const data = await response.json()

            // Add the AI response
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: data.response || "I'm having trouble connecting to the AI service. Please try again.",
                timestamp: Date.now(),
              },
            ])
            return
          }
        } catch (apiError) {
          console.error("API Error:", apiError)
          // Continue to fallback
        }

        // If API call fails, generate a mock response
        console.log("Using mock response due to API connection issues")

        // Simple response generation based on the user's message
        let mockResponse = "I'm currently in demo mode and can't access the AI service. "

        if (message.content.toLowerCase().includes("mafia")) {
          mockResponse += "Mafia is a social deduction game where players try to identify the mafia members among them."
        } else if (message.content.toLowerCase().includes("role")) {
          mockResponse += "There are various roles in Mafia, including Townspeople, Mafia, Doctor, Detective, and more."
        } else if (message.content.toLowerCase().includes("rule")) {
          mockResponse +=
            "The basic rules of Mafia involve alternating day and night phases, with discussions and voting during the day."
        } else if (message.content.toLowerCase().includes("strategy")) {
          mockResponse +=
            "Good strategies include observing voting patterns, being consistent in your statements, and using logic to deduce roles."
        } else {
          mockResponse += "How else can I help you learn about the Mafia game?"
        }

        // Add the mock AI response
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: mockResponse,
            timestamp: Date.now(),
          },
        ])
      } catch (error) {
        // Handle error
        console.error("Error in chat:", error)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: Date.now(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const clearChat = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        timestamp: Date.now(),
      },
    ])
  }

  return <ChatContext.Provider value={{ messages, addMessage, isLoading, clearChat }}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
