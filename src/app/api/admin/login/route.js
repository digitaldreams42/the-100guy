import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/session';

export async function POST(request) {
  const session = await getSession();
  const { email, password } = await request.json();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (email === adminEmail && password === adminPassword) {
    session.user = {
      isAdmin: true,
      email: adminEmail,
    };
    await session.save();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}
