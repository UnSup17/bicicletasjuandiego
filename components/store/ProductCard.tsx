// ============================================================
//  components/store/ProductCard.tsx — Minimalist Product Card (Bikehouse Style)
// ============================================================

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/whatsapp';
import type { Product } from '@/types';
import { Eye, ShieldCheck, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export default function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary)?.url || 
                       product.images?.[0]?.url || 
                       '/placeholder-bike.jpg';

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <Card 
      onClick={() => onOpenDetails(product)}
      className="group overflow-hidden border-0 bg-white shadow-none hover:shadow-sm transition-all duration-300 flex flex-col h-full rounded-none cursor-pointer"
    >
      {/* Product Image Area - Solid Muted Background */}
      <div className="relative aspect-square w-full bg-[#f6f6f6] overflow-hidden flex items-center justify-center">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          priority={product.is_featured}
        />
        
        {/* Flat Minimalist Badges */}
        <div className="absolute top-0 left-0 flex flex-col gap-0 z-10">
          {product.is_featured ? (
            <div className="bg-[#f2e811] text-black text-[9px] px-3 py-1 font-sans font-extrabold uppercase tracking-widest">
              Recomendados
            </div>
          ) : null}
          {isOutOfStock ? (
            <div className="bg-black text-white text-[9px] px-3 py-1 font-sans font-extrabold uppercase tracking-widest">
              Agotado
            </div>
          ) : isLowStock ? (
            <div className="bg-red-600 text-white text-[9px] px-3 py-1 font-sans font-extrabold uppercase tracking-widest animate-pulse">
              Últimas {product.stock} u.
            </div>
          ) : (
            <div className="bg-black text-white text-[9px] px-3 py-1 font-sans font-extrabold uppercase tracking-widest">
              Nuevo
            </div>
          )}
        </div>
      </div>

      {/* Info Area - Typographies matching Bikehouse */}
      <CardContent className="p-4 flex-grow flex flex-col justify-between bg-white">
        <div>
          <span className="text-[9px] font-sans font-bold text-neutral-400 uppercase tracking-widest block mb-1">
            {product.brand || 'Genérico'} · Ref: {product.reference || 'N/A'}
          </span>

          <h3 className="text-sm font-extrabold text-black uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-neutral-700 transition-colors duration-200">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 border border-neutral-200">
              {product.category?.name || 'Producto'}
            </span>
            {product.specifications?.some(s => s.spec_key === 'garantia') && (
              <span className="text-[9px] text-emerald-600 font-sans font-semibold uppercase tracking-wider flex items-center gap-0.5">
                Garantía oficial
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400 font-sans uppercase tracking-widest">Precio</span>
          <span className="text-lg font-black text-black font-sans tracking-tighter">
            {formatPrice(product.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 bg-white">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="w-full bg-black text-white hover:bg-neutral-800 transition-all duration-300 font-sans font-extrabold uppercase tracking-widest text-[10px] py-3.5 rounded-none border border-black flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={13} />
          {isOutOfStock ? 'Ver Detalle' : 'Comprar Ahora'}
        </Button>
      </CardFooter>
    </Card>
  );
}
