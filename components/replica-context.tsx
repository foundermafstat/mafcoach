"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SensayReplica } from "@/app/lib/api/sensay-replicas-client";
import { fetchReplicas } from "@/app/lib/api/sensay-replicas-client";
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = "selected_replica_uuid";

interface ReplicaContextType {
  selectedReplicaUuid: string;
  setSelectedReplicaUuid: (uuid: string) => void;
  replicas: SensayReplica[];
  loading: boolean;
  refreshReplicas: () => Promise<void>;
  selectedReplica: SensayReplica | undefined;
}

const ReplicaContext = createContext<ReplicaContextType | undefined>(undefined);

export function ReplicaProvider({ children }: { children: React.ReactNode }) {
  const [selectedReplicaUuid, setSelectedReplicaUuid] = useState<string>("");
  const [replicas, setReplicas] = useState<SensayReplica[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedReplica = replicas.find(replica => replica.uuid === selectedReplicaUuid);

  // Load saved replica from localStorage on initialization
  useEffect(() => {
    const savedUuid = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUuid) {
      setSelectedReplicaUuid(savedUuid);
    }
  }, []);

  // Save selected replica to localStorage when it changes
  useEffect(() => {
    if (selectedReplicaUuid) {
      localStorage.setItem(LOCAL_STORAGE_KEY, selectedReplicaUuid);
    }
  }, [selectedReplicaUuid]);

  // Fetch replicas on component mount
  useEffect(() => {
    refreshReplicas();
  }, []);

  // Function to fetch replicas from API
  const refreshReplicas = async () => {
    try {
      setLoading(true);
      const replicasList = await fetchReplicas();
      setReplicas(replicasList);
      
      // Проверяем текущий выбранный UUID
      const savedUuid = selectedReplicaUuid || localStorage.getItem(LOCAL_STORAGE_KEY);
      
      // Проверяем, существует ли сохраненная реплика в полученном списке
      const replicaExists = replicasList.some(replica => replica.uuid === savedUuid);
      
      if (replicasList.length > 0) {
        if (replicaExists && savedUuid) {
          // Если сохраненная реплика существует, используем ее
          if (savedUuid !== selectedReplicaUuid) {
            setSelectedReplicaUuid(savedUuid);
          }
        } else {
          // Если сохраненная реплика не существует или не выбрана, выбираем первую в списке
          console.log('Saved replica not found or not selected, using first available replica');
          setSelectedReplicaUuid(replicasList[0].uuid);
        }
      }
    } catch (error) {
      console.error("Error fetching replicas:", error);
      toast({
        title: "Error",
        description: "Failed to load replicas. Please check your API settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReplicaContext.Provider
      value={{
        selectedReplicaUuid,
        setSelectedReplicaUuid,
        replicas,
        loading,
        refreshReplicas,
        selectedReplica
      }}
    >
      {children}
    </ReplicaContext.Provider>
  );
}

export function useReplica() {
  const context = useContext(ReplicaContext);
  if (context === undefined) {
    throw new Error("useReplica must be used within a ReplicaProvider");
  }
  return context;
}
