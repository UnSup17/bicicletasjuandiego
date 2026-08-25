// ============================================================
//  components/store/CartDrawer.tsx — Interactive Cart Drawer
// ============================================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
// Wait, in shadcn, standard sidebar is `Sheet` from `components/ui/sheet.tsx`. Let's import from `@/components/ui/sheet` to make it a side slide-over! Yes.
import {
  Sheet as ShadcnSheet,
  SheetContent as ShadcnSheetContent,
  SheetHeader as ShadcnSheetHeader,
  SheetTitle as ShadcnSheetTitle,
  SheetFooter as ShadcnSheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart';
import { formatPrice, generateWhatsAppLink } from '@/lib/whatsapp';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  MessageSquare, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, validateCart } = useCartStore();
  const [isValidating, setIsValidating] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsValidating(true);
    toast.info('Verificando disponibilidad de stock en tiempo real...');

    try {
      const validation = await validateCart();

      if (validation.isValid) {
        // Todo en orden, generar link e ir a WhatsApp
        const waLink = generateWhatsAppLink(items, getTotalPrice());
        toast.success('¡Stock verificado! Redirigiendo a WhatsApp...');
        window.open(waLink, '_blank');
        onClose();
      } else {
        // Encontrar los ítems problemáticos
        const outOfStockItems = validation.items.filter(item => !item.isAvailable);
        const errorMessages = outOfStockItems.map(vi => {
          const cartItem = items.find(i => i.productId === vi.productId);
          return `${cartItem?.brand} ${cartItem?.name} (Solicitado: ${vi.requestedQuantity}, Disponible: ${vi.availableStock})`;
        });

        toast.error('Lo sentimos, algunos productos del carrito superan el stock disponible.', {
          description: errorMessages.join('\n'),
          duration: 6000,
        });

        toast.warning('Hemos ajustado tu carrito a las cantidades reales de stock.');
      }
    } catch (error) {
      console.error('Error during checkout validation:', error);
      toast.error('Ocurrió un error al verificar el stock. Intenta de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <ShadcnSheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ShadcnSheetContent className="w-full sm:max-w-md bg-card border-l border-border text-navy flex flex-col h-full p-0">
        <ShadcnSheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-burgundy" size={20} />
            <ShadcnSheetTitle className="text-xl font-bold font-heading text-navy">
              Mi Carrito ({getTotalItems()} unids)
            </ShadcnSheetTitle>
          </div>
        </ShadcnSheetHeader>

        {/* List of Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <ShoppingCart size={48} className="text-muted-foreground/40 stroke-[1.5]" />
              <div>
                <p className="font-medium font-sans text-navy">El carrito está vacío</p>
                <p className="text-xs text-muted-foreground font-sans mt-1">
                  Explora nuestros productos y agrega lo que necesites.
                </p>
              </div>
              <Button onClick={onClose} variant="outline" className="font-sans border-border">
                Volver a la tienda
              </Button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="flex gap-4 bg-[#fcfaf5] border border-border/40 p-3 rounded-lg relative overflow-hidden group">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 bg-white border border-border/40 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-heading font-bold text-sm text-navy line-clamp-1">
                        {item.brand} {item.name}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.productId)}
                        className="h-6 w-6 text-muted-foreground hover:text-burgundy hover:bg-transparent -mt-1 -mr-1"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                    
                    {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {Object.entries(item.selectedSpecs).map(([key, value]) => (
                          <span key={key} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.2 rounded font-sans uppercase">
                            {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-sm font-bold font-sans text-navy">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    
                    {/* Controls */}
                    <div className="flex items-center border border-border/80 bg-white rounded">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-6 w-6 text-navy hover:bg-transparent rounded-none"
                      >
                        <Minus size={10} />
                      </Button>
                      <span className="w-6 text-center font-sans font-bold text-xs text-navy">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-6 w-6 text-navy hover:bg-transparent rounded-none"
                      >
                        <Plus size={10} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with checkout */}
        {items.length > 0 && (
          <ShadcnSheetFooter className="p-6 bg-[#fcfaf5] border-t border-border flex flex-col gap-4">
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-muted-foreground font-sans uppercase">
                <span>Items totales:</span>
                <span>{getTotalItems()} unidades</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold font-sans text-navy uppercase">Total Estimado:</span>
                <span className="text-2xl font-extrabold font-sans text-navy">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-md p-2.5 flex items-start gap-2 mt-1">
                <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={13} />
                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-sans leading-normal">
                  Los pedidos se coordinan y finalizan directamente por chat de WhatsApp. Confirmaremos el método de envío y el pago contra entrega.
                </p>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isValidating || items.length === 0}
              className="w-full bg-navy text-cream hover:bg-burgundy hover:text-white transition-all duration-300 py-6 font-sans font-semibold rounded-md shadow-md border border-navy flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Validando Stock...
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  Confirmar Pedido por WhatsApp
                </>
              )}
            </Button>
          </ShadcnSheetFooter>
        )}
      </ShadcnSheetContent>
    </ShadcnSheet>
  );
}
