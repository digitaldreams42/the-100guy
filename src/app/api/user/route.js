// src/app/api/user/route.js
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

export async function GET(request) {
  const session = await getIronSession(cookies(), sessionOptions);
  if (session.user) {
    return NextResponse.json(session.user);
  }
  return NextResponse.json(null);
}
