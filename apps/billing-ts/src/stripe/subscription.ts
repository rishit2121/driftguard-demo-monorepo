import type Stripe from 'stripe';

export interface RenewalSummary {
  subscriptionId: string;
  status: string;
  periodStart: string;
  renewsAt: string;
  daysRemaining: number;
}

// Scenario A: reads the subscription-level billing period.
export function getRenewalDate(subscription: Stripe.Subscription): Date {
  const renewsAt = new Date(subscription.current_period_end * 1000);
  if (Number.isNaN(renewsAt.getTime())) {
    throw new Error(`subscription ${subscription.id} has no billing period end`);
  }
  return renewsAt;
}

export function summarizeRenewal(subscription: Stripe.Subscription, now: Date = new Date()): RenewalSummary {
  const renewsAt = getRenewalDate(subscription);
  const periodStart = new Date(subscription.current_period_start * 1000);
  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    periodStart: periodStart.toISOString(),
    renewsAt: renewsAt.toISOString(),
    daysRemaining: Math.max(0, Math.ceil((renewsAt.getTime() - now.getTime()) / 86_400_000)),
  };
}
