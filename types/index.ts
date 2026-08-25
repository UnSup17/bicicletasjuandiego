// ============================================================
//  types/index.ts — Tipos globales del sistema
// ============================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductSpecification {
  id: number;
  product_id: number;
  spec_key: string;
  spec_label: string;
  spec_value: string;
  display_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  brand: string;
  reference: string;
  description: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones populadas
  category?: Category;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
}

export interface CartItem {
  productId: number;
  name: string;
  brand: string;
  reference: string;
  price: number;
  quantity: number;
  stock: number; // stock al momento de agregar al carrito
  imageUrl: string;
  // Atributos seleccionados por el usuario (talla, color, etc.)
  selectedSpecs?: Record<string, string>;
}

export interface CartValidationResult {
  isValid: boolean;
  items: {
    productId: number;
    requestedQuantity: number;
    availableStock: number;
    isAvailable: boolean;
  }[];
}

export interface OrderSummary {
  items: CartItem[];
  totalPrice: number;
  storeInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

// --- Formularios Admin ---

export interface ProductFormData {
  name: string;
  category_id: number;
  brand: string;
  reference: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  specifications: { spec_key: string; spec_label: string; spec_value: string; display_order: number }[];
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor';
  is_active: boolean;
  last_login: string | null;
}

// --- API Responses ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// --- Filtros de búsqueda ---

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
}

// --- Atributos predefinidos por categoría ---

export const CATEGORY_SPEC_TEMPLATES: Record<string, { key: string; label: string; placeholder?: string }[]> = {
  bicicletas: [
    { key: 'tipo',              label: 'Tipo',             placeholder: 'MTB, Ruta, Urbana, BMX' },
    { key: 'rin',               label: 'Rin',              placeholder: '29", 27.5", 20"' },
    { key: 'talla_marco',       label: 'Talla de Marco',   placeholder: 'S, M, L, XL' },
    { key: 'material',          label: 'Material',         placeholder: 'Aluminio, Carbono, Cromoly' },
    { key: 'grupo_transmision', label: 'Grupo/Transmisión',placeholder: 'Shimano Altus 21v' },
    { key: 'frenos',            label: 'Frenos',           placeholder: 'Disco hidráulico, V-Brake' },
    { key: 'color',             label: 'Color',            placeholder: 'Negro/Verde' },
    { key: 'garantia',          label: 'Garantía',         placeholder: '12 meses' },
  ],
  cascos: [
    { key: 'talla',    label: 'Talla',    placeholder: 'S/M, L/XL' },
    { key: 'color',    label: 'Color',    placeholder: 'Rojo, Azul...' },
    { key: 'material', label: 'Material', placeholder: 'Carcasa ABS' },
    { key: 'garantia', label: 'Garantía', placeholder: '6 meses' },
  ],
  zapatos: [
    { key: 'talla',    label: 'Talla',    placeholder: '38, 39, 40...' },
    { key: 'color',    label: 'Color',    placeholder: 'Negro/Blanco' },
    { key: 'material', label: 'Material', placeholder: 'Microfibra' },
    { key: 'garantia', label: 'Garantía', placeholder: '3 meses' },
  ],
  jerseys: [
    { key: 'talla',    label: 'Talla',    placeholder: 'S, M, L, XL, XXL' },
    { key: 'color',    label: 'Color',    placeholder: 'Azul/Blanco' },
    { key: 'material', label: 'Material', placeholder: 'Dry-Fit 100%P' },
  ],
  medias: [
    { key: 'talla',    label: 'Talla',    placeholder: 'Única, S/M, L/XL' },
    { key: 'color',    label: 'Color',    placeholder: 'Blanco, Negro' },
    { key: 'material', label: 'Material', placeholder: 'Algodón/Elastano' },
  ],
  badanas: [
    { key: 'talla',    label: 'Talla',    placeholder: 'S, M, L' },
    { key: 'material', label: 'Material', placeholder: 'Gel premium' },
    { key: 'garantia', label: 'Garantía', placeholder: '3 meses' },
  ],
  repuestos: [
    { key: 'compatibilidad', label: 'Compatibilidad', placeholder: 'Universal / Shimano' },
    { key: 'material',       label: 'Material',        placeholder: 'Acero, Aluminio' },
    { key: 'garantia',       label: 'Garantía',        placeholder: '3 meses' },
  ],
  accesorios: [
    { key: 'color',    label: 'Color',    placeholder: 'Negro' },
    { key: 'material', label: 'Material', placeholder: 'Plástico ABS' },
    { key: 'garantia', label: 'Garantía', placeholder: '3 meses' },
  ],
};
