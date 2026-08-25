// ============================================================
//  lib/auth.ts — Configuración NextAuth.js v5
// ============================================================

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { queryOne } from '@/lib/db';
import type { AdminUser } from '@/types';

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: 'Credenciales',
      credentials: {
        email:    { label: 'Email',      type: 'email'    },
        password: { label: 'Contraseña', type: 'password' },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await queryOne<AdminUser & { password_hash: string }>(
          'SELECT id, email, name, role, is_active, password_hash FROM admin_users WHERE email = ? AND is_active = 1 LIMIT 1',
          [email]
        );

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return null;

        // Actualizar last_login
        await queryOne(
          'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
          [user.id]
        );

        return {
          id:    String(user.id),
          email: user.email,
          name:  user.name,
          role:  user.role,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
