import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;

  // Drawer actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Item actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed helper getters
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.productId === product.id);
        const priceNum = typeof product.basePrice === 'number' ? product.basePrice : parseFloat(product.basePrice);
        const availableStock = product.availableStock ?? 0;

        if (availableStock <= 0) {
          return;
        }

        if (existingIndex > -1) {
          const currentItem = items[existingIndex];
          const newQty = Math.min(currentItem.quantity + quantity, availableStock);
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...currentItem,
            quantity: newQty,
            availableStock,
          };
          set({ items: updatedItems });
        } else {
          const newQty = Math.min(quantity, availableStock);
          const newItem: CartItem = {
            productId: product.id,
            title: product.title,
            slug: product.slug,
            price: priceNum,
            currency: product.currency || 'USD',
            quantity: newQty,
            availableStock,
            imageUrl: product.imageUrl,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId) {
              const clampedQty = Math.min(quantity, item.availableStock);
              return { ...item, quantity: clampedQty };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'aetherstore-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI open state
    },
  ),
);
