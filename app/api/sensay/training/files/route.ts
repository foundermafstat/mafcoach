import { NextResponse } from 'next/server';

// Получаем API ключи напрямую из переменных окружения
const SENSAY_API_KEY = process.env.SENSAY_API_KEY || '';
const SENSAY_ORG_ID = process.env.SENSAY_ORG_ID || '';

/**
 * GET-метод для получения подписанного URL для загрузки файла
 * Согласно документации: https://docs.sensay.io/topic/topic-training
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const replicaUUID = searchParams.get('replicaUUID');
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Missing required parameter: filename' },
        { status: 400 }
      );
    }
    
    if (!replicaUUID) {
      return NextResponse.json(
        { error: 'Missing required parameter: replicaUUID' },
        { status: 400 }
      );
    }
    
    // Проверяем, что ключи API доступны
    if (!SENSAY_API_KEY) {
      return NextResponse.json(
        { error: 'Missing API key. Please check environment variables.' },
        { status: 500 }
      );
    }
    
    console.log(`Получение подписанного URL для загрузки файла: ${filename}, реплика: ${replicaUUID}`);
    
    // Выполняем запрос к API Sensay для получения подписанного URL
    const response = await fetch(
      `https://api.sensay.io/v1/replicas/${replicaUUID}/training/files/upload?filename=${encodeURIComponent(filename)}`,
      {
        method: 'GET',
        headers: {
          'X-ORGANIZATION-SECRET': SENSAY_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Ошибка при получении подписанного URL: ${response.status} ${response.statusText}`);
      try {
        const error = await response.json();
        console.error('Данные ошибки:', error);
        return NextResponse.json(
          { error: `Failed to get signed URL: ${error.error || JSON.stringify(error)}` },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to get signed URL: ${response.statusText}` },
          { status: response.status }
        );
      }
    }
    
    // Получаем данные ответа
    const data = await response.json();
    console.log('Получен подписанный URL:', data.signedURL ? 'успешно' : 'отсутствует');
    
    // Возвращаем данные клиенту
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to get signed URL for file upload' },
      { status: 500 }
    );
  }
}
