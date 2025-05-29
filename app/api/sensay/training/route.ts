import { NextResponse } from 'next/server';

// Получаем API ключи напрямую из переменных окружения
const SENSAY_API_KEY = process.env.SENSAY_API_KEY || '';
const SENSAY_ORG_ID = process.env.SENSAY_ORG_ID || '';

interface KnowledgeBaseEntry {
  id: number;
  replica_uuid: string | null;
  type: "file_upload" | "url" | "training_history" | "text";
  filename: string | null;
  status: string;
  raw_text: string | null;
  processed_text: string | null;
  created_at: string;
  updated_at: string;
  title: string | null;
  description: string | null;
}

// Получить все тренировочные записи или конкретную запись по ID
// Также поддерживает фильтрацию по UUID реплики
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const replicaUuid = searchParams.get('replica_uuid');
  try {
    // Проверяем, что ключи API доступны
    if (!SENSAY_API_KEY || !SENSAY_ORG_ID) {
      return NextResponse.json(
        { error: 'Missing API keys. Please check environment variables.' },
        { status: 500 }
      );
    }
    
    // Если указан ID, получаем конкретную запись, иначе получаем все записи
    let url = id 
      ? `https://api.sensay.io/v1/training/${id}` 
      : "https://api.sensay.io/v1/training";
      
    // Если указан UUID реплики, добавляем фильтр
    if (replicaUuid && !id) {
      url += `?replica_uuid=${replicaUuid}`;
    }
      
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `Failed to get knowledge base entries: ${error.error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Если это ответ на запрос всех записей, возвращаем items, иначе возвращаем один объект
    const result = id ? data : data.items;
    
    // Если фильтр по UUID реплики был указан, но API не поддерживает этот параметр,
    // фильтруем записи на стороне сервера
    if (replicaUuid && !id && Array.isArray(result)) {
      return NextResponse.json(result.filter(item => item.replica_uuid === replicaUuid));
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching training entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training entries' },
      { status: 500 }
    );
  }
}

// Создать новую тренировочную запись
export async function POST(request: Request) {
  try {
    // Проверяем, что ключи API доступны
    if (!SENSAY_API_KEY || !SENSAY_ORG_ID) {
      return NextResponse.json(
        { error: 'Missing API keys. Please check environment variables.' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { replicaUUID, content, title, description } = body;
    
    if (!replicaUUID) {
      return NextResponse.json(
        { error: 'Missing required field: replicaUUID' },
        { status: 400 }
      );
    }
    
    // Проверяем, это создание пустой записи для последующей загрузки файла или нет
    const isEmptyEntryForFileUpload = content === '';
    
    // Для обычного текстового ввода контент обязателен
    if (!isEmptyEntryForFileUpload && !content) {
      return NextResponse.json(
        { error: 'Content is required for text entries' },
        { status: 400 }
      );
    }
    
    // Step 1: Create knowledge base entry
    const createResponse = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/training`, {
      method: "POST",
      headers: {
        "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      return NextResponse.json(
        { error: `Failed to create knowledge base entry: ${error.error}` },
        { status: createResponse.status }
      );
    }

    const createData = await createResponse.json();
    const knowledgeBaseID = createData.knowledgeBaseID;
    
    // Step 2: Update with content
    const updateResponse = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/training/${knowledgeBaseID}`, {
      method: "PUT",
      headers: {
        "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rawText: content,
        // Согласно документации Sensay API не используем title и description
      }),
    });

    if (!updateResponse.ok) {
      try {
        const error = await updateResponse.json();
        return NextResponse.json(
          { error: `Failed to update knowledge base entry: ${error.error}` },
          { status: updateResponse.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to update knowledge base entry: ${updateResponse.statusText}` },
          { status: updateResponse.status }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      knowledgeBaseID 
    });
  } catch (error) {
    console.error('Error creating training entry:', error);
    return NextResponse.json(
      { error: 'Failed to create training entry' },
      { status: 500 }
    );
  }
}

// Обновить тренировочную запись по ID
export async function PUT(request: Request) {
  try {
    console.log('PUT запрос к API тренировочных данных')
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Проверяем, что ключи API доступны
    if (!SENSAY_API_KEY || !SENSAY_ORG_ID) {
      return NextResponse.json(
        { error: 'Missing API keys. Please check environment variables.' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { replicaUUID, content, rawText, title, description } = body;
    
    console.log(`PUT запрос: replicaUUID=${replicaUUID}, ID=${id}`);
    console.log(`Размер контента: ${(content?.length || 0)} символов, rawText: ${(rawText?.length || 0)} символов`);
    
    if (!replicaUUID) {
      return NextResponse.json(
        { error: 'Missing required field: replicaUUID' },
        { status: 400 }
      );
    }
    
    // Проверяем наличие контента в любом из полей
    let contentText = rawText || content;
    
    // Ограничиваем размер текста для предотвращения ошибок
    if (contentText && contentText.length > 1000000) {
      console.warn(`Слишком большой файл, обрезаем до 1000000 символов (был ${contentText.length})`);
      contentText = contentText.substring(0, 1000000);
    }
    
    if (!contentText) {
      return NextResponse.json(
        { error: 'Content is required (either as content or rawText)' },
        { status: 400 }
      );
    }
    
    const requestBody = JSON.stringify({
      rawText: contentText,
    });
    
    console.log(`Отправка запроса к Sensay API: ${`https://api.sensay.io/v1/replicas/${replicaUUID}/training/${id}`}`);
    console.log(`Заголовки: X-ORGANIZATION-SECRET: ${SENSAY_API_KEY.substring(0, 5)}...`);
    
    const response = await fetch(`https://api.sensay.io/v1/replicas/${replicaUUID}/training/${id}`, {
      method: "PUT",
      headers: {
        "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    if (!response.ok) {
      console.error(`Ошибка от Sensay API: ${response.status} ${response.statusText}`);
      try {
        const error = await response.json();
        console.error('Данные ошибки:', error);
        return NextResponse.json(
          { error: `Failed to update knowledge base entry: ${error.error || JSON.stringify(error)}` },
          { status: response.status }
        );
      } catch (e) {
        console.error('Не удалось распарсить ответ как JSON:', e);
        // Попробуем получить текст ответа
        try {
          const textResponse = await response.text();
          console.error('Текст ответа:', textResponse);
          return NextResponse.json(
            { error: `Failed to update knowledge base entry: ${response.statusText}. Response: ${textResponse.substring(0, 200)}` },
            { status: response.status }
          );
        } catch (textError) {
          console.error('Не удалось получить текст ответа:', textError);
          return NextResponse.json(
            { error: `Failed to update knowledge base entry: ${response.statusText}` },
            { status: response.status }
          );
        }
      }
    }

    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error('Error updating training entry:', error);
    return NextResponse.json(
      { error: 'Failed to update training entry' },
      { status: 500 }
    );
  }
}

// Удалить тренировочную запись по ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    // Проверяем, что ключи API доступны
    if (!SENSAY_API_KEY || !SENSAY_ORG_ID) {
      return NextResponse.json(
        { error: 'Missing API keys. Please check environment variables.' },
        { status: 500 }
      );
    }
    
    const response = await fetch(`https://api.sensay.io/v1/training/${id}`, {
      method: "DELETE",
      headers: {
        "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        return NextResponse.json(
          { error: `Failed to delete knowledge base entry: ${error.error}` },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to delete knowledge base entry: ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error('Error deleting training entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete training entry' },
      { status: 500 }
    );
  }
}
