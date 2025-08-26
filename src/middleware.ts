import { NextRequest, NextResponse } from 'next/server';
import { dump } from './helper/helper';

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const APP_URL = req.nextUrl.origin ;

  if (pathname === '/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get('__session')?.value;

  const res = await fetch(`${APP_URL}/api/verify?token=${token}`);
  const { user } = await res.json();

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
