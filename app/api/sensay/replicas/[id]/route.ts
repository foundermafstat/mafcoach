import { NextRequest, NextResponse } from 'next/server';

// Получить конкретную реплику по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const replicaId = params.id;
    
    // Получаем API ключи из переменных окружения
    const apiKey = process.env.SENSAY_API_KEY;
    const orgId = process.env.SENSAY_ORG_ID;
    const userId = process.env.SENSAY_USER_ID;

    if (!apiKey || !orgId) {
      return NextResponse.json(
        { error: "Missing required API settings in environment variables (SENSAY_API_KEY, SENSAY_ORG_ID)" },
        { status: 400 }
      );
    }

    // Выполняем запрос к Sensay API для получения реплики по ID
    const url = `${process.env.SENSAY_REPLICA_API || "https://api.sensay.io/v1/replicas"}/${replicaId}`;
    console.log(`Sending GET request to: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-ORGANIZATION-SECRET": apiKey,
        "X-API-Version": "2025-03-25",
        "x-organization-id": orgId
      }
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch replica: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Replica details retrieved successfully');

    // Возвращаем данные реплики
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in replica GET route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch replica: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Обновить реплику по ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const replicaId = params.id;
    
    // Получаем данные из тела запроса
    const replicaData = await request.json();
    
    // Получаем API ключи из переменных окружения
    const apiKey = process.env.SENSAY_API_KEY;
    const orgId = process.env.SENSAY_ORG_ID;
    const userId = process.env.SENSAY_USER_ID;

    if (!apiKey || !orgId) {
      return NextResponse.json(
        { error: "Missing required API settings in environment variables (SENSAY_API_KEY, SENSAY_ORG_ID)" },
        { status: 400 }
      );
    }

    // Выполняем запрос к Sensay API для обновления реплики
    const url = `${process.env.SENSAY_REPLICA_API || "https://api.sensay.io/v1/replicas"}/${replicaId}`;
    console.log(`Sending PUT request to: ${url}`);
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "X-ORGANIZATION-SECRET": apiKey,
        "Content-Type": "application/json",
        "X-API-Version": "2025-03-25",
        "x-organization-id": orgId
      },
      body: JSON.stringify(replicaData)
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to update replica: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Replica updated successfully');

    // Возвращаем данные обновленной реплики
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in replica PUT route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update replica: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Удалить реплику по ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Используем await для обеспечения корректной загрузки параметров
    const { id: replicaId } = params;
    
    // Получаем API ключи из переменных окружения
    const apiKey = process.env.SENSAY_API_KEY;
    const orgId = process.env.SENSAY_ORG_ID;
    const userId = process.env.SENSAY_USER_ID;

    if (!apiKey || !orgId) {
      return NextResponse.json(
        { error: "Missing required API settings in environment variables (SENSAY_API_KEY, SENSAY_ORG_ID)" },
        { status: 400 }
      );
    }

    // Выполняем запрос к Sensay API для удаления реплики
    const url = `${process.env.SENSAY_REPLICA_API || "https://api.sensay.io/v1/replicas"}/${replicaId}`;
    console.log(`Sending DELETE request to: ${url}`);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-ORGANIZATION-SECRET": apiKey,
        "X-API-Version": "2025-03-25",
        "x-organization-id": orgId
      }
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to delete replica: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    // Возвращаем успешный ответ
    return NextResponse.json({ success: true, message: 'Replica deleted successfully' });
  } catch (error) {
    console.error('Error in replica DELETE route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete replica: ${errorMessage}` },
      { status: 500 }
    );
  }
}
