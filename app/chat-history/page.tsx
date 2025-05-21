"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type ChatHistoryEntry = {
  id: string
  replicaUUID: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  createdAt: string
}

export default function ChatHistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [replicaUUID, setReplicaUUID] = useState("")
  const [selectedChat, setSelectedChat] = useState<ChatHistoryEntry | null>(null)
  const { toast } = useToast()

  // Fetch chat history
  const fetchChatHistory = async () => {
    if (!replicaUUID.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a replica UUID.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Try to fetch from the API
      try {
        const response = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`, {
          // Add headers if needed
          headers: {
            "Content-Type": "application/json",
            // Add any auth headers if required
            // "Authorization": `Bearer ${apiKey}`
          },
        })

        if (response.ok) {
          const data = await response.json()
          setChatHistory(data.history || [])
          return
        }
      } catch (apiError) {
        console.error("API Error:", apiError)
        // Continue to fallback
      }

      // Fallback to mock data if API call fails
      console.log("Using mock data due to API connection issues")
      const mockChatHistory = [
        {
          id: "mock-chat-1",
          replicaUUID: replicaUUID,
          messages: [
            {
              role: "user",
              content: "What is the Mafia game?",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              role: "assistant",
              content:
                "Mafia is a social deduction game where players are secretly assigned roles and must work together to identify the mafia members among them, or if you're a mafia member, to eliminate the innocent townspeople.",
              timestamp: new Date(Date.now() - 3590000).toISOString(),
            },
            {
              role: "user",
              content: "How many players do I need to play?",
              timestamp: new Date(Date.now() - 3500000).toISOString(),
            },
            {
              role: "assistant",
              content:
                "Mafia can be played with 7 or more players, though 8-12 is ideal. With fewer than 7, the game mechanics become less balanced. The game needs a moderator and a mix of town and mafia roles.",
              timestamp: new Date(Date.now() - 3490000).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "mock-chat-2",
          replicaUUID: replicaUUID,
          messages: [
            {
              role: "user",
              content: "What are the best strategies for playing as a Detective?",
              timestamp: new Date(Date.now() - 1800000).toISOString(),
            },
            {
              role: "assistant",
              content:
                "As a Detective in Mafia, consider these strategies: 1) Be selective about revealing your role and findings, 2) Keep notes of your investigations, 3) Investigate quiet players who might be hiding their mafia role, 4) Consider the timing of your reveals - sometimes it's better to gather more information before sharing.",
              timestamp: new Date(Date.now() - 1790000).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ]

      setChatHistory(mockChatHistory)
      toast({
        title: "Demo Mode",
        description: "Showing mock chat history (API unavailable).",
      })
    } catch (error) {
      console.error("Error fetching chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history. Please try again.",
        variant: "destructive",
      })
      setChatHistory([])
    } finally {
      setLoading(false)
    }
  }

  // Create chat history entry
  const handleCreateChatEntry = async () => {
    if (!replicaUUID.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a replica UUID.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Hello, this is a test message.",
            },
          ],
        }),
      })

      if (!response.ok) throw new Error("Failed to create chat history entry")

      // Refresh chat history
      fetchChatHistory()

      toast({
        title: "Success",
        description: "Chat history entry created successfully.",
      })
    } catch (error) {
      console.error("Error creating chat history entry:", error)
      toast({
        title: "Error",
        description: "Failed to create chat history entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Download chat history as JSON
  const downloadChatHistory = (chat: ChatHistoryEntry) => {
    const dataStr = JSON.stringify(chat, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `chat-history-${chat.id.substring(0, 8)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-mafia-900 dark:text-mafia-300">Chat History</h1>

      <Card className="border-mafia-200 dark:border-mafia-800 mb-6">
        <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
          <CardTitle className="text-mafia-900 dark:text-mafia-300">Search Chat History</CardTitle>
          <CardDescription>View and manage your chat history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="replicaUUID" className="block text-sm font-medium mb-1">
                Replica UUID
              </label>
              <Input
                id="replicaUUID"
                value={replicaUUID}
                onChange={(e) => setReplicaUUID(e.target.value)}
                placeholder="Enter replica UUID"
                className="border-mafia-300 focus-visible:ring-mafia-500"
              />
            </div>
            <Button onClick={fetchChatHistory} className="bg-mafia-600 hover:bg-mafia-700">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button onClick={handleCreateChatEntry} variant="outline" className="border-mafia-300">
              Create Test Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-mafia-200 dark:border-mafia-800">
        <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
          <CardTitle className="text-mafia-900 dark:text-mafia-300">Chat History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading chat history...
                  </TableCell>
                </TableRow>
              ) : chatHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No chat history found.
                  </TableCell>
                </TableRow>
              ) : (
                chatHistory.map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell>{chat.id.substring(0, 8)}...</TableCell>
                    <TableCell>{formatDate(chat.createdAt)}</TableCell>
                    <TableCell>{chat.messages.length} messages</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedChat(chat)}
                          className="h-8 w-8 text-blue-600"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadChatHistory(chat)}
                          className="h-8 w-8 text-green-600"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Chat History</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this chat history? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {}}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={() => {}}>
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedChat && (
        <Dialog open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chat Conversation</DialogTitle>
              <DialogDescription>
                ID: {selectedChat.id} • Created: {formatDate(selectedChat.createdAt)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              {selectedChat.messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-mafia-600 text-white" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-60">{formatDate(message.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedChat(null)}>
                Close
              </Button>
              <Button onClick={() => downloadChatHistory(selectedChat)} className="bg-mafia-600 hover:bg-mafia-700">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
