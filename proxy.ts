import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes
const protectedRoutes = ['/hub'];

export function proxy(req: NextRequest) {
  // Get the cookie named 'auth_token'
  const authToken = req.cookies.get('auth_token')?.value;

  // Check if the requested path is protected
  const isProtected = protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtected) {
    // If no token, redirect to sign-in
    if (!authToken) {
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Otherwise, continue normally
  return NextResponse.next();
}

// Match all routes
export const config = {
  matcher: ['/hub/:path*'],
};
