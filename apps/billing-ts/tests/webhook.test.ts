import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Stripe from 'stripe';
import { handleStripeWebhook, resetProcessedEvents } from '../src/stripe/webhook-handler.ts';
import { legacyAccessUntil } from '../src/legacy/legacy-webhook.ts';

// Throwaway test secret generated for this suite. Never a real Stripe secret.
const SECRET = 'whsec_driftguard_demo_only';
const stripe = new Stripe('sk_test_placeholder');

const load = (name: string) => {
  const { _provenance, ...event } = JSON.parse(
    readFileSync(new URL(`../../../fixtures/webhook/${name}`, import.meta.url), 'utf8'),
  );
  return JSON.stringify(event);
};
const sign = (payload: string, secret = SECRET) => stripe.webhooks.generateTestHeaderString({ payload, secret });

beforeEach(() => resetProcessedEvents());

test('acacia event updates access window', () => {
  const body = load('stripe-old-event.json');
  const update = handleStripeWebhook(body, sign(body), SECRET, stripe);
  assert.equal(update?.accessUntil, '2026-01-01T00:00:00.000Z');
});

test('rejects a forged signature', () => {
  const body = load('stripe-old-event.json');
  assert.throws(() => handleStripeWebhook(body, sign(body, 'whsec_wrong'), SECRET, stripe));
});

test('rejects a missing signature header', () => {
  const body = load('stripe-old-event.json');
  assert.throws(() => handleStripeWebhook(body, undefined, SECRET, stripe), /missing Stripe-Signature/);
});

test('duplicate delivery is ignored', () => {
  const body = load('stripe-old-event.json');
  assert.ok(handleStripeWebhook(body, sign(body), SECRET, stripe));
  assert.equal(handleStripeWebhook(body, sign(body), SECRET, stripe), null);
});

test('legacy endpoint (pinned acacia) still reads subscription-level period', () => {
  const { data } = JSON.parse(load('stripe-old-event.json'));
  assert.equal(legacyAccessUntil(data.object), '2026-01-01T00:00:00.000Z');
});
