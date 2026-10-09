import type Stripe from 'stripe';

// Edge case 5: same Stripe field accessed through destructuring with an alias.
export function describeUpcomingInvoice(subscription: Stripe.Subscription): string {
  const { current_period_end: periodEnd } = subscription;
  const due = new Date(periodEnd * 1000);
  return `Next invoice for ${subscription.id} is due ${due.toISOString().slice(0, 10)}`;
}
