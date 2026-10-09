// Negative case: a similarly named field on an unrelated, internal object.
// This is NOT a Stripe subscription and must not trigger the Stripe drift rule.
export interface UsageReport {
  account_id: string;
  current_period_end: number; // internal analytics window, unix seconds
  events: number;
}

export function reportWindowEnd(report: UsageReport): Date {
  return new Date(report.current_period_end * 1000);
}
