// ============================================================
//  components/store/ProductModal.tsx — Product Detail with Live Stock Verification
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/whatsapp';
import type { Product } from '@/types';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liveStock, setLiveStock] = useState<number | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Reiniciar estado cuando cambia el producto
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setLiveStock(product.stock); // Usar stock local inicial
      
      // Consultar stock en tiempo real desde la BD
      fetchLiveStock(product.id);
    }
  }, [product]);

  const fetchLiveStock = async (productId: number) => {
    setIsLoadingStock(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data: Product = await res.json();
        setLiveStock(data.stock);
        // Si el stock actual es menor a la cantidad seleccionada, ajustar
        if (data.stock < quantity) {
          setQuantity(data.stock > 0 ? 1 : 0);
        }
      }
    } catch (err) {
      console.error('Error fetching live stock:', err);
    } finally {
      setIsLoadingStock(false);
    }
  };

  if (!product) return null;

  const images = product.images && product.images.length > 0 
    ? product.images.map((img) => img.url) 
    : ['/placeholder-bike.jpg'];

  const currentStock = liveStock !== null ? liveStock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 3;

  const handleIncrement = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    // Agrupar especificaciones relevantes para el checkout
    const specsRecord: Record<string, string> = {};
    product.specifications?.forEach((spec) => {
      // Filtrar y guardar solo specs críticas como talla, rin, color
      if (['talla', 'talla_marco', 'rin', 'color', 'material'].includes(spec.spec_key)) {
        specsRecord[spec.spec_key] = spec.spec_value;
      }
    });

    addItem(product, quantity, specsRecord);
    toast.success(`${product.name} añadido al carrito con éxito.`, {
      description: `${quantity} unidad(es) de ${product.brand}`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 text-black rounded-none p-6 md:p-8 outline-none">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-2">
          
          {/* Col 1: Galería de Fotos (6/12 cols) */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-neutral-50 border border-neutral-200 rounded-none overflow-hidden flex items-center justify-center">
              <Image
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-6"
                priority
              />
              
              {/* Overlay de Carga */}
              {isLoadingStock && (
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-1.5 border border-neutral-200 text-neutral-500 flex items-center gap-1.5 text-xs font-sans">
                  <Loader2 className="animate-spin" size={12} />
                  Verificando stock...
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 bg-neutral-50 border rounded-none overflow-hidden flex-shrink-0 transition-all ${
                      idx === activeImageIndex 
                        ? 'border-black ring-1 ring-black' 
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx}`}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Info & Compra (6/12 cols) */}
          <div className="md:col-span-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-sans text-neutral-500 uppercase tracking-widest block font-bold">
                  {product.brand} · Ref: {product.reference || 'N/A'}
                </span>
                <h2 className="text-2xl md:text-3xl font-black font-heading text-black mt-1 tracking-tight uppercase">
                  {product.name}
                </h2>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-neutral-100 font-sans text-xs border-neutral-200 rounded-none text-black">
                    {product.category?.name}
                  </Badge>
                  
                  {isOutOfStock ? (
                    <Badge className="bg-neutral-500 text-white text-xs font-sans rounded-none flex items-center gap-1">
                      <AlertTriangle size={12} /> Agotado
                    </Badge>
                  ) : isLowStock ? (
                    <Badge className="bg-amber-600 text-white text-xs font-sans rounded-none flex items-center gap-1">
                      <AlertTriangle size={12} /> Pocas unidades ({currentStock})
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-600 text-white text-xs font-sans rounded-none flex items-center gap-1">
                      <CheckCircle size={12} /> Disponible ({currentStock})
                    </Badge>
                  )}
                </div>
              </div>

              {/* Precio */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-none p-4">
                <span className="text-xs text-neutral-500 font-sans uppercase font-bold">Precio de Venta</span>
                <div className="text-3xl font-black text-black font-sans tracking-tight mt-0.5">
                  {formatPrice(product.price)}
                  <span className="text-sm font-medium text-neutral-500 ml-1.5 uppercase font-sans">COP</span>
                </div>
              </div>

              {/* Ficha técnica estructurada */}
              <div>
                <h4 className="text-xs font-bold font-sans text-black uppercase tracking-wider mb-2">
                  Ficha Técnica
                </h4>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm bg-white border border-neutral-200 rounded-none p-4">
                  <div className="flex flex-col border-b border-neutral-100 pb-1.5">
                    <span className="text-xs text-neutral-500 font-sans">Marca</span>
                    <span className="font-bold font-sans text-black">{product.brand || 'Genérico'}</span>
                  </div>
                  <div className="flex flex-col border-b border-neutral-100 pb-1.5">
                    <span className="text-xs text-neutral-500 font-sans">Referencia</span>
                    <span className="font-bold font-sans text-black">{product.reference || 'N/A'}</span>
                  </div>
                  
                  {product.specifications && product.specifications.length > 0 ? (
                    product.specifications.map((spec) => (
                      <div key={spec.id} className="flex flex-col border-b border-neutral-100 pb-1.5">
                        <span className="text-xs text-neutral-500 font-sans">{spec.spec_label}</span>
                        <span className="font-bold font-sans text-black">{spec.spec_value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-neutral-500 italic font-sans">
                      No hay especificaciones técnicas detalladas.
                    </div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              {product.description && (
                <div>
                  <h4 className="text-xs font-bold font-sans text-black uppercase tracking-wider mb-1">
                    Descripción
                  </h4>
                  <p className="text-sm text-neutral-600 font-sans leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Compra / Acciones */}
            <div className="mt-8 pt-4 border-t border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-sans text-black uppercase tracking-wider">Cantidad:</span>
                
                <div className="flex items-center border border-neutral-200 bg-neutral-50 rounded-none">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="h-9 w-9 text-black hover:bg-neutral-200 rounded-none"
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-10 text-center font-sans font-bold text-black text-sm">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="h-9 w-9 text-black hover:bg-neutral-200 rounded-none"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-grow bg-black text-white hover:bg-accent hover:text-white transition-all duration-300 font-sans font-black uppercase tracking-wider py-6 rounded-none border border-black flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  {isOutOfStock ? 'Producto Agotado' : 'Añadir al Carrito'}
                </Button>
              </div>

              {product.specifications?.some((s) => s.spec_key === 'garantia') && (
                <div className="flex items-center gap-1.5 justify-center text-xs text-emerald-600 font-sans font-semibold mt-2">
                  <ShieldCheck size={14} />
                  Este producto cuenta con respaldo y garantía directa en el almacén
                </div>
              )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
