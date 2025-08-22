
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación ni multi-tenancy
  const publicRoutes = [
    '/',
    '/register',
    '/auth/signin',
    '/api/organizations/register',
    '/api/organizations/plans',
    '/api/auth'
  ];

  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Si no hay token, redirigir al login
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Verificar que el usuario tenga organizationId
  if (!token.organizationId) {
    // Redirigir a seleccionar organización o registro
    const selectOrgUrl = new URL('/register', request.url);
    return NextResponse.redirect(selectOrgUrl);
  }

  // Agregar headers con información de la organización para las APIs
  const response = NextResponse.next();
  response.headers.set('x-organization-id', token.organizationId as string);
  response.headers.set('x-user-id', token.sub as string);
  response.headers.set('x-user-role', token.role as string || 'AUXILIAR');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)'
  ]
};
