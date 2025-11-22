// src/app/api/register/route.js
import { adminAuth } from '../../../lib/firebase-admin';
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
  const { email, password, displayName } = await request.json();

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    session.user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      isAdmin: false,
    };
    await session.save();

    return NextResponse.json({ success: true, ...session.user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
