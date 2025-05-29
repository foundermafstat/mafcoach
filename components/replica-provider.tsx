"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"
import { SensayReplica } from "@/app/lib/api/sensay-replicas-client"
import { fetchReplicas } from "@/app/lib/api/sensay-replicas-client"

type ReplicaContextType = {
  replicas: SensayReplica[]
  selectedReplica: SensayReplica | null
  setSelectedReplica: (replica: SensayReplica | null) => void
  loadingReplicas: boolean
  refreshReplicas: () => Promise<void>
}

const ReplicaContext = createContext<ReplicaContextType | undefined>(undefined)

export default function ReplicaProvider({ children }: { children: ReactNode }) {
  const [replicas, setReplicas] = useState<SensayReplica[]>([])
  const [selectedReplica, setSelectedReplica] = useState<SensayReplica | null>(null)
  const [loadingReplicas, setLoadingReplicas] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Загрузка списка реплик при монтировании компонента
  useEffect(() => {
    if (!initialized) {
      refreshReplicas()
      setInitialized(true)
    }
  }, [initialized])

  // Сохраняем выбранную реплику в localStorage
  useEffect(() => {
    if (selectedReplica) {
      localStorage.setItem("selectedReplicaUuid", selectedReplica.uuid)
      console.log("Saved replica UUID to localStorage:", selectedReplica.uuid)
    }
  }, [selectedReplica])

  // Функция для обновления списка реплик
  const refreshReplicas = async () => {
    try {
      setLoadingReplicas(true)
      const data = await fetchReplicas()
      console.log('Loaded replicas:', data)
      setReplicas(data)
      
      // Восстанавливаем выбранную реплику из localStorage или устанавливаем первую доступную
      const savedUuid = localStorage.getItem("selectedReplicaUuid")
      
      if (savedUuid && data.length > 0) {
        // Ищем реплику с сохраненным UUID
        const savedReplica = data.find(r => r.uuid === savedUuid)
        
        if (savedReplica) {
          console.log('Restored replica from localStorage:', savedReplica)
          setSelectedReplica(savedReplica)
        } else {
          // Если сохраненная реплика не найдена, используем первую из списка
          console.log('Saved replica not found, using first available')
          setSelectedReplica(data[0])
        }
      } else if (data.length > 0) {
        // Если нет сохраненного UUID, используем первую реплику
        console.log('No saved replica, using first available:', data[0])
        setSelectedReplica(data[0])
      }
    } catch (error) {
      console.error('Ошибка при загрузке реплик:', error)
    } finally {
      setLoadingReplicas(false)
    }
  }

  return (
    <ReplicaContext.Provider
      value={{
        replicas,
        selectedReplica,
        setSelectedReplica,
        loadingReplicas,
        refreshReplicas
      }}
    >
      {children}
    </ReplicaContext.Provider>
  )
}

export function useReplica() {
  const context = useContext(ReplicaContext)
  if (context === undefined) {
    throw new Error("useReplica must be used within a ReplicaProvider")
  }
  return context
}
