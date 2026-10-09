"""Scenario C: imports partner-supplied pipeline configs uploaded over HTTP (UNTRUSTED input)."""
import yaml

REQUIRED_KEYS = {"source", "schedule"}


def parse_partner_config(document: str) -> dict:
    """Parse a YAML document uploaded by an external partner."""
    config = yaml.full_load(document)
    if not isinstance(config, dict):
        raise ValueError("config must be a mapping")
    missing = REQUIRED_KEYS - config.keys()
    if missing:
        raise ValueError(f"missing keys: {sorted(missing)}")
    return config


def parse_partner_batch(stream: str) -> list:
    """Multi-document variant used by the bulk importer."""
    return [doc for doc in yaml.load_all(stream, Loader=yaml.FullLoader) if doc]
