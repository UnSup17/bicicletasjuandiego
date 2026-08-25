// ============================================================
//  app/(admin)/productos/[id]/editar/page.tsx — Edit Product Page
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import type { Product, Category } from '@/types';
import { toast } from 'sonner';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [productId, setProductId] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Desempaquetar params usando React.use() o useEffect
  useEffect(() => {
    params.then((p) => {
      setProductId(Number(p.id));
    });
  }, [params]);

  useEffect(() => {
    if (productId === null) return;

    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch('/api/categories?admin=true'),
        ]);

        if (prodRes.ok && catRes.ok) {
          const prodData = await prodRes.json();
          const catData = await catRes.json();
          setProduct(prodData);
          setCategories(catData);
        } else {
          toast.error('No se pudo encontrar la información requerida.');
        }
      } catch (err) {
        console.error('Error loading edit product data:', err);
        toast.error('Error de red al recuperar datos.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleFormSubmit = async (formData: any) => {
    if (productId === null) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Producto actualizado con éxito.', {
          description: `Se guardaron los cambios en "${formData.name}".`,
        });
        router.push('/admin/productos');
        router.refresh();
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Error al actualizar el producto');
      }
    } catch (error: any) {
      console.error('Submit edit product error:', error);
      toast.error(error.message || 'Error al guardar los cambios del producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold font-heading text-navy">Editar Producto</h2>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Actualiza los campos técnicos, fotos o ajusta el stock actual del producto.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center font-sans text-muted-foreground flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mb-4"></div>
          Cargando detalles del producto...
        </div>
      ) : (
        <ProductForm
          initialData={product}
          categories={categories}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
