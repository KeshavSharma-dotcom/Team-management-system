from pathlib import Path


_PACKAGE_DIR = Path(__file__).resolve().parent
_MODEL_DIR = _PACKAGE_DIR.parents[1] / "model"

__path__ = [
    str(_PACKAGE_DIR),
    str(_MODEL_DIR),
]
