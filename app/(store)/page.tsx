// ============================================================
//  app/(store)/page.tsx — Beautiful Public Storefront Catalog
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/store/Header';
import FilterSidebar from '@/components/store/FilterSidebar';
import ProductCard from '@/components/store/ProductCard';
import ProductModal from '@/components/store/ProductModal';
import CartDrawer from '@/components/store/CartDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product, Category } from '@/types';
import { Bike, Shield, Wrench, PackageOpen, Award, ArrowRight } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Modal / Drawer states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hero Carousel State
  const [activeBanner, setActiveBanner] = useState(0);
  const banners = [
    {
      image: '/banner1.png',
      tag: 'ESTRENA TU BICI SOÑADA',
      title: 'ENCUENTRA LA BICI PERFECTA',
      highlight: 'BICI PERFECTA',
      desc: 'Equipamiento profesional, repuestos de alta gama y asesoría técnica especializada. Garantía oficial de marcas líderes en Popayán.'
    },
    {
      image: '/banner2.png',
      tag: 'SERVICIO TÉCNICO PREMIUM',
      title: 'MANTENIMIENTO ESPECIALIZADO',
      highlight: 'ESPECIALIZADO',
      desc: 'Ajuste de suspensiones, purgado de frenos, mantenimiento general y repuestos originales Shimano y GW con mecánicos expertos.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ]);

        if (categoriesRes.ok && productsRes.ok) {
          const cats: Category[] = await categoriesRes.json();
          const prods: Product[] = await productsRes.json();
          setCategories(cats);
          setProducts(prods);

          // Determinar precio máximo para inicializar filtro
          if (prods.length > 0) {
            const prices = prods.map((p) => p.price);
            const highest = Math.max(...prices);
            setMaxPrice(highest || 5000000);
          }
        }
      } catch (error) {
        console.error('Error loading storefront data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSelectedBrand(null);
    setMinPrice(0);
    const highest = products.length > 0 ? Math.max(...products.map(p => p.price)) : 5000000;
    setMaxPrice(highest);
  };

  // Obtener lista única de marcas activas para los filtros
  const uniqueBrands = Array.from(
    new Set(
      products
        .map((p) => p.brand)
        .filter((brand): brand is string => !!brand && brand.trim() !== '')
    )
  );

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    // Categoría
    if (selectedCategory && product.category?.slug !== selectedCategory) {
      return false;
    }
    // Marca
    if (selectedBrand && product.brand !== selectedBrand) {
      return false;
    }
    // Precio
    if (product.price < minPrice || product.price > maxPrice) {
      return false;
    }
    // Buscador
    if (searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(queryLower);
      const matchBrand = product.brand?.toLowerCase().includes(queryLower);
      const matchRef = product.reference?.toLowerCase().includes(queryLower);
      const matchDesc = product.description?.toLowerCase().includes(queryLower);
      return matchName || matchBrand || matchRef || matchDesc;
    }
    return true;
  });

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-black">
      <Header onOpenCart={() => setIsCartOpen(true)} />

      {/* Hero Section — Minimalist Carousel Banner with Image Overlay (Bikehouse style) */}
      <section className="relative bg-black text-white min-h-[460px] md:min-h-[520px] overflow-hidden flex items-center">
        {/* Banner Images with Crossfade transition */}
        {banners.map((b, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeBanner ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30 md:bg-gradient-to-r md:from-black/95 md:via-black/70 md:to-transparent"></div>
          </div>
        ))}

        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 w-full py-16 md:py-24">
          <div className="max-w-2xl space-y-6 text-left">
            <span className="inline-block bg-[#f2e811] text-black text-[10px] font-black uppercase tracking-widest px-3.5 py-1">
              {banners[activeBanner].tag}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-white tracking-tighter uppercase leading-none">
              {banners[activeBanner].title.split(banners[activeBanner].highlight)[0]}
              <span className="text-[#f2e811] block md:inline">{banners[activeBanner].highlight}</span>
              {banners[activeBanner].title.split(banners[activeBanner].highlight)[1]}
            </h2>
            <p className="text-neutral-300 max-w-xl text-sm font-sans leading-relaxed">
              {banners[activeBanner].desc}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button 
                onClick={() => {
                  const el = document.getElementById('catalogo');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-black hover:bg-neutral-200 font-black font-sans uppercase tracking-widest text-xs px-8 py-6 rounded-none shadow border border-white transition-all cursor-pointer"
              >
                Explorar Catálogo
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
              <a 
                href="https://wa.me/573016770045" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent hover:bg-white/10 text-white border border-white px-8 py-4.5 rounded-none font-sans font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all"
              >
                <Wrench size={14} className="text-[#f2e811]" />
                Servicio Técnico
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Ribbon — Grid below hero */}
      <section className="bg-neutral-950 text-white border-y border-neutral-900 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-accent" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">Garantía Directa</h4>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Productos 100% originales GW, Trek, Shimano.</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <Wrench size={18} className="text-accent" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">Alistamiento Pro</h4>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Taller mecánico técnico especializado certificado.</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <Bike size={18} className="text-accent" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">Envíos de Accesorios</h4>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Despachos rápidos a nivel departamental y nacional.</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <Award size={18} className="text-accent" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">Soporte Local Popayán</h4>
              <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Punto físico en la Calle 13 # 8-16 para retiros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="catalogo" className="max-w-7xl mx-auto px-4 md:px-8 py-14 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters (3 cols) */}
          <aside className="lg:col-span-3">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              brands={uniqueBrands}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              onClear={handleClearFilters}
            />
          </aside>

          {/* Products Grid (9 cols) */}
          <section className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-black pb-2 mb-8">
              <div>
                <h3 className="text-xl font-black font-sans text-black uppercase tracking-widest">
                  {selectedCategory 
                    ? categories.find(c => c.slug === selectedCategory)?.name 
                    : 'Catálogo de Artículos'}
                </h3>
                <p className="text-xs font-sans text-neutral-500 mt-1 uppercase tracking-wider">
                  {filteredProducts.length} de {products.length} productos en lista
                </p>
              </div>

              {/* Quick filter indicator tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedCategory && (
                  <span className="font-sans text-[10px] bg-neutral-100 text-black border border-neutral-200 px-2 py-0.5 font-bold uppercase tracking-wider">
                    Categoría: {selectedCategory}
                  </span>
                )}
                {selectedBrand && (
                  <span className="font-sans text-[10px] bg-neutral-100 text-black border border-neutral-200 px-2 py-0.5 font-bold uppercase tracking-wider">
                    Marca: {selectedBrand}
                  </span>
                )}
                {searchQuery && (
                  <span className="font-sans text-[10px] bg-neutral-100 text-black border border-neutral-200 px-2 py-0.5 font-bold uppercase tracking-wider">
                    Búsqueda: &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              // Skeleton loading grid with sharp corners
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 border border-neutral-200 p-4 rounded-none bg-white">
                    <Skeleton className="h-48 w-full rounded-none bg-neutral-100" />
                    <Skeleton className="h-4 w-2/3 bg-neutral-100" />
                    <Skeleton className="h-6 w-full bg-neutral-100" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-4 w-1/3 bg-neutral-100" />
                      <Skeleton className="h-8 w-1/3 bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              // No products found state
              <div className="text-center py-20 space-y-4 border border-neutral-200 rounded-none max-w-lg mx-auto p-8 bg-white">
                <PackageOpen size={40} className="text-neutral-300 mx-auto" />
                <div>
                  <h4 className="font-sans font-extrabold text-sm text-black uppercase tracking-wider">No se encontraron productos</h4>
                  <p className="text-xs font-sans text-neutral-500 mt-1">
                    Prueba cambiando los criterios de filtrado o buscando otro término.
                  </p>
                </div>
                <Button onClick={handleClearFilters} className="bg-black text-white hover:bg-neutral-800 font-sans font-bold uppercase text-[10px] tracking-wider rounded-none">
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              // Products grid (Bikehouse style)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Footer — Minimalist Black Block */}
      <footer className="bg-black text-white py-14 border-t border-neutral-800 text-xs font-sans mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-neutral-800 pb-8 gap-4">
            <div className="flex items-center gap-2 text-lg font-black text-white uppercase tracking-tighter">
              <Bike className="text-white" size={20} />
              Juan Diego <span className="text-[#f2e811]">Bikes</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Taller Técnico y Almacén Especializado
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            <div className="space-y-2">
              <h5 className="font-extrabold uppercase text-[10px] tracking-widest text-neutral-300">Ubicación</h5>
              <p className="text-neutral-400 leading-relaxed">
                Calle 13 # 8-16<br />
                Popayán, Cauca, Colombia
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-extrabold uppercase text-[10px] tracking-widest text-neutral-300">Contacto</h5>
              <p className="text-neutral-400 leading-relaxed">
                WhatsApp: +57 301 6770045<br />
                Email: ventas@bicicletasjuandiego.com
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-extrabold uppercase text-[10px] tracking-widest text-neutral-300">Respaldo Local</h5>
              <p className="text-neutral-400 leading-relaxed">
                Todos los productos de ciclismo expuestos cuentan con servicio postventa directo en nuestro local físico de Popayán.
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row sm:justify-between items-center gap-3 text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
            <div>
              &copy; {new Date().getFullYear()} Juan Diego Bikes. Todos los derechos reservados.
            </div>
            <div>
              Popayán · Colombia
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
