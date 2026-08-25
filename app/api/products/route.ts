// ============================================================
//  app/api/products/route.ts — Route Handler for Products (List/Create)
// ============================================================

import { NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { Product, ProductImage, ProductSpecification } from '@/types';

// Obtener catálogo de productos con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const inStock = searchParams.get('inStock') === 'true';
    const admin = searchParams.get('admin') === 'true';

    const conditions: string[] = [];
    const params: (string | number | boolean)[] = [];

    // Si no es admin, solo mostrar productos activos
    if (!admin) {
      conditions.push('p.is_active = 1');
    }

    if (categorySlug) {
      conditions.push('c.slug = ?');
      params.push(categorySlug);
    }

    if (brand) {
      conditions.push('p.brand = ?');
      params.push(brand);
    }

    if (minPrice) {
      conditions.push('p.price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    if (inStock) {
      conditions.push('p.stock > 0');
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.brand LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.is_featured DESC, p.created_at DESC
    `;

    const products = await query<any>(sql, params);

    if (products.length === 0) {
      return NextResponse.json([]);
    }

    // Obtener imágenes y especificaciones asociadas para todos los productos consultados
    const productIds = products.map((p) => p.id);
    const placeholders = productIds.map(() => '?').join(',');

    const imagesSql = `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY display_order ASC`;
    const specsSql = `SELECT * FROM product_specifications WHERE product_id IN (${placeholders}) ORDER BY display_order ASC`;

    const [images, specs] = await Promise.all([
      query<ProductImage>(imagesSql, productIds),
      query<ProductSpecification>(specsSql, productIds),
    ]);

    // Asociar imágenes y especificaciones a cada producto
    const productsWithRelations: Product[] = products.map((product) => {
      return {
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
        images: images.filter((img) => img.product_id === product.id),
        specifications: specs.filter((spec) => spec.product_id === product.id),
      };
    });

    return NextResponse.json(productsWithRelations);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}

// Crear un nuevo producto (Admin Protegido)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

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

    if (!name || !category_id || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Los campos básicos (nombre, categoría, precio, stock) son obligatorios' },
        { status: 400 }
      );
    }

    // Generar slug
    const timestamp = Date.now();
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
    const slug = `${baseSlug}-${timestamp}`;

    // 1. Insertar el producto
    const productResult = await execute(
      `INSERT INTO products (category_id, name, slug, brand, reference, description, price, stock, is_active, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(category_id),
        name,
        slug,
        brand || '',
        reference || '',
        description || null,
        Number(price),
        Number(stock),
        is_active === undefined ? 1 : (is_active ? 1 : 0),
        is_featured ? 1 : 0,
      ]
    );

    const productId = productResult.insertId;

    // 2. Insertar especificaciones si existen
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

    // 3. Insertar imágenes si existen
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

    // 4. Loggear stock inicial
    const userId = session.user.id ? Number(session.user.id) : null;
    await execute(
      `INSERT INTO stock_logs (product_id, admin_user_id, previous_stock, new_stock, reason) 
       VALUES (?, ?, 0, ?, 'Stock inicial al crear producto')`,
      [productId, userId, Number(stock)]
    );

    return NextResponse.json({
      success: true,
      productId,
      message: 'Producto creado con éxito',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear producto' },
      { status: 500 }
    );
  }
}
