import { SensaySettingsService } from './sensay-settings';

// Базовый URL API
const BASE_URL = 'https://api.sensay.io';

/**
 * Класс для работы с Sensay API
 */
export class SensayApi {
  private apiKey: string;
  private organizationId: string;
  private userId: string;
  private replicaUuid: string;
  
  /**
   * Создает экземпляр клиента Sensay API
   * @param apiKey - Ключ API
   * @param organizationId - ID организации
   * @param userId - ID пользователя
   * @param replicaUuid - UUID реплики
   */
  constructor(
    apiKey: string,
    organizationId: string,
    userId: string,
    replicaUuid: string
  ) {
    this.apiKey = apiKey;
    this.organizationId = organizationId;
    this.userId = userId;
    this.replicaUuid = replicaUuid;
  }

  /**
   * Создает клиент Sensay API с активными настройками из базы данных
   * @returns Промис с экземпляром SensayApi или null, если настройки не найдены
   */
  static async createWithActiveSettings(): Promise<SensayApi | null> {
    try {
      const settings = await SensaySettingsService.getActiveSettings();
      
      if (!settings) {
        console.error('Активные настройки API не найдены в базе данных');
        return null;
      }
      
      return new SensayApi(
        settings.apiKey,
        settings.organizationId,
        settings.userId,
        settings.replicaUuid
      );
    } catch (error) {
      console.error('Ошибка при создании клиента Sensay API:', error);
      return null;
    }
  }

  /**
   * Получить заголовки для запросов к API
   * @returns Объект с заголовками
   */
  private getHeaders() {
    return {
      'X-ORGANIZATION-SECRET': this.apiKey,
      'X-USER-ID': this.userId,
      'Content-Type': 'application/json',
      'X-API-Version': '2025-03-25',
    };
  }

  /**
   * Отправить сообщение реплике и получить ответ
   * @param content - Содержание сообщения
   * @param skipChatHistory - Флаг, указывающий не сохранять сообщение в истории чата
   * @returns Промис с ответом от API
   */
  async sendMessage(content: string, skipChatHistory: boolean = false) {
    try {
      console.log('Отправка сообщения реплике Sensay:', { 
        replicaUuid: this.replicaUuid, 
        contentLength: content.length 
      });
      
      // Составляем URL API
      const apiUrl = `${BASE_URL}/v1/replicas/${this.replicaUuid}/chat/completions`;
      
      // Логируем заголовки для отладки (без секретных данных)
      console.log('Заголовки запроса:', { 
        ...this.getHeaders(), 
        'X-ORGANIZATION-SECRET': '[REDACTED]' 
      });
      
      // Выполняем запрос к API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          content,
          skip_chat_history: skipChatHistory,
          source: 'web',
        }),
      });
      
      console.log('Статус ответа:', response.status);
      
      // Проверяем успешность ответа
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ошибка API (${response.status}):`, errorText);
        throw new Error(`Ошибка API (${response.status}): ${errorText}`);
      }
      
      // Разбираем ответ
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка при отправке сообщения реплике Sensay:', error);
      throw error;
    }
  }
  
  /**
   * Получить информацию о пользователе
   * @returns Промис с информацией о пользователе
   */
  async getUserInfo() {
    try {
      const apiUrl = `${BASE_URL}/v1/users/me`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при получении информации о пользователе (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении информации о пользователе:', error);
      throw error;
    }
  }
  
  /**
   * Получить список всех реплик
   * @returns Промис со списком реплик
   */
  async getReplicas() {
    try {
      const apiUrl = `${BASE_URL}/v1/replicas`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при получении списка реплик (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении списка реплик:', error);
      throw error;
    }
  }
}
