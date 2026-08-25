// ============================================================
//  app/api/cart/validate/route.ts — Route Handler for Stock Validation
// ============================================================

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ValidateRequestBody {
  items: {
    productId: number;
    requestedQuantity: number;
  }[];
}

interface DBProductStock {
  id: number;
  stock: number;
  is_active: number;
}

export async function POST(request: Request) {
  try {
    const body: ValidateRequestBody = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { isValid: true, items: [] },
        { status: 200 }
      );
    }

    const productIds = body.items.map((item) => Number(item.productId));
    
    // Consultar stock y estado de los productos en la base de datos
    const placeholders = productIds.map(() => '?').join(',');
    const sql = `
      SELECT id, stock, is_active 
      FROM products 
      WHERE id IN (${placeholders})
    `;

    const dbProducts = await query<DBProductStock>(sql, productIds);

    const validatedItems = body.items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === Number(item.productId));
      
      const availableStock = dbProduct && dbProduct.is_active === 1 ? dbProduct.stock : 0;
      const isAvailable = availableStock >= item.requestedQuantity && availableStock > 0;

      return {
        productId: item.productId,
        requestedQuantity: item.requestedQuantity,
        availableStock,
        isAvailable,
      };
    });

    const isValid = validatedItems.every((item) => item.isAvailable);

    return NextResponse.json({
      isValid,
      items: validatedItems,
    });
  } catch (error) {
    console.error('Error validating cart stock:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al validar stock.' },
      { status: 500 }
    );
  }
}
