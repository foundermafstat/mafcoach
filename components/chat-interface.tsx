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
// import { TriggerButtons } from "@/components/trigger-buttons" // Закомментировано по запросу пользователя
import { SensayReplica } from "@/app/lib/api/sensay-replicas-client"
import { useReplica } from "./replica-provider"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

export default function ChatInterface() {
  const { messages, addMessage, isLoading, clearChat } = useChat()
  const [input, setInput] = useState("")
  
  // Используем глобальный контекст для работы с репликами
  const { selectedReplica, selectedReplicaUuid } = useReplica()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isClient = useIsClient() // Определяем, выполняется ли код на клиенте
  const router = useRouter()
  const { setTheme } = useTheme()
  const { setHeaderState } = useHeader()
  
  // Флаг для отслеживания первого ответа реплики
  const [firstResponseSent, setFirstResponseSent] = useState(false)

  // Прокрутка к последнему сообщению при загрузке компонента или изменении сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
      // Используем значение из глобального контекста
      const replicaUuid = selectedReplicaUuid || undefined;
      console.log('Sending message to replica UUID:', replicaUuid);
      addMessage({ role: "user", content: input.trim() }, replicaUuid);
      setInput("");
      
      // Устанавливаем флаг первого ответа в true после отправки первого сообщения пользователем
      if (!firstResponseSent) {
        setFirstResponseSent(true);
      }
    }
  }

  const handleClearChat = () => {
    clearChat()
    // Сбрасываем флаг первого ответа при очистке чата
    setFirstResponseSent(false)
    
    // После очистки чата отображаем начальный запрос текущего активного ИИ-агента
    if (selectedReplica) {
      // Используем реплику из глобального контекста
      const welcomeMessage = selectedReplica.greeting || `Привет! Я ${selectedReplica.name}. Чем я могу помочь?`
      
      console.log('Sending welcome message with replica UUID:', selectedReplicaUuid);
      // Передаём UUID выбранной реплики для корректной обработки последующих сообщений
      addMessage({ role: "assistant", content: welcomeMessage }, selectedReplicaUuid)
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
          {/* Отображение текущей реплики из глобального контекста */}
          <div className="flex items-center gap-2 px-2">
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
          </div>
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
                  message.role === "user" ? "bg-mafia-600 text-white" : "bg-muted dark:bg-mafia-800/50"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({node, ...props}) => <p className="text-sm my-2" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold my-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 ml-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 ml-2" {...props} />,
                        li: ({node, ...props}) => <li className="my-1" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-500 underline" {...props} />,
                        code: ({node, className, ...props}: any) => {
                          const match = /language-(\w+)/.exec(className || '')
                          const isInline = !match && !props.children?.includes('\n');
                          return isInline ? (
                            <code className="bg-mafia-100 dark:bg-mafia-700 px-1 py-0.5 rounded text-xs" {...props} />
                          ) : (
                            <code className="block bg-mafia-100 dark:bg-mafia-700 p-2 rounded text-xs my-2 overflow-x-auto" {...props} />
                          )
                        },
                        pre: ({node, ...props}) => <pre className="bg-mafia-100 dark:bg-mafia-700 p-2 rounded my-2 overflow-x-auto" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-mafia-300 dark:border-mafia-600 pl-2 italic my-2" {...props} />
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className="text-xs mt-1 opacity-60">
                  {/* Форматировать дату только на клиенте, на сервере показать заглушку */}
                  {isClient 
                    ? format(new Date(message.timestamp), "MMM d, yyyy h:mm a")
                    : ""}
                </p>
                {/* Отображаем кнопки с триггерами только после сообщений ассистента */}
                {/* Триггеры закомментированы по запросу пользователя */}
                {/* {message.role === "assistant" && <TriggerButtons className="mt-2" selectedReplica={selectedReplica} />} */}
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
            placeholder="Enter your message"
            disabled={isLoading}
            className="focus-visible:ring-mafia-500"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-gold-400 hover:bg-gold-500"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
