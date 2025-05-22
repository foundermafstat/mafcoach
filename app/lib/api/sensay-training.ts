import { SensaySettingsService } from "./sensay-settings";

interface KnowledgeBaseEntry {
  id: number;
  replica_uuid: string | null;
  type: "file_upload" | "url" | "training_history" | "text";
  filename: string | null;
  status: "AWAITING_UPLOAD" | "SUPABASE_ONLY" | "PROCESSING" | "READY" | "SYNC_ERROR" | 
          "ERR_FILE_PROCESSING" | "ERR_TEXT_PROCESSING" | "ERR_TEXT_TO_VECTOR" | "BLANK";
  raw_text: string | null;
  processed_text: string | null;
  created_at: string;
  updated_at: string;
  title: string | null;
  description: string | null;
}

interface KnowledgeBaseListResponse {
  success: boolean;
  items: KnowledgeBaseEntry[];
}

interface CreateKnowledgeBaseResponse {
  success: boolean;
  knowledgeBaseID: number;
}

interface UpdateKnowledgeBaseRequest {
  rawText: string;
  title?: string;
  description?: string;
}

interface UpdateKnowledgeBaseResponse {
  success: boolean;
}

export class SensayTrainingService {
  // Используем статические методы SensaySettingsService напрямую

  /**
   * Get all knowledge base entries
   */
  async getKnowledgeBaseEntries(): Promise<KnowledgeBaseEntry[]> {
    const settings = await SensaySettingsService.getActiveSettings();
    if (!settings) {
      throw new Error("No active API settings found");
    }

    const response = await fetch("https://api.sensay.io/v1/training", {
      method: "GET",
      headers: {
        "X-API-Version": "2025-03-25",
        "X-ORGANIZATION-SECRET": settings.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get knowledge base entries: ${error.error}`);
    }

    const data = await response.json() as KnowledgeBaseListResponse;
    return data.items;
  }

  /**
   * Get a specific knowledge base entry by ID
   */
  async getKnowledgeBaseEntry(id: number): Promise<KnowledgeBaseEntry> {
    const settings = await SensaySettingsService.getActiveSettings();
    if (!settings) {
      throw new Error("No active API settings found");
    }

    const response = await fetch(`https://api.sensay.io/v1/training/${id}`, {
      method: "GET",
      headers: {
        "X-API-Version": "2025-03-25",
        "X-ORGANIZATION-SECRET": settings.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get knowledge base entry: ${error.error}`);
    }

    return await response.json() as KnowledgeBaseEntry;
  }

  /**
   * Create a new knowledge base entry (step 1 of training process)
   */
  async createKnowledgeBaseEntry(replicaUUID: string): Promise<number> {
    const settings = await SensaySettingsService.getActiveSettings();
    if (!settings) {
      throw new Error("No active API settings found");
    }

    const response = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/training`, {
      method: "POST",
      headers: {
        "X-API-Version": "2025-03-25",
        "X-ORGANIZATION-SECRET": settings.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create knowledge base entry: ${error.error}`);
    }

    const data = await response.json() as CreateKnowledgeBaseResponse;
    return data.knowledgeBaseID;
  }

  /**
   * Update a knowledge base entry with content (step 2 of training process)
   */
  async updateKnowledgeBaseEntry(
    replicaUUID: string, 
    trainingID: number, 
    content: UpdateKnowledgeBaseRequest
  ): Promise<boolean> {
    const settings = await SensaySettingsService.getActiveSettings();
    if (!settings) {
      throw new Error("No active API settings found");
    }

    const response = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/training/${trainingID}`, {
      method: "PUT",
      headers: {
        "X-API-Version": "2025-03-25",
        "X-ORGANIZATION-SECRET": settings.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update knowledge base entry: ${error.error}`);
    }

    const data = await response.json() as UpdateKnowledgeBaseResponse;
    return data.success;
  }

  /**
   * Delete a knowledge base entry
   */
  async deleteKnowledgeBaseEntry(id: number): Promise<boolean> {
    const settings = await SensaySettingsService.getActiveSettings();
    if (!settings) {
      throw new Error("No active API settings found");
    }

    const response = await fetch(`https://api.sensay.io/v1/training/${id}`, {
      method: "DELETE",
      headers: {
        "X-API-Version": "2025-03-25",
        "X-ORGANIZATION-SECRET": settings.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete knowledge base entry: ${error.error}`);
    }

    return true;
  }

  /**
   * Simplified method to create a knowledge base entry with content in one call
   */
  async trainReplica(
    replicaUUID: string, 
    content: string, 
    title?: string, 
    description?: string
  ): Promise<number> {
    // Step 1: Create knowledge base entry
    const knowledgeBaseID = await this.createKnowledgeBaseEntry(replicaUUID);
    
    // Step 2: Update with content
    await this.updateKnowledgeBaseEntry(replicaUUID, knowledgeBaseID, {
      rawText: content,
      title,
      description,
    });

    return knowledgeBaseID;
  }
}
