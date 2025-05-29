"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash, Bot, Eye, RefreshCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useReplica } from "@/components/replica-provider"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { SensayChatHistory, SensayChatMessage } from "@/app/lib/api/sensay-chat-history"

// Используем тип из нашего сервиса

// Extended chat history with status
interface ExtendedSensayChatHistory extends SensayChatHistory {
  status?: string;
}

export default function ChatHistoryPage() {
  // Определяем стили для контейнера страницы для улучшения прокрутки
  const pageStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    padding: '1rem',
    paddingBottom: '5rem', // Добавляем больший отступ внизу для обеспечения прокрутки
    overflow: 'auto',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const [chatHistory, setChatHistory] = useState<ExtendedSensayChatHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<ExtendedSensayChatHistory | null>(null)
  const { toast } = useToast()
  
  // Use the global replica context instead of local state
  const { selectedReplicaUuid: replicaUUID, selectedReplica } = useReplica()

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    if (!replicaUUID) {
      toast({
        title: "No Replica Selected",
        description: "Please select a replica from the header dropdown.",
        variant: "destructive",
      })
      return
    }
    
    console.log(`Fetching chat history for replica UUID: ${replicaUUID}`);

    try {
      setLoading(true)

      // Используем отладочный API-маршрут
      console.log(`Using debug route for replica UUID: ${replicaUUID}`);
      const response = await fetch(`/api/sensay/chat-history/debug?replicaUUID=${encodeURIComponent(replicaUUID)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch chat history");
      }

      const debugData = await response.json();
      console.log('Debug API response:', debugData);
      
      // Проверяем, какой метод аутентификации сработал
      if (debugData.error) {
        throw new Error(`Debug API error: ${debugData.error}. Attempts: ${JSON.stringify(debugData.attempts)}`);
      }
      
      // Получаем данные из ответа отладочного API
      const data = debugData.data;
      
      // Обрабатываем данные в зависимости от формата
      let processedData: ExtendedSensayChatHistory[] = [];
      
      if (data?.history && Array.isArray(data.history)) {
        processedData = data.history.map((item: Record<string, unknown>) => ({
          id: item.id || `history-${Date.now()}`,
          replicaUUID: replicaUUID,
          messages: Array.isArray(item.messages) ? item.messages : [],
          createdAt: item.createdAt as string || new Date().toISOString(),
          status: item.status as string || 'COMPLETED'
        }));
      } else if (data?.items && Array.isArray(data.items)) {
        processedData = data.items.map((item: Record<string, unknown>) => ({
          id: item.id || `history-${Date.now()}`,
          replicaUUID: replicaUUID,
          messages: [{
            role: 'user',
            content: item.content as string || '',
            timestamp: item.created_at as string || new Date().toISOString()
          }],
          createdAt: item.created_at as string || new Date().toISOString(),
          status: item.status as string || 'COMPLETED'
        }));
      } else {
        // Если данные в другом формате, просто используем как есть
        console.log('Data in unknown format:', data);
        processedData = Array.isArray(data) ? data.map((item: any) => ({
          ...item,
          status: item.status || 'UNKNOWN'
        })) : [];
      }
      
      setChatHistory(processedData);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load chat history. Please try again.",
        variant: "destructive",
      })
      setChatHistory([])
    } finally {
      setLoading(false)
    }
  }, [replicaUUID, toast])
  
  // Инициализация: загружаем историю чатов при загрузке страницы или при изменении реплики
  useEffect(() => {
    console.log('Using replica UUID from global context:', replicaUUID);
    
    if (replicaUUID) {
      fetchChatHistory();
    }
  }, [replicaUUID, fetchChatHistory]);

  // Create chat history entry
  const handleCreateChatEntry = async () => {
    if (!replicaUUID) {
      toast({
        title: "No Replica Selected",
        description: "Please select a replica from the header dropdown.",
        variant: "destructive",
      })
      return
    }

    try {
      const testMessage = "Hello, this is a test message.";
      
      // Use the updated API format with 'content' instead of 'messages' array
      const response = await fetch(`/api/sensay/chat-history?replicaUUID=${encodeURIComponent(replicaUUID)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: testMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create chat history entry");
      }

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
        description: error instanceof Error ? error.message : "Failed to create chat history entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete chat history entry
  const handleDeleteChatEntry = async (chatId: string) => {
    if (!replicaUUID) {
      toast({
        title: "No Replica Selected",
        description: "Please select a replica from the header dropdown.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/sensay/chat-history?replicaUUID=${encodeURIComponent(replicaUUID)}&chatId=${encodeURIComponent(chatId)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete chat history entry");
      }

      // Refresh chat history
      fetchChatHistory()
      
      // Close dialog if the deleted chat was selected
      if (selectedChat && selectedChat.id === chatId) {
        setSelectedChat(null);
      }

      toast({
        title: "Success",
        description: "Chat history entry deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting chat history entry:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete chat history entry. Please try again.",
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
  const downloadChatHistory = (chat: ExtendedSensayChatHistory) => {
    const dataStr = JSON.stringify(chat, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    // Добавляем проверку, что chat.id это строка, иначе используем полное значение или генерируем новый ID
    const chatIdStr = typeof chat.id === 'string' 
      ? chat.id 
      : (typeof chat.id === 'number' || typeof chat.id === 'object' 
          ? String(chat.id) 
          : `chat-${Date.now()}`);
    const exportFileDefaultName = `chat-history-${chatIdStr.substring(0, 8)}.json`;

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div style={pageStyles} className="space-y-6">
      <h1 className="text-3xl font-bold text-mafia-900 dark:text-mafia-300">Chat History</h1>

      <Card className="border-mafia-200 dark:border-mafia-800">
        <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
          <CardTitle className="text-mafia-900 dark:text-mafia-300">Active Replica</CardTitle>
          <CardDescription>View and manage your chat history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div>
            <div className="flex items-center gap-2 p-2 border rounded-md border-mafia-300 bg-mafia-50 dark:bg-mafia-900/20 dark:border-mafia-700">
              <Bot className="h-5 w-5 text-mafia-500" />
              {selectedReplica ? (
                <div>
                  <span className="font-medium">{selectedReplica.name}</span>
                  <span className="ml-2 text-xs opacity-70">({selectedReplica.type})</span>
                </div>
              ) : (
                <div className="text-mafia-500 italic">
                  No replica selected. Please select a replica from the header dropdown.
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchChatHistory} className="bg-mafia-600 hover:bg-mafia-700">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh History
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading chat history...
                    </TableCell>
                  </TableRow>
                ) : chatHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No chat history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  chatHistory.map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell>{typeof chat.id === 'string' ? `${chat.id.substring(0, 8)}...` : chat.id}</TableCell>
                      <TableCell>{formatDate(chat.createdAt)}</TableCell>
                      <TableCell>
                        {chat.status ? (
                          <Badge variant={chat.status === 'COMPLETED' ? 'default' : 
                                 chat.status === 'PROCESSING' ? 'secondary' : 
                                 chat.status === 'FAILED' ? 'destructive' : 'outline'}>
                            {chat.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">UNKNOWN</Badge>
                        )}
                      </TableCell>
                      <TableCell>{chat.messages.length} messages</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedChat(chat)}
                            className="h-8 w-8 text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
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
                                <Button variant="destructive" onClick={() => handleDeleteChatEntry(typeof chat.id === 'string' ? chat.id : String(chat.id))}>
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
          </div>
        </CardContent>
      </Card>

      {/* Dialog to view chat history details */}
      {selectedChat && (
        <Dialog open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chat History Details</DialogTitle>
              <DialogDescription>
                View detailed information about this chat history
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Debug information section */}
              <div className="bg-mafia-50 dark:bg-mafia-900/20 p-4 rounded-md border border-mafia-200 dark:border-mafia-800">
                <h3 className="text-sm font-medium mb-2">Debug Information</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <span className="text-xs font-semibold">ID:</span>
                    <code className="ml-2 text-xs bg-mafia-100 dark:bg-mafia-800 p-1 rounded">
                      {selectedChat.id}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs font-semibold">Created:</span>
                    <code className="ml-2 text-xs bg-mafia-100 dark:bg-mafia-800 p-1 rounded">
                      {formatDate(selectedChat.createdAt)}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs font-semibold">Status:</span>
                    <code className="ml-2 text-xs bg-mafia-100 dark:bg-mafia-800 p-1 rounded">
                      {selectedChat.status || 'UNKNOWN'}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs font-semibold">Replica UUID:</span>
                    <code className="ml-2 text-xs bg-mafia-100 dark:bg-mafia-800 p-1 rounded">
                      {selectedChat.replicaUUID}
                    </code>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold">Message Count:</span>
                    <code className="ml-2 text-xs bg-mafia-100 dark:bg-mafia-800 p-1 rounded">
                      {selectedChat.messages.length}
                    </code>
                  </div>
                </div>
              </div>
              
              {/* Messages section */}
              <div className="bg-mafia-50 dark:bg-mafia-900/20 p-4 rounded-md border border-mafia-200 dark:border-mafia-800">
                <h3 className="text-sm font-medium mb-2">Messages</h3>
                <div className="space-y-3">
                  {selectedChat.messages.map((message: SensayChatMessage, idx: number) => (
                    <div
                      key={`msg-${idx}`}
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-mafia-200 dark:bg-mafia-800 text-mafia-900 dark:text-mafia-100 ml-auto max-w-[80%]'
                          : 'bg-mafia-600 text-white mr-auto max-w-[80%]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant={message.role === 'user' ? 'outline' : 'default'}>
                          {message.role}
                        </Badge>
                        {message.timestamp && (
                          <span className="text-xs opacity-70">{formatDate(message.timestamp)}</span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))}
                  
                  {selectedChat.messages.length === 0 && (
                    <div className="text-center p-4 text-sm text-gray-500">
                      No messages in this chat history
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => downloadChatHistory(selectedChat)}
                className="mr-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={() => setSelectedChat(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
