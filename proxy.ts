import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    // Token is valid, proceed to the requested route
    return NextResponse.next();
  } catch {
    // Invalid/expired/tampered token → redirect
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
}

// Match all routes
export const config = {
  matcher: ['/hub/:path*', '/hub/create', '/hub/settings'],
};
