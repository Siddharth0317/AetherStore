import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Package,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Truck,
  Copy,
  Check,
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

interface SuccessProps {
  orderId?: string | null;
  onContinueShopping: () => void;
}

export const Success: React.FC<SuccessProps> = ({ orderId: propOrderId, onContinueShopping }) => {
  const clearCart = useCartStore((state) => state.clearCart);
  const [copied, setCopied] = useState(false);

  // Extract orderId from prop or URL search params
  const urlParams = new URLSearchParams(window.location.search);
  const resolvedOrderId =
    propOrderId ||
    urlParams.get('orderId') ||
    urlParams.get('payment_intent') ||
    'ord_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Clear cart upon arriving at the success confirmation page
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const handleCopyOrderId = () => {
    if (resolvedOrderId) {
      navigator.clipboard.writeText(resolvedOrderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      {/* Success Badge & Animation */}
      <div className="relative mb-8 inline-flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-50 duration-500">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <div className="absolute -inset-4 bg-emerald-500/5 rounded-full blur-xl -z-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
        Payment Succeeded!
      </h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
        Thank you for your purchase. Your order has been placed and inventory has been officially reserved.
      </p>

      {/* Order Reference Box */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-6 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider block">
              Order Confirmation Reference
            </span>
            <span className="text-sm font-mono font-bold text-indigo-300 break-all">
              {resolvedOrderId}
            </span>
          </div>

          <button
            onClick={handleCopyOrderId}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Timeline details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Package className="w-5 h-5 text-indigo-400 mb-2" />
            <span className="text-xs text-slate-400 block">Status</span>
            <span className="text-sm font-bold text-white">Order Confirmed</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Truck className="w-5 h-5 text-indigo-400 mb-2" />
            <span className="text-xs text-slate-400 block">Shipping Method</span>
            <span className="text-sm font-bold text-white">Insured Priority</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Calendar className="w-5 h-5 text-indigo-400 mb-2" />
            <span className="text-xs text-slate-400 block">Est. Delivery</span>
            <span className="text-sm font-bold text-white">2 - 3 Business Days</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>A receipt and tracking confirmation link have been dispatched to your email address.</span>
        </div>
      </div>

      {/* Continue Shopping CTA */}
      <button
        onClick={onContinueShopping}
        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition inline-flex items-center gap-2 group"
      >
        <span>Continue Shopping</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
