import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Only protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for token in cookies or headers
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Basic token validation (you might want to verify JWT here)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        // Token expired, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};