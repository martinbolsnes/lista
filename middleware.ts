import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserIdFromToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const userId = await getUserIdFromToken(request);

  const protectedRoutes = ['/dashboard', '/list'];

  if (!userId && protectedRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/list/:path*'],
};
