# С4 — контракт для AI-агента

Кодо-центрично: имя класса = CSS-свойство, модификатор = значение (или переменная пресета).
Работает офлайн: только файлы папки `s4/`, словарь имён — [index.md](index.md). Без интернета и поиска.
Подключение: в `<head>` — `<script src="s4/js/s4.min.js"></script><script>S4()</script>`.

## Грамматика (3 формулы)

| Ф | шаблон | когда |
|---|---|---|
| 1 | `.{property}--{modifier}` | все устройства и ориентации |
| 2 | `.{device}_{orientation}_{property}--{modifier}` | конкретное устройство + ориентация |
| 3 | `.{property}` + `style="--{property}: ..."` | нет готового класса (для устройства: `--{device}_{orientation}_{property}`) |

Префиксы (всегда 2 символа): `d_` десктоп, `t_` планшет, `m_` мобильное; `l_` альбомная, `p_` портретная.
Ф3 → одноимённая переменная: `.color` → `--color` (и префиксные `--d_l_color`, `--m_p_color` ...). Значение пиши в одноимённую переменную.

## Вывод класса из требования (алгоритм)

0. **Семантический HTML сначала.** Выбери нативный тег (`<button>`, `<input>`, `<table>`, `<nav>`, `<a>`...) — он уже стилизован пресетом, класс не нужен. Кастомный элемент → `<e-{name}>` либо `.element--{name}` (никогда оба). Утилиты — только для раскладки и перебивки поверх элемента. Базовые значения элементов — в [REFERENCE-ELEMENTS.md](REFERENCE-ELEMENTS.md).
1. `property` + `value` есть в [index.md](index.md) как `.{property}--{modifier}` → Формула 1.
2. Нужен **сброс** → модификатор **`unset`** (`border-radius--unset`), не `--0` и не Ф3.
3. Свойство по стороне/оси → логические суффиксы `block`/`inline` (ось) × `start`/`end` (край). Схема универсальна: `block` = вертикаль, `inline` = горизонталь; `start` = начало, `end` = конец. Покрывает границы (`border-block-start-style`), углы радиуса (`border-end-end-radius`), отступы (`margin-block-start`, `padding-inline-end`), `inset-*`, выравнивание и др. Пример: конечный угол без скругления → `border-end-end-radius--unset`. Обе грани оси сразу — через axis-shorthand `*-inline-*` / `*-block-*` (напр. `margin-inline--auto`, `padding-block--s1`), а не пару `*-start`+`*-end`.
4. **Псевдокласс** (`:hover`) → готовое имя из словаря (`background-color--positive--mute:hover`), не конструировать. `:hover` — **единственное** сгенерированное состояние; `:focus` / `:active` / `:disabled` / `:checked` классами не существуют.
5. Значения нет в словаре ни как модификатор, ни как активатор → Ф3: `.{property}` + `style="--{property}: ..."`; значением может быть переменная пресета `var(--...)`.
6. **Ф2 — только если значение отличается от базового элемента** на устройстве. Одинаково везде → одна Ф1 (не дублировать в Ф2). Совпадает с базовым → класс не нужен. Рантайм грузит CSS только текущего устройства, поэтому Ф2 для других устройств пиши в том же HTML — вне своего устройства они просто не применятся (см. LAYOUT.md §1).

## Few-shot (CSS → класс → HTML)

- `display: flex;` → `.display--flex` → `<div class="display--flex">`
- `display: none;` → `.display--none` → `<div class="display--none">`
- `color: var(--prime);` → `.color--prime` → `<div class="color--prime">`
- `margin-block-start: 1em;` → `.margin-block-start--md` (`md` = `--size--4` = 1em) → `<div class="margin-block-start--md">`
- `padding-inline: 2em;` → `.padding-inline--l4` → `<div class="padding-inline--l4">`
- `d_l_display: flex;` → `.d_l_display--flex` (десктоп, альбомная) → `<div class="d_l_display--flex">`
- `m_p_position: sticky;` → `.m_p_position--sticky` (мобильный, портретная) → `<div class="m_p_position--sticky">`
- `color: red;` → `.color` + `style="--color: red"` (Ф3) → `<div class="color" style="--color: red">`
- `table-layout: auto;` (везде одинаково) → `.table-layout--auto` (одна Ф1, не 4×Ф2) → `<table class="table-layout--auto">`
- `display: grid; grid-template-columns: 16em 1fr;` → `.display--grid` + `.grid-template-columns` (Ф3) → `<div class="display--grid" style="--grid-template-columns: 16em 1fr">`
- ссылка `display:block; text-decoration:none; border-radius:unset; border-block-start-style:dashed; border-color:negative--mute; :hover background:positive--mute` → `.display--block text-decoration--none border-radius--unset border-block-start-style--dashed border-color--negative--mute background-color--positive--mute:hover` → `<a class="display--block text-decoration--none border-radius--unset border-block-start-style--dashed border-color--negative--mute background-color--positive--mute:hover">`
- `border-end-end-radius: 0;` (конечный угол без скругления) → `.border-end-end-radius--unset` (ось×край: `block`/`inline` × `start`/`end`) → `<div class="border-end-end-radius--unset">`
- `grid-template-columns: 2` (на десктоп-портрет → 1) → `.grid-template-columns--2` + `d_p_grid-template-columns--1` (Ф2 только где значение отличается) → `<div class="grid-template-columns--2 d_p_grid-template-columns--1">`

Когда готового класса нет (ни в [index.md](index.md), ни в [REFERENCE-UTILITIES.md](REFERENCE-UTILITIES.md)):

```html
<div class="background-image" style="--background-image: linear-gradient(135deg, transparent, var(--positive--dark))">...</div>
<div class="min-block-size" style="--m_p_min-block-size: 100dvb">...</div> <!-- Ф3 + префикс: только мобильный, портретная -->
```

## Элементы

У каждого элемента есть **базовые значения** (см. [REFERENCE-ELEMENTS.md](REFERENCE-ELEMENTS.md)) — перед переопределением узнай базовое.
Стандартные HTML-теги уже стилизованы — класс не нужен (`<button>`, `<input>`, `<table>`, `<a>`, `<h1>`–`<h6>` ...).
Кастомные: `<e-badge>`, `<e-icon>`, `<e-popover>`, `<e-message>`, `<e-truncate>`, `<e-tag>`, `<e-group>`, `<e-line>` (и дубликат `.element--{name}` для React/legacy). Один селектор на ноду.

## Запреты

Только логические свойства (`inline-size`, `block-size`, `margin-block`, `padding-inline`, `inset-*`), не физические (`width`, `margin-top` ...).
Физические многозначные сокращения (`border-style: a b c d`, `margin: 1em 2em`, `padding: ...`) запрещены — только логические utility-классы; сырую инъекцию физических значений через `style` не использовать.
Без `!important`. Один класс = одно свойство. Прямые `--size--*` в вёрстке не использовать (метрики — через модификаторы `s3 s2 s1 md l1 l2 l3 l4`).

## Ссылки (локально)

[index.md](index.md) словарь · [LAYOUT.md](LAYOUT.md) гайд вёрстки · [variables.md](variables.md) переменные · [REFERENCE-UTILITIES.md](REFERENCE-UTILITIES.md) · [REFERENCE-ELEMENTS.md](REFERENCE-ELEMENTS.md) · [S4.md](S4.md)
