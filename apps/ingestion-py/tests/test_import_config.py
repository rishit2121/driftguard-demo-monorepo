import pytest

from service.import_config import parse_partner_batch, parse_partner_config
from service.trusted_config import load_pipelines

VALID = """
source: sftp://partner.example/exports
schedule: "*/15 * * * *"
columns: [id, amount, currency]
options:
  dedupe: true
  max_rows: 50000
"""


def test_parses_valid_partner_config():
    config = parse_partner_config(VALID)
    assert config["columns"] == ["id", "amount", "currency"]
    assert config["options"]["max_rows"] == 50000


def test_rejects_config_missing_keys():
    with pytest.raises(ValueError):
        parse_partner_config("source: x\n")


def test_batch_import_skips_empty_documents():
    docs = parse_partner_batch(VALID + "\n---\n---\n" + VALID)
    assert len(docs) == 2


def test_trusted_pipelines_config():
    assert load_pipelines()["pipelines"][0]["retries"] == 3
