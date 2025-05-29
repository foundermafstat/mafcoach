"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Trash2, ChevronDown, Check, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "./chat-provider"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useIsClient } from "@/app/lib/utils/use-is-client"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { extractChatTrigger, ChatTrigger } from "@/app/lib/utils/parseTrigger"
import { useHeader } from "@/components/header-context"
import { TriggerButtons } from "@/components/trigger-buttons"
import { SensayReplica } from "@/app/lib/api/sensay-replicas-client"
import { useReplica } from "./replica-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ChatInterface() {
  const { messages, addMessage, isLoading, clearChat } = useChat()
  const [input, setInput] = useState("")
  
  // Используем глобальный контекст для работы с репликами
  const { replicas, selectedReplica, setSelectedReplica, loadingReplicas, refreshReplicas } = useReplica()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isClient = useIsClient() // Определяем, выполняется ли код на клиенте
  const router = useRouter()
  const { setTheme } = useTheme()
  const { setHeaderState } = useHeader()

  // Прокрутка к последнему сообщению при загрузке компонента или изменении сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  // Функция для выбора реплики из глобального контекста
  const handleSelectReplica = (replica: SensayReplica) => {
    console.log('Selecting replica:', replica);
    console.log('Selected replica UUID:', replica.uuid);
    
    // Проверяем, меняется ли реплика
    const isNewReplica = !selectedReplica || selectedReplica.uuid !== replica.uuid;
    
    // Устанавливаем выбранную реплику в глобальном контексте
    setSelectedReplica(replica);
    
    // Если выбрана новая реплика, сбрасываем состояние чата
    if (isNewReplica) {
      // Очищаем историю чата при смене реплики
      clearChat();
      
      // Добавляем приветственное сообщение от выбранной реплики
      const welcomeMessage = replica.greeting || `Привет! Я ${replica.name}. Чем я могу помочь?`
      
      // Передаем UUID выбранной реплики при добавлении приветственного сообщения
      addMessage({ role: "assistant", content: welcomeMessage }, replica.uuid);
    }
  }

  // Effect: watch for triggers in the latest assistant message
  useEffect(() => {
    if (!messages.length) return
    const last = messages[messages.length - 1]
    if (last.role !== "assistant") return
    const trigger = extractChatTrigger(last.content)
    if (!trigger) return
    handleChatTrigger(trigger)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  function handleChatTrigger(trigger: ChatTrigger) {
    switch (trigger.action) {
      case "navigate":
        if (typeof trigger.payload === "string") {
          router.push(trigger.payload)
        }
        break
      case "theme":
        if (
          trigger.payload === "light" ||
          trigger.payload === "dark" ||
          trigger.payload === "system"
        ) {
          setTheme(trigger.payload)
        }
        break
      case "headerState":
        setHeaderState(trigger.payload)
        break
      default:
        // Unknown trigger
        break
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      // Передаем UUID выбранной реплики при отправке сообщения
      // Теперь используем значение из глобального контекста
      const replicaUuid = selectedReplica?.uuid || undefined;
      console.log('Sending message to replica UUID:', replicaUuid);
      addMessage({ role: "user", content: input.trim() }, replicaUuid);
      setInput("");
    }
  }

  const handleClearChat = () => {
    clearChat()
    
    // После очистки чата отображаем начальный запрос текущего активного ИИ-агента
    if (selectedReplica) {
      // Используем реплику из глобального контекста
      const welcomeMessage = selectedReplica.greeting || `Привет! Я ${selectedReplica.name}. Чем я могу помочь?`
      
      console.log('Sending welcome message with replica UUID:', selectedReplica.uuid);
      // Передаём UUID выбранной реплики для корректной обработки последующих сообщений
      addMessage({ role: "assistant", content: welcomeMessage }, selectedReplica.uuid)
    } else {
      // Если реплика не выбрана, используем стандартное приветствие Mafia Coach
      addMessage({ role: "assistant", content: "Привет! Я Mafia Coach. Как я могу помочь тебе в игре Мафия?" })
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Выпадающее меню для выбора реплики */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 h-8 px-2 text-white hover:bg-mafia-800 border border-mafia-700"
              >
                <div className="flex items-center gap-2 max-w-[180px]">
                  {selectedReplica ? (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-white">
                      <img 
                        src={selectedReplica.profileImage || '/coach.png'} 
                        alt={selectedReplica.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/coach.png';
                        }}
                        width={32}
                        height={32}
                      />
                    </div>
                  ) : (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-white">
                      <Image
                        src="/coach.png"
                        alt="Mafia Coach"
                        fill
                        className="object-cover"
                        sizes="32px"
                        priority
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-semibold">
                      {selectedReplica ? selectedReplica.name : 'Mafia Coach'}
                    </span>
                    {selectedReplica && (
                      <span className="text-xs text-gray-400">
                        {selectedReplica.type}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-dark-200 border-mafia-600 text-white">
              <DropdownMenuLabel>Выберите реплику</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-mafia-700" />
              {loadingReplicas ? (
                <div className="p-2 text-center text-sm text-gray-400">Загрузка...</div>
              ) : replicas.length > 0 ? (
                replicas.map((replica) => (
                  <DropdownMenuItem 
                    key={replica.uuid} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-mafia-800"
                    onClick={() => handleSelectReplica(replica)}
                  >
                    <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0 bg-mafia-100/10">
                      <img 
                        src={replica.profileImage || '/coach.png'} 
                        alt={replica.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/coach.png';
                        }}
                        width={24}
                        height={24}
                      />
                    </div>
                    <span className="flex-1 truncate">{replica.name}</span>
                    {selectedReplica?.uuid === replica.uuid && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-gray-400">Нет доступных реплик</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearChat}
          className="text-white hover:bg-mafia-800 hover:text-white"
          title="Clear chat history"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto" style={{ height: "calc(100vh - 130px)" }}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-mafia-600 text-white" : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-60">
                  {/* Форматировать дату только на клиенте, на сервере показать заглушку */}
                  {isClient 
                    ? format(new Date(message.timestamp), "MMM d, yyyy h:mm a")
                    : ""}
                </p>
                {/* Отображаем кнопки с триггерами только после сообщений ассистента */}
                {message.role === "assistant" && <TriggerButtons className="mt-2" selectedReplica={selectedReplica} />}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t sticky bottom-0 bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Mafia game..."
            disabled={isLoading}
            className="border-mafia-300 focus-visible:ring-mafia-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-mafia-600 hover:bg-mafia-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
