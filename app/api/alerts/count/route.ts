import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

type AlertStatus = 'ACTIVE' | 'DISMISSED';

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch from Spring Boot API
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // const response = await fetch(`${apiUrl}/alerts/count?status=ACTIVE&branchId=${session.user.branchId}`);
    // const data = await response.json();

    // Mock data for now
    const count = session.user.role === 'superadmin' ? 5 : 3;

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching alerts count:', error);
    return NextResponse.json({ count: 0 });
  }
}
