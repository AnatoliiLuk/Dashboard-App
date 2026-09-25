import { NextResponse } from 'next/server';
import { getDashboard } from '@/lib/dashboard';

export async function GET() {
  return NextResponse.json(getDashboard());
}
