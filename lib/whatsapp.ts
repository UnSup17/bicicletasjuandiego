// ============================================================
//  lib/whatsapp.ts — Helper de generación de mensaje WhatsApp
// ============================================================

import type { CartItem } from '@/types';

const STORE_INFO = {
  name:    'Bicicletas Juan Diego',
  address: 'Calle 13 # 8-16, Popayán',
  phone:   '573016770045',
} as const;

/**
 * Formatea un precio en COP con separadores de miles.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style:    'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Genera la URL de WhatsApp con el mensaje del pedido codificado.
 *
 * @param cartItems - Ítems del carrito del usuario
 * @param totalPrice - Total calculado del carrito
 * @returns URL completa para abrir WhatsApp con el mensaje pre-llenado
 */
export function generateWhatsAppLink(
  cartItems: CartItem[],
  totalPrice: number
): string {
  if (cartItems.length === 0) {
    throw new Error('El carrito está vacío');
  }

  const lines: string[] = [];

  lines.push('¡Hola! Buen día, estoy interesado en realizar la compra de los siguientes productos en Bicicletas Juan Diego:\n');
  lines.push('🛒 *RESUMEN DE MI PEDIDO:*');

  for (const item of cartItems) {
    const subtotal = item.price * item.quantity;

    // Construir línea de especificaciones seleccionadas
    const specParts: string[] = [];
    if (item.selectedSpecs) {
      for (const [_key, value] of Object.entries(item.selectedSpecs)) {
        if (value) specParts.push(value);
      }
    }
    const specsStr = specParts.length > 0 ? ` | ${specParts.join(' | ')}` : '';
    const refStr   = item.reference ? ` | Ref: ${item.reference}` : '';

    if (item.quantity > 1) {
      lines.push(
        `- ${item.quantity}x ${item.brand} ${item.name}${specsStr}${refStr}\n  *Precio:* ${formatPrice(item.price)} c/u (${formatPrice(subtotal)})`
      );
    } else {
      lines.push(
        `- 1x ${item.brand} ${item.name}${specsStr}${refStr}\n  *Precio:* ${formatPrice(item.price)}`
      );
    }
  }

  lines.push('');
  lines.push(`💰 *TOTAL ESTIMADO:* ${formatPrice(totalPrice)}`);
  lines.push('');
  lines.push(`📍 *Ubicación del Almacén:* ${STORE_INFO.address}`);
  lines.push('¿Tienen disponibilidad para coordinar la entrega/pago?');

  const message     = lines.join('\n');
  const encodedMsg  = encodeURIComponent(message);

  return `https://wa.me/${STORE_INFO.phone}?text=${encodedMsg}`;
}
