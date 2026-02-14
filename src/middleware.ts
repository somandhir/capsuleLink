import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  //   NextAuth Session (Google)
  const session = await getToken({ req: request });
  
  //   Custom Refresh Token (Credentials)
  const customToken = request.cookies.get("refreshToken")?.value;

  const isPublicPath = path === '/login' || path === '/register' || path === '/verify';

  if (!isPublicPath && !session && !customToken) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
  
  if (isPublicPath && (session || customToken)) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/verify']
};