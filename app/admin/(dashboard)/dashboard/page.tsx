// ============================================================
//  app/(admin)/dashboard/page.tsx — Metrics & Activity Dashboard
// ============================================================

import React from 'react';
import { queryOne, query } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Tag, 
  AlertTriangle, 
  TrendingUp, 
  Wrench, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
  lowStock: number;
}

interface StockLogActivity {
  id: number;
  product_id: number;
  product_name: string;
  product_brand: string;
  admin_name: string | null;
  previous_stock: number;
  new_stock: number;
  change_delta: number;
  reason: string | null;
  created_at: Date;
}

export default async function AdminDashboardPage() {
  // Consultar estadísticas directamente desde la BD en el servidor
  const productsCountRes = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products');
  const categoriesCountRes = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  const outOfStockRes = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products WHERE stock <= 0');
  const lowStockRes = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= 3');

  const stats: DashboardStats = {
    totalProducts: productsCountRes?.count || 0,
    totalCategories: categoriesCountRes?.count || 0,
    outOfStock: outOfStockRes?.count || 0,
    lowStock: lowStockRes?.count || 0,
  };

  // Consultar últimos movimientos de inventario
  const recentActivities = await query<StockLogActivity>(`
    SELECT sl.*, p.name as product_name, p.brand as product_brand, u.name as admin_name 
    FROM stock_logs sl
    INNER JOIN products p ON sl.product_id = p.id
    LEFT JOIN admin_users u ON sl.admin_user_id = u.id
    ORDER BY sl.created_at DESC
    LIMIT 5
  `);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-heading text-navy">Resumen Administrativo</h2>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Métricas clave del taller y control del inventario actual en tiempo real.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Productos */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold font-sans text-navy uppercase tracking-wider">
              Productos Totales
            </CardTitle>
            <Package className="text-navy" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans text-navy">{stats.totalProducts}</div>
            <Link 
              href="/admin/productos" 
              className="text-xs text-burgundy hover:underline flex items-center gap-1 font-sans mt-2"
            >
              Gestionar catálogo
              <ArrowRight size={10} />
            </Link>
          </CardContent>
        </Card>

        {/* Categorías */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold font-sans text-navy uppercase tracking-wider">
              Categorías
            </CardTitle>
            <Tag className="text-navy" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans text-navy">{stats.totalCategories}</div>
            <Link 
              href="/admin/categorias" 
              className="text-xs text-burgundy hover:underline flex items-center gap-1 font-sans mt-2"
            >
              Gestionar categorías
              <ArrowRight size={10} />
            </Link>
          </CardContent>
        </Card>

        {/* Sin Stock */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold font-sans text-navy uppercase tracking-wider">
              Agotados
            </CardTitle>
            <AlertTriangle className="text-red-600" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans text-red-600">{stats.outOfStock}</div>
            <p className="text-[10px] text-muted-foreground font-sans mt-2">
              Invisibles o con badge agotado en catálogo.
            </p>
          </CardContent>
        </Card>

        {/* Bajo Stock */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold font-sans text-navy uppercase tracking-wider">
              Stock Bajo
            </CardTitle>
            <TrendingUp className="text-amber-600" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans text-amber-600">{stats.lowStock}</div>
            <p className="text-[10px] text-muted-foreground font-sans mt-2">
              Con menos de 3 unidades disponibles.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Col 1: Historial de Stock Reciente (8/12 cols) */}
        <div className="lg:col-span-8">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-heading text-navy">
                Movimientos Recientes de Inventario
              </CardTitle>
              <CardDescription className="text-xs font-sans text-muted-foreground">
                Últimos 5 cambios en cantidades de productos y registros de auditoría.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground font-sans italic">
                  Aún no se registran movimientos de stock.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-sans font-semibold text-navy">Producto</TableHead>
                      <TableHead className="font-sans font-semibold text-navy">Historial</TableHead>
                      <TableHead className="font-sans font-semibold text-navy">Cambio</TableHead>
                      <TableHead className="font-sans font-semibold text-navy">Autor</TableHead>
                      <TableHead className="font-sans font-semibold text-navy">Motivo / Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivities.map((act) => {
                      const isAddition = act.new_stock > act.previous_stock;
                      return (
                        <TableRow key={act.id} className="border-border hover:bg-muted/30">
                          <TableCell className="font-sans">
                            <p className="font-medium text-navy text-xs">{act.product_brand} {act.product_name}</p>
                          </TableCell>
                          <TableCell className="font-sans text-xs">
                            {act.previous_stock} &rarr; {act.new_stock}
                          </TableCell>
                          <TableCell className="font-sans">
                            <Badge 
                              className={`text-[10px] font-sans rounded-full ${
                                isAddition 
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-600/90' 
                                  : 'bg-red-600 text-white hover:bg-red-600/90'
                              }`}
                            >
                              {isAddition ? `+${act.new_stock - act.previous_stock}` : act.new_stock - act.previous_stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-sans text-xs">
                            {act.admin_name || 'Sistema'}
                          </TableCell>
                          <TableCell className="font-sans">
                            <p className="text-[11px] text-slate font-sans leading-none">{act.reason || 'N/A'}</p>
                            <span className="text-[9px] text-muted-foreground font-sans mt-1 block">
                              {new Date(act.created_at).toLocaleString('es-CO')}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Col 2: Info de Negocio (4/12 cols) */}
        <div className="lg:col-span-4">
          <Card className="border-border bg-card shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-heading text-navy">
                Info del Negocio
              </CardTitle>
              <CardDescription className="text-xs font-sans text-muted-foreground">
                Información de contacto oficial de la tienda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm font-sans">
              <div className="flex flex-col border-b border-border/40 pb-3">
                <span className="text-[11px] text-muted-foreground uppercase">Nombre de Almacén</span>
                <span className="font-semibold text-navy">Bicicletas Juan Diego</span>
              </div>
              <div className="flex flex-col border-b border-border/40 pb-3">
                <span className="text-[11px] text-muted-foreground uppercase">Dirección Física</span>
                <span className="font-semibold text-navy">Calle 13 # 8-16, Popayán</span>
              </div>
              <div className="flex flex-col border-b border-border/40 pb-3">
                <span className="text-[11px] text-muted-foreground uppercase">Número WhatsApp</span>
                <span className="font-semibold text-navy">+57 301 6770045</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-3 flex gap-2 items-start text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="flex-shrink-0 mt-0.5" size={14} />
                <p>
                  El sistema valida inventario de forma síncrona al enviar pedidos para evitar errores de ventas sobre-vendidas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
