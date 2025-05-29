import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Получаем тело запроса
    const body = await request.json();
    
    // ID реплики для экспериментального API: используем из запроса или из переменных окружения
    const replicaId = body.replicaId || process.env.SENSAY_REPLICA_UUID || "";
    
    if (!replicaId) {
      return NextResponse.json(
        { error: "Replica ID is required" },
        { status: 400 }
      );
    }
    
    console.log("Using replica ID:", replicaId);
    
    // Получаем API ключ и ID организации из переменных окружения
    const apiKey = process.env.SENSAY_API_KEY;
    const orgId = process.env.SENSAY_ORG_ID;
    const userId = process.env.SENSAY_USER_ID;
    
    if (!apiKey || !orgId) {
      return NextResponse.json(
        { error: "API key or Organization ID not configured" },
        { status: 500 }
      );
    }

    // Формируем URL для запроса к экспериментальному API
    const url = `https://api.sensay.io/v1/experimental/replicas/${replicaId}/chat/completions`;
    
    // Выполняем запрос к Sensay API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ORGANIZATION-SECRET': apiKey,
        'X-USER-ID': userId || apiKey,
      },
      body: JSON.stringify(body),
    });
    
    // Проверяем ответ
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Sensay API Error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to process request', details: errorData },
        { status: response.status }
      );
    }
    
    // Возвращаем успешный ответ
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
