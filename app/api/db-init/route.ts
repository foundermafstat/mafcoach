import { NextResponse } from 'next/server';
import { initDatabase } from '@/app/lib/db-init';

// GET /api/db-init - инициализировать базу данных
export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
