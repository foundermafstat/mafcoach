import { NextResponse } from 'next/server';
import { SensaySettingsService } from '@/app/lib/api/sensay-settings';

// GET /api/settings - получить все настройки API
export async function GET() {
  try {
    const settings = await SensaySettingsService.getAllSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching API settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings - создать или обновить настройки API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, apiKey, organizationId, userId, replicaUuid, isActive } = body;
    
    // Проверяем наличие всех необходимых полей
    if (!name || !apiKey || !organizationId || !userId || !replicaUuid) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const settings = await SensaySettingsService.createOrUpdateSettings(
      name,
      apiKey,
      organizationId,
      userId,
      replicaUuid,
      isActive !== undefined ? isActive : true
    );
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error creating/updating API settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create/update API settings' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings?name=settingName - удалить настройки API по имени
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Missing setting name' },
        { status: 400 }
      );
    }
    
    const success = await SensaySettingsService.deleteSettings(name);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete API settings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting API settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete API settings' },
      { status: 500 }
    );
  }
}
