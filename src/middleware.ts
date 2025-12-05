import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * MVP Middleware - No Authentication Required
 * 
 * For MVP, ShepGate is open access. Users land directly on the dashboard.
 * This removes friction for non-technical founders to experience the value immediately.
 * 
 * Authentication will be added in v0.2 when we introduce:
 * - Multi-user accounts
 * - Usage-based pricing tiers
 * - Team workspaces
 */
export async function middleware(request: NextRequest) {
  // Redirect /login to dashboard since no auth needed for MVP
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Allow all other requests through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match /login to redirect it
    '/login',
  ],
};
