// ============================================================
//  components/store/FilterSidebar.tsx — Minimalist Sidebar (Bikehouse Style)
// ============================================================

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Category } from '@/types';
import { Search, RotateCcw, Filter, ChevronRight } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  brands: string[];
  selectedBrand: string | null;
  onSelectBrand: (brand: string | null) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchQueryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  brands,
  selectedBrand,
  onSelectBrand,
  onClear,
}: FilterSidebarProps) {
  
  return (
    <Card className="border border-neutral-200 bg-white shadow-none h-fit sticky top-36 rounded-none">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-neutral-100">
        <CardTitle className="text-xs font-bold font-sans text-black uppercase tracking-widest flex items-center gap-2">
          <Filter size={13} />
          Filtrar Catálogo
        </CardTitle>
        {(selectedCategory || searchQuery || selectedBrand || minPrice > 0 || maxPrice < 5000000) && (
          <Button
            variant="ghost"
            onClick={onClear}
            className="h-auto p-0 text-[10px] font-sans font-black text-accent uppercase tracking-wider hover:text-accent/80 hover:bg-transparent flex items-center gap-1"
          >
            <RotateCcw size={10} />
            Limpiar
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-sans text-black uppercase tracking-wider block">
            Buscador
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar por marca, ref..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-9 bg-white border-neutral-300 focus-visible:ring-black text-xs font-sans rounded-none"
            />
          </div>
        </div>

        <Separator className="bg-neutral-100" />

        {/* Categories List */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-sans text-black uppercase tracking-wider block mb-2">
            Categorías
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => onSelectCategory(null)}
              className={`flex items-center justify-between w-full py-1 text-xs font-sans text-left transition-all ${
                selectedCategory === null
                  ? 'border-l-2 border-black pl-2.5 font-black text-black'
                  : 'text-neutral-600 border-l-2 border-transparent hover:border-neutral-300 hover:text-black pl-2.5'
              }`}
            >
              <span>TODOS LOS PRODUCTOS</span>
              <ChevronRight size={10} className="opacity-60" />
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center justify-between w-full py-1 text-xs font-sans text-left transition-all ${
                  selectedCategory === cat.slug
                    ? 'border-l-2 border-black pl-2.5 font-black text-black'
                    : 'text-neutral-600 border-l-2 border-transparent hover:border-neutral-300 hover:text-black pl-2.5'
                }`}
              >
                <span className="uppercase">{cat.name}</span>
                <ChevronRight size={10} className="opacity-60" />
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-neutral-100" />

        {/* Brands List */}
        {brands.length > 0 && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold font-sans text-black uppercase tracking-wider block mb-2">
              Marcas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((brand) => {
                const isSelected = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => onSelectBrand(isSelected ? null : brand)}
                    className={`font-sans font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-none border transition-all ${
                      isSelected 
                        ? 'bg-black text-white border-black' 
                        : 'border-neutral-300 text-neutral-700 bg-white hover:border-black hover:text-black'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Separator className="bg-neutral-100" />

        {/* Price Filter Inputs */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold font-sans text-black uppercase tracking-wider">
            Rango de Precios (COP)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[9px] text-neutral-400 uppercase font-sans font-bold">Mínimo</span>
              <Input
                type="number"
                placeholder="Mín"
                value={minPrice || ''}
                onChange={(e) => onPriceChange(Number(e.target.value), maxPrice)}
                className="bg-white border-neutral-300 focus-visible:ring-black text-xs font-sans rounded-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-neutral-400 uppercase font-sans font-bold">Máximo</span>
              <Input
                type="number"
                placeholder="Máx"
                value={maxPrice || ''}
                onChange={(e) => onPriceChange(minPrice, Number(e.target.value))}
                className="bg-white border-neutral-300 focus-visible:ring-black text-xs font-sans rounded-none"
              />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
