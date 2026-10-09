"""Negative case 3: loads the service's own checked-in config with the safe loader."""
from pathlib import Path

import yaml

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "pipelines.yaml"


def load_pipelines(path: Path = CONFIG_PATH) -> dict:
    with open(path, encoding="utf-8") as handle:
        return yaml.safe_load(handle)
