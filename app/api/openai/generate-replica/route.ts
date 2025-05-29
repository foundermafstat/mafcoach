import { NextResponse } from 'next/server';
import { generateReplicaContent } from '@/app/lib/api/openai';

export async function POST(request: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const content = await generateReplicaContent(description);
    
    // Списки допустимых значений для полей с перечислениями
    const validTypes = ['individual', 'character', 'brand'];
    const validModels = [
      'gpt-4o', 'claude-3-5-haiku-latest', 'claude-3-7-sonnet-latest', 'claude-4-sonnet-20250514', 
      'grok-2-latest', 'grok-3-beta', 'deepseek-chat', 'o3-mini', 'gpt-4o-mini', 
      'huggingface-eva', 'huggingface-dolphin-llama'
    ];
    
    // Валидация и исправление значений перечислений
    if (content.type && !validTypes.includes(content.type)) {
      console.log(`Недопустимое значение type: ${content.type}, заменено на 'character'`);
      content.type = 'character';
    }
    
    if (content.modelName && !validModels.includes(content.modelName)) {
      console.log(`Недопустимое значение modelName: ${content.modelName}, заменено на 'gpt-4o'`);
      content.modelName = 'gpt-4o';
    }
    
    // Используем реальный ID пользователя из переменных окружения
    const userId = process.env.SENSAY_USER_ID || 'f676f323-fc10-44a3-8f8d-508b1f9c942f';
    
    // Дополнительная валидация и обрезка полей до допустимых значений
    // Функция для генерации slug из имени
    const generateSlugFromName = (name: string): string => {
      return name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
        .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
        .replace(/--+/g, '-') // Удаляем повторяющиеся дефисы
        .trim(); // Удаляем пробелы по краям
    };
    
    // Добавляем URL изображения профиля по умолчанию (надежный и доступный)
    const defaultProfileImage = 'https://placehold.co/400x400/4F46E5/FFFFFF?text=AI+Replica';
    
    // Если slug не был сгенерирован, создаем его из имени
    const slug = content.slug || (content.name ? generateSlugFromName(content.name) : 'ai-replica');
    
    const generatedContent = {
      ...content,
      // Добавляем надежный URL изображения и slug
      profileImage: content.profileImage || defaultProfileImage,
      slug,
      // Обязательные поля с ограничениями по длине
      purpose: content.purpose && content.purpose.length > 200 
        ? `${content.purpose.substring(0, 197)}...` 
        : content.purpose,
      shortDescription: content.shortDescription && content.shortDescription.length > 50 
        ? `${content.shortDescription.substring(0, 47)}...` 
        : content.shortDescription,
      
      // Убедимся, что все обязательные поля заполнены
      name: content.name || 'Новая реплика',
      greeting: content.greeting || 'Привет! Чем я могу помочь?',
      systemMessage: content.systemMessage || 'Помогать пользователям дружелюбно и информативно',
      // Добавляем поле ownerID с реальным ID пользователя
      ownerID: userId,
      // Используем проверенные значения для перечислений
      type: content.type || 'character',
      modelName: content.modelName || 'gpt-4o',
      
      // Дополнительные поля
      tags: Array.isArray(content.tags) && content.tags.length > 0 
        ? content.tags 
        : ['ai', 'assistant', 'helper'],
      suggestedQuestions: Array.isArray(content.suggestedQuestions) && content.suggestedQuestions.length > 0 
        ? content.suggestedQuestions 
        : ['Чем ты можешь помочь?', 'Расскажи о себе', 'Какие у тебя возможности?'],
      
      // Добавляем описание для изображения профиля (не используется напрямую, но может быть полезно пользователю)
      profileImageDescription: content.profileImageDescription || 'Подходящее изображение профиля'
    };
    
    return NextResponse.json(generatedContent);
  } catch (error) {
    console.error('Error generating replica content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate replica content';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
