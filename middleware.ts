import { auth } from '@/lib/auth';
import { can, type Permission } from '@/lib/permissions';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route permissions
const routePermissions: Record<string, string[]> = {
  '/dashboard/users': ['manage_users'],
  '/dashboard/roles': ['manage_roles'],
  '/dashboard/branches': ['manage_branches'],
  '/dashboard/products': ['manage_products'],
  '/dashboard/categories': ['manage_categories'],
  '/dashboard/inventory': ['view_inventory'],
  '/dashboard/orders': ['process_orders'],
  '/dashboard/reports': ['view_sales_reports'],
  '/dashboard/alerts': ['dismiss_expiry_alerts'],
};

// Routes that require authentication but no specific permission
const protectedRoutes = ['/dashboard'];

// Public routes
const publicRoutes = ['/auth/login', '/auth/error'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();

  // Redirect to login if not authenticated and trying to access protected routes
  if (!session?.user) {
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const userRole = session.user.role;

  // Check route-specific permissions
  for (const [route, requiredPermissions] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      const hasPermission = requiredPermissions.some(permission =>
        can(userRole, permission as Permission)
      );

      if (!hasPermission) {
        // Redirect to unauthorized page or dashboard
        return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url));
      }
    }
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
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
