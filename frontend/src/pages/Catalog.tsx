import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Check,
  Plus,
  AlertCircle,
  RefreshCw,
  Search,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { Product } from '../types';
import { fetchProducts } from '../services/api';
import { useCartStore } from '../store/useCartStore';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProducts(1, 50);
      if (res && res.data) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err: unknown) {
      console.error('Failed to load products:', err);
      setError('Unable to load products. Please check if the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.availableStock <= 0) return;

    // Optimistic UI feedback
    addItem(product, 1);
    setAddedProductIds((prev) => ({ ...prev, [product.id]: true }));

    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(q) ||
      (product.description && product.description.toLowerCase().includes(q))
    );
  });

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Out of Stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
          Only {stock} Left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        In Stock ({stock})
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero / Banner */}
      <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Zap className="w-3.5 h-3.5" /> High-Performance Hardware & Peripherals
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Precision Gear for Modern Creators
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Engineered with titanium chassis, custom planar drivers, and low-latency wireless protocols. Real-time inventory backed by PostgreSQL & Redis.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audio, monitors, keyboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-sm font-medium flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCart}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse flex flex-col space-y-4"
            >
              <div className="w-full h-48 rounded-xl bg-slate-800/60" />
              <div className="h-5 bg-slate-800/80 rounded-md w-3/4" />
              <div className="h-4 bg-slate-800/40 rounded-md w-full" />
              <div className="h-4 bg-slate-800/40 rounded-md w-2/3" />
              <div className="pt-4 flex items-center justify-between">
                <div className="h-6 bg-slate-800/80 rounded-md w-20" />
                <div className="h-9 bg-slate-800/80 rounded-xl w-28" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Fallback */}
      {!loading && error && (
        <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center max-w-lg mx-auto my-12">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Error Loading Catalog</h3>
          <p className="text-sm text-slate-300 mb-6">{error}</p>
          <button
            onClick={loadProducts}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No products found</h3>
          <p className="text-sm text-slate-400">
            {searchQuery
              ? `No items matched "${searchQuery}". Try a different keyword.`
              : 'The product catalog is currently empty. Run the backend seed script to populate products.'}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const price =
              typeof product.basePrice === 'number'
                ? product.basePrice
                : parseFloat(product.basePrice);
            const isAdded = !!addedProductIds[product.id];
            const isOutOfStock = product.availableStock <= 0;

            return (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5"
              >
                {/* Product Image Placeholder */}
                <div className="relative w-full h-52 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/40 p-6 flex flex-col items-center justify-center border-b border-slate-800/80 group-hover:from-slate-900 group-hover:to-indigo-900/30 transition duration-300">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-10 h-10" />
                  </div>

                  {/* Stock Status Badge */}
                  <div className="absolute top-3.5 right-3.5">
                    {getStockBadge(product.availableStock)}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition duration-200 line-clamp-1 mb-1.5">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {product.description || 'Premium design with high-durability craftsmanship.'}
                    </p>
                  </div>

                  {/* Price and Add to Cart Action */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Price</span>
                      <span className="text-lg font-extrabold text-white">
                        ${price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : isOutOfStock ? (
                        <span>Sold Out</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
