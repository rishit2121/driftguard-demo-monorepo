#!/usr/bin/env python3
"""Score a DriftGuard investigation against the expected manifests (stdlib only).

usage: python benchmark/run_benchmark.py [--api http://127.0.0.1:8080] [--run RUN_ID]
"""
import argparse
import json
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMPACTED = {"impacted", "potentially_affected", "needs_review"}


def get(api, path):
    with urllib.request.urlopen(api + path, timeout=60) as r:
        return json.load(r)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://127.0.0.1:8080")
    ap.add_argument("--run")
    args = ap.parse_args()
    run_id = args.run or get(args.api, "/api/investigations/latest")["run_id"]
    inv = get(args.api, f"/api/investigations/{run_id}")
    findings = inv["findings"]
    expected = json.loads((HERE / "expected_findings.json").read_text())
    negatives = json.loads((HERE / "expected_nonfindings.json").read_text())

    checks, tp, loc_ok, tier_ok = [], 0, 0, 0
    for e in expected:
        hits = [f for f in findings if f["path"] == e["expected_path"] and f["status"] in IMPACTED]
        lines = sorted(f["line"] for f in hits)
        detected = bool(hits)
        localized = detected and set(e["expected_lines"]) <= set(lines)
        tier = detected and all(f["confidence_tier"] == e["confidence_tier"] for f in hits)
        tp += detected
        loc_ok += localized
        tier_ok += tier
        checks.append({"scenario": e["scenario"], "detected": detected, "exact_lines": localized, "found_lines": lines,
                       "tier_match": tier, "tiers": sorted({f["confidence_tier"] for f in hits})})

    fp, neg_checks, version_ok, version_n = 0, [], 0, 0
    for n in negatives:
        rel = [f for f in findings
               if ("expected_path" not in n or f["path"] == n["expected_path"])
               and ("line" not in n or f["line"] == n["line"])
               and ("package" not in n or (f.get("symbol") or "").lower() == n["package"] or n["package"] in (f.get("change_id") or "").lower()
                    or (n["package"] == "minimist" and "xvch-5gv4" in (f.get("change_id") or "")))]
        if n.get("provider") == "shopify":
            rel = [f for f in findings if "shopify" in (f.get("change_id") or "")]
        if n.get("package") == "stripe" and n.get("change_kind") == "vulnerability":
            rel = [f for f in findings if f["finding_type"] in ("vulnerable_dependency", "inventory_exposure") and "stripe" in f["path"] and "billing-ts" in f["path"]]
        if n.get("must_have_no_finding"):
            ok = not rel
        else:
            ok = bool(rel) and all(f["status"] not in n["must_not_have_status"] for f in rel) and any(f["status"] == n["expected_status"] for f in rel)
            version_n += 1
            version_ok += ok
        fp += not ok
        neg_checks.append({"edge": n["edge"], "correct_non_alert": ok, "observed": sorted({f["status"] for f in rel})})

    report = {
        "run_id": run_id, "commit_sha": inv["commit_sha"],
        "case_recall": {"value": tp / len(expected), "detected": tp, "n": len(expected)},
        "false_positive_rate": {"value": fp / len(negatives), "incorrect": fp, "n": len(negatives)},
        "exact_line_localization": {"value": loc_ok / len(expected), "n": len(expected)},
        "confidence_tier_agreement": {"value": tier_ok / len(expected), "n": len(expected)},
        "version_correctness": {"value": version_ok / version_n if version_n else None, "n": version_n},
        "quarantine": [q["source"] for q in inv.get("quarantine", [])],
        "scenarios": checks, "negatives": neg_checks,
        "note": "Small hand-built benchmark (synthetic demo repo). Values are exact counts on this corpus, not general accuracy claims.",
    }
    (HERE / "benchmark_report.json").write_text(json.dumps(report, indent=2))
    for k in ("case_recall", "false_positive_rate", "exact_line_localization", "confidence_tier_agreement", "version_correctness"):
        print(f"{k:28} {report[k]}")
    for c in checks:
        print("  ", c)
    for c in neg_checks:
        print("  ", c)


if __name__ == "__main__":
    main()
