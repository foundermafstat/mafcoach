import { SensaySettingsService } from "./sensay-settings";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SensayReplicaLLM {
  model: string;
  tools: string[];
  memoryMode: string;
  systemMessage: string;
}

export interface SensayReplicaIntegration {
  token: string;
  is_active?: boolean;
  service_name: string;
}

export interface SensayReplica {
  llm: SensayReplicaLLM;
  name: string;
  slug: string;
  tags: string[];
  type: string;
  uuid: string;
  ownerID: string;
  private: boolean;
  purpose: string;
  greeting: string;
  created_at: string;
  owner_uuid: string;
  elevenLabsID?: string;
  introduction?: string;
  profileImage?: string;
  profile_image?: string;
  video_enabled: boolean;
  voice_enabled: boolean;
  system_message: string;
  whitelistEmails?: string[];
  shortDescription?: string;
  short_description?: string;
  chat_history_count: number;
  suggestedQuestions?: string[];
  discord_integration?: SensayReplicaIntegration;
  telegram_integration?: SensayReplicaIntegration;
}

interface SensayReplicasResponse {
  success: boolean;
  type: string;
  items: SensayReplica[];
  total: number;
}

interface SensayReplicaResponse {
  success: boolean;
  replica: SensayReplica;
}

export class SensayReplicasService {
  /**
   * Get all replicas from Sensay API
   * @see https://docs.sensay.io/operation/operation-get-v1-replicas
   */
  static async getReplicas(): Promise<SensayReplica[]> {
    try {
      console.log('Fetching replicas from Sensay API...');
      
      // Получаем активные настройки API
      const settings = await SensaySettingsService.getActiveSettings();
      if (!settings) {
        console.error("No active API settings found. Please configure API settings first.");
        throw new Error("No active API settings found. Please configure API settings first.");
      }

      console.log(`Using API key: ${settings.apiKey ? settings.apiKey.substring(0, 10) + '...' : 'undefined'}`);
      console.log(`Using organization ID: ${settings.organizationId || 'undefined'}`);

      // Выполняем запрос согласно документации и требованиям
      const url = "https://api.sensay.io/v1/replicas";
      console.log(`Sending GET request to: ${url}`);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-ORGANIZATION-SECRET": settings.apiKey,
          "X-USER-ID": settings.apiKey,
          "X-API-Version": "2025-03-25",
          "x-organization-id": settings.organizationId,
        },
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Failed to fetch replicas: ${response.status} ${response.statusText}`);
      }

      // Парсим успешный ответ
      const data = await response.json();
      console.log('Response data:', data);

      if (!data.success) {
        console.error('API returned success: false');
        throw new Error(`API Error: ${data.message || 'Unknown error'}`);
      }
      
      // Стандартный путь - структура соответствует ожидаемой
      // Сохраняем реплики в базу данных
      await this.saveReplicasToDatabase(data.replicas, settings.id);
      
      return data.replicas;
    } catch (error) {
      console.error('Error in getReplicas:', error);
      
      // В случае ошибки API, пытаемся получить данные из базы
      console.log('Falling back to database replicas');
      try {
        const dbReplicas = await this.getReplicasFromDatabase();
        console.log(`Retrieved ${dbReplicas.length} replicas from database`);
        return dbReplicas;
      } catch (dbError) {
        console.error('Error retrieving replicas from database:', dbError);
        throw error; // Выбрасываем оригинальную ошибку API
      }
    }
  }

  /**
   * Create a new replica in Sensay API
   */
  static async createReplica(name: string, description: string): Promise<SensayReplica> {
    try {
      // Получаем активные настройки API
      const settings = await SensaySettingsService.getActiveSettings();
      if (!settings) {
        console.error("No active API settings found. Please configure API settings first.");
        throw new Error("No active API settings found. Please configure API settings first.");
      }

      console.log(`Creating replica with name: ${name}, description: ${description}`);
      console.log(`Using API key: ${settings.apiKey ? settings.apiKey.substring(0, 10) + '...' : 'undefined'}`);
      console.log(`Using organization ID: ${settings.organizationId || 'undefined'}`);

      // Строим запрос к API Sensay согласно документации
      // https://docs.sensay.io/operation/operation-post-v1-replicas
      const url = "https://api.sensay.io/v1/replicas";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.apiKey}`,
          "x-organization-id": settings.organizationId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          // Можно добавить дополнительные параметры, если требуются
        }),
      });

      // Получаем и логируем статус ответа
      console.log(`Response status: ${response.status} ${response.statusText}`);

      // Обрабатываем ошибки
      if (!response.ok) {
        let errorMessage = `Failed to create replica: Status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = `Failed to create replica: ${errorData.error || JSON.stringify(errorData)}`;
          console.error(errorMessage, errorData);
        } catch (parseError) {
          // Если ответ не является JSON
          const errorText = await response.text();
          errorMessage = `Failed to create replica: ${errorText || response.statusText}`;
          console.error(errorMessage, errorText);
        }
        throw new Error(errorMessage);
      }

      // Парсим успешный ответ
      const data = await response.json() as SensayReplicaResponse;
      console.log('Replica created successfully:', data.replica);
      
      // Сохраняем новую реплику в базу данных
      await this.saveReplicaToDatabase(data.replica, settings.id);
      
      return data.replica;
    } catch (error) {
      console.error('Error in createReplica:', error);
      throw error;
    }
  }

  /**
   * Update an existing replica in Sensay API
   */
  static async updateReplica(id: string, name: string, description: string): Promise<SensayReplica> {
    const settings = await SensaySettingsService.getActiveSettings();
    if (!settings) {
      throw new Error("No active API settings found");
    }

    const response = await fetch(`https://api.sensay.io/v1/replicas/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${settings.apiKey}`,
        "x-organization-id": settings.organizationId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update replica: ${error.error}`);
    }

    const data = await response.json() as SensayReplicaResponse;
    
    // Update the replica in database
    await this.updateReplicaInDatabase(data.replica, settings.id);
    
    return data.replica;
  }

  /**
   * Delete a replica from Sensay API
   */
  static async deleteReplica(id: string): Promise<boolean> {
    const settings = await SensaySettingsService.getActiveSettings();
    if (!settings) {
      throw new Error("No active API settings found");
    }

    const response = await fetch(`https://api.sensay.io/v1/replicas/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${settings.apiKey}`,
        "x-organization-id": settings.organizationId,
      },
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(`Failed to delete replica: ${error.error}`);
      } catch (e) {
        // Handle non-JSON responses
        throw new Error(`Failed to delete replica: ${response.statusText}`);
      }
    }

    // Delete the replica from database
    try {
      await prisma.replica.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      console.warn("Failed to delete replica from database:", error);
      // Continue even if database operation fails
    }

    return true;
  }

  /**
   * Save a replica to database
   */
  private static async saveReplicaToDatabase(replica: SensayReplica, apiSettingsId: string): Promise<void> {
    try {
      await prisma.replica.upsert({
        where: {
          id: replica.id,
        },
        update: {
          name: replica.name,
          description: replica.description,
          updatedAt: new Date(),
        },
        create: {
          id: replica.id,
          name: replica.name,
          description: replica.description,
          apiSettingsId: apiSettingsId,
        },
      });
    } catch (error) {
      console.warn("Failed to save replica to database:", error);
      // Continue even if database operation fails
    }
  }

  /**
   * Save multiple replicas to database
   */
  private static async saveReplicasToDatabase(replicas: SensayReplica[], apiSettingsId: string): Promise<void> {
    try {
      // Process replicas in sequence to avoid potential issues
      for (const replica of replicas) {
        await this.saveReplicaToDatabase(replica, apiSettingsId);
      }
    } catch (error) {
      console.warn("Failed to save replicas to database:", error);
      // Continue even if database operation fails
    }
  }

  /**
   * Update a replica in database
   */
  private static async updateReplicaInDatabase(replica: SensayReplica, apiSettingsId: string): Promise<void> {
    try {
      await prisma.replica.update({
        where: {
          id: replica.id,
        },
        data: {
          name: replica.name,
          description: replica.description,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.warn("Failed to update replica in database:", error);
      try {
        // If update fails, try to create instead
        await prisma.replica.create({
          data: {
            id: replica.id,
            name: replica.name,
            description: replica.description,
            apiSettingsId: apiSettingsId,
          },
        });
      } catch (createError) {
        console.warn("Failed to create replica in database after update failure:", createError);
        // Continue even if database operation fails
      }
    }
  }

  /**
   * Get all replicas from database
   */
  static async getReplicasFromDatabase(): Promise<SensayReplica[]> {
    try {
      const dbReplicas = await prisma.replica.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      });
      
      return dbReplicas.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.warn("Failed to get replicas from database:", error);
      return [];
    }
  }
}
