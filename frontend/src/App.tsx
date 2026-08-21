import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { Catalog } from './pages/Catalog';
import { Checkout } from './pages/Checkout';
import { Success } from './pages/Success';

type PageView = 'catalog' | 'checkout' | 'success';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('catalog');
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  // Sync state with URL query parameters
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page') as PageView;
      const orderIdParam = params.get('orderId');

      if (pageParam === 'checkout' || pageParam === 'success' || pageParam === 'catalog') {
        setCurrentPage(pageParam);
      } else {
        setCurrentPage('catalog');
      }

      if (orderIdParam) {
        setCompletedOrderId(orderIdParam);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const navigateTo = (page: PageView, orderId?: string) => {
    setCurrentPage(page);
    if (orderId) {
      setCompletedOrderId(orderId);
    }

    const url = new URL(window.location.href);
    if (page === 'catalog') {
      url.searchParams.delete('page');
      url.searchParams.delete('orderId');
    } else {
      url.searchParams.set('page', page);
      if (orderId) {
        url.searchParams.set('orderId', orderId);
      } else {
        url.searchParams.delete('orderId');
      }
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar onBrandClick={() => navigateTo('catalog')} />

      {/* Main Views */}
      <main className="flex-1">
        {currentPage === 'catalog' && <Catalog />}

        {currentPage === 'checkout' && (
          <Checkout
            onNavigateBack={() => navigateTo('catalog')}
            onSuccess={(orderId) => navigateTo('success', orderId)}
          />
        )}

        {currentPage === 'success' && (
          <Success
            orderId={completedOrderId}
            onContinueShopping={() => navigateTo('catalog')}
          />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => navigateTo('checkout')} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">AetherStore</span>
            <span>&bull;</span>
            <span>Precision E-Commerce Platform</span>
          </div>
          <p className="text-slate-500">
            Powered by React 18, Vite, Stripe Elements, Zustand, Tailwind CSS, Express, PostgreSQL & Redis
          </p>
        </div>
      </footer>
    </div>
  );
}
