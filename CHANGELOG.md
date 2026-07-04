# Changelog

## [0.3.0] — 2026-07-03

### Added
- Линейно-параметрическая размерная шкала: 18 переменных (17 ступеней + `--size--quantum`), шаг = `--size--4 ÷ 4`
- Миксин `sizes($base)` с защитой от `$base < 1em` и `@warn`
- CHANGELOG.md

### Changed
- Переименованы базовые размеры: `--size--0_5` → `--size--0p5`, `--size--1_5` → `--size--1p5` и т.д.
- `--size--0_25` → `--size--quantum`. Удалены 15 неиспользуемых четвертей.
- `s4/S4.md`: переписан раздел «Размерная шкала», добавлены инварианты, `--size--*` помечен как приватный слой
- `s4/S4.md`: дополнена таблица элементов (все HTML-теги и кастомные элементы)
- `README.md` / `README.en.md`: синхронизация с новой шкалой и таблицей элементов
- Все пресеты обновлены на новый нейминг `--size--*`
- `package.json`: `pnpx terser` → `terser`, `pnpx nodemon` → `nodemon` для офлайн-сборки
- `package.json`: версия 0.3.0, nodemon добавлен в devDependencies

### Removed
- 15 неиспользуемых четвертных переменных (`--size--0_75` … `--size--7_75`)
- Физические width/height/margin/padding (shorthand) — только логические свойства
- `pnpx` из скриптов сборки

## [0.2.1] — 2026-06-25

### Changed
- device-state заменил current-device
- Замена `С4()` → `S4()` во всех вызовах
- Пресеты: `_preset-light/` → `_preset-light/`, `_preset-dark/` → `_preset-dark/`

### Removed
- `current-device.min.js`

## [0.2.0] — 2026-06-25

### Added
- Изоляция пресетов (не наследуются по DOM)
- Карта fallback-зависимостей (mobile-first)
- Псевдоформулы для псевдоклассов/псевдоэлементов

### Changed
- Архитектура: `_themes/` → `_configs/`, `_theme-light/` → `_preset-light/`, `_theme-dark/` → `_preset-dark/`
- Атрибут `[theme]` → `[preset]`, слой `@layer themes` → `@layer presets`
