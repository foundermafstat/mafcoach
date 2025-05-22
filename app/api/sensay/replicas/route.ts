import { NextResponse } from 'next/server';
import { SensayReplicasService } from '@/app/lib/api/sensay-replicas';
import type { SensayReplica } from '@/app/lib/api/sensay-replicas';

// Получить все реплики или конкретную реплику по ID
export async function GET(request: Request) {
  // Проверяем, запрашивается ли конкретная реплика по ID
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    // Логика для получения конкретной реплики будет добавлена позже
    return NextResponse.json(
      { error: 'Fetching individual replicas not implemented yet' },
      { status: 501 }
    );
  }
  try {
    let replicas: SensayReplica[] = [];
    
    try {
      // Сначала пытаемся получить реплики из API Sensay
      replicas = await SensayReplicasService.getReplicas();
      console.log('Successfully fetched replicas from API');
    } catch (apiError) {
      console.error('Error fetching replicas from API:', apiError);
      
      // Если API недоступен, используем данные из базы данных
      console.log('Falling back to database replicas');
      replicas = await SensayReplicasService.getReplicasFromDatabase();
      
      // Если нет данных в базе, это нормально для первого запуска
      if (replicas.length === 0) {
        console.log('No replicas found in database, returning empty array');
        // Возвращаем пустой массив вместо ошибки
      }
    }
    
    return NextResponse.json(replicas);
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
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const replica = await SensayReplicasService.createReplica(name, description || '');
    
    return NextResponse.json(replica);
  } catch (error) {
    console.error('Error in replicas POST route:', error);
    return NextResponse.json(
      { error: 'Failed to create replica' },
      { status: 500 }
    );
  }
}

// Обновить реплику по ID
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const replica = await SensayReplicasService.updateReplica(
      id,
      name,
      description || ''
    );
    
    return NextResponse.json(replica);
  } catch (error) {
    console.error('Error in replicas PUT route:', error);
    return NextResponse.json(
      { error: 'Failed to update replica' },
      { status: 500 }
    );
  }
}

// Удалить реплику по ID
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
    
    await SensayReplicasService.deleteReplica(id);
    
    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error in replicas DELETE route:', error);
    return NextResponse.json(
      { error: 'Failed to delete replica' },
      { status: 500 }
    );
  }
}
