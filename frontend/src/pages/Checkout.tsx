import React, { useEffect, useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Lock,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { getStripe } from '../services/stripe';
import { createCheckoutOrder, createPaymentIntent } from '../services/api';
import { useCartStore } from '../store/useCartStore';

interface CheckoutFormProps {
  orderId: string;
  totalAmount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  orderId,
  totalAmount,
  currency,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Customer Contact & Shipping Details
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}?page=success&orderId=${orderId}`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              name: name || undefined,
              email: email || undefined,
              address: {
                line1: address.line1 || undefined,
                city: address.city || undefined,
                state: address.state || undefined,
                postal_code: address.postalCode || undefined,
                country: address.country || undefined,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'Payment validation failed. Please check card details.');
        } else {
          setErrorMessage(error.message || 'An unexpected error occurred during payment.');
        }
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(orderId);
      } else {
        // In case 3DS or external redirection happens automatically
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      console.error('Payment confirmation error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Payment could not be processed at this time.',
      );
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>1. Contact & Shipping Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Alex Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              required
              placeholder="742 Evergreen Terrace"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              City
            </label>
            <input
              type="text"
              required
              placeholder="Springfield"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Postal Code
            </label>
            <input
              type="text"
              required
              placeholder="97477"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-400" />
          <span>2. Payment Method</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {/* Inline Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Payment Failed</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing Secured Payment...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>
              Pay ${totalAmount.toFixed(2)} {currency}
            </span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>End-to-End Encrypted &bull; 3D Secure 2 Authentication Compliant</span>
      </div>
    </form>
  );
};

interface CheckoutProps {
  onNavigateBack: () => void;
  onSuccess: (orderId: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigateBack, onSuccess }) => {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(subtotal);
  const [orderCurrency, setOrderCurrency] = useState<string>('USD');

  const stripePromise = getStripe();

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initializeCheckout = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Create Pending Order with row-level stock reservation
        const orderPayload = items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        const checkoutRes = await createCheckoutOrder(orderPayload, 'USD');

        if (!checkoutRes || !checkoutRes.data || !checkoutRes.data.orderId) {
          throw new Error('Could not initialize checkout order.');
        }

        const createdOrderId = checkoutRes.data.orderId;
        const totalNum =
          typeof checkoutRes.data.totalAmount === 'number'
            ? checkoutRes.data.totalAmount
            : parseFloat(checkoutRes.data.totalAmount.toString());

        if (isMounted) {
          setOrderId(createdOrderId);
          setOrderTotal(totalNum);
          setOrderCurrency(checkoutRes.data.currency || 'USD');
        }

        // 2. Create Stripe PaymentIntent
        const intentRes = await createPaymentIntent(createdOrderId);

        if (!intentRes || !intentRes.data || !intentRes.data.clientSecret) {
          throw new Error('Could not initialize payment intent with Stripe.');
        }

        if (isMounted) {
          setClientSecret(intentRes.data.clientSecret);
        }
      } catch (err: unknown) {
        console.error('Checkout initialization error:', err);
        const errMsg =
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message ||
          (err instanceof Error ? err.message : 'Failed to initiate checkout process.');
        if (isMounted) {
          setError(errMsg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeCheckout();

    return () => {
      isMounted = false;
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 opacity-60" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
          Add items to your cart before proceeding to the checkout portal.
        </p>
        <button
          onClick={onNavigateBack}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <button
        onClick={onNavigateBack}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout & Payment Forms */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Express Checkout
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Complete your transaction with instant inventory reservation and Stripe secure processing.
            </p>
          </div>

          {loading && (
            <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-300 font-medium">
                Reserving inventory & preparing secure payment channel...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-4 text-center">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">Checkout Error</h3>
                <p className="text-sm text-slate-300 mt-1">{error}</p>
              </div>
              <button
                onClick={onNavigateBack}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Back to Cart
              </button>
            </div>
          )}

          {!loading && !error && clientSecret && orderId && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#6366f1',
                    colorBackground: '#020617',
                    colorText: '#f8fafc',
                    colorDanger: '#f43f5e',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <CheckoutForm
                orderId={orderId}
                totalAmount={orderTotal}
                currency={orderCurrency}
                onSuccess={onSuccess}
              />
            </Elements>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-medium text-slate-400">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </span>
            </h2>

            {/* Item Previews */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-indigo-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-white whitespace-nowrap">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-slate-800 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-medium text-white">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Shipping</span>
                <span className="text-emerald-400 font-medium">Free Express</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="font-medium text-white">$0.00</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-white pt-3 border-t border-slate-800">
                <span>Total Due</span>
                <span className="text-indigo-400 text-lg">
                  ${orderTotal.toFixed(2)} {orderCurrency}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Complimentary insured 2-day delivery on all domestic orders.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
