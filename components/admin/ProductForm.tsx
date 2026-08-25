// ============================================================
//  components/admin/ProductForm.tsx — Dynamic Admin Product Form
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUploader from '@/components/admin/ImageUploader';
import { CATEGORY_SPEC_TEMPLATES } from '@/types';
import type { Product, Category } from '@/types';
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  // Main fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [brand, setBrand] = useState('');
  const [reference, setReference] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Specifications and Images
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<
    { spec_key: string; spec_label: string; spec_value: string }[]
  >([]);

  // Hydrate form on edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategoryId(String(initialData.category_id));
      setBrand(initialData.brand || '');
      setReference(initialData.reference || '');
      setPrice(Number(initialData.price));
      setStock(initialData.stock);
      setDescription(initialData.description || '');
      setIsActive(!!initialData.is_active);
      setIsFeatured(!!initialData.is_featured);
      setImages(initialData.images?.map((img) => img.url) || []);
      setSpecifications(
        initialData.specifications?.map((spec) => ({
          spec_key: spec.spec_key,
          spec_label: spec.spec_label,
          spec_value: spec.spec_value,
        })) || []
      );
    }
  }, [initialData]);

  // Manejar el cambio de categoría para generar especificaciones plantilla por defecto
  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    
    // Si estamos creando un nuevo producto, cargamos la plantilla de specs recomendada
    if (!initialData) {
      const selectedCat = categories.find((c) => c.id === Number(val));
      if (selectedCat) {
        const slug = selectedCat.slug.toLowerCase();
        const template = CATEGORY_SPEC_TEMPLATES[slug] || [];
        
        // Cargar especificaciones vacías basadas en la plantilla
        setSpecifications(
          template.map((item) => ({
            spec_key: item.key,
            spec_label: item.label,
            spec_value: '',
          }))
        );
      }
    }
  };

  // Manejar actualización de valor de una especificación
  const handleSpecValueChange = (index: number, value: string) => {
    const updated = [...specifications];
    updated[index].spec_value = value;
    setSpecifications(updated);
  };

  // Agregar especificación personalizada manual
  const handleAddCustomSpec = () => {
    setSpecifications([
      ...specifications,
      { spec_key: `custom_${Date.now()}`, spec_label: 'Atributo', spec_value: '' },
    ]);
  };

  // Eliminar especificación
  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar requeridos
    if (!name || !categoryId || price === undefined || stock === undefined) {
      return;
    }

    // Filtrar especificaciones vacías
    const cleanSpecs = specifications.filter((s) => s.spec_value.trim() !== '');

    onSubmit({
      name,
      category_id: Number(categoryId),
      brand,
      reference,
      price: Number(price),
      stock: Number(stock),
      description,
      is_active: isActive ? 1 : 0,
      is_featured: isFeatured ? 1 : 0,
      images,
      specifications: cleanSpecs,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-6 md:p-8 rounded-lg shadow-sm">
      
      {/* 2-Column Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="font-semibold text-navy">Nombre del Producto *</Label>
          <Input
            id="name"
            placeholder="Ej: Bicicleta Venzo Talon Rin 29"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border-border font-sans"
          />
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <Label htmlFor="category" className="font-semibold text-navy">Categoría *</Label>
          <Select value={categoryId} onValueChange={(val) => handleCategoryChange(val || '')}>
            <SelectTrigger className="bg-white border-border font-sans">
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent className="bg-white text-navy font-sans">
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand" className="font-semibold text-navy">Marca</Label>
          <Input
            id="brand"
            placeholder="Ej: Venzo, GW, Shimano"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bg-white border-border font-sans"
          />
        </div>

        {/* Reference */}
        <div className="space-y-2">
          <Label htmlFor="reference" className="font-semibold text-navy">Referencia / Código</Label>
          <Input
            id="reference"
            placeholder="Ej: VZ-2026-X"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="bg-white border-border font-sans"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="font-semibold text-navy">Precio de Venta (COP) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="Ej: 2400000"
            required
            min="0"
            value={price || ''}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="bg-white border-border font-sans"
          />
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock" className="font-semibold text-navy">Stock en Inventario *</Label>
          <Input
            id="stock"
            type="number"
            placeholder="Ej: 10"
            required
            min="0"
            value={stock !== undefined ? stock : ''}
            onChange={(e) => setStock(Number(e.target.value))}
            className="bg-white border-border font-sans"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="font-semibold text-navy">Descripción y Detalles Comerciales</Label>
        <Textarea
          id="description"
          placeholder="Escribe características generales del producto, usos recomendados, etc."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white border-border font-sans"
        />
      </div>

      {/* Image Uploader */}
      <ImageUploader initialImages={images} onChange={setImages} />

      {/* Toggles (Active / Featured) */}
      <div className="flex flex-wrap gap-8 border-y border-border/50 py-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is-active" className="cursor-pointer text-navy font-semibold font-sans">
            Producto Activo (Visible en tienda)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is-featured"
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
          />
          <Label htmlFor="is-featured" className="cursor-pointer text-navy font-semibold font-sans">
            Destacar Producto (Aparece primero)
          </Label>
        </div>
      </div>

      {/* Dynamic Specifications Area */}
      {categoryId && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider font-sans">
              Atributos Técnicos Específicos
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomSpec}
              className="h-8 text-xs font-sans border-border"
            >
              <Plus size={12} className="mr-1.5" />
              Atributo Personalizado
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 border border-border/40 p-4 rounded-lg">
            {specifications.map((spec, idx) => (
              <div key={spec.spec_key} className="flex gap-2 items-end">
                <div className="flex-grow space-y-1">
                  <span className="text-xs text-muted-foreground font-sans block">
                    {spec.spec_label}
                  </span>
                  <Input
                    type="text"
                    placeholder="Ej: Aluminio, S, Rin 29..."
                    value={spec.spec_value}
                    onChange={(e) => handleSpecValueChange(idx, e.target.value)}
                    className="bg-white border-border text-xs font-sans h-8"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSpec(idx)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-transparent"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
            {specifications.length === 0 && (
              <div className="col-span-2 text-xs text-muted-foreground italic font-sans py-2">
                Sin atributos técnicos asignados. Agrega uno o completa la categoría.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Submission Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Link href="/admin/productos">
          <Button type="button" variant="outline" className="font-sans border-border">
            <ArrowLeft size={14} className="mr-1.5" />
            Cancelar
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-navy hover:bg-burgundy text-cream hover:text-white font-sans font-semibold px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-1.5" size={14} />
              Guardando...
            </>
          ) : (
            <>
              <Save size={14} className="mr-1.5" />
              Guardar Producto
            </>
          )}
        </Button>
      </div>

    </form>
  );
}
