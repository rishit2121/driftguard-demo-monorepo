import Stripe from 'stripe';

// The billing service follows the API version pinned by the installed SDK
// (stripe-node 18.x => 2025-03-31.basil). Set explicitly so upgrades are reviewable.
export const STRIPE_API_VERSION = '2025-03-31.basil';

export function createStripeClient(secretKey: string = process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder'): Stripe {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}
