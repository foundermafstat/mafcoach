/**
 * Клиент для получения статистики тренировок от Sensay API
 */

// Типы для статистики тренировок
export interface TrainingStats {
  total_entries: number;
  processed_entries: number;
  error_entries: number;
  processing_entries: number;
  data_size_bytes: number;
  token_count: number;
  last_updated: string;
}

/**
 * Получает статистику тренировок для указанной реплики
 * @param replicaUUID UUID реплики Sensay
 * @returns Объект со статистикой тренировок
 */
export async function fetchTrainingStats(replicaUUID: string): Promise<TrainingStats> {
  if (!replicaUUID) {
    throw new Error("Replica UUID is required");
  }

  try {
    const response = await fetch(`/api/sensay/training-stats?replicaUUID=${replicaUUID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || "Failed to fetch training statistics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching training stats:", error);
    throw error;
  }
}
