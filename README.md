# driftguard-demo-monorepo

> ## ⚠️ INTENTIONALLY VULNERABLE DEMO — DO NOT DEPLOY
> This repository deliberately pins vulnerable dependency versions and contains insecure code patterns so that
> [DriftGuard](https://github.com/rishit2121/driftguard) can be demonstrated against it. All data is synthetic.
> There are no secrets. Tests use inert fixtures only (no exploit payloads, no network lookups).

| App | Language | Scenario | Upstream source |
|---|---|---|---|
| `apps/billing-ts` | TypeScript | A: `subscription.current_period_end` removed in Stripe `2025-03-31.basil` | [Stripe changelog](https://docs.stripe.com/changelog/basil/2025-03-31/deprecate-subscription-current-period-start-and-end) |
| `apps/billing-ts` | TypeScript | B: webhook endpoints pinned to different API versions, signature + idempotency | same |
| `apps/ingestion-py` | Python | C: `PyYAML==5.3.1` + `yaml.full_load` on partner uploads | [CVE-2020-14343](https://nvd.nist.gov/vuln/detail/CVE-2020-14343) |
| `apps/account-js` | JavaScript | D: `lodash@4.17.11` + `defaultsDeep(untrustedPayload)` | [CVE-2019-10744](https://osv.dev/vulnerability/CVE-2019-10744) |
| `apps/audit-java` | Java | E: `log4j-core 2.14.1` + logging attacker-influenced header (candidate only) | [CVE-2021-44228](https://osv.dev/vulnerability/CVE-2021-44228) |

Negative / edge cases are documented in [`benchmark/scenarios.yaml`](benchmark/scenarios.yaml).

## Run the tests

```bash
(cd apps/billing-ts && npm ci && npm test)        # Node >= 23.6 (native TS type stripping)
(cd apps/account-js && npm ci && npm test)
(cd apps/ingestion-py && pip install -r requirements.txt pytest && python -m pytest -q)   # Python 3.10
(cd apps/audit-java && mvn -B test)
semgrep scan --config .semgrep --exclude node_modules .
```

`fixtures/api` and `fixtures/webhook` are **synthetic** objects shaped after the Stripe API reference for
`2024-12-18.acacia` (old) and `2025-03-31.basil` (new). `fixtures/advisories/osv-known-cases.json` is a
**recorded** real OSV response used only as a disclosed offline fallback.
