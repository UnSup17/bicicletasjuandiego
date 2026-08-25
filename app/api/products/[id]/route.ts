// ============================================================
//  app/api/products/[id]/route.ts — Route Handler for Single Product
// ============================================================

import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { Product, ProductImage, ProductSpecification } from '@/types';

// Obtener un producto por ID o Slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNumericId = /^\d+$/.test(id);

    // Buscar producto
    const productSql = isNumericId
      ? 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p INNER JOIN categories c ON p.category_id = c.id WHERE p.id = ?'
      : 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p INNER JOIN categories c ON p.category_id = c.id WHERE p.slug = ?';

    const product = await queryOne<any>(productSql, [isNumericId ? Number(id) : id]);

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Obtener imágenes y especificaciones
    const imagesSql = 'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC';
    const specsSql = 'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC';

    const [images, specs] = await Promise.all([
      query<ProductImage>(imagesSql, [product.id]),
      query<ProductSpecification>(specsSql, [product.id]),
    ]);

    const productWithRelations: Product = {
      ...product,
      price: Number(product.price),
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug,
        description: null,
        icon: '',
        sort_order: 0,
        is_active: true,
        created_at: '',
        updated_at: '',
      },
      images,
      specifications: specs,
    };

    return NextResponse.json(productWithRelations);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    );
  }
}

// Actualizar un producto (Admin Protegido)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const productId = Number(id);

    const body = await request.json();
    const {
      name,
      category_id,
      brand,
      reference,
      description,
      price,
      stock,
      is_active,
      is_featured,
      specifications, // array de { spec_key, spec_label, spec_value }
      images,         // array de urls de imagen o { url, is_primary }
    } = body;

    // Obtener producto existente para verificar stock
    const existingProduct = await queryOne<{ stock: number }>(
      'SELECT stock FROM products WHERE id = ?',
      [productId]
    );

    if (!existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // 1. Actualizar tabla principal
    await execute(
      `UPDATE products 
       SET category_id = ?, name = ?, brand = ?, reference = ?, description = ?, price = ?, stock = ?, is_active = ?, is_featured = ?
       WHERE id = ?`,
      [
        Number(category_id),
        name,
        brand || '',
        reference || '',
        description || null,
        Number(price),
        Number(stock),
        is_active ? 1 : 0,
        is_featured ? 1 : 0,
        productId,
      ]
    );

    // 2. Registrar cambio de stock si corresponde
    if (existingProduct.stock !== Number(stock)) {
      const userId = session.user.id ? Number(session.user.id) : null;
      await execute(
        `INSERT INTO stock_logs (product_id, admin_user_id, previous_stock, new_stock, reason) 
         VALUES (?, ?, ?, ?, 'Actualización manual desde panel admin')`,
        [productId, userId, existingProduct.stock, Number(stock)]
      );
    }

    // 3. Re-escribir especificaciones
    await execute('DELETE FROM product_specifications WHERE product_id = ?', [productId]);
    if (specifications && Array.isArray(specifications) && specifications.length > 0) {
      for (let i = 0; i < specifications.length; i++) {
        const spec = specifications[i];
        if (spec.spec_key && spec.spec_value) {
          await execute(
            `INSERT INTO product_specifications (product_id, spec_key, spec_label, spec_value, display_order) 
             VALUES (?, ?, ?, ?, ?)`,
            [productId, spec.spec_key, spec.spec_label, spec.spec_value, i]
          );
        }
      }
    }

    // 4. Re-escribir imágenes
    await execute('DELETE FROM product_images WHERE product_id = ?', [productId]);
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imageUrl = typeof img === 'string' ? img : img.url;
        const isPrimary = typeof img === 'string' ? (i === 0 ? 1 : 0) : (img.is_primary ? 1 : 0);

        if (imageUrl) {
          await execute(
            `INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) 
             VALUES (?, ?, ?, ?, ?)`,
            [productId, imageUrl, name, i, isPrimary]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado con éxito',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar producto' },
      { status: 500 }
    );
  }
}

// Eliminar un producto (Admin Protegido)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const productId = Number(id);

    // Eliminar producto (las tablas hijas cascadean por FKs de base de datos)
    const result = await execute('DELETE FROM products WHERE id = ?', [productId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado con éxito',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar producto' },
      { status: 500 }
    );
  }
}
