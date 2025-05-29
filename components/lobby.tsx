"use client"

import React from "react"
import { Star, MessageSquare, User, Briefcase } from "lucide-react"
import Link from "next/link"

interface Room {
  id: string
  name: string
  message: string
  time: string
  avatarType: "star" | "cross" | "flower"
  isStarred?: boolean
}

export default function Lobby() {
  const [rooms, setRooms] = React.useState<Room[]>([
    {
      id: "1",
      name: "Ronald",
      message: "Of course! Let's make a deal tomorrow!",
      time: "02:46",
      avatarType: "flower",
      isStarred: false,
    },
    {
      id: "2",
      name: "George",
      message: "it will be ready in an hour. Please specify a couple of details?",
      time: "00:08",
      avatarType: "star",
      isStarred: false,
    },
    {
      id: "3",
      name: "Salkino",
      message: "Let's get in touch with you tomorrow.",
      time: "00:04",
      avatarType: "cross",
      isStarred: false,
    },
  ])

  const toggleStar = (id: string) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === id) {
          return { ...room, isStarred: !room.isStarred }
        }
        return room
      })
    )
  }

  return (
    <div className="bg-[#121316] min-h-screen pb-16">
      {/* Header with room info */}
      <div className="p-4 bg-[#141519] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-[#1e2024] rounded-full p-2">
            <MessageSquare className="text-blue-400 h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl text-white font-semibold">28.02.23</h1>
            <p className="text-gray-400 text-sm">Sale of real estate in Cyprus for long-term cooperation</p>
          </div>
        </div>
        <div className="bg-[#f4b13e] text-[#121316] font-semibold rounded-full px-3 py-1">
          2
        </div>
      </div>

      {/* Room list */}
      <div className="p-4">
        <h2 className="text-2xl font-bold text-white mb-4">Open Rooms</h2>
        
        {rooms.map((room) => (
          <div key={room.id} className="room-card flex items-start gap-3">
            <div className="avatar-circle flex-shrink-0">
              {room.avatarType === "star" && <Star className="avatar-icon-orange h-6 w-6" />}
              {room.avatarType === "cross" && <MessageSquare className="avatar-icon-white h-6 w-6" />}
              {room.avatarType === "flower" && (
                <div className="h-6 w-6 flex items-center justify-center">
                  <div className="avatar-icon-orange">✻</div>
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between">
                <h3 className="text-white font-medium">{room.name}</h3>
                <button type="button" onClick={() => toggleStar(room.id)}>
                  <Star className={`h-5 w-5 ${room.isStarred ? "text-yellow-400" : "text-gray-600"}`} />
                </button>
              </div>
              <p className="room-message">{room.message}</p>
            </div>
            
            <div className="time-indicator flex-shrink-0">{room.time}</div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <Link href="/lobby" className="nav-item active">
          <MessageSquare className="h-6 w-6 mb-1" />
          <span>Lobby</span>
        </Link>
        <Link href="/games" className="nav-item">
          <Briefcase className="h-6 w-6 mb-1" />
          <span>Games</span>
        </Link>
        <Link href="/profile" className="nav-item">
          <User className="h-6 w-6 mb-1" />
          <span>Profile</span>
        </Link>
        <Link href="/notifications" className="nav-item">
          <div className="relative">
            <div className="h-6 w-6 mb-1 rounded-full bg-gray-700" />
          </div>
          <span>Notify</span>
        </Link>
      </div>
    </div>
  )
}
