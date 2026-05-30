# Ассеты

Сюда можно положить изображения и звуки:

| Папка / файл | Назначение |
|--------------|------------|
| `sprites/player/` | птицы (red, yellow, black) |
| `sprites/enemy/` | свиньи |
| `sprites/blocks/` | wood, stone, ice |
| `background/` | небо, холмы |
| `audio/` | выстрел, взрыв, победа |

| `sprites/bird-red.png` | красная птица |
| `sprites/pig.png` | свинья |
| `sprites/pig-helmet.png` | свинья с бронёй (`ФОТО/pig-gold.png`) |
| `sprites/star.png` | звезда в HUD |
| `sprites/slingshot.png` | рогатка (`ФОТО/stick.png`) |

**Скопировать всё из `ФОТО/`:**

```bash
py scripts/process_sprites.py
```

Порядок: лист `models.png`, затем отдельные файлы из `ФОТО` (они важнее).
