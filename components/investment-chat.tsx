"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, Send, MessageSquare, User, Mic, ChevronDown, Bot, Check } from "lucide-react"
import { fetchReplicas } from "@/app/lib/api/sensay-replicas-client"
import { SensayReplica } from "@/app/lib/api/sensay-replicas-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  time: string
  avatar?: string
}

export default function InvestmentChat() {
  // Состояние для хранения реплик, загруженных из API
  const [replicas, setReplicas] = useState<SensayReplica[]>([])
  const [selectedReplica, setSelectedReplica] = useState<SensayReplica | null>(null)
  const [loadingReplicas, setLoadingReplicas] = useState(false)

  // Состояние для чата
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Who would be close to the idea of doing everything together and dividing it in percentages",
      sender: "other",
      time: "22:45",
      avatar: "flower"
    },
    {
      id: "2",
      content: "Try to send me offer later",
      sender: "other",
      time: "22:45",
      avatar: "flower"
    },
    {
      id: "3",
      content: "I would like to participate with my project on my own token. You can now invest your funds in the development of this project",
      sender: "other",
      time: "22:45",
      avatar: "flower"
    },
    {
      id: "4",
      content: "No, thanks",
      sender: "other",
      time: "22:45",
      avatar: "cross"
    }
  ])

  const [activeTab, setActiveTab] = useState<string>("rooms")
  const [newMessage, setNewMessage] = useState<string>("") 
  
  // Загрузка списка реплик при монтировании компонента
  useEffect(() => {
    const loadReplicas = async () => {
      try {
        setLoadingReplicas(true)
        const data = await fetchReplicas()
        setReplicas(data)
        
        // Установка первой реплики как выбранной по умолчанию
        if (data.length > 0 && !selectedReplica) {
          setSelectedReplica(data[0])
        }
      } catch (error) {
        console.error('Ошибка при загрузке реплик:', error)
      } finally {
        setLoadingReplicas(false)
      }
    }
    
    loadReplicas()
  }, [selectedReplica]) // Исправляем зависимость
  
  // Функция для выбора реплики
  const handleSelectReplica = (replica: SensayReplica) => {
    setSelectedReplica(replica)
    // Здесь можно добавить логику для изменения контекста чата при смене реплики
  }

  // Investment opportunities shown in the right panel
  const investments = [
    { 
      id: "1", 
      date: "22.02.23", 
      title: "The idea for opening a online casino on a new blockchain", 
      tokens: "2"
    },
    { 
      id: "2", 
      date: "22.02.23", 
      title: "Lukoil shares for sale to other intermediaries", 
      tokens: "3"
    },
    { 
      id: "3", 
      date: "22.02.23", 
      title: "Sale of real estate in Cyprus for long-term cooperation", 
      tokens: "2"
    }
  ]

  // People in the room
  const participants = [
    { id: "1", name: "Alexx", role: "admin", status: "inactive" },
    { id: "2", name: "Ronald", role: "guest", status: "active" },
    { id: "3", name: "Kost-La", role: "guest", status: "inactive" },
    { id: "4", name: "Vampire", role: "guest", status: "inactive" }
  ]

  // Room chat example
  const roomsChat = [
    { id: "1", name: "Ronald", message: "Of course! Let's make a deal tomorrow!", time: "02:46" },
    { id: "2", name: "George", message: "it will be ready in an hour. Please specify a couple of details?", time: "00:08" },
    { id: "3", name: "Salkino", message: "Let's get in touch with you tomorrow.", time: "00:04" }
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          content: newMessage,
          sender: "user",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
      setNewMessage("")
    }
  }

  // Function to render avatar based on type
  const renderAvatar = (type?: string) => {
    if (type === "flower") {
      return (
        <div className="w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center text-gold-400">
          ✻
        </div>
      )
    } else if (type === "cross") {
      return (
        <div className="w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
      )
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-dark-200 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-dark-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-3 bg-dark-200 border-b border-dark-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Discussion of hot bets</h2>
            <div className="h-6 w-16 flex">
              <div className="w-full bg-dark-300 h-1 mt-3 relative">
                <div className="absolute inset-y-0 left-0 right-0">
                  <div className="w-full h-full flex items-center justify-between px-1">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="w-0.5 h-3 bg-gold-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-300 px-3 py-2 rounded flex items-center gap-2">
            <div className="text-gold-400">
              ♠
            </div>
            <span className="text-white text-sm">GR Secure</span>
          </div>
        </div>
        
        {/* Participants */}
        <div className="p-3 bg-dark-200 border-b border-dark-500">
          <div className="flex gap-6">
            {participants.map(participant => (
              <div key={participant.id} className="flex flex-col items-center">
                <div className={`relative w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center ${
                  participant.status === "active" ? "ring-2 ring-green-500" : ""
                }`}>
                  <Mic className="h-5 w-5 text-white" />
                  {participant.status === "active" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs text-white mt-1">{participant.name}</span>
                <span className="text-xs text-gray-500">{participant.role}</span>
              </div>
            ))}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center">
                <span className="text-gray-400 text-xl">+</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-dark-100">
          <div className="space-y-4">
            {messages.map(message => (
              <div key={message.id} className="flex items-start gap-2">
                {message.sender === "other" && renderAvatar(message.avatar)}
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user" 
                    ? "bg-dark-300 ml-auto" 
                    : "bg-dark-200"
                }`}>
                  <p className="text-white">{message.content}</p>
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                </div>
                {message.sender === "user" && renderAvatar()}
              </div>
            ))}
          </div>
        </div>
        
        {/* Message Input */}
        <div className="p-3 bg-dark-200 border-t border-dark-500 flex gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400">
            <span className="text-2xl">+</span>
          </Button>
          <Input 
            type="text" 
            placeholder="Add your message" 
            className="flex-1 bg-dark-100 border-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button variant="gold" size="icon" className="rounded-full" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-72 border-l border-dark-500 bg-dark-100 flex flex-col">
        {/* Investment Opportunities */}
        <div className="p-2 space-y-2">
          {investments.map(investment => (
            <div key={investment.id} className="flex items-center gap-2 p-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400">{investment.date}</div>
                <p className="text-xs text-gray-300">{investment.title}</p>
              </div>
              <div className="bg-gold-400 text-dark-100 px-2 py-0.5 rounded-full text-xs font-medium">
                {investment.tokens}
              </div>
            </div>
          ))}
        </div>
        
        {/* Tab Navigation */}
        <div className="mt-4 px-3">
          <h3 className="text-md font-medium text-white">Rooms</h3>
          <div className="flex mt-2 space-x-2">
            <Button 
              variant={activeTab === "rooms" ? "gold" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("rooms")}
              className="text-xs"
            >
              Rooms
            </Button>
            <Button 
              variant={activeTab === "lobby" ? "gold" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("lobby")}
              className="text-xs"
            >
              Lobby
            </Button>
            <Button 
              variant={activeTab === "private" ? "ghost" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("private")}
              className="text-xs"
            >
              Private chat
            </Button>
          </div>
        </div>
        
        {/* Room List */}
        <div className="flex-1 overflow-y-auto p-2 mt-2">
          {roomsChat.map(room => (
            <div key={room.id} className="p-2 bg-dark-200 rounded-lg mb-2">
              <div className="flex justify-between items-center">
                <h4 className="text-white">{room.name}</h4>
                <div className="text-xs text-gray-400">{room.time}</div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{room.message}</p>
            </div>
          ))}
        </div>
        
        {/* Casino Pitch */}
        <div className="p-3 mt-auto border-t border-dark-500">
          <Card className="p-3">
            <h4 className="text-center text-white mb-3">Casino pitch</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center text-gold-400">✻</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center text-gray-500">+</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center text-gray-500">+</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" className="w-full bg-green-500 text-white">Start</Button>
              <Button variant="ghost" size="sm" className="w-10 bg-red-500 text-white rounded-full">×</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center text-gold-400">✻</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center text-gold-400">♦</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center text-gray-500">+</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
