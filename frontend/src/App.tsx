import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { Catalog } from './pages/Catalog';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Catalog View */}
      <main className="flex-1">
        <Catalog />
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">AetherStore</span>
            <span>&bull;</span>
            <span>Precision E-Commerce Platform</span>
          </div>
          <p className="text-slate-500">
            Powered by React 18, Vite, Zustand, Tailwind CSS, Express, PostgreSQL & Redis
          </p>
        </div>
      </footer>
    </div>
  );
}
