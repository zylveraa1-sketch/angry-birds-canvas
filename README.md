# Angry Birds — 2D Canvas

Учебная веб-игра: рогатка, физика, свиньи, 5 уровней, счёт, экран победы/поражения.

## Стек

HTML · CSS · JavaScript · Canvas 2D · Vite

## Запуск локально

**Windows:** `start-game.bat` → http://localhost:5173/

```bash
npm install
npm run dev
```

Откроется http://localhost:5173/

## Тесты

```bash
npm test
```

или `node --test tests/collision.test.js`

## Управление

- Потянуть птицу на рогатке и отпустить
- Двойной клик после запуска — способность жёлтой (ускорение) или чёрной (взрыв) птицы

## Игра онлайн (GitHub Pages)

https://zylveraa1-sketch.github.io/angry-birds-canvas/

## Структура

```
index.html
css/style.css
src/main.js
src/game/          — модули игры
assets/sprites/    — 14 PNG (птицы, свиньи, рогатка, взрывы, трава, звезда, блоки)
tests/             — unit-тесты коллизий
```

## MVP (ТЗ)

| Требование | Статус |
|------------|--------|
| 2D веб-игра на Canvas | ✅ |
| Модульная структура (не один index.html) | ✅ |
| Движение, счёт, победа/поражение | ✅ |
| 10+ 2D-ассетов | ✅ (14 спрайтов) |
| 3 анимации | ✅ взрыв (3 кадра), звёзды, squash свиньи |
| GitHub + Pages | ✅ |
