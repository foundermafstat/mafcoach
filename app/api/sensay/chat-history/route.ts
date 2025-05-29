import { NextResponse } from 'next/server';
import type { SensayChatMessage, SensayChatHistory } from '@/app/lib/api/sensay-chat-history-sdk';

// Получаем настройки API из переменных окружения
// Получаем API ключи напрямую из переменных окружения
const SENSAY_API_KEY = process.env.SENSAY_API_KEY || '';
const SENSAY_ORG_ID = process.env.SENSAY_ORG_ID || '';

// Получить историю чатов для конкретной реплики
export async function GET(request: Request) {
  // Получаем UUID реплики из параметров запроса
  const { searchParams } = new URL(request.url);
  const replicaUUID = searchParams.get('replicaUUID');
  
  if (!replicaUUID) {
    return NextResponse.json(
      { error: 'Replica UUID is required' },
      { status: 400 }
    );
  }
  
  try {
    console.log(`Getting chat history for replica UUID: ${replicaUUID} directly from API route`);
    console.log(`Using API Key starting with: ${SENSAY_API_KEY.substring(0, 5)}...`);
    
    // Согласно памяти о проекте, используем Bearer токен и ID организации
    const url = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': SENSAY_API_KEY
      }
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response body: ${errorText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Обрабатываем ответ из API
    let chatHistory: SensayChatHistory[] = [];
    
    console.log('Response data structure:', JSON.stringify(data, null, 2).substring(0, 500));
    
    // Проверяем разные возможные форматы ответа
    if (data?.history && Array.isArray(data.history)) {
      // Формат 1: Прямой массив истории
      chatHistory = data.history.map((item: any) => ({
        id: item.id || `history-${Date.now()}`,
        replicaUUID: replicaUUID,
        messages: Array.isArray(item.messages) ? item.messages : [],
        createdAt: item.createdAt || new Date().toISOString()
      }));
    } else if (data?.items && Array.isArray(data.items)) {
      // Формат 2: Формат items из SDK
      chatHistory = data.items.map((item: any) => ({
        id: item.id || `history-${Date.now()}`,
        replicaUUID: replicaUUID,
        messages: [{
          role: 'user',
          content: item.content || '',
          timestamp: item.created_at || new Date().toISOString()
        }],
        createdAt: item.created_at || new Date().toISOString()
      }));
    }
    
    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error('Error in chat history GET route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch chat history: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Создать новую запись истории чата
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const replicaUUID = searchParams.get('replicaUUID');
    
    if (!replicaUUID) {
      return NextResponse.json(
        { error: 'Replica UUID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Valid messages array is required' },
        { status: 400 }
      );
    }
    
    console.log(`Creating chat history for replica UUID: ${replicaUUID} directly from API route`);
    
    // Based on the error message, it seems the API expects a 'content' field instead of 'messages'
    // Extract the content from the first message
    const messageContent = messages[0].content || "";
    
    // Согласно памяти о проекте, используем Bearer токен и ID организации
    const url = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`;
    
    // Prepare the request body according to the API requirements
    const requestBody = {
      content: messageContent,
      // Include any other required fields here
    };
    
    console.log('Sending request with body:', JSON.stringify(requestBody));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': SENSAY_API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response body: ${errorText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({ id: data.id || `chat-${Date.now()}` });
  } catch (error) {
    console.error('Error in chat history POST route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create chat history entry: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Удалить запись истории чата
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const replicaUUID = searchParams.get('replicaUUID');
    const chatId = searchParams.get('chatId');
    
    if (!replicaUUID || !chatId) {
      return NextResponse.json(
        { error: 'Replica UUID and Chat ID are required' },
        { status: 400 }
      );
    }
    
    console.log(`Deleting chat history entry ${chatId} for replica UUID: ${replicaUUID} directly from API route`);
    
    // Согласно памяти о проекте, используем Bearer токен и ID организации
    const url = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history/${chatId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': SENSAY_API_KEY
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response body: ${errorText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in chat history DELETE route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete chat history entry: ${errorMessage}` },
      { status: 500 }
    );
  }
}
