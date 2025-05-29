"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash, Edit, Save, X, Upload, FileText, RefreshCcw, AlertCircle, Eye, Database, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReplica } from "@/components/replica-provider"
// Импорт функции статистики удален, так как API не поддерживает этот эндпоинт

// Using the actual Sensay API types
type KnowledgeEntry = {
  id: number
  replica_uuid: string | null
  type: "file_upload" | "url" | "training_history" | "text"
  filename: string | null
  status: string
  raw_text: string | null
  processed_text: string | null
  created_at: string
  updated_at: string
  title: string | null
  description: string | null
}

export default function TrainingPage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Use global replica context instead of local state
  const { selectedReplicaUuid: replicaUUID, selectedReplica } = useReplica()
  // Состояния для статистики удалены, так как API не поддерживает этот эндпоинт
  
  const { toast } = useToast()

  // Fetch knowledge entries
  const fetchEntries = useCallback(async (showRefreshing = true) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Fetch entries from the API via API routes
      try {
        // Используем replicaUUID для фильтрации данных, если он задан
        const url = replicaUUID 
          ? `/api/sensay/training?replica_uuid=${replicaUUID}` 
          : '/api/sensay/training';
          
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch entries')
        }
        
        const fetchedEntries = await response.json()
        setEntries(fetchedEntries)
      } catch (apiError) {
        console.error("API Error:", apiError)
        toast({
          title: "Error",
          description: "Could not fetch training data. Please check your API settings.",
          variant: "destructive",
        })
        // Set empty array as fallback
        setEntries([])
      }
    } catch (error) {
      console.error("Error in fetchEntries:", error)
      toast({
        title: "Error",
        description: "Failed to load knowledge entries.",
        variant: "destructive",
      })
      setEntries([])
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [replicaUUID, toast])

  // Функция для получения статистики тренировок удалена, так как API не поддерживает этот эндпоинт

  // Initial fetch
  useEffect(() => {
    fetchEntries(false);
  }, [fetchEntries]);
  
  // Обновляем данные при смене реплики
  useEffect(() => {
    if (replicaUUID) {
      fetchEntries(true);
    }
  }, [replicaUUID, fetchEntries]);
  
  // useEffect для получения статистики удален, так как API не поддерживает этот эндпоинт
  
  // Function to refresh entries
  const handleRefresh = () => {
    fetchEntries(true)
  }

  // Create knowledge entry
  const handleCreateEntry = async () => {
    if (!content || !replicaUUID) {
      toast({
        title: "Missing information",
        description: "Please provide a replica UUID and content for the training entry.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/sensay/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replicaUUID,
          content,
          title: title || undefined,
          description: description || undefined
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create training entry')
      }
      
      const data = await response.json()
      const knowledgeBaseID = data.knowledgeBaseID

      toast({
        title: "Training entry created",
        description: `Successfully created a training entry with ID: ${knowledgeBaseID}`,
      })

      // Add the new entry to the list (optimistic update)
      const newEntry: KnowledgeEntry = {
        id: knowledgeBaseID,
        replica_uuid: replicaUUID,
        type: "text",
        filename: null,
        status: "PROCESSING",
        raw_text: content,
        processed_text: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        title: title || null,
        description: description || null
      }
      
      setEntries(prev => [newEntry, ...prev])

      // Reset form fields
      setTitle("")
      setContent("")
      setDescription("")
      
      // Refresh entries to get the updated status
      setTimeout(() => {
        fetchEntries(true)
      }, 2000)
    } catch (error) {
      console.error("Error creating training entry:", error)
      toast({
        title: "Error",
        description: "Failed to create training entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update knowledge entry
  const handleUpdateEntry = async (id: number) => {
    if (!editContent) {
      toast({
        title: "Missing information",
        description: "Please provide content for the training entry.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const entry = entries.find(e => e.id === id)
      
      if (!entry?.replica_uuid) {
        throw new Error("Entry or replica UUID not found")
      }

      const response = await fetch(`/api/sensay/training?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replicaUUID: entry.replica_uuid,
          content: editContent,
          title: editTitle || undefined,
          description: editDescription || undefined
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update training entry')
      }

      toast({
        title: "Training entry updated",
        description: "Successfully updated the training entry",
      })

      // Update the entry in the list (optimistic update)
      setEntries(prev => 
        prev.map(entry => {
          if (entry.id === id) {
            return {
              ...entry,
              raw_text: editContent,
              title: editTitle || null,
              description: editDescription || null,
              updated_at: new Date().toISOString(),
              status: "PROCESSING" // Reset status as it will be processed again
            }
          }
          return entry
        })
      )

      // Reset editing state
      setEditingId(null)
      setEditTitle("")
      setEditContent("")
      setEditDescription("")
      
      // Refresh entries to get the updated status
      setTimeout(() => {
        fetchEntries(true)
      }, 2000)
    } catch (error) {
      console.error("Error updating training entry:", error)
      toast({
        title: "Error",
        description: "Failed to update training entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete knowledge entry
  const handleDeleteEntry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this training entry? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/sensay/training?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete training entry')
        } catch (e) {
          // Если ответ не содержит JSON
          throw new Error(`Failed to delete training entry: ${response.statusText}`)
        }
      }

      toast({
        title: "Training entry deleted",
        description: "Successfully deleted the training entry",
      })

      // Remove the entry from the list
      setEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (error) {
      console.error("Error deleting training entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete training entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Start editing entry
  const startEditing = (entry: KnowledgeEntry) => {
    setEditingId(entry.id)
    setEditTitle(entry.title || "")
    setEditContent(entry.raw_text || "")
    setEditDescription(entry.description || "")
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // Upload file using the Sensay file upload API with signed URLs
  const handleFileUpload = async () => {
    if (!file || !replicaUUID) {
      toast({
        title: "Missing information",
        description: "Please select a file and provide a replica UUID.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadProgress(10)
      
      console.log(`Начинаем загрузку файла: ${file.name}, размер: ${file.size} байт`)
      
      // Шаг 1: Получаем подписанный URL для загрузки файла
      const getSignedUrlResponse = await fetch(
        `/api/sensay/training/files?filename=${encodeURIComponent(file.name)}&replicaUUID=${replicaUUID}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      
      if (!getSignedUrlResponse.ok) {
        const errorData = await getSignedUrlResponse.json()
        throw new Error(errorData.error || 'Failed to get signed URL for file upload')
      }
      
      const signedUrlData = await getSignedUrlResponse.json()
      const { signedURL, knowledgeBaseID } = signedUrlData
      
      if (!signedURL || !knowledgeBaseID) {
        throw new Error('Invalid response from server - missing signedURL or knowledgeBaseID')
      }
      
      console.log(`Получен подписанный URL для загрузки: ${knowledgeBaseID}`)
      setUploadProgress(30)
      
      // Шаг 2: Читаем файл и передаем его содержимое
      const fileText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          resolve(content)
        }
        reader.onerror = (e) => {
          reject(new Error('Failed to read file'))
        }
        reader.readAsText(file)
      })
      
      setUploadProgress(50)
      
      // Шаг 3: Загружаем файл на подписанный URL
      const uploadResponse = await fetch('/api/sensay/training/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signedURL,
          knowledgeBaseID,
          fileContent: fileText,
          fileType: file.type || 'text/plain'
        })
      })
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: uploadResponse.statusText }))
        throw new Error(errorData.error || 'Failed to upload file')
      }
      
      const uploadResult = await uploadResponse.json()
      setUploadProgress(80)
      
      setUploadProgress(100)
      
      toast({
        title: "File uploaded",
        description: "File has been successfully uploaded and is being processed.",
      })
      
      // Очищаем форму и обновляем список
      setFile(null)
      
      // Обновляем список записей
      setTimeout(() => {
        fetchEntries(true)
        setUploadProgress(0)
      }, 2000)
      
    } catch (error) {
      console.error('Error in file upload:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to upload file. Please try again.',
        variant: "destructive",
      })
      setUploadProgress(0)
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-green-500 hover:bg-green-600"
      case "PROCESSING":
        return "bg-blue-500 hover:bg-blue-600"
      case "ERR_FILE_PROCESSING":
      case "ERR_TEXT_PROCESSING":
      case "ERR_TEXT_TO_VECTOR":
      case "SYNC_ERROR":
        return "bg-red-500 hover:bg-red-600"
      case "BLANK":
      case "AWAITING_UPLOAD":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Форматирование размера данных в читаемый вид
  const formatDataSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="container mx-auto py-8 pb-32" style={{ height: "calc(100vh - 60px)", overflowY: "auto" }}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-mafia-900 dark:text-mafia-100">AI Training</h1>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="text">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="text">Text Training</TabsTrigger>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <Card className="border-mafia-200 dark:border-mafia-800">
              <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
                <CardTitle className="text-mafia-900 dark:text-mafia-300">Create Training Entry</CardTitle>
                <CardDescription>Train your AI agent with custom knowledge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <label htmlFor="replicaInfo" className="block text-sm font-medium mb-1">
                    Active Replica
                  </label>
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
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title (optional)
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for this training entry"
                    className="border-mafia-300 focus-visible:ring-mafia-500"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the training content"
                    className="min-h-[150px] border-mafia-300 focus-visible:ring-mafia-500"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description (optional)
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description for this training entry"
                    className="min-h-[80px] border-mafia-300 focus-visible:ring-mafia-500"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCreateEntry}
                  className="bg-mafia-600 hover:bg-mafia-700"
                  disabled={loading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Entry
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="border-mafia-200 dark:border-mafia-800">
              <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
                <CardTitle className="text-mafia-900 dark:text-mafia-300">Upload Training Files</CardTitle>
                <CardDescription>Upload documents to train your AI agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <label htmlFor="replicaInfo" className="block text-sm font-medium mb-1">
                    Active Replica
                  </label>
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
                <div>
                  <label htmlFor="file" className="block text-sm font-medium mb-1">
                    Training File
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="border-mafia-300 focus-visible:ring-mafia-500"
                    />
                    {file && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-mafia-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }} 
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleFileUpload}
                  className="bg-mafia-600 hover:bg-mafia-700"
                  disabled={!file || uploadProgress > 0 || loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div>
          <h2 className="text-xl font-bold mb-4 text-mafia-900 dark:text-mafia-100">Training Entries</h2>
          {loading && !refreshing ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <AlertCircle className="mx-auto h-10 w-10 text-mafia-400 mb-2" />
              <p className="text-mafia-600 dark:text-mafia-400">No training entries found</p>
              <p className="text-sm text-mafia-500 dark:text-mafia-500">
                Create a new entry above to get started with training your AI
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className={editingId === entry.id ? "bg-mafia-50 dark:bg-mafia-800/30" : ""}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell>
                        {editingId === entry.id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="border-mafia-300 focus-visible:ring-mafia-500"
                          />
                        ) : (
                          <div className="max-w-[200px] truncate">{entry.title || "No title"}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === entry.id ? (
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Content"
                            className="min-h-[100px] border-mafia-300 focus-visible:ring-mafia-500"
                          />
                        ) : (
                          <div className="max-w-[200px] truncate">{entry.raw_text || "No content"}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(entry.status)}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {editingId === entry.id ? (
                            <>
                              <Button
                                onClick={() => handleUpdateEntry(entry.id)}
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-green-500 hover:text-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={cancelEditing}
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => startEditing(entry)}
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-blue-500 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteEntry(entry.id)}
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
