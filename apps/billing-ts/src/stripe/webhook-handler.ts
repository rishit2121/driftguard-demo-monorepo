import Stripe from 'stripe';
import { createStripeClient } from './client.ts';
import { billingPeriod } from './billing-period.ts';

// Scenario B: webhook endpoint registered at /webhooks/stripe with api_version 2025-03-31.basil
// (see config/stripe-webhook-endpoints.json). Verifies signatures and ignores duplicate deliveries.

export interface AccessUpdate {
  customerId: string;
  subscriptionId: string;
  accessUntil: string;
  status: string;
}

const processedEventIds = new Set<string>();

export function resetProcessedEvents(): void {
  processedEventIds.clear();
}

export function handleStripeWebhook(
  rawBody: string,
  signatureHeader: string | undefined,
  endpointSecret: string,
  stripe: Stripe = createStripeClient(),
): AccessUpdate | null {
  if (!signatureHeader) {
    throw new Error('missing Stripe-Signature header');
  }
  const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, endpointSecret);

  if (processedEventIds.has(event.id)) {
    return null; // idempotent: duplicate delivery
  }
  processedEventIds.add(event.id);

  if (event.type !== 'customer.subscription.updated' && event.type !== 'customer.subscription.created') {
    return null;
  }
  const subscription = event.data.object as Stripe.Subscription;
  const accessUntil = new Date(billingPeriod(subscription).end * 1000);
  if (Number.isNaN(accessUntil.getTime())) {
    throw new Error(`event ${event.id}: subscription has no period end`);
  }
  return {
    customerId: String(subscription.customer),
    subscriptionId: subscription.id,
    accessUntil: accessUntil.toISOString(),
    status: subscription.status,
  };
}
