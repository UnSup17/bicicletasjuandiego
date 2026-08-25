// ============================================================
//  components/store/Header.tsx — Storefront Custom Header (Bikehouse Style)
// ============================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Bike, Phone, MapPin, User, Search } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
}

export default function Header({ onOpenCart }: HeaderProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-sm">
      
      {/* Top Banner Info - Solid Black, White Text */}
      <div className="bg-black text-white py-2 px-4 md:px-8 text-center border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans font-bold uppercase tracking-widest gap-2">
          <div className="flex items-center gap-1">
            <MapPin size={10} className="text-accent" />
            <span>Calle 13 # 8-16, Popayán, Cauca</span>
          </div>
          <div>
            <span>ENVÍO GRATIS EN ACCESORIOS CIUDADES PRINCIPALES</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Phone size={10} className="text-accent" />
              <span>WhatsApp: +57 301 6770045</span>
            </div>
            <Link 
              href="/admin/login" 
              className="hover:text-neutral-300 transition-colors flex items-center gap-1 font-bold"
            >
              <User size={10} />
              Ingresar Staff
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation - White Background, Black Elements */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="Bicicletas Juan Diego" 
            className="h-10 w-auto object-contain transition-transform group-hover:scale-[1.03] duration-300"
          />
          <div className="flex flex-col justify-center border-l border-neutral-200 pl-3">
            <span className="text-sm font-black font-heading tracking-tighter leading-none text-black uppercase">
              Bicicletas
            </span>
            <span className="text-[11px] font-black font-heading tracking-tighter leading-none text-accent uppercase mt-0.5">
              Juan Diego
            </span>
          </div>
        </Link>

        {/* Action Buttons: Cart and Search */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onOpenCart}
            className="text-black hover:bg-neutral-100 hover:text-black font-sans font-bold uppercase text-xs px-4 py-2 flex items-center gap-2 relative border border-black rounded-none transition-all duration-300"
          >
            <ShoppingCart size={15} />
            <span>Mi Pedido</span>
            
            {totalItems > 0 ? (
              <span className="bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center shadow border border-black">
                {totalItems}
              </span>
            ) : (
              <span className="bg-neutral-200 text-neutral-600 text-[10px] font-black w-5 h-5 flex items-center justify-center border border-neutral-300">
                0
              </span>
            )}
          </Button>
        </div>

      </div>
    </header>
  );
}
