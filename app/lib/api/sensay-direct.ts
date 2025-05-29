/**
 * Direct implementation of Sensay API calls without using the SDK
 * This approach gives us more control over the exact request structure
 */

// Get environment variables for client-side usage (Next.js public env vars)
// Для клиентской части в Next.js нужно использовать переменные с префиксом NEXT_PUBLIC_
const SENSAY_API_KEY = process.env.NEXT_PUBLIC_SENSAY_API_KEY || '';
const SENSAY_ORG_ID = process.env.NEXT_PUBLIC_SENSAY_ORG_ID || '';
const SENSAY_USER_ID = process.env.NEXT_PUBLIC_SENSAY_USER_ID || '';
const SENSAY_REPLICA_UUID = process.env.NEXT_PUBLIC_SENSAY_REPLICA_UUID || '';

// Base API URL and endpoints
const BASE_URL = 'https://api.sensay.io';

/**
 * Send a message to a Sensay replica using direct API calls
 * @param replicaUuid - The UUID of the replica to use
 * @param content - The message content to send
 * @param skipChatHistory - Whether to skip saving the message in chat history
 */
/**
 * ВАЖНО: Для работы с API Sensay требуется:
 * 1. Создать пользователя в организации Sensay
 * 2. Получить ID пользователя
 * 3. Добавить ID пользователя в .env файл как SENSAY_USER_ID
 */
export const sendMessageToReplicaDirect = async (
  content: string,
  replicaUuid: string,
  skipChatHistory = false,
  userId = SENSAY_USER_ID
) => {
  try {
    console.log('Sending message to Sensay replica:', { replicaUuid, contentLength: content.length });
    
    // Детальное логирование для отладки проблемы с UUID реплики
    console.log('Input replicaUuid parameter:', replicaUuid);
    console.log('Environment SENSAY_REPLICA_UUID:', SENSAY_REPLICA_UUID);
    
    // Проверяем длину UUID и валидность
    if (replicaUuid) {
      console.log('replicaUuid length:', replicaUuid.length, 'value:', replicaUuid);
      // Проверка на валидный UUID (36 символов, формат 8-4-4-4-12)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      console.log('Is valid UUID format:', uuidRegex.test(replicaUuid));
    }
    
    // Используем UUID реплики из переменной окружения NEXT_PUBLIC_SENSAY_REPLICA_UUID
    // Если передан явный replicaUuid, используем его
    const actualReplicaUuid = replicaUuid || SENSAY_REPLICA_UUID;
    console.log('Final replica UUID used for API call:', actualReplicaUuid);
    const apiUrl = `${BASE_URL}/v1/replicas/${actualReplicaUuid}/chat/completions`;
    
    // Подготовка заголовков для аутентификации по Method 2: как пользователь
    // Требуется X-ORGANIZATION-SECRET и действительный X-USER-ID
    const headers = {
      'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
      'X-USER-ID': userId, // Должен быть действительный ID пользователя из вашей организации
      'Content-Type': 'application/json',
      'X-API-Version': '2025-03-25',
    };
    
    // Проверка наличия ID пользователя
    if (!userId) {
      console.error('ОШИБКА: Отсутствует ID пользователя (SENSAY_USER_ID). Создайте пользователя в Sensay и добавьте его ID в .env файл.');
    }
    
    // Log headers for debugging (without sensitive values)
    console.log('Request headers:', { ...headers, 'X-ORGANIZATION-SECRET': '[REDACTED]' });
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content,
        skip_chat_history: skipChatHistory,
        source: 'web',
      }),
    });
    
    console.log('Response status:', response.status);
    
    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    console.log('Response success, status:', response.status);
    
    // Parse the response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to Sensay replica:', error);
    throw error;
  }
}
