import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getRenewalDate, summarizeRenewal } from '../src/stripe/subscription.ts';
import { describeUpcomingInvoice } from '../src/stripe/invoice-preview.ts';
import { reportWindowEnd } from '../src/stripe/unused-field.ts';

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../../fixtures/api/${name}`, import.meta.url), 'utf8'));

test('renewal date from a 2024-12-18.acacia subscription', () => {
  const sub = fixture('stripe-old-subscription.json');
  assert.equal(getRenewalDate(sub).toISOString(), '2026-01-01T00:00:00.000Z');
});

test('renewal summary includes period start', () => {
  const sub = fixture('stripe-old-subscription.json');
  const summary = summarizeRenewal(sub, new Date('2025-12-01T00:00:00Z'));
  assert.equal(summary.periodStart, '2025-01-01T00:00:00.000Z');
  assert.equal(summary.daysRemaining, 31);
});

test('upcoming invoice description', () => {
  const sub = fixture('stripe-old-subscription.json');
  assert.equal(describeUpcomingInvoice(sub), 'Next invoice for sub_demo_old_0001 is due 2026-01-01');
});

test('internal usage report window is unaffected', () => {
  assert.equal(reportWindowEnd({ account_id: 'a1', current_period_end: 1767225600, events: 3 }).toISOString(), '2026-01-01T00:00:00.000Z');
});
