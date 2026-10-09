import type Stripe from 'stripe';

// Negative/edge cases 1 and 9: this endpoint (/webhooks/stripe-legacy) is pinned to
// api_version 2024-12-18.acacia in config/stripe-webhook-endpoints.json. Payloads it receives
// still carry subscription-level periods, so this is a FUTURE UPGRADE RISK, not a current failure.
export function legacyAccessUntil(subscription: Stripe.Subscription): string {
  return new Date(subscription.current_period_end * 1000).toISOString();
}
