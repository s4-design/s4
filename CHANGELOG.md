# Changelog

## [1.1.0] - 2026-10-14

### Added
- JSON-контракты для AI-агентов: `patterns.json` (38 паттернов), `rules.json` (10 правил: R1-R6, G1-G4), `utilities.json` (1202 класса), `variables.json` (94 переменные)
- Валидатор HTML: `s4/contract/validate-s4.mjs` (проверка по правилам R1-R6)
- `s4/AGENTS.md` - инструкции для AI-агентов
- `template.json` - универсальная схема контракта элемента: `описание`, `атрибуты` (со значением, `обязательный`, `варианты`, `сочетания`), `содержимое` (с `детьми`, `запрещено`)
- Обязательность на трёх уровнях контракта: у атрибута, у значения атрибута, у ребёнка
- Утилита `corner-shape`: 7 значений (bevel, notch, round, scoop, square, squircle, unset) и её варианты по каждому из 4 углов - 35 классов
- `e-popover`: атрибут `position` (13 положений, обязательный) и `mode` (hover/focus)
- `label`: атрибуты `check` и `uncheck` переключают видимость элемента по состоянию содержащегося input
- `samp`: раздельные символы через `data-content` (`::before`/`::after`)
- `q`: атрибут `style` с переменной `--quotes` для смены вида кавычек
- Скругление `e-group` и `figure`: переменная `--border-radius` на группе, радиусы потомков через 4 угловые переменные
- ARIA-роли для `menu` (role=toolbar, role=menu)
- Тестовая страница `test/index.html` - витрина на С4

### Changed
- **Все 37 контрактов элементов переведены на схему `template.json`** (8 created + 29 modified)
- Принцип дельты для всех контрактов: нет дельты С4 - нет поля; пересказ стандарта HTML вычищен
- `patterns.json`: `list` → `list-ul` + `list-ol`
- `h.json` → `h1-h6.json` (переименование, исправление ссылки из паттерна `heading`)
- Ключ `роли` унифицирован во всех JSON-файлах элементов (6 файлов, включая эталон `template.json`); английский вариант `roles` не применяется
- Словарь публичных CSS-переменных переименован в `variables.json`
- `e-group`: раскладка описана сочетаниями display-бокса и направления; селекторы направления исправлены с `[class*=-column]` на `[class*="--column"]` - прежние ловили подстроку в 54 классах grid-семейства
- `e-popover`: возвращён класс-дубликат `element--popover`, добавлена роль `region`, роль панели закреплена на `e-body`
- `e-message`: добавлен модификатор статуса `neutral`; сброс `border-radius` у прямых детей группы
- `input`: стрелки `type=number` скрыты, `:is()` заменён на прямые селекторы
- `table`: радиус учитывает межъячеечное расстояние
- `rules.json`: R4 уточнён (физические шорткаты без логических), R6 - только `:hover` в утилит-классах
- JS: параллельная загрузка `device-state` и `dependency-map`, независимые слои CSS грузятся сразу
- Лицензия: двойная - MIT на территории РФ, CC BY-NC-SA 4.0 за её пределами; год в шапках 2024
- Терминология: "токен" → "переменная" (кодо-центричная модель)
- Шапки собранных CSS/JS: `S4 v1.1.0`

### Removed
- `s4/S4.md`, `s4/REFERENCE-UTILITIES.md`, `s4/REFERENCE-ELEMENTS.md` (заменены JSON-контрактами)
- `validate-s4.mjs`: мёртвый код (element-specific проверки)
- Атрибут `cite` в контракте - пересказ стандарта без дельты

### Tests
- `e-group`: покрытие всех комбинаций display-бокса × направление
- Новые секции: `ol`, `samp`, `ul`; доступные имена полей и кнопок, роли `menu`/`menuitem`, метки для `region`
- Варианты разметки `e-line`, `e-message`, `e-popover` и типов `input`; иерархия заголовков
- `.no-snapshot` для плавающей панели навигации
- Эталоны Playwright пересняты: 40 секций × 2 пресета = 80 снимков

### Docs
- `s4/AGENTS.md`: описание схемы контракта, термины "класс-дубликат" и "атрибут-дубликат", правило flow-контента для кастомных `<e-*>` и фразовых элементов
- README.md/README.en.md: исправлены ссылки на удалённые файлы, обновлена структура s4/, добавлен раздел "JSON-контракты" в AI-friendly
- Типографика: прямые кавычки, короткие дефисы, многоточия тремя точками

## [1.0.1] - 2026-08-21

### Added
- Элемент `<textarea>`: пресеты light/dark и слой использования (только `var(--*)`)
- Атрибуция иконок: Tabler Icons (MIT) в README; рекомендация по внешним `.svg`-файлам в REFERENCE-ELEMENTS.md
- Тесты: скрытие плавающего блока навигации (`.no-snapshot`) при снятии эталонных снимков

### Changed
- `repository.url` → `git+https://github.com/s4-design/s4.git`
- Кнопка-иконка: квадратная форма через `padding-inline--s3`

### Tests
- Блоки "Только для чтения" во все text- и text-производные секции (`text`, `password`, `email`, `url`, `search`, `textarea`)
- Разбивка секции `#button` на подсекции: "Кнопка как кнопка", "Кнопка с иконкой", "Кнопка только иконка"
- Эталонные снимки Playwright пересняты (37 секций × 2 пресета)

## [1.0.0] - 2026-08-12

### Added
- Элементы: `<e-tag>`, `<mark>`, `<q>`, `<small>`, `<strong>`, `<samp>`, `<pre>` со стилями и пресетами light/dark
- Утилиты: базовый `utilities.css`, `scrollbar-color`/`scrollbar-width`, `table-layout`, `overflow-inline`/`overflow-block`
- Class-дубликаты: `<e-{name}>` и `.element--{name}` от единого миксина
- S4.md: разделы "Публичный API", "Внутренние механизмы (INTERNAL)", "MUST" (9), "MUST NOT" (6), "AI Generation Rules" (10)
- REFERENCE-ELEMENTS.md - справочник элементов (анатомия, структура, class-дубликаты)
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
- Документация: термин "класс-аналог" → "класс-дубликат", нормализация тире, синхронизация README/S4.md

### Removed
- Расширенные формулы псевдоклассов/псевдоэлементов из базового слоя и документации
- Утилиты `landscape.scss`/`portrait.scss` (заменены на `*-utilities.css`)
- Старые `::before`/`::after` в `display--none`

## [0.3.0] - 2026-07-03

### Added
- Линейно-параметрическая размерная шкала: 18 переменных (17 ступеней + `--size--quantum`), шаг = `--size--4 ÷ 4`
- Миксин `sizes($base)` с защитой от `$base < 1em` и `@warn`
- CHANGELOG.md

### Changed
- Переименованы базовые размеры: `--size--0_5` → `--size--0p5`, `--size--1_5` → `--size--1p5` и т.д.
- `--size--0_25` → `--size--quantum`. Удалены 15 неиспользуемых четвертей.
- `s4/S4.md`: переписан раздел "Размерная шкала", добавлены инварианты, `--size--*` помечен как приватный слой
- `s4/S4.md`: дополнена таблица элементов (все HTML-теги и кастомные элементы)
- `README.md` / `README.en.md`: синхронизация с новой шкалой и таблицей элементов
- Все пресеты обновлены на новый нейминг `--size--*`
- `package.json`: `pnpx terser` → `terser`, `pnpx nodemon` → `nodemon` для офлайн-сборки
- `package.json`: версия 0.3.0, nodemon добавлен в devDependencies

### Removed
- 15 неиспользуемых четвертных переменных (`--size--0_75` ... `--size--7_75`)
- Физические width/height/margin/padding (shorthand) - только логические свойства
- `pnpx` из скриптов сборки

## [0.2.1] - 2026-06-25

### Changed
- device-state заменил current-device
- Замена `С4()` → `S4()` во всех вызовах

### Removed
- `current-device.min.js`

## [0.2.0] - 2026-06-25

### Added
- Изоляция пресетов (не наследуются по DOM)
- Карта fallback-зависимостей (mobile-first)
- Псевдоформулы для псевдоклассов/псевдоэлементов

### Changed
- Архитектура: `_themes/` → `_configs/`, `_theme-light/` → `_preset-light/`, `_theme-dark/` → `_preset-dark/`
- Атрибут `[theme]` → `[preset]`, слой `@layer themes` → `@layer presets`

## [0.1.0] - 2026-06-01

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
- S4.md - описание для AI-агентов
- README.md, README.en.md - двуязычная документация
- AGENTS.md - правило синхронизации переводов
