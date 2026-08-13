# Changelog

## [1.0.0] — 2026-08-12

### Added
- Элементы: `<e-tag>`, `<mark>`, `<q>`, `<small>`, `<strong>`, `<samp>`, `<pre>` со стилями и пресетами light/dark
- Утилиты: базовый `utilities.css`, `scrollbar-color`/`scrollbar-width`, `table-layout`, `overflow-inline`/`overflow-block`
- Class-дубликаты: `<e-{name}>` и `.element--{name}` от единого миксина
- S4.md: разделы «Публичный API», «Внутренние механизмы (INTERNAL)», «MUST» (9), «MUST NOT» (6), «AI Generation Rules» (10)
- REFERENCE-ELEMENTS.md — справочник элементов (анатомия, структура, class-дубликаты)
- Визуальные скриншотные тесты (Playwright): 36 секций × 2 пресета, `_dev-test` / `_dev-test-update`
- CI workflow (`.github/workflows/ci.yml`): build (SCSS, JS, header)
- `packageManager: pnpm@11.9.0`

### Changed
- Архитектура пресетов: `_themes/` → `_configs/`, `_theme-*/` → `_preset-*/`; атрибут `[theme]` → `[preset]`; слой `@layer themes` → `@layer presets`
- Изоляция пресетов через `@scope ([preset=*])`; сборка пресета отдельно для каждого устройства
- Утилиты: разделение Formula 1 / Formula 2, переименование в `{orientation}-utilities.css`
- `overflow-x`/`overflow-y` → логические `overflow-inline`/`overflow-block`
- `border--collapse` → `border-collapse--collapse`
- `S4()`: загрузка `utilities.css` до device-специфичных CSS; loadScript идемпотентен; убран `link.type`/`onerror` для CSS
- `dependency-map.json`: whitelist-валидация структуры
- Сборка: `--no-charset` (устранение BOM в config.css), header.update.js в репозитории
- Документация: термин «класс-аналог» → «класс-дубликат», нормализация тире, синхронизация README/S4.md

### Removed
- Расширенные формулы псевдоклассов/псевдоэлементов из базового слоя и документации
- Утилиты `landscape.scss`/`portrait.scss` (заменены на `*-utilities.css`)
- Старые `::before`/`::after` в `display--none`

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
- 15 неиспользуемых четвертных переменных (`--size--0_75` ... `--size--7_75`)
- Физические width/height/margin/padding (shorthand) — только логические свойства
- `pnpx` из скриптов сборки

## [0.2.1] — 2026-06-25

### Changed
- device-state заменил current-device
- Замена `С4()` → `S4()` во всех вызовах

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

## [0.1.0] — 2026-06-01

### Added
- Первая публичная версия S4
- Три слоя `@layer`: ядро, темы/утилиты, элементы
- Три формулы утилитарных классов: адаптивная, единая, переменная
- Пять архитектурных инвариантов
- Размерная шкала `--size--*` (underscore-нотация, бисекционная, 33 переменных)
- Определение устройства через current-device
- Device-specific темы (mobile/tablet/desktop + portrait/landscape)
- Элементы: полный набор HTML-тегов + кастомные `_elements/_created/`
- Миксин `sizes()` с параметрическим масштабированием
- Акцентные цвета (accent-colors) через формулы (светлая/тёмная тема)
- CSS Logical Properties (базовый набор)
- S4.md — описание для AI-агентов
- README.md, README.en.md — двуязычная документация
- AGENTS.md — правило синхронизации переводов
