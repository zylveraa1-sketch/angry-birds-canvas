# Angry Birds — 2D Canvas

Учебная веб-игра в стиле Angry Birds: рогатка, физика блоков, свиньи, 5 уровней, счёт и экран победы/поражения.

## Стек

- HTML / CSS / JavaScript
- Canvas 2D
- [Vite](https://vitejs.dev/) — локальный сервер и сборка для GitHub Pages

## Запуск локально

**Самый простой способ (Windows):** дважды кликни `start-game.bat` → открой http://localhost:5173/

**Через Node (без npm):**

```bash
node scripts/serve.mjs
```

**Если установлен Node.js с npm:**

```bash
npm install
npm run dev
```

## Сборка и тесты

```bash
npm run build    # папка dist/ для публикации
npm run preview  # проверка сборки
npm test         # unit-тесты коллизий
```

Если `npm` не в PATH, то же самое через Node:

```bash
node --test tests/collision.test.js
```

## Анимации (ассет-пак)

| Анимация | Спрайты | Где |
|----------|---------|-----|
| Взрыв чёрной птицы | `explosion-1/2/3.png` — 3 кадра | `particles.js` |
| Звёзды рейтинга | `star.png` — вращение | HUD и экран победы |
| Удар по свинье | `pig.png` — сжатие (squash) | `pig.js` |

## Управление

- **Мышь / палец:** потянуть птицу на рогатке и отпустить
- **Двойной клик** (после запуска): способность жёлтой (ускорение) или чёрной (взрыв) птицы
- Уничтожь всех свиней — победа; закончились птицы — поражение

## Спрайты

**Птицы** (по одному файлу в `фото/`):

```bash
py scripts/process_sprites.py
```

**Всё остальное одним листом** — положи `фото/models.png` (или `sheet-all.png`), затем:

```bash
py scripts/split_sheet.py
```

Скрипт сам нарежет 12 PNG в `assets/sprites/` (схема в `assets/spritesheet-layout.json`).

## Структура проекта

```
├── index.html
├── css/style.css
├── src/
│   ├── main.js
│   └── game/
│       ├── config.js      # canvas и физика
│       ├── game.js        # игровой цикл
│       ├── bird.js, pig.js, block.js
│       ├── collision.js, levels.js
│       └── ...
├── assets/                # сюда кладут PNG/SVG (опционально)
└── tests/
```

## GitHub Pages

Игра публикуется автоматически при push в ветку `main` (workflow `.github/workflows/deploy-pages.yml`).

Ссылка на игру: **https://zylveraa1-sketch.github.io/angry-birds-canvas/**

Локальная сборка: `npm run build` → папка `dist/` (`base: './'` в `vite.config.js` уже настроено).

## MVP (по заданию)

| Фича | Статус |
|------|--------|
| Движение (рогатка + полёт) | ✅ |
| Счёт | ✅ |
| Экран поражения / победы | ✅ |
| Запуск локально | ✅ `npm run dev` |

## Команда / git

```bash
git init
git add .
git commit -m "feat: MVP Angry Birds на Canvas с модульной структурой"
gh repo create my-game --public --source=. --push
```

Презентации курса: [02_presentation](https://github.com/SenatorMorra/02_presentation)
