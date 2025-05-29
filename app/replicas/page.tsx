"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash, Edit, Info, Bot, Database, Eye, Zap, AlertCircle, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { SensayReplica, ReplicaCreateUpdateData } from "@/app/lib/api/sensay-replicas-client"
import { fetchReplicas, fetchReplicaById, createReplica, updateReplica, deleteReplica } from "@/app/lib/api/sensay-replicas-client"
import ReplicaDetail from "@/components/replica-detail"
import ReplicaForm from "@/components/replica-form"
import { format } from "date-fns"

export default function ReplicasPage() {
  const [replicas, setReplicas] = useState<SensayReplica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReplica, setSelectedReplica] = useState<SensayReplica | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const { toast } = useToast()

  // Fetch replicas
  const fetchReplicasData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching replicas...');

      const data = await fetchReplicas()
      console.log('Replicas fetched successfully:', data.length, 'items');
      setReplicas(data)
    } catch (error) {
      console.error("Error fetching replicas:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch replicas"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])
  
  // Получение деталей реплики
  const handleViewReplica = async (replicaId: string) => {
    try {
      setLoading(true)
      const replica = await fetchReplicaById(replicaId)
      setSelectedReplica(replica)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error("Error fetching replica details:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch replica details"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Создание новой реплики
  const handleCreateReplica = async (data: ReplicaCreateUpdateData) => {
    try {
      setFormLoading(true)
      const newReplica = await createReplica(data)
      toast({
        title: "Success",
        description: `Replica "${newReplica.name}" created successfully`,
      })
      await fetchReplicasData()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating replica:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create replica"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }
  
  // Редактирование реплики
  const handleOpenEditDialog = async (replicaId: string) => {
    try {
      setLoading(true)
      const replica = await fetchReplicaById(replicaId)
      setSelectedReplica(replica)
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Error fetching replica for edit:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch replica"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdateReplica = async (data: ReplicaCreateUpdateData) => {
    if (!selectedReplica) return
    
    try {
      setFormLoading(true)
      await updateReplica(selectedReplica.uuid, data)
      toast({
        title: "Success",
        description: `Replica "${data.name}" updated successfully`,
      })
      await fetchReplicasData()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating replica:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update replica"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }
  
  // Удаление реплики
  const handleOpenDeleteDialog = (replica: SensayReplica) => {
    setSelectedReplica(replica)
    setIsDeleteDialogOpen(true)
  }
  
  const handleDeleteReplica = async () => {
    if (!selectedReplica) return
    
    try {
      setLoading(true)
      await deleteReplica(selectedReplica.uuid)
      toast({
        title: "Success",
        description: `Replica "${selectedReplica.name}" deleted successfully`,
      })
      await fetchReplicasData()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting replica:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete replica"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "ID скопирован",
      description: "Идентификатор реплики скопирован в буфер обмена",
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchReplicasData()
  }, [fetchReplicasData])

  // UI Elements for replicas table
  const replicasTable = replicas.length > 0 ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Название и информация</TableHead>
          <TableHead>Идентификатор</TableHead>
          <TableHead>Модель LLM</TableHead>
          <TableHead>Теги</TableHead>
          <TableHead>Создана</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {replicas.map((replica) => (
          <TableRow key={replica.uuid}>
            <TableCell>
              <div className="font-medium flex items-center gap-3">
                {/* Добавляем изображение реплики */}
                <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-mafia-100/10">
                  <img 
                    src={replica.profileImage || 'https://placehold.co/400x400/4F46E5/FFFFFF?text=AI'} 
                    alt={replica.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Заменяем битые изображения на плейсхолдер
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/4F46E5/FFFFFF?text=AI';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {replica.name}
                    {replica.private && <Badge variant="outline" className="ml-1 bg-dark-400">Приватная</Badge>}
                  </div>
                  {(replica.shortDescription || replica.short_description) && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                      {replica.shortDescription || replica.short_description}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{replica.type}</Badge>
                    {replica.voice_enabled && <Badge variant="outline" className="text-xs bg-dark-400">Voice</Badge>}
                    {replica.video_enabled && <Badge variant="outline" className="text-xs bg-dark-400">Video</Badge>}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[130px]">
                  {replica.uuid}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  title="Скопировать ID"
                  onClick={() => handleCopyId(replica.uuid)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-mafia-300" />
                <span>{replica.llm?.model || "Не указана"}</span>
              </div>
              {replica.llm?.memoryMode && (
                <div className="text-xs text-muted-foreground mt-1">Память: {replica.llm.memoryMode}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="link" className="h-auto p-0 text-xs">
                      Системное сообщение
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2 bg-dark-300 border-dark-500 text-white">
                    <p className="text-xs">{replica.llm?.systemMessage || replica.system_message}</p>
                  </PopoverContent>
                </Popover>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1 max-w-[150px]">
                {replica.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-dark-400">{tag}</Badge>
                ))}
                {replica.tags && replica.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-dark-400">+{replica.tags.length - 3}</Badge>
                )}
                {(!replica.tags || replica.tags.length === 0) && (
                  <span className="text-xs text-muted-foreground">Нет тегов</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {replica.created_at ? (
                <div className="text-sm">
                  {format(new Date(replica.created_at), "dd.MM.yyyy")}
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(replica.created_at), "HH:mm:ss")}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Не указана</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  title="Подробная информация"
                  onClick={() => handleViewReplica(replica.uuid)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  title="Редактировать"
                  onClick={() => handleOpenEditDialog(replica.uuid)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:text-red-500"
                  title="Удалить"
                  onClick={() => handleOpenDeleteDialog(replica)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <div className="text-center py-8 text-muted-foreground">
      {error ? (
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p>Ошибка: {error}</p>
        </div>
      ) : (
        "Реплики не найдены. Проверьте конфигурацию API."
      )}
    </div>
  )

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sensay Replicas</h1>
          <p className="text-muted-foreground mt-1">Управление репликами для Sensay API</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="bg-mafia-600 hover:bg-mafia-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать реплику
          </Button>
          <Button 
            onClick={fetchReplicasData} 
            disabled={loading} 
            variant="outline"
            className="border-dark-500 bg-dark-400 text-white"
          >
            {loading ? "Загрузка..." : "Обновить"}
          </Button>
        </div>
      </div>

      <Card className="border border-dark-500 bg-dark-300 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-mafia-300" />
            <span>Активные реплики</span>
          </CardTitle>
          <CardDescription>
            Список реплик из Sensay API. Это ИИ-персонажи, которые могут использоваться в вашем приложении.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <div className="mt-4 text-muted-foreground">Загрузка реплик из Sensay API...</div>
            </div>
          ) : (
            replicasTable
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {replicas.length > 0 ? `Найдено ${replicas.length} реплик` : "Реплики не найдены"}
          </div>
        </CardFooter>
      </Card>

      {/* Диалог просмотра деталей реплики */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl border border-dark-500 bg-dark-300 text-white">
          <DialogHeader>
            <DialogTitle>Информация о реплике</DialogTitle>
            <DialogDescription>
              Детальная информация о реплике {selectedReplica?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedReplica && <ReplicaDetail replica={selectedReplica} />}
          <DialogFooter>
            <Button 
              onClick={() => setIsViewDialogOpen(false)}
              className="border-dark-500 bg-dark-400 text-white"
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог создания реплики */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl border border-dark-500 bg-dark-300 text-white">
          <DialogHeader>
            <DialogTitle>Создать новую реплику</DialogTitle>
            <DialogDescription>
              Заполните информацию для создания новой реплики Sensay
            </DialogDescription>
          </DialogHeader>
          <ReplicaForm 
            onSubmit={handleCreateReplica}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования реплики */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl border border-dark-500 bg-dark-300 text-white">
          <DialogHeader>
            <DialogTitle>Редактировать реплику</DialogTitle>
            <DialogDescription>
              Обновите информацию о реплике {selectedReplica?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedReplica && (
            <ReplicaForm 
              initialData={selectedReplica}
              onSubmit={handleUpdateReplica}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border border-dark-500 bg-dark-300 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит реплику <strong>{selectedReplica?.name}</strong> и не может быть отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-dark-500 bg-dark-400 text-white">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReplica}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
