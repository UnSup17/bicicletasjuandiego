// ============================================================
//  app/(admin)/categorias/page.tsx — Categories Management Panel
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Category } from '@/types';
import { Tag, Plus, Loader2, RefreshCw, FolderClosed } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('tag');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories?admin=true');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Error al cargar la lista de categorías.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-generar slug
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          icon,
          sort_order: sortOrder,
          is_active: isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Categoría "${name}" creada con éxito.`);
        // Reset form
        setName('');
        setSlug('');
        setDescription('');
        setIcon('tag');
        setSortOrder(0);
        setIsActive(true);
        // Reload list
        await loadCategories();
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Error al guardar la categoría');
      }
    } catch (error: any) {
      console.error('Submit category error:', error);
      toast.error(error.message || 'Error al crear la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-navy">Gestión de Categorías</h2>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Define las categorías principales de productos y asocia sus íconos de catálogo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Col 1: Categories List Table (7/12 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b border-border/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider font-sans">
              Categorías Registradas
            </h3>
            <Button variant="ghost" size="icon" onClick={loadCategories} className="h-8 w-8 text-navy">
              <RefreshCw size={14} />
            </Button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center font-sans text-muted-foreground flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy mb-3"></div>
              Cargando categorías...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center font-sans text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <FolderClosed size={36} className="text-muted-foreground/30" />
              <p className="font-semibold text-navy">Sin categorías</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-sans font-semibold text-navy">Nombre</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Slug</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Ícono</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Orden</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-sans font-medium text-navy text-sm">
                      {cat.name}
                      {cat.description && (
                        <span className="text-[10px] text-muted-foreground block font-normal">
                          {cat.description}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-sans text-xs font-mono">{cat.slug}</TableCell>
                    <TableCell className="font-sans text-xs font-mono">{cat.icon}</TableCell>
                    <TableCell className="font-sans text-xs">{cat.sort_order}</TableCell>
                    <TableCell className="font-sans">
                      {cat.is_active ? (
                        <Badge className="bg-emerald-600 text-white font-sans text-xs">Activo</Badge>
                      ) : (
                        <Badge className="bg-slate text-white font-sans text-xs">Inactivo</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Col 2: Create Category Form (5/12 cols) */}
        <div className="lg:col-span-5">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-heading text-navy">
                Crear Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name" className="font-semibold text-navy text-xs">Nombre *</Label>
                  <Input
                    id="cat-name"
                    required
                    placeholder="Ej: Cascos, Jerseys..."
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="bg-white border-border"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <Label htmlFor="cat-slug" className="font-semibold text-navy text-xs">Slug (Único) *</Label>
                  <Input
                    id="cat-slug"
                    required
                    placeholder="ej-cascos-ruta"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-white border-border font-mono text-xs"
                  />
                </div>

                {/* Icon */}
                <div className="space-y-1.5">
                  <Label htmlFor="cat-icon" className="font-semibold text-navy text-xs">Ícono (Lucide Name)</Label>
                  <Input
                    id="cat-icon"
                    placeholder="bike, shirt, settings, tag..."
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="bg-white border-border font-mono text-xs"
                  />
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <Label htmlFor="cat-order" className="font-semibold text-navy text-xs">Orden de Clasificación</Label>
                  <Input
                    id="cat-order"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="bg-white border-border"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="cat-desc" className="font-semibold text-navy text-xs">Descripción</Label>
                  <Textarea
                    id="cat-desc"
                    placeholder="Breve descripción comercial..."
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white border-border"
                  />
                </div>

                {/* Is Active Switch */}
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="cat-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="cat-active" className="cursor-pointer text-navy font-semibold text-xs">
                    Categoría Activa (Visible en filtros)
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy text-cream hover:bg-burgundy hover:text-white transition-all duration-300 py-5 font-semibold rounded-md shadow flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Agregar Categoría
                    </>
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
