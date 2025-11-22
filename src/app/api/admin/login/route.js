import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const sessionOptions = {
  cookieName: 'gstore-session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function POST(request) {
  const session = await getIronSession(cookies(), sessionOptions);
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
