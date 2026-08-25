// ============================================================
//  app/(admin)/productos/nuevo/page.tsx — Create Product Page
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import type { Category } from '@/types';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories?admin=true');
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
          setCategories(data);
        } else {
          toast.error('No se pudieron cargar las categorías.');
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        toast.error('Error de red al cargar categorías.');
      } finally {
        setIsLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Producto creado con éxito.', {
          description: `Se registró "${formData.name}" en la base de datos.`,
        });
        router.push('/admin/productos');
        router.refresh();
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Ocurrió un error al crear el producto');
      }
    } catch (error: any) {
      console.error('Submit product error:', error);
      toast.error(error.message || 'Error al guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold font-heading text-navy">Nuevo Producto</h2>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Completa la ficha técnica para publicar el artículo en el catálogo virtual.
        </p>
      </div>

      {isLoadingCategories ? (
        <div className="py-20 text-center font-sans text-muted-foreground flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mb-4"></div>
          Cargando categorías requeridas...
        </div>
      ) : (
        <ProductForm
          categories={categories}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
