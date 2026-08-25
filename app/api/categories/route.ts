// ============================================================
//  app/api/categories/route.ts — Route Handler for Categories
// ============================================================

import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { auth } from '@/lib/auth';
import type { Category } from '@/types';

// Obtener todas las categorías
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';

    // Si es admin, mostrar todas. Si no, solo las activas
    const sql = admin
      ? 'SELECT * FROM categories ORDER BY sort_order ASC, name ASC'
      : 'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC';

    const categories = await query<Category>(sql);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    );
  }
}

// Crear una categoría (Admin protegido)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, icon, sort_order, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'El nombre y slug son obligatorios' },
        { status: 400 }
      );
    }

    // Insertar en la BD
    const result = await execute(
      `INSERT INTO categories (name, slug, description, icon, sort_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug.toLowerCase(),
        description || null,
        icon || 'tag',
        Number(sort_order) || 0,
        is_active === undefined ? 1 : (is_active ? 1 : 0),
      ]
    );

    return NextResponse.json({
      success: true,
      categoryId: result.insertId,
      message: 'Categoría creada con éxito',
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este slug' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor al crear categoría' },
      { status: 500 }
    );
  }
}
