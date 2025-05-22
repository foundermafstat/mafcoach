import { SensaySettingsService } from "./sensay-settings";

// Тип для сообщения в чате
export type SensayChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// Тип для записи истории чата
export type SensayChatHistory = {
  id: string;
  replicaUUID: string;
  messages: SensayChatMessage[];
  createdAt: string;
};

/**
 * Сервис для работы с историей чатов Sensay API
 */
export class SensayChatHistoryService {
  /**
   * Получить историю чатов для конкретной реплики
   */
  static async getChatHistory(replicaUUID: string): Promise<SensayChatHistory[]> {
    console.log(`Getting chat history for replica UUID: ${replicaUUID}`);
    
    try {
      const settings = await SensaySettingsService.getActiveSettings();
      
      if (!settings) {
        console.error('No active API settings found');
        throw new Error("No active API settings found");
      }
      
      console.log(`Using API settings: ${settings.id}, organizationId: ${settings.organizationId}`);
      
      // Используем правильный URL для API Sensay
      const SENSAY_REPLICA_API = process.env.SENSAY_REPLICA_API || 'https://api.sensay.io/v1/replicas';
      const url = `${SENSAY_REPLICA_API}/${replicaUUID}/chat/history`;
      console.log(`Fetching from URL: ${url}`);
      
      // Используем правильные заголовки аутентификации согласно документации
      const response = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
          'x-organization-id': settings.organizationId
        },
      });
      
      console.log(`Response status: ${response.status}, ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        
        let errorData: any = { error: 'Unknown error' };
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { error: 'Response is not valid JSON' };
        }
        
        throw new Error(`Failed to get chat history: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
      
      const responseText = await response.text();
      console.log(`Response body (first 100 chars): ${responseText.substring(0, 100)}...`);
      
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Response is not valid JSON');
      }
      
      console.log(`Received history items: ${data.history ? data.history.length : 'none'}`);
      return data.history || [];      
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      throw error;
    }
  }

  /**
   * Создать новую запись истории чата
   */
  static async createChatHistoryEntry(replicaUUID: string, messages: SensayChatMessage[]): Promise<SensayChatHistory> {
    try {
      const settings = await SensaySettingsService.getActiveSettings();
      
      if (!settings) {
        throw new Error("No active API settings found");
      }

      const SENSAY_REPLICA_API = process.env.SENSAY_REPLICA_API || 'https://api.sensay.io/v1/replicas';
      const url = `${SENSAY_REPLICA_API}/${replicaUUID}/chat/history`;
      
      console.log(`Creating chat history entry at URL: ${url}`);
      console.log(`Request body:`, JSON.stringify(messages));
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
          'x-organization-id': settings.organizationId
        },
        body: JSON.stringify({
          messages,
        }),
      });

      console.log(`Response status: ${response.status}, ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        
        let errorData: any = { error: 'Unknown error' };
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { error: 'Response is not valid JSON' };
        }
        
        throw new Error(`Failed to create chat history entry: ${errorData.error || errorData.message || 'Unknown error'}`);
      }

      const responseText = await response.text();
      console.log(`Response body (first 100 chars): ${responseText.substring(0, 100)}...`);
      
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Response is not valid JSON');
      }
      
      return data;
    } catch (error) {
      console.error('Error in createChatHistoryEntry:', error);
      throw error;
    }
  }

  /**
   * Удалить запись истории чата
   */
  static async deleteChatHistoryEntry(replicaUUID: string, chatId: string): Promise<boolean> {
    try {
      const settings = await SensaySettingsService.getActiveSettings();
      
      if (!settings) {
        throw new Error("No active API settings found");
      }

      const SENSAY_REPLICA_API = process.env.SENSAY_REPLICA_API || 'https://api.sensay.io/v1/replicas';
      const url = `${SENSAY_REPLICA_API}/${replicaUUID}/chat/history/${chatId}`;
      
      console.log(`Deleting chat history entry at URL: ${url}`);
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
          'x-organization-id': settings.organizationId
        },
      });

      console.log(`Response status: ${response.status}, ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        
        let errorData: any = { error: 'Unknown error' };
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { error: 'Response is not valid JSON' };
        }
        
        throw new Error(`Failed to delete chat history entry: ${errorData.error || errorData.message || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteChatHistoryEntry:', error);
      throw error;
    }
  }
}
