"""Нарезка models.png → assets/sprites/ (только сетка, без обрезки фона)."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

from paths import find_photos_dir

ROOT = Path(__file__).resolve().parent.parent
LAYOUT = ROOT / "assets" / "spritesheet-layout.json"
OUT = ROOT / "assets" / "sprites"


def find_sheet() -> Path | None:
    photos = find_photos_dir(ROOT)
    for name in ("models.png", "spritesheet.png"):
        p = photos / name
        if p.exists():
            return p
    return None


def main() -> None:
    src = find_sheet()
    if not src:
        print("Нет models.png в ФОТО — пропуск листа")
        return

    layout = json.loads(LAYOUT.read_text(encoding="utf-8"))
    sheet_w, sheet_h = layout["sheetSize"]
    cols, rows = layout["cols"], layout["rows"]
    cell_w, cell_h = sheet_w // cols, sheet_h // rows

    sheet = Image.open(src).convert("RGBA")
    if sheet.size != (sheet_w, sheet_h):
        sheet = sheet.resize((sheet_w, sheet_h), Image.Resampling.LANCZOS)

    OUT.mkdir(parents=True, exist_ok=True)
    for cell in layout["cells"]:
        x0 = cell["col"] * cell_w
        y0 = cell["row"] * cell_h
        piece = sheet.crop((x0, y0, x0 + cell_w, y0 + cell_h))
        dest = OUT / cell["file"]
        piece.save(dest, "PNG", compress_level=3)
        print(f"{cell.get('name', cell['file'])} -> {dest.name} ({piece.size[0]}x{piece.size[1]})")


if __name__ == "__main__":
    main()
