import { NextResponse } from 'next/server';

/**
 * POST-метод для загрузки файла на подписанный URL
 * Согласно документации: https://docs.sensay.io/topic/topic-training
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signedURL, fileContent, fileType, knowledgeBaseID } = body;
    
    if (!signedURL) {
      return NextResponse.json(
        { error: 'Missing required parameter: signedURL' },
        { status: 400 }
      );
    }
    
    if (!fileContent) {
      return NextResponse.json(
        { error: 'Missing required parameter: fileContent' },
        { status: 400 }
      );
    }
    
    console.log(`Загрузка файла на подписанный URL для записи: ${knowledgeBaseID}`);
    console.log(`Тип файла: ${fileType || 'не указан'}`);
    
    // Преобразуем содержимое файла в бинарный формат
    const binaryData = new TextEncoder().encode(fileContent);
    
    // Загружаем файл на подписанный URL
    const uploadResponse = await fetch(signedURL, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType || 'application/octet-stream',
      },
      body: binaryData,
    });
    
    if (!uploadResponse.ok) {
      console.error(`Ошибка при загрузке файла: ${uploadResponse.status} ${uploadResponse.statusText}`);
      try {
        const responseText = await uploadResponse.text();
        console.error('Ответ при ошибке:', responseText);
        return NextResponse.json(
          { error: `Failed to upload file: ${uploadResponse.statusText}. Response: ${responseText.substring(0, 200)}` },
          { status: uploadResponse.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to upload file: ${uploadResponse.statusText}` },
          { status: uploadResponse.status }
        );
      }
    }
    
    // Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      knowledgeBaseID
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
