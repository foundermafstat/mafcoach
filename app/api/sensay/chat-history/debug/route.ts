import { NextResponse } from 'next/server';
import type { SensayChatMessage, SensayChatHistory } from '@/app/lib/api/sensay-chat-history-sdk';

// Получаем настройки API из переменных окружения
const SENSAY_API_KEY = process.env.SENSAY_API_KEY || '';
const SENSAY_ORG_ID = process.env.SENSAY_ORG_ID || '';
const SENSAY_USER_ID = process.env.SENSAY_USER_ID || '';
const DEFAULT_REPLICA_UUID = process.env.SENSAY_REPLICA_UUID || '';

// Получить историю чатов для конкретной реплики
export async function GET(request: Request) {
  // Получаем UUID реплики из параметров запроса
  const { searchParams } = new URL(request.url);
  const replicaUUID = searchParams.get('replicaUUID') || DEFAULT_REPLICA_UUID;
  
  if (!replicaUUID) {
    return NextResponse.json(
      { error: 'Replica UUID is required' },
      { status: 400 }
    );
  }
  
  // Логирование для диагностики
  console.log('=== DEBUG API ROUTE ===');
  console.log(`Getting chat history for replica UUID: ${replicaUUID}`);
  console.log(`Environment variables:`);
  console.log(`- SENSAY_API_KEY: ${SENSAY_API_KEY ? 'Set (first 5 chars: ' + SENSAY_API_KEY.substring(0, 5) + '...)' : 'Not set'}`);
  console.log(`- SENSAY_ORG_ID: ${SENSAY_ORG_ID ? 'Set (first 5 chars: ' + SENSAY_ORG_ID.substring(0, 5) + '...)' : 'Not set'}`);
  console.log(`- SENSAY_USER_ID: ${SENSAY_USER_ID ? 'Set (first 5 chars: ' + SENSAY_USER_ID.substring(0, 5) + '...)' : 'Not set'}`);
  console.log(`- SENSAY_REPLICA_UUID: ${DEFAULT_REPLICA_UUID ? 'Set (' + DEFAULT_REPLICA_UUID + ')' : 'Not set'}`);
  
  try {
    // Пробуем все возможные комбинации заголовков для аутентификации
    
    // Вариант 1: X-ORGANIZATION-SECRET
    console.log('\nTrying authentication with X-ORGANIZATION-SECRET...');
    const url1 = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history?history=true`;
    const response1 = await fetch(url1, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': SENSAY_API_KEY
      }
    });
    
    console.log(`Response 1 status: ${response1.status} ${response1.statusText}`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('Response 1 data structure (first 100 chars):', JSON.stringify(data1).substring(0, 100));
      return NextResponse.json({
        method: "X-ORGANIZATION-SECRET",
        status: response1.status,
        data: data1
      });
    } else {
      console.log('Response 1 failed, trying next method...');
    }
    
    // Вариант 2: Bearer token + x-organization-id
    console.log('\nTrying authentication with Bearer token + x-organization-id...');
    const url2 = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history?history=true`;
    const response2 = await fetch(url2, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENSAY_API_KEY}`,
        'x-organization-id': SENSAY_ORG_ID
      }
    });
    
    console.log(`Response 2 status: ${response2.status} ${response2.statusText}`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('Response 2 data structure (first 100 chars):', JSON.stringify(data2).substring(0, 100));
      return NextResponse.json({
        method: "Bearer + x-organization-id",
        status: response2.status,
        data: data2
      });
    } else {
      console.log('Response 2 failed, trying next method...');
    }
    
    // Вариант 3: SDK URL формат
    console.log('\nTrying SDK URL format with X-API-Version...');
    const url3 = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`;
    const response3 = await fetch(url3, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
        'X-API-Version': '2025-03-25'
      }
    });
    
    console.log(`Response 3 status: ${response3.status} ${response3.statusText}`);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('Response 3 data structure (first 100 chars):', JSON.stringify(data3).substring(0, 100));
      return NextResponse.json({
        method: "X-ORGANIZATION-SECRET + X-API-Version",
        status: response3.status,
        data: data3
      });
    }
    
    // Вариант 4: Как в sensay-direct.ts с X-USER-ID
    console.log('\nTrying authentication like in sensay-direct.ts with X-USER-ID...');
    const url4 = `https://api.sensay.io/v1/replicas/${replicaUUID}/chat/history`;
    const response4 = await fetch(url4, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
        'X-USER-ID': SENSAY_USER_ID,
        'X-API-Version': '2025-03-25'
      }
    });
    
    console.log(`Response 4 status: ${response4.status} ${response4.statusText}`);
    
    if (response4.ok) {
      const data4 = await response4.json();
      console.log('Response 4 data structure (first 100 chars):', JSON.stringify(data4).substring(0, 100));
      return NextResponse.json({
        method: "X-ORGANIZATION-SECRET + X-USER-ID + X-API-Version",
        status: response4.status,
        data: data4
      });
    } else {
      // Если все методы не сработали, возвращаем ошибку с информацией о всех попытках
      return NextResponse.json(
        { 
          error: 'All authentication methods failed',
          attempts: [
            { method: "X-ORGANIZATION-SECRET", status: response1.status },
            { method: "Bearer + x-organization-id", status: response2.status },
            { method: "X-ORGANIZATION-SECRET + X-API-Version", status: response3.status },
            { method: "X-ORGANIZATION-SECRET + X-USER-ID + X-API-Version", status: response4.status }
          ]
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in debug chat history route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch chat history: ${errorMessage}` },
      { status: 500 }
    );
  }
}
