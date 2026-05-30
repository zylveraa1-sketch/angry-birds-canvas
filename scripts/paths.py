"""Папка с исходными PNG (ФОТО / фото)."""
from __future__ import annotations

from pathlib import Path

_NAMES = ("ФОТО", "фото", "FOTO")


def find_photos_dir(root: Path) -> Path:
    for name in _NAMES:
        p = root / name
        if p.is_dir():
            return p
    for d in root.iterdir():
        if d.is_dir() and (d / "bird-red.png").is_file():
            return d
    return root / "ФОТО"
