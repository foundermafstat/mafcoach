import { NextResponse } from 'next/server';
import { SensaySettingsService } from '@/app/lib/api/sensay-settings';

export async function GET() {
  try {
    const settings = await SensaySettingsService.getActiveSettings();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'No active API settings found' },
        { status: 404 }
      );
    }
    
    // Return only safe data, don't expose API keys directly
    return NextResponse.json({
      orgId: settings.orgId,
      userId: settings.userId,
      replicaUUID: settings.replicaUUID,
      // Don't include the actual API key in the response
      hasApiKey: !!settings.apiKey,
    });
  } catch (error) {
    console.error('Error fetching API settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API settings' },
      { status: 500 }
    );
  }
}
