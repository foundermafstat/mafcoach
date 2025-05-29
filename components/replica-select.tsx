"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCcw } from "lucide-react"
import { fetchReplicas } from "@/app/lib/api/sensay-replicas-client"
import type { SensayReplica } from "@/app/lib/api/sensay-replicas-client"
import { useToast } from "@/hooks/use-toast"

interface ReplicaSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function ReplicaSelect({ value, onChange, className }: ReplicaSelectProps) {
  const [replicas, setReplicas] = useState<SensayReplica[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Функция для загрузки списка реплик
  const fetchReplicasList = async () => {
    try {
      setLoading(true)
      const replicasList = await fetchReplicas()
      setReplicas(replicasList)
      
      if (replicasList.length > 0 && !value) {
        // Автоматически выбрать первую реплику если нет выбранной
        onChange(replicasList[0].uuid)
      }
    } catch (error) {
      console.error("Error fetching replicas:", error)
      toast({
        title: "Error",
        description: "Failed to load replicas. Please check your API settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Загружаем реплики при первом рендере
  useEffect(() => {
    fetchReplicasList()
  }, [])

  return (
    <div className={className}>
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : replicas.length > 0 ? (
        <Select 
          value={value} 
          onValueChange={onChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a replica" />
          </SelectTrigger>
          <SelectContent>
            {replicas.map((replica) => (
              <SelectItem key={replica.uuid} value={replica.uuid}>
                {replica.name} ({replica.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex flex-col space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter Replica UUID manually"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchReplicasList}
            disabled={loading}
            className="w-full"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Load Replicas
          </Button>
        </div>
      )}
    </div>
  )
}
