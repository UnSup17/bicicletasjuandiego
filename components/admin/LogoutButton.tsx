// ============================================================
//  components/admin/LogoutButton.tsx — Sign Out Trigger
// ============================================================

'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function LogoutButton() {
  const handleLogout = async () => {
    toast.info('Cerrando sesión...');
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-cream hover:bg-burgundy hover:text-white font-sans text-xs flex items-center gap-1.5 h-8"
    >
      <LogOut size={13} />
      <span>Salir</span>
    </Button>
  );
}
