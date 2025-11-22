// src/app/api/user/route.js
import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/session';

export async function GET(request) {
  const session = await getSession();
  if (session.user) {
    return NextResponse.json(session.user);
  }
  return NextResponse.json(null);
}
