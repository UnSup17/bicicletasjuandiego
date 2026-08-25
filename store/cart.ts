// ============================================================
//  store/cart.ts — Zustand Cart Store with LocalStorage Persistence
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product, CartValidationResult } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedSpecs?: Record<string, string>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  validateCart: () => Promise<CartValidationResult>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity, selectedSpecs) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) =>
            item.productId === product.id &&
            JSON.stringify(item.selectedSpecs) === JSON.stringify(selectedSpecs)
        );

        const primaryImage = product.images?.find((img) => img.is_primary)?.url || 
                             product.images?.[0]?.url || 
                             '/placeholder-bike.jpg';

        if (existingItemIndex > -1) {
          const updatedItems = [...items];
          const newQty = updatedItems[existingItemIndex].quantity + quantity;
          // Restringir al stock disponible
          updatedItems[existingItemIndex].quantity = Math.min(newQty, product.stock);
          set({ items: updatedItems });
        } else {
          const newItem: CartItem = {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            reference: product.reference,
            price: Number(product.price),
            quantity: Math.min(quantity, product.stock),
            stock: product.stock,
            imageUrl: primaryImage,
            selectedSpecs,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        set({
          items: get().items.map((item) => {
            if (item.productId === productId) {
              return { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      validateCart: async () => {
        const items = get().items;
        if (items.length === 0) {
          return { isValid: true, items: [] };
        }

        try {
          const response = await fetch('/api/cart/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: items.map((item) => ({
                productId: item.productId,
                requestedQuantity: item.quantity,
              })),
            }),
          });

          if (!response.ok) {
            throw new Error('Error al validar el carrito');
          }

          const result: CartValidationResult = await response.json();

          // Sincronizar el estado local con el stock disponible de la base de datos
          const updatedItems = items
            .map((item) => {
              const validatedItem = result.items.find((vi) => vi.productId === item.productId);
              if (!validatedItem) return item;

              return {
                ...item,
                stock: validatedItem.availableStock,
                quantity: Math.min(item.quantity, validatedItem.availableStock),
              };
            })
            .filter((item) => item.stock > 0); // Remover agotados completamente

          set({ items: updatedItems });

          return {
            isValid: result.isValid,
            items: result.items,
          };
        } catch (error) {
          console.error('Error validating cart:', error);
          // Si la llamada falla, asumimos que no se puede re-validar pero no vaciamos
          return {
            isValid: false,
            items: items.map((item) => ({
              productId: item.productId,
              requestedQuantity: item.quantity,
              availableStock: item.stock,
              isAvailable: true,
            })),
          };
        }
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'bjd-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
