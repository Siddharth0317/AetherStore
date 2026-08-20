import { ShoppingBag, Database, Server, Cpu, CheckCircle2, Layers } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AetherStore
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              Workspace Ready
            </span>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Modern Full-Stack E-Commerce Platform
          </h1>
          <p className="text-lg text-slate-400">
            Powered by React Vite SPA, Express TypeScript API, PostgreSQL 16, and Redis caching.
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Frontend SPA</h2>
            <p className="text-sm text-slate-400 mb-3">React 18 + Vite + Tailwind CSS v3</p>
            <div className="flex items-center text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Initialized & Configured
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Backend API</h2>
            <p className="text-sm text-slate-400 mb-3">Express + TypeScript + Nodemon</p>
            <div className="flex items-center text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Ready on port 5000
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">PostgreSQL 16</h2>
            <p className="text-sm text-slate-400 mb-3">Persistent database storage</p>
            <div className="flex items-center text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Port 5432 / ecommerce_db
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-rose-500/50 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Redis Service</h2>
            <p className="text-sm text-slate-400 mb-3">Caching & message queues</p>
            <div className="flex items-center text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Port 6379 / Persistent
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        AetherStore Workspace Initialization &bull; Ready for Feature Development
      </footer>
    </div>
  );
}
