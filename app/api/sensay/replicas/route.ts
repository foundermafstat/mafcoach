import { NextResponse } from 'next/server';

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
  message?: string; // Опциональное сообщение об ошибке
}

// Получить все реплики из Sensay API
export async function GET(request: Request) {
  try {
    // Используем переменные окружения напрямую вместо базы данных
    const apiKey = process.env.SENSAY_API_KEY;
    const orgId = process.env.SENSAY_ORG_ID;
    const userId = process.env.SENSAY_USER_ID;

    if (!apiKey || !orgId) {
      return NextResponse.json(
        { error: "Missing required API settings in environment variables (SENSAY_API_KEY, SENSAY_ORG_ID)" },
        { status: 400 }
      );
    }

    console.log(`Using API key: ${apiKey.substring(0, 5)}...`);
    console.log(`Using organization ID: ${orgId}`);
    console.log(`Using user ID: ${userId || apiKey}`);

    // Выполняем запрос к API согласно предоставленной спецификации
    const url = process.env.SENSAY_REPLICA_API || "https://api.sensay.io/v1/replicas";
    console.log(`Sending GET request to: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-ORGANIZATION-SECRET": apiKey,
        "X-USER-ID": userId || apiKey,
        "X-API-Version": "2025-03-25",
        "x-organization-id": orgId,
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to fetch replicas: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json() as SensayReplicasResponse;
    console.log('Response data received');

    if (!data.success) {
      console.error('API returned success: false');
      return NextResponse.json(
        { error: `API Error: ${data.message || 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Возвращаем список реплик
    console.log(`Retrieved ${data.items?.length || 0} replicas.`);
    return NextResponse.json(data.items || []);
  } catch (error) {
    console.error('Error in replicas GET route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch replicas: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Создать новую реплику
export async function POST(request: Request) {
  try {
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

    // Выполняем запрос к Sensay API для создания реплики
    const url = process.env.SENSAY_REPLICA_API || "https://api.sensay.io/v1/replicas";
    console.log(`Sending POST request to: ${url}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-ORGANIZATION-SECRET": apiKey,
        "Content-Type": "application/json",
        "X-API-Version": "2025-03-25"
      },
      body: JSON.stringify(replicaData)
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to create replica: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Replica created successfully');

    // Возвращаем данные созданной реплики
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in replicas POST route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create replica: ${errorMessage}` },
      { status: 500 }
    );
  }
}
