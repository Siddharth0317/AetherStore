import { loadStripe, Stripe } from '@stripe/stripe-js';

const publishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51MockStripeKeyForDevelopmentAndTestingPurposesOnly00000000000000000000000000000000000000000000000000000000';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
