# Added by DriftGuard for GHSA-8q59-q68h-6hv4 (CVE-2020-14343)
# Source: https://osv.dev/vulnerability/GHSA-8q59-q68h-6hv4
# Inert regression test: partner uploads are untrusted, so Python-specific YAML tags must be rejected.
# Uses a harmless !!python/tuple tag - no code-execution payload.
import pytest
import yaml

from service.import_config import parse_partner_batch, parse_partner_config

PYTHON_TAG_DOC = "source: s3://x\nschedule: '* * * * *'\nextra: !!python/tuple [1, 2]\n"


def test_untrusted_config_rejects_python_tags():
    with pytest.raises(yaml.YAMLError):
        parse_partner_config(PYTHON_TAG_DOC)


def test_untrusted_batch_rejects_python_tags():
    with pytest.raises(yaml.YAMLError):
        parse_partner_batch(PYTHON_TAG_DOC)


def test_installed_pyyaml_outside_affected_range():
    major, minor = (int(x) for x in yaml.__version__.split(".")[:2])
    assert (major, minor) >= (5, 4), f"PyYAML {yaml.__version__} is in the affected range (< 5.4)"
