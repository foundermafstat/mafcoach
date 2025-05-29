"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import { sendMessageToReplicaDirect } from "@/app/lib/api/sensay-direct"
import { useReplica } from "./replica-provider"

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

// Создаем функцию для генерации приветственного сообщения
const createWelcomeMessage = (replicaName?: string, greeting?: string) => {
  return {
    id: `welcome-message-${Date.now()}`,
    role: "assistant" as const,
    content: greeting || `Привет! Я ${replicaName || "Mafia Coach"}. Чем я могу помочь тебе в игре Мафия?`,
    timestamp: Date.now(),
  }
}

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatStorageKey, setChatStorageKey] = useState("chatHistory")
  
  // Используем глобальный контекст реплики
  const { selectedReplica, selectedReplicaUuid } = useReplica()
  
  // Создаем уникальный ключ для хранения истории чата для каждой реплики
  useEffect(() => {
    if (selectedReplicaUuid) {
      setChatStorageKey(`chatHistory_${selectedReplicaUuid}`)
    } else {
      setChatStorageKey("chatHistory")
    }
  }, [selectedReplicaUuid])

  // Инициализируем чат с приветственным сообщением выбранной реплики
  useEffect(() => {
    if (selectedReplica) {
      const welcomeMsg = {
        id: `welcome-${selectedReplicaUuid}`,
        role: "assistant" as const,
        content: selectedReplica.greeting || `Привет! Я ${selectedReplica.name}. Чем я могу помочь?`,
        timestamp: Date.now(),
      }
      
      // Проверяем, есть ли сохраненная история чата для этой реплики
      const savedMessages = localStorage.getItem(chatStorageKey)
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages)
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages)
          } else {
            // Если история пуста, показываем приветственное сообщение
            setMessages([welcomeMsg])
          }
        } catch (error) {
          console.error("Error loading chat history:", error)
          // В случае ошибки, показываем приветственное сообщение
          setMessages([welcomeMsg])
        }
      } else {
        // Если истории нет, показываем приветственное сообщение
        setMessages([welcomeMsg])
      }
    } else {
      const defaultWelcome = createWelcomeMessage();
      const savedMessages = localStorage.getItem(chatStorageKey)
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages)
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages)
          } else {
            setMessages([defaultWelcome])
          }
        } catch (error) {
          console.error("Error loading chat history:", error)
          setMessages([defaultWelcome])
        }
      } else {
        setMessages([defaultWelcome])
      }
    }
  }, [selectedReplica, selectedReplicaUuid, chatStorageKey])

  // Save chat history to localStorage when it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages))
    }
  }, [messages, chatStorageKey])

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
    // При очистке чата добавляем приветственное сообщение в зависимости от выбранной реплики
    if (selectedReplica) {
      // Используем приветствие из выбранной реплики
      const welcomeMsg = createWelcomeMessage(selectedReplica.name, selectedReplica.greeting);
      setMessages([welcomeMsg])
    } else {
      // Используем стандартное приветствие
      setMessages([createWelcomeMessage()])
    }
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
