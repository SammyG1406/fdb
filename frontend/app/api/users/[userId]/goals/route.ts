import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const response = await fetch(`${USER_SERVICE_URL}/users/${userId}/goals`);

  if (response.status === 404) {
    return NextResponse.json(null, { status: 404 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
