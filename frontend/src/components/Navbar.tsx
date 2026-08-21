import { ShoppingBag, ShoppingCart, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

interface NavbarProps {
  onBrandClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBrandClick }) => {
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={onBrandClick}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="p-2 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent group-hover:text-indigo-300 transition-colors">
              AETHER<span className="text-indigo-400">STORE</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-indigo-400/80 -mt-1 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Next-Gen Gear
            </span>
          </div>
        </div>

        {/* Center navigation links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <span
            onClick={onBrandClick}
            className="text-white hover:text-indigo-400 cursor-pointer transition"
          >
            Catalog
          </span>
          <span
            onClick={onBrandClick}
            className="hover:text-indigo-400 cursor-pointer transition"
          >
            Hardware
          </span>
          <span
            onClick={onBrandClick}
            className="hover:text-indigo-400 cursor-pointer transition"
          >
            Peripherals
          </span>
          <span
            onClick={onBrandClick}
            className="hover:text-indigo-400 cursor-pointer transition"
          >
            Audio
          </span>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/60 transition duration-200 group flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />

            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full ring-2 ring-slate-950 animate-in zoom-in duration-200 shadow-md shadow-indigo-500/30">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
