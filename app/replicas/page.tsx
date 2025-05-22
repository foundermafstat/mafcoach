"use client"

import { useState, useEffect, useCallback } from "react"
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
  const fetchReplicas = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching replicas...');

      const response = await fetch("/api/sensay/replicas")
      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData);
        throw new Error(errorData.error || "Failed to fetch replicas")
      }

      const data = await response.json()
      console.log('Received data:', data);
      
      // Обрабатываем различные структуры ответа
      let replicasList: Replica[] = [];
      
      if (Array.isArray(data)) {
        console.log('Data is an array, using directly');
        replicasList = data;
      } else if (data.replicas && Array.isArray(data.replicas)) {
        console.log('Found replicas array in response');
        replicasList = data.replicas;
      } else if (data.items && Array.isArray(data.items)) {
        console.log('Found items array in response');
        replicasList = data.items;
      } else {
        console.warn('Unexpected data structure:', data);
        // Если структура не соответствует ожидаемой, возвращаем пустой массив
        replicasList = [];
      }
      
      console.log(`Setting ${replicasList.length} replicas`);
      setReplicas(replicasList);
    } catch (error) {
      console.error("Error in fetchReplicas:", error)
      toast({
        title: "Error",
        description: `Failed to load replicas: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      setReplicas([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    fetchReplicas()
  }, [fetchReplicas])

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
      const response = await fetch("/api/sensay/replicas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create replica")
      }

      const newReplica = await response.json()

      setReplicas((prev) => [newReplica, ...prev])
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
        description: `Failed to create replica: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      const response = await fetch(`/api/sensay/replicas?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update replica")
      }

      const updatedReplica = await response.json()

      setReplicas((prev) =>
        prev.map((replica) =>
          replica.id === id ? updatedReplica : replica
        )
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
        description: `Failed to update replica: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // Delete replica
  const handleDeleteReplica = async (id: string) => {
    try {
      const response = await fetch(`/api/sensay/replicas?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete replica")
      }

      setReplicas((prev) => prev.filter((replica) => replica.id !== id))

      toast({
        title: "Success",
        description: "Replica deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting replica:", error)
      toast({
        title: "Error",
        description: `Failed to delete replica: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      title: "Copied!",
      description: "Replica ID copied to clipboard.",
    })
  }

  return (
    <div className="container mx-auto py-6 overflow-auto" style={{ maxHeight: '100vh' }}>
      <h1 className="text-3xl font-bold mb-6 text-mafia-900 dark:text-mafia-300">AI Replicas</h1>

      <div className="space-y-8">
        <div>
          <Card className="border-mafia-200 dark:border-mafia-800">
            <CardHeader className="bg-mafia-50 dark:bg-mafia-900/20 rounded-t-lg">
              <CardTitle className="text-mafia-900 dark:text-mafia-300">Manage Replicas</CardTitle>
              <CardDescription>View and manage your AI replicas</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto" style={{ maxHeight: '60vh' }}>
              <Table className="overflow-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        No replicas found. Create a new one below.
                      </TableCell>
                    </TableRow>
                  ) : (
                    replicas.map((replica) => (
                      <TableRow key={replica.id}>
                        <TableCell className="font-medium">
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
                              className="border-mafia-300 focus-visible:ring-mafia-500 min-h-[80px]"
                            />
                          ) : (
                            replica.description
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono truncate max-w-[120px]">{replica.id}</span>
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
                        <TableCell className="text-right">
                          {editingId === replica.id ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateReplica(replica.id)}
                                className="h-8 text-green-600"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditing}
                                className="h-8"
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
