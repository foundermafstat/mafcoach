"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import { sendMessageToReplicaDirect } from "@/app/lib/api/sensay-direct"

// Используем переменные окружения для клиентской части
const SENSAY_REPLICA_UUID = process.env.NEXT_PUBLIC_SENSAY_REPLICA_UUID || ''

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

type ChatContextType = {
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "timestamp">, replicaUuid?: string) => void
  isLoading: boolean
  clearChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const WELCOME_MESSAGE = {
  id: "welcome-message",
  role: "assistant" as const,
  // content: "Hello! I'm your Mafia game assistant. How can I help you learn about the game today?",
  content: "Welcome! I'm Ihor, your Mafia coach and teammate in training. Ready to level up your game? ",
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

  const addMessage = async (message: Omit<Message, "id" | "timestamp">, replicaUuid?: string) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, newMessage])

    if (message.role === "user") {
      setIsLoading(true)
      try {
        // Используем UUID реплики из параметра или из переменной окружения в качестве запасного варианта
        const targetReplicaUuid = replicaUuid || SENSAY_REPLICA_UUID;
        console.log('Using replica UUID:', targetReplicaUuid);
        
        try {
          // Send the message to the Sensay replica using direct API
          // Обратите внимание на порядок параметров: content, replicaUuid, skipChatHistory, userId
          const response = await sendMessageToReplicaDirect(
            message.content,
            targetReplicaUuid,
            false // Don't skip chat history
          )
          
          // Add the AI response
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: response.content || "I'm having trouble processing your request. Please try again.",
              timestamp: Date.now(),
            },
          ])
        } catch (apiError) {
          console.error("Sensay API Error:", apiError)
          
          // Handle API error with a user-friendly message
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "I'm currently experiencing connection issues with my knowledge base. Please try again in a moment.",
              timestamp: Date.now(),
            },
          ])
        }
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
