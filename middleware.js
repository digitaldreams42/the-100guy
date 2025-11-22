import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session/edge';

export async function middleware(req) {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, {
    cookieName: 'gstore-session',
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  });

  const { user } = session;

  if (req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!user || !user.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};