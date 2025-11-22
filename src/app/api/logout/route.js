// src/app/api/logout/route.js
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
  session.destroy();
  return NextResponse.json({ success: true });
}
