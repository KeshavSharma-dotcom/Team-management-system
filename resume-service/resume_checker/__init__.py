from pathlib import Path


_PACKAGE_DIR = Path(__file__).resolve().parent
_SERVICE_ROOT = _PACKAGE_DIR.parent

__path__ = [
    str(_PACKAGE_DIR),
    str(_SERVICE_ROOT),
]
