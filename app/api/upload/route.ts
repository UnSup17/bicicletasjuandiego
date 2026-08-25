// ============================================================
//  app/api/upload/route.ts — Route Handler for Local Image Upload
// ============================================================

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron archivos en la solicitud' },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    // Asegurar que la carpeta de destino exista
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generar nombre de archivo único libre de caracteres extraños
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const cleanBaseName = file.name
        .split('.')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      const filename = `${Date.now()}-${cleanBaseName}.${fileExtension}`;
      const filePath = join(uploadDir, filename);

      // Guardar el archivo en public/uploads
      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0], // fallback de retrocompatibilidad
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la subida' },
      { status: 500 }
    );
  }
}
