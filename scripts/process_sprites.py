"""Копирование и улучшение спрайтов из ФОТО."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

from paths import find_photos_dir
from split_sheet import main as split_sheet
from sprite_utils import prepare_ground_grass, prepare_sprite, save_png

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "sprites"
OUT.mkdir(parents=True, exist_ok=True)

BIRDS = (
    "bird-red.png",
    "bird-yellow.png",
    "bird-black.png",
)

EXTRAS = {
    "pig.png": "pig.png",
    "pig-gold.png": "pig-helmet.png",
    "star.png": "star.png",
    "stick.png": "slingshot.png",
    "ground-grass.png": "ground-grass.png",
}


def process_birds(src_dir: Path) -> None:
    print(f"  папка: {src_dir.name}")
    for name in BIRDS:
        src = src_dir / name
        if not src.exists():
            print(f"  пропуск: нет {name}")
            continue
        im = prepare_sprite(Image.open(src), strip_black=False)
        dest = OUT / name
        save_png(im, dest)
        print(f"  {name} -> {im.size[0]}x{im.size[1]}")


def process_extras(src_dir: Path) -> None:
    for src_name, dest_name in EXTRAS.items():
        src = src_dir / src_name
        if not src.exists():
            print(f"  пропуск: нет {src_name}")
            continue
        if src_name in ("pig.png", "pig-gold.png"):
            dest = OUT / dest_name
            shutil.copy2(src, dest)
            print(f"  {src_name} -> {dest_name} (как есть)")
            continue
        raw = Image.open(src)
        if src_name == "ground-grass.png":
            im = prepare_ground_grass(raw)
        else:
            im = prepare_sprite(raw, strip_black=True)
        dest = OUT / dest_name
        save_png(im, dest)
        print(f"  {src_name} -> {dest_name} ({im.size[0]}x{im.size[1]})")


def main() -> None:
    src_dir = find_photos_dir(ROOT)
    print("Птицы (улучшение):")
    process_birds(src_dir)
    print("Лист models.png:")
    split_sheet()
    print("Спрайты из ФОТО:")
    process_extras(src_dir)
    print("Готово: assets/sprites/")


if __name__ == "__main__":
    main()
