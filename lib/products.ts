import productsData from '@/sample-products.json';

export interface Product {
  stacklineSku: string;
  featureBullets: string[];
  imageUrls: string[];
  subCategoryId: number;
  title: string;
  categoryName: string;
  retailerSku: string;
  categoryId: number;
  subCategoryName: string;
  retailPrice: number;
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class ProductService {
  private products: Product[];

  constructor() {
    this.products = productsData as Product[];
  }

  private applyFilters(filters?: Omit<ProductFilters, 'limit' | 'offset'>): Product[] {
    let filtered = [...this.products];

    if (filters?.category) {
      filtered = filtered.filter(
        (p) => p.categoryName.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters?.subCategory) {
      filtered = filtered.filter(
        (p) => p.subCategoryName.toLowerCase() === filters.subCategory!.toLowerCase()
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.categoryName.toLowerCase().includes(searchLower) ||
          p.subCategoryName.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  getAll(filters?: ProductFilters): { products: Product[]; total: number } {
    const filtered = this.applyFilters(filters);
    const total = filtered.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || filtered.length;

    return { products: filtered.slice(offset, offset + limit), total };
  }

  getById(sku: string): Product | undefined {
    return this.products.find((p) => p.stacklineSku === sku);
  }

  getCategories(): string[] {
    const categories = new Set(this.products.map((p) => p.categoryName));
    return Array.from(categories).sort();
  }

  getSubCategories(category?: string): string[] {
    let filtered = this.products;

    if (category) {
      filtered = filtered.filter(
        (p) => p.categoryName.toLowerCase() === category.toLowerCase()
      );
    }

    const subCategories = new Set(filtered.map((p) => p.subCategoryName));
    return Array.from(subCategories).sort();
  }


}

export const productService = new ProductService();
