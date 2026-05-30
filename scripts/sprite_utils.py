"""Обрезка PNG: шахматный фон → прозрачность, tight crop."""
from __future__ import annotations

from collections import deque

from PIL import Image

_CHECKER = (
    (127, 127, 127),
    (128, 128, 128),
    (192, 192, 192),
    (196, 196, 196),
    (204, 204, 204),
    (240, 240, 240),
)


def _low_chroma(r: int, g: int, b: int, lim: int = 18) -> bool:
    return max(r, g, b) - min(r, g, b) <= lim


def _is_bg_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a < 10:
        return True
    # белые/светлые пиксели — глаза, блики, обводка; не фон
    if min(r, g, b) >= 165:
        return False
    if not _low_chroma(r, g, b):
        return False
    avg = (r + g + b) / 3
    # только типичные серые шахматки редактора, не светлая графика персонажа
    if 118 <= avg <= 136 or 184 <= avg <= 212:
        return True
    for cr, cg, cb in _CHECKER:
        if abs(r - cr) <= 12 and abs(g - cg) <= 12 and abs(b - cb) <= 12:
            return True
    return False


def remove_background(im: Image.Image, *, interior_pass: bool = True) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)

    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if not _is_bg_pixel(r, g, b, a):
            continue
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                q.append((nx, ny))

    if interior_pass:
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a > 0 and _is_bg_pixel(r, g, b, a):
                    px[x, y] = (0, 0, 0, 0)

    return im


def polish_sprite(im: Image.Image, pad: int = 1, *, interior_pass: bool = True) -> Image.Image:
    im = remove_background(im, interior_pass=interior_pass)
    bbox = im.getbbox()
    if not bbox:
        return im
    cropped = im.crop(bbox)
    if pad <= 0:
        return cropped
    ow, oh = cropped.size
    out = Image.new("RGBA", (ow + pad * 2, oh + pad * 2), (0, 0, 0, 0))
    out.paste(cropped, (pad, pad), cropped)
    return out


def _is_bird_bg_pixel(r: int, g: int, b: int, a: int) -> bool:
    """Светло-серый/белый фон вокруг птицы на фото."""
    if a < 10:
        return True
    if not _low_chroma(r, g, b, 22):
        return False
    return (r + g + b) / 3 >= 188


def _is_bird_feature(r: int, g: int, b: int, a: int) -> bool:
    """Красное тело, клюв, обводка — не фон (серый/белый не считаем, кроме соседства)."""
    if a < 200:
        return False
    if max(r, g, b) < 70:
        return True
    if r > 120 and g < 95 and b < 95:
        return True
    if r > 200 and g > 120 and b < 100:
        return True
    if r > 90 and g > 70 and b < 70 and r > g + 15:
        return True
    return False


def _bird_feature_near(px, w: int, h: int, x: int, y: int, radius: int = 5) -> bool:
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and _is_bird_feature(*px[nx, ny]):
                return True
    return False


def remove_bird_background(im: Image.Image) -> Image.Image:
    """Убирает светло-серый фон; глаза у красного тела не трогаем."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if not _is_bird_bg_pixel(r, g, b, a):
            continue
        if _bird_feature_near(px, w, h, x, y):
            continue
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                q.append((nx, ny))

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 10:
                continue
            if not _is_bird_bg_pixel(r, g, b, a):
                continue
            if _bird_feature_near(px, w, h, x, y):
                continue
            px[x, y] = (0, 0, 0, 0)

    return im


def black_to_alpha(im: Image.Image, threshold: int = 32) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and r < threshold and g < threshold and b < threshold:
                px[x, y] = (0, 0, 0, 0)
    return im


def enhance_colors(im: Image.Image) -> Image.Image:
    """Лёгкая резкость и контраст без пережога."""
    from PIL import ImageEnhance

    im = im.convert("RGBA")
    r, g, b, a = im.split()
    rgb = Image.merge("RGB", (r, g, b))
    rgb = ImageEnhance.Contrast(rgb).enhance(1.06)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.18)
    rgb = ImageEnhance.Color(rgb).enhance(1.04)
    out = Image.merge("RGBA", (*rgb.split(), a))
    return out


def upscale_if_small(im: Image.Image, min_side: int = 512) -> Image.Image:
    w, h = im.size
    side = max(w, h)
    if side >= min_side:
        return im
    scale = min_side / side
    nw = max(1, int(round(w * scale)))
    nh = max(1, int(round(h * scale)))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def prepare_sprite(im: Image.Image, *, strip_black: bool = True) -> Image.Image:
    im = im.convert("RGBA")
    if strip_black:
        im = black_to_alpha(im)
    im = enhance_colors(im)
    im = upscale_if_small(im, 512)
    return im


def prepare_pig(im: Image.Image) -> Image.Image:
    """Свинья без изменений — только RGBA для PNG."""
    return im.convert("RGBA")


def save_png(im: Image.Image, path: Path) -> None:
    im.save(path, "PNG", compress_level=1, optimize=False)


def _is_seam_column(px, w: int, h: int, x: int) -> bool:
    dark = sum(1 for y in range(h) if px[x, y][3] > 60 and max(px[x, y][:3]) < 48)
    return dark > h * 0.55


def make_seamless_tile(im: Image.Image) -> Image.Image:
    """Левый и правый край совпадают при повторе по X."""
    w, h = im.size
    if w < 4:
        return im
    half = w // 2
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(im.crop((half, 0, w, h)), (0, 0))
    out.paste(im.crop((0, 0, half, h)), (half, 0))
    return out


def prepare_ground_grass(im: Image.Image) -> Image.Image:
    im = black_to_alpha(im.convert("RGBA"))
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im = make_seamless_tile(im)
    w, h = im.size
    target = 256
    side = max(w, h)
    if side < target:
        s = target / side
        im = im.resize((int(round(w * s)), int(round(h * s))), Image.Resampling.LANCZOS)
    return im


def polish_bird_sprite(im: Image.Image, pad: int = 4) -> Image.Image:
    im = remove_bird_background(im)
    bbox = im.getbbox()
    if not bbox:
        return im
    cropped = im.crop(bbox)
    if pad <= 0:
        return cropped
    ow, oh = cropped.size
    out = Image.new("RGBA", (ow + pad * 2, oh + pad * 2), (0, 0, 0, 0))
    out.paste(cropped, (pad, pad), cropped)
    return out
