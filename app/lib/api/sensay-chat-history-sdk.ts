import { sensayClient } from './sensay';
import { ChatHistoryService } from '../../../sensay-sdk';

// Тип для сообщения в чате (соответствует формату SDK)
export type SensayChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// Тип для записи истории чата (соответствует формату SDK)
export type SensayChatHistory = {
  id: string;
  replicaUUID: string;
  messages: SensayChatMessage[];
  createdAt: string;
};

// Типы для результата от API
type SensayApiHistoryItem = {
  id: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
};

type SensayApiHistoryResponse = {
  history: SensayApiHistoryItem[];
};

/**
 * Функции для работы с историей чатов Sensay API
 */
export const SensayChatHistorySDKService = {
  /**
   * Получить историю чатов для конкретной реплики
   */
  async getChatHistory(replicaUUID: string): Promise<SensayChatHistory[]> {
    console.log(`Getting chat history for replica UUID: ${replicaUUID} using direct API call`);
    
    try {
      // Получаем настройки API
      const SENSAY_API_KEY = process.env.NEXT_PUBLIC_SENSAY_API_KEY || '';
      const SENSAY_ORG_ID = process.env.NEXT_PUBLIC_SENSAY_ORG_ID || '';
      
      // Согласно документации https://docs.sensay.io/group/endpoint-chat-history
      const url = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`;
      console.log(`Fetching from URL: ${url}`);
      
      // Используем заголовки согласно документации https://docs.sensay.io/group/endpoint-chat-history
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SENSAY_API_KEY}`,
          'x-organization-id': SENSAY_ORG_ID
        }
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      // Обрабатываем ответ согласно документации
      if (data?.history && Array.isArray(data.history)) {
        return data.history.map((item: SensayApiHistoryItem) => ({
          id: item.id || `history-${Date.now()}`,
          replicaUUID: replicaUUID,
          messages: Array.isArray(item.messages) ? item.messages : [],
          createdAt: item.createdAt || new Date().toISOString()
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error using SDK getChatHistory:', error);
      throw new Error(`Failed to get chat history using SDK: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Создать новую запись истории чата
   * Согласно документации https://docs.sensay.io/group/endpoint-chat-history
   */
  async createChatHistoryEntry(replicaUUID: string, messages: SensayChatMessage[]): Promise<{ id: string }> {
    console.log(`Creating chat history for replica UUID: ${replicaUUID} using direct API call`);
    
    try {
      // Получаем настройки API
      const SENSAY_API_KEY = process.env.NEXT_PUBLIC_SENSAY_API_KEY || '';
      const SENSAY_ORG_ID = process.env.NEXT_PUBLIC_SENSAY_ORG_ID || '';
      
      // Согласно документации https://docs.sensay.io/group/endpoint-chat-history
      const url = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`;
      console.log(`Posting to URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SENSAY_API_KEY}`,
          'x-organization-id': SENSAY_ORG_ID
        },
        body: JSON.stringify({ messages })
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      return { id: data.id || `chat-${Date.now()}` };
    } catch (error) {
      console.error('Error creating chat history entry:', error);
      throw new Error(`Failed to create chat history entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Удалить запись истории чата
   * Согласно документации https://docs.sensay.io/group/endpoint-chat-history
   */
  async deleteChatHistoryEntry(replicaUUID: string, chatId: string): Promise<boolean> {
    console.log(`Deleting chat history entry ${chatId} for replica UUID: ${replicaUUID} using direct API call`);
    
    try {
      // Получаем настройки API
      const SENSAY_API_KEY = process.env.NEXT_PUBLIC_SENSAY_API_KEY || '';
      const SENSAY_ORG_ID = process.env.NEXT_PUBLIC_SENSAY_ORG_ID || '';
      
      // Согласно документации https://docs.sensay.io/group/endpoint-chat-history
      const url = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history/${chatId}`;
      console.log(`Deleting URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SENSAY_API_KEY}`,
          'x-organization-id': SENSAY_ORG_ID
        }
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting chat history entry:', error);
      throw new Error(`Failed to delete chat history entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
