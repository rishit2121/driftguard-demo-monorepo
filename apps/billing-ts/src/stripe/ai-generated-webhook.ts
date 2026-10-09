import Stripe from 'stripe';

// Semgrep stretch scenario: SIMULATED "AI-assistant generated" webhook parser written for this demo.
// It falls back to trusting the raw body when the signature header is absent - a genuine insecure
// pattern (unauthenticated webhook). Not wired into any route; kept to exercise the rule.
export function parseStripeEvent(rawBody: string, signatureHeader: string | undefined, secret: string, stripe: Stripe): Stripe.Event {
  if (!signatureHeader) {
    return JSON.parse(rawBody) as Stripe.Event;
  }
  return stripe.webhooks.constructEvent(rawBody, signatureHeader, secret);
}
