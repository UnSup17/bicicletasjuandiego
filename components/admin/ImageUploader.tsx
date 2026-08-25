// ============================================================
//  components/admin/ImageUploader.tsx — Local File Uploader Component
// ============================================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  initialImages: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ initialImages = [], onChange }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir imágenes');
      }

      const data = await response.json();
      const newUrls = [...images, ...data.urls];
      setImages(newUrls);
      onChange(newUrls);
      toast.success('Imágenes subidas con éxito.');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error al subir las imágenes');
    } finally {
      setIsUploading(false);
      // Limpiar input para permitir seleccionar el mismo archivo
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updatedImages);
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-navy font-sans">Galería de Imágenes</label>
        <span className="text-xs text-muted-foreground font-sans">Sube fotos locales del producto</span>
      </div>

      {/* Grid Previews */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-square border border-border bg-white rounded-lg overflow-hidden group shadow-sm"
          >
            <Image
              src={url}
              alt={`Imagen del producto ${index + 1}`}
              fill
              sizes="150px"
              className="object-contain p-2"
            />
            {index === 0 && (
              <span className="absolute bottom-1.5 left-1.5 bg-navy text-cream text-[10px] px-1.5 py-0.5 rounded font-sans uppercase font-semibold">
                Principal
              </span>
            )}
            
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Upload Button Box */}
        <label className="relative aspect-square border-2 border-dashed border-border/80 hover:border-navy/60 bg-[#fcfaf5] hover:bg-muted/30 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <>
              <Loader2 className="animate-spin text-burgundy mb-2" size={24} />
              <span className="text-xs font-sans text-muted-foreground">Subiendo...</span>
            </>
          ) : (
            <>
              <Upload className="text-muted-foreground/80 mb-2 group-hover:text-navy" size={24} />
              <span className="text-xs font-sans text-slate text-center px-2">Subir fotos</span>
            </>
          )}
        </label>
      </div>

      {images.length === 0 && !isUploading && (
        <div className="border border-dashed border-border/60 bg-muted/20 py-8 rounded-lg text-center flex flex-col items-center justify-center">
          <ImageIcon className="text-muted-foreground/30 mb-2" size={32} />
          <p className="text-xs text-muted-foreground font-sans">Ninguna imagen subida aún.</p>
        </div>
      )}
    </div>
  );
}
