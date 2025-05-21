"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash, Edit, Save, X, Copy } from "lucide-react"
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

type Replica = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export default function ReplicasPage() {
  const [replicas, setReplicas] = useState<Replica[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const { toast } = useToast()

  // Fetch replicas
  useEffect(() => {
    const fetchReplicas = async () => {
      try {
        setLoading(true)

        // Try to fetch from the API
        try {
          const response = await fetch("https://api.sensay.io/v1/replicas", {
            // Add headers if needed
            headers: {
              "Content-Type": "application/json",
              // Add any auth headers if required
              // "Authorization": `Bearer ${apiKey}`
            },
          })

          if (response.ok) {
            const data = await response.json()
            setReplicas(data.replicas || [])
            return
          }
        } catch (apiError) {
          console.error("API Error:", apiError)
          // Continue to fallback
        }

        // Fallback to mock data if API call fails
        console.log("Using mock data due to API connection issues")
        const mockReplicas = [
          {
            id: "mock-replica-123",
            name: "Mafia Game Assistant",
            description: "An AI assistant that helps users learn about the Mafia game rules, roles, and strategies.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "mock-replica-456",
            name: "Game Moderator",
            description: "An AI that can help moderate Mafia games by managing roles and game flow.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]

        setReplicas(mockReplicas)
      } catch (error) {
        console.error("Error in fetchReplicas:", error)
        toast({
          title: "Error",
          description: "Failed to load replicas. Using mock data instead.",
          variant: "destructive",
        })

        // Set empty array as fallback
        setReplicas([])
      } finally {
        setLoading(false)
      }
    }

    fetchReplicas()
  }, [toast])

  // Create replica
  const handleCreateReplica = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the replica.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("https://api.sensay.io/v1/replicas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      })

      if (!response.ok) throw new Error("Failed to create replica")

      const data = await response.json()

      setReplicas((prev) => [...prev, data.replica])
      setName("")
      setDescription("")

      toast({
        title: "Success",
        description: "Replica created successfully.",
      })
    } catch (error) {
      console.error("Error creating replica:", error)
      toast({
        title: "Error",
        description: "Failed to create replica. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update replica
  const handleUpdateReplica = async (id: string) => {
    if (!editName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the replica.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`https://api.sensay.io/v1/replicas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      })

      if (!response.ok) throw new Error("Failed to update replica")

      setReplicas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, name: editName, description: editDescription, updatedAt: new Date().toISOString() } : r,
        ),
      )

      setEditingId(null)

      toast({
        title: "Success",
        description: "Replica updated successfully.",
      })
    } catch (error) {
      console.error("Error updating replica:", error)
      toast({
        title: "Error",
        description: "Failed to update replica. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete replica
  const handleDeleteReplica = async (id: string) => {
    try {
      const response = await fetch(`https://api.sensay.io/v1/replicas/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete replica")

      setReplicas((prev) => prev.filter((r) => r.id !== id))

      toast({
        title: "Success",
        description: "Replica deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting replica:", error)
      toast({
        title: "Error",
        description: "Failed to delete replica. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Start editing replica
  const startEditing = (replica: Replica) => {
    setEditingId(replica.id)
    setEditName(replica.name)
    setEditDescription(replica.description)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
  }

  // Copy replica ID to clipboard
  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id)
    toast({
      title: "Copied",
      description: "Replica ID copied to clipboard.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-mafia-900 dark:text-mafia-300">AI Replicas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Your Replicas</CardTitle>
              <CardDescription>Manage your AI replicas</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading replicas...
                      </TableCell>
                    </TableRow>
                  ) : replicas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No replicas found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    replicas.map((replica) => (
                      <TableRow key={replica.id}>
                        <TableCell>
                          {editingId === replica.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="border-mafia-300 focus-visible:ring-mafia-500"
                            />
                          ) : (
                            replica.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === replica.id ? (
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="min-h-[80px] border-mafia-300 focus-visible:ring-mafia-500"
                            />
                          ) : (
                            <div className="max-w-xs overflow-hidden text-ellipsis">{replica.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[80px]">{replica.id}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(replica.id)}
                              className="h-6 w-6"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(replica.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {editingId === replica.id ? (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateReplica(replica.id)}
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
                                onClick={() => startEditing(replica)}
                                className="h-8 w-8 text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Replica</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete "{replica.name}"? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {}}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteReplica(replica.id)}>
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
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
        </div>

        <div>
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Create New Replica</CardTitle>
              <CardDescription>Add a new AI replica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter replica name"
                  className="border-mafia-300 focus-visible:ring-mafia-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter replica description"
                  className="min-h-[100px] border-mafia-300 focus-visible:ring-mafia-500"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateReplica} className="bg-mafia-600 hover:bg-mafia-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Replica
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
