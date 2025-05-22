"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import { SensayApi } from "@/app/lib/api/sensay-api"

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
  content: "Привет! Я ассистент по игре в мафию. Как я могу помочь вам сегодня?",
  timestamp: Date.now(),
}

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [sensayApi, setSensayApi] = useState<SensayApi | null>(null)

  // Инициализируем Sensay API при монтировании компонента
  useEffect(() => {
    const initApi = async () => {
      try {
        // Создаем экземпляр SensayApi с активными настройками из базы данных
        const api = await SensayApi.createWithActiveSettings();
        if (api) {
          setSensayApi(api);
          console.log('SensayApi успешно инициализирован');
        } else {
          console.error('Не удалось инициализировать SensayApi: настройки не найдены');
        }
      } catch (error) {
        console.error('Ошибка при инициализации SensayApi:', error);
      }
    };

    initApi();
  }, []);

  // Загружаем историю чата из localStorage при монтировании
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages)
        }
      } catch (error) {
        console.error("Ошибка при загрузке истории чата:", error)
      }
    }
  }, [])

  // Сохраняем историю чата в localStorage при изменении
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
        // Проверяем, инициализирован ли SensayApi
        if (!sensayApi) {
          throw new Error("SensayApi не инициализирован");
        }
        
        console.log('Отправка сообщения через SensayApi');
        
        try {
          // Отправляем сообщение через SensayApi
          const response = await sensayApi.sendMessage(message.content, false);
          
          // Добавляем ответ ИИ
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: response.content || "У меня возникли проблемы с обработкой вашего запроса. Пожалуйста, попробуйте снова.",
              timestamp: Date.now(),
            },
          ])
        } catch (apiError) {
          console.error("Ошибка Sensay API:", apiError)
          
          // Обрабатываем ошибку API с дружественным сообщением
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "В настоящее время у меня возникли проблемы с соединением с моей базой знаний. Пожалуйста, попробуйте еще раз через минуту.",
              timestamp: Date.now(),
            },
          ])
        }
      } catch (error) {
        // Обрабатываем общую ошибку
        console.error("Ошибка в чате:", error)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Извините, произошла ошибка. Пожалуйста, попробуйте снова.",
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
