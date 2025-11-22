// src/app/api/login/route.js
import { adminAuth } from '../../../lib/firebase-admin';
import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/session';

export async function POST(request) {
  const session = await getSession();
  const { token } = await request.json();

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    session.user = {
      uid,
      email,
      displayName: name,
      isAdmin: false,
    };
    await session.save();

    return NextResponse.json({ success: true, ...session.user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}
