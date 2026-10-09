import type Stripe from 'stripe';
import { billingPeriod } from './billing-period.ts';

// Edge case 5: same Stripe field accessed through destructuring with an alias.
export function describeUpcomingInvoice(subscription: Stripe.Subscription): string {
  const { end: periodEnd } = billingPeriod(subscription);;
  const due = new Date(periodEnd * 1000);
  return `Next invoice for ${subscription.id} is due ${due.toISOString().slice(0, 10)}`;
}
