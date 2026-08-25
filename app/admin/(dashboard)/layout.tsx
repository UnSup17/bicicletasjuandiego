// ============================================================
//  app/(admin)/layout.tsx — Admin Protected Layout Shell
// ============================================================

import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LogoutButton from '@/components/admin/LogoutButton';
import { Bike, LayoutDashboard, Package, Tag, ArrowUpRight } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirección de seguridad secundaria (middleware es el principal)
  if (!session || !session.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white text-black border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Bicicletas Juan Diego" 
              className="h-8 w-auto object-contain"
            />
            <div className="flex flex-col justify-center border-l border-neutral-200 pl-3">
              <span className="text-[10px] font-black font-heading tracking-widest text-black uppercase block leading-none">
                Bicicletas
              </span>
              <span className="text-[9px] font-black font-heading tracking-widest text-accent uppercase block leading-none mt-1">
                Juan Diego
              </span>
            </div>
            <span className="bg-black text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ml-2 font-sans">
              Staff
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 font-sans text-xs font-black uppercase tracking-wider text-neutral-700 hover:text-black hover:bg-neutral-100 transition-all border border-transparent"
            >
              <LayoutDashboard size={13} />
              Dashboard
            </Link>
            <Link
              href="/admin/productos"
              className="flex items-center gap-1.5 px-4 py-2 font-sans text-xs font-black uppercase tracking-wider text-neutral-700 hover:text-black hover:bg-neutral-100 transition-all border border-transparent"
            >
              <Package size={13} />
              Productos
            </Link>
            <Link
              href="/admin/categorias"
              className="flex items-center gap-1.5 px-4 py-2 font-sans text-xs font-black uppercase tracking-wider text-neutral-700 hover:text-black hover:bg-neutral-100 transition-all border border-transparent"
            >
              <Tag size={13} />
              Categorías
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 px-4 py-2 font-sans text-xs font-black uppercase tracking-wider text-neutral-500 hover:text-black hover:bg-neutral-50 transition-all border border-transparent"
            >
              Ver Tienda
              <ArrowUpRight size={11} />
            </Link>
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-black leading-none font-sans">
                {session.user.name || 'Administrador'}
              </p>
              <p className="text-[10px] text-neutral-500 font-sans mt-1 leading-none">
                {session.user.email}
              </p>
            </div>
            
            <LogoutButton />
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-neutral-200 bg-white py-2.5 px-4 flex items-center justify-around text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-700">
          <Link
            href="/admin/dashboard"
            className="flex flex-col items-center gap-1 hover:text-black"
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/productos"
            className="flex flex-col items-center gap-1 hover:text-black"
          >
            <Package size={14} />
            <span>Productos</span>
          </Link>
          <Link
            href="/admin/categorias"
            className="flex flex-col items-center gap-1 hover:text-black"
          >
            <Tag size={14} />
            <span>Categorías</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-grow w-full">
        {children}
      </main>

    </div>
  );
}
