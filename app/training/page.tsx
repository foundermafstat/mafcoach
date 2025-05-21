"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash, Edit, Save, X, Upload, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type KnowledgeEntry = {
  id: string
  question: string
  answer: string
  replicaUUID: string
  createdAt: string
  updatedAt: string
}

export default function TrainingPage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [replicaUUID, setReplicaUUID] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  // Fetch knowledge entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true)

        // Try to fetch from the API
        try {
          const response = await fetch("https://api.sensay.io/v1/training", {
            // Add headers if needed
            headers: {
              "Content-Type": "application/json",
              // Add any auth headers if required
              // "Authorization": `Bearer ${apiKey}`
            },
          })

          if (response.ok) {
            const data = await response.json()
            setEntries(data.entries || [])
            return
          }
        } catch (apiError) {
          console.error("API Error:", apiError)
          // Continue to fallback
        }

        // Fallback to mock data if API call fails
        console.log("Using mock data due to API connection issues")
        const mockEntries = [
          {
            id: "mock-1",
            question: "What is the Mafia game?",
            answer:
              "Mafia is a social deduction game where players are secretly assigned roles and must work together to identify the mafia members among them.",
            replicaUUID: "mock-replica-123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "mock-2",
            question: "How do you win as a Town member?",
            answer:
              "As a Town member, you win by successfully identifying and eliminating all Mafia members through discussion and voting.",
            replicaUUID: "mock-replica-123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "mock-3",
            question: "What is the role of the Detective?",
            answer:
              "The Detective can investigate one player each night to determine if they are a member of the Mafia or not.",
            replicaUUID: "mock-replica-123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]

        setEntries(mockEntries)
      } catch (error) {
        console.error("Error in fetchEntries:", error)
        toast({
          title: "Error",
          description: "Failed to load knowledge entries. Using mock data instead.",
          variant: "destructive",
        })

        // Set empty array as fallback
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [toast])

  // Create knowledge entry
  const handleCreateEntry = async () => {
    if (!question.trim() || !answer.trim() || !replicaUUID.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Show loading state
      toast({
        title: "Processing",
        description: "Creating knowledge entry...",
      })

      try {
        const response = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/training`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add any auth headers if required
            // "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            question,
            answer,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setEntries((prev) => [...prev, data.entry])
          setQuestion("")
          setAnswer("")

          toast({
            title: "Success",
            description: "Knowledge entry created successfully.",
          })
          return
        }
      } catch (apiError) {
        console.error("API Error:", apiError)
        // Continue to fallback
      }

      // If API call fails, create a mock entry
      const mockEntry = {
        id: `mock-${Date.now()}`,
        question,
        answer,
        replicaUUID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setEntries((prev) => [...prev, mockEntry])
      setQuestion("")
      setAnswer("")

      toast({
        title: "Demo Mode",
        description: "Entry created in demo mode (API unavailable).",
      })
    } catch (error) {
      console.error("Error creating knowledge entry:", error)
      toast({
        title: "Error",
        description: "Failed to create knowledge entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update knowledge entry
  const handleUpdateEntry = async (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    const entry = entries.find((e) => e.id === id)
    if (!entry) return

    try {
      try {
        const response = await fetch(`https://api.sensay.io/v1/replicas/${entry.replicaUUID}/training/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Add auth headers if needed
          },
          body: JSON.stringify({
            question: editQuestion,
            answer: editAnswer,
          }),
        })

        if (response.ok) {
          // API call succeeded
          setEntries((prev) =>
            prev.map((e) =>
              e.id === id
                ? { ...e, question: editQuestion, answer: editAnswer, updatedAt: new Date().toISOString() }
                : e,
            ),
          )
          setEditingId(null)
          toast({
            title: "Success",
            description: "Knowledge entry updated successfully.",
          })
          return
        }
      } catch (apiError) {
        console.error("API Error:", apiError)
        // Continue to fallback
      }

      // Fallback - update local state only
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, question: editQuestion, answer: editAnswer, updatedAt: new Date().toISOString() } : e,
        ),
      )
      setEditingId(null)
      toast({
        title: "Demo Mode",
        description: "Entry updated in demo mode (API unavailable).",
      })
    } catch (error) {
      console.error("Error updating knowledge entry:", error)
      toast({
        title: "Error",
        description: "Failed to update knowledge entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete knowledge entry
  const handleDeleteEntry = async (id: string) => {
    try {
      try {
        const response = await fetch(`https://api.sensay.io/v1/training/${id}`, {
          method: "DELETE",
          // Add auth headers if needed
        })

        if (response.ok) {
          // API call succeeded
          setEntries((prev) => prev.filter((e) => e.id !== id))
          toast({
            title: "Success",
            description: "Knowledge entry deleted successfully.",
          })
          return
        }
      } catch (apiError) {
        console.error("API Error:", apiError)
        // Continue to fallback
      }

      // Fallback - update local state only
      setEntries((prev) => prev.filter((e) => e.id !== id))
      toast({
        title: "Demo Mode",
        description: "Entry deleted in demo mode (API unavailable).",
      })
    } catch (error) {
      console.error("Error deleting knowledge entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete knowledge entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Start editing entry
  const startEditing = (entry: KnowledgeEntry) => {
    setEditingId(entry.id)
    setEditQuestion(entry.question)
    setEditAnswer(entry.answer)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Upload file
  const handleFileUpload = async () => {
    if (!file || !replicaUUID) {
      toast({
        title: "Validation Error",
        description: "Please select a file and enter a replica UUID.",
        variant: "destructive",
      })
      return
    }

    try {
      // First, get a signed URL for upload
      const urlResponse = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/training/files/upload`)
      if (!urlResponse.ok) throw new Error("Failed to get upload URL")

      const { uploadUrl } = await urlResponse.json()

      // Then upload the file
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", uploadUrl)

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast({
            title: "Success",
            description: "File uploaded successfully.",
          })
          setFile(null)
          setUploadProgress(0)
        } else {
          throw new Error("Upload failed")
        }
      }

      xhr.onerror = () => {
        throw new Error("Upload failed")
      }

      xhr.send(file)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
      setUploadProgress(0)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-mafia-900 dark:text-mafia-300">AI Agent Training</h1>

      <Tabs defaultValue="entries">
        <TabsList className="mb-6 bg-mafia-100 dark:bg-mafia-900/30">
          <TabsTrigger value="entries" className="data-[state=active]:bg-mafia-600 data-[state=active]:text-white">
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-mafia-600 data-[state=active]:text-white">
            Add Entry
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-mafia-600 data-[state=active]:text-white">
            Upload Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Knowledge Base Entries</CardTitle>
              <CardDescription>Manage your AI agent's knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Replica ID</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading entries...
                      </TableCell>
                    </TableRow>
                  ) : entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No knowledge entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="align-top">
                          {editingId === entry.id ? (
                            <Textarea
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              className="min-h-[100px]"
                            />
                          ) : (
                            <div className="max-w-xs overflow-hidden text-ellipsis">{entry.question}</div>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          {editingId === entry.id ? (
                            <Textarea
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              className="min-h-[100px]"
                            />
                          ) : (
                            <div className="max-w-xs overflow-hidden text-ellipsis">{entry.answer}</div>
                          )}
                        </TableCell>
                        <TableCell className="align-top">{entry.replicaUUID.substring(0, 8)}...</TableCell>
                        <TableCell className="align-top">{new Date(entry.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="align-top">
                          {editingId === entry.id ? (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateEntry(entry.id)}
                                className="h-8 w-8 text-green-600"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={cancelEditing}
                                className="h-8 w-8 text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(entry)}
                                className="h-8 w-8 text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="h-8 w-8 text-red-600"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Add Knowledge Entry</CardTitle>
              <CardDescription>Create a new entry for your AI agent's knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
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
              <div>
                <label htmlFor="question" className="block text-sm font-medium mb-1">
                  Question
                </label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter a question or prompt"
                  className="min-h-[100px] border-mafia-300 focus-visible:ring-mafia-500"
                />
              </div>
              <div>
                <label htmlFor="answer" className="block text-sm font-medium mb-1">
                  Answer
                </label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer or response"
                  className="min-h-[150px] border-mafia-300 focus-visible:ring-mafia-500"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateEntry} className="bg-mafia-600 hover:bg-mafia-700">
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
                  <div className="bg-mafia-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleFileUpload}
                className="bg-mafia-600 hover:bg-mafia-700"
                disabled={!file || uploadProgress > 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
