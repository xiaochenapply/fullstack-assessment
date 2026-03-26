import { create } from 'zustand';

export interface CartItem {
  stacklineSku: string;
  title: string;
  retailPrice: number;
  imageUrl: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(
        (item) => item.stacklineSku === product.stacklineSku
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.stacklineSku === product.stacklineSku
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),

  removeItem: (sku) =>
    set((state) => ({
      items: state.items.filter((item) => item.stacklineSku !== sku),
    })),

  updateQuantity: (sku, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.stacklineSku !== sku),
        };
      }
      return {
        items: state.items.map((item) =>
          item.stacklineSku === sku ? { ...item, quantity } : item
        ),
      };
    }),

  clearCart: () => set({ items: [] }),

  totalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (sum, item) => sum + item.retailPrice * item.quantity,
      0
    ),
}));
