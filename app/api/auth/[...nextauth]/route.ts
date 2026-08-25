// ============================================================
//  app/api/auth/[...nextauth]/route.ts — NextAuth Handler
// ============================================================

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
