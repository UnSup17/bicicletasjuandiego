// ============================================================
//  lib/auth.config.ts — NextAuth Edge-Compatible Configuration
// ============================================================

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET || 'tu_secreto_seguro_aqui_minimo_32_caracteres',
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  providers: [], // Agregado vacío; se poblará en auth.ts con Credentials
  callbacks: {},
} satisfies NextAuthConfig;
