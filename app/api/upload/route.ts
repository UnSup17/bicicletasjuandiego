// ============================================================
//  app/api/upload/route.ts — Route Handler for Image Upload (Vercel Blob / Local)
// ============================================================

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';

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

    const isVercelBlobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;
    const uploadedUrls: string[] = [];

    if (isVercelBlobEnabled) {
      // Subida usando Vercel Blob (producción en Vercel)
      for (const file of files) {
        // Generar nombre de archivo limpio
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const cleanBaseName = file.name
          .split('.')[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');
        const filename = `${Date.now()}-${cleanBaseName}.${fileExtension}`;

        const blob = await put(filename, file, {
          access: 'public',
        });
        uploadedUrls.push(blob.url);
      }
    } else {
      // Si estamos en Vercel o en producción, no podemos usar el sistema de archivos local.
      // Retornamos un error descriptivo en lugar de fallar con EROFS (Read-only file system).
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'La subida de imágenes no está configurada en producción. Por favor, conecta Vercel Blob en el panel de tu proyecto de Vercel (se requiere BLOB_READ_WRITE_TOKEN).' },
          { status: 400 }
        );
      }

      // Caída al sistema de archivos local (desarrollo local)
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = file.name.split('.').pop() || 'jpg';
        const cleanBaseName = file.name
          .split('.')[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');
        const filename = `${Date.now()}-${cleanBaseName}.${fileExtension}`;
        const filePath = join(uploadDir, filename);

        await writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/${filename}`);
      }
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

