import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname === '/admin/login';
  
  // Proteger rutas admin
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin') && !isAuthPage;

  if (isAdminPage && !isLoggedIn) {
    // Redirigir al login si no está autenticado
    const loginUrl = new URL('/admin/login', req.nextUrl);
    // Preservar la url de retorno
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    // Si ya está logueado e ingresa al login, redirigir al dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
  }

  return NextResponse.next();
});

// Configuración de rutas que pasará por el middleware
export const config = {
  matcher: ['/admin/:path*'],
};
