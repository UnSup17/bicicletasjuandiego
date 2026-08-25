// ============================================================
//  app/(admin)/productos/page.tsx — Admin Product Catalog CRUD
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StockBadge from '@/components/admin/StockBadge';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/whatsapp';
import type { Product, Category } from '@/types';
import { Plus, Edit, Trash2, Search, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?admin=true'),
          fetch('/api/categories?admin=true'),
        ]);

        if (prodRes.ok && catRes.ok) {
          const prods = await prodRes.json();
          const cats = await catRes.json();
          setProducts(prods);
          setCategories(cats);
        }
      } catch (err) {
        console.error('Error loading admin products:', err);
        toast.error('Error al cargar datos del inventario.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        toast.success(`Producto "${productName}" eliminado con éxito.`);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Delete product error:', error);
      toast.error(error.message || 'Error al eliminar el producto.');
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.brand.toLowerCase().includes(search.toLowerCase()) ||
      (prod.reference && prod.reference.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || String(prod.category_id) === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-navy">Gestión de Inventario</h2>
          <p className="text-sm font-sans text-muted-foreground mt-1">
            Crea, edita, elimina productos y controla el stock disponible.
          </p>
        </div>

        <Link href="/admin/productos/nuevo">
          <Button className="bg-navy hover:bg-burgundy text-cream hover:text-white font-sans font-semibold flex items-center gap-2">
            <Plus size={16} />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Filters Box */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card border border-border p-4 rounded-lg shadow-sm">
        
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, marca o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-border text-sm font-sans"
          />
        </div>

        {/* Category Select */}
        <div className="w-full sm:w-60">
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'all')}>
            <SelectTrigger className="bg-white border-border font-sans">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent className="bg-white text-navy font-sans">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Display */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center font-sans text-muted-foreground flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mb-4"></div>
            Cargando inventario de productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center font-sans text-muted-foreground flex flex-col items-center justify-center space-y-3">
            <Package size={40} className="text-muted-foreground/30" />
            <div>
              <p className="font-semibold text-navy">Sin productos registrados</p>
              <p className="text-xs">Usa el botón superior para ingresar tu primer artículo.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-sans font-semibold text-navy">Producto</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Categoría</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Precio de Venta</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Stock Actual</TableHead>
                  <TableHead className="font-sans font-semibold text-navy">Estado</TableHead>
                  <TableHead className="font-sans font-semibold text-navy text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((prod) => (
                  <TableRow key={prod.id} className="border-border hover:bg-muted/30">
                    
                    {/* Producto Info */}
                    <TableCell className="font-sans">
                      <div className="space-y-0.5">
                        <span className="font-bold text-navy text-sm block">
                          {prod.name}
                        </span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{prod.brand}</span>
                          {prod.reference && <span>· Ref: {prod.reference}</span>}
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Categoría */}
                    <TableCell className="font-sans">
                      <Badge variant="outline" className="bg-muted/40 border-border text-xs text-navy">
                        {prod.category?.name || 'N/A'}
                      </Badge>
                    </TableCell>

                    {/* Precio */}
                    <TableCell className="font-sans text-sm font-semibold text-navy">
                      {formatPrice(prod.price)}
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="font-sans">
                      <StockBadge stock={prod.stock} />
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="font-sans">
                      {prod.is_active ? (
                        <Badge className="bg-emerald-600 text-white font-sans text-xs">Activo</Badge>
                      ) : (
                        <Badge className="bg-slate text-white font-sans text-xs">Inactivo</Badge>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="font-sans text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/admin/productos/${prod.id}/editar`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-navy hover:bg-muted">
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-transparent"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
