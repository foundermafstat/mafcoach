"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "./chat-provider"
import { format } from "date-fns"

export default function ChatInterface() {
  const { messages, addMessage, isLoading, clearChat } = useChat()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      addMessage({ role: "user", content: input.trim() })
      setInput("")
    }
  }

  const handleClearChat = () => {
    clearChat()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b bg-mafia-900 text-white flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
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
                  {format(new Date(message.timestamp || Date.now()), "MMM d, yyyy h:mm a")}
                </p>
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
