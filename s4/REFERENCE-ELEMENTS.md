# Справочник элементов S4 для AI-агента

> См. также: [S4.md](S4.md), [REFERENCE-UTILITIES.md](REFERENCE-UTILITIES.md)

Описание кастомных (`<e-*>`) и мутированных (HTML) элементов С4: теги, атрибуты, структура, ARIA, правила использования.

---

## Класс-аналоги и вес

Каждый элемент С4 можно разметить двумя способами:

1. **Кастомный тег** — `<e-message>`, `<e-body>`, `<e-group>`.
2. **Класс-аналог на обычном теге** — `.element--message`, `.element--body`, `.element--group`, `.element--button`.

Оба способа стилизуются одинаково (селекторы в SCSS перечислены через запятую: `e-group, .element--group { … }`).

**Класс-аналог применяется, когда нужно совместить два элемента:** тег остаётся семантическим, а класс придаёт ему визуальный вид другого:

```html
<label class="element--button"><input type="radio"> Переключатель</label>
```

`label` семантически (кликабельная подпись для `<input>`), а выглядит как кнопка.

**Вес элемента** (специфичность CSS-селекторов):

| Разметка | Вес |
|----------|-----|
| Простой тег | `0.0.1` |
| Класс-аналог | `0.1.0` |
| Совмещённый `<label class="element--button">` | `0.1.1` |

**Правило композиции.** Если внутри контейнера есть совмещённые дети (класс-аналог даёт им вес `0.1.1`), родитель **должен иметь вес выше**, чтобы покрывать детей и применять к ним изменения внешнего вида (углы, отступы). Для этого родителя усиливают его классом-аналогом и утилитами:

```html
<e-group class="element--group display--inline-grid grid-auto-flow--row" role="group">
    <label class="element--button"><input type="radio" checked>Переключатель</label>
    <label class="element--button"><input type="radio">Переключатель</label>
    <label class="element--button"><input type="radio">Переключатель</label>
</e-group>
```

Утилиты (`display--inline-grid`, `grid-auto-flow--row`) объединяют детей в одну полосу — убирают углы и отступы.

**Не усиливают родителя**, когда дети — простые элементы без класса (только теги). Веса `0.0.1` хватает, класс родителя лишний:

```html
<e-group class="display--inline-grid grid-auto-flow--row" role="group">
    <button>Кнопка</button>
    <button>Кнопка</button>
    <button>Кнопка</button>
</e-group>
```

**Критерий решения:** усиливать контейнер класс-аналогом и утилитами — только если в нём есть совмещённые дети с класс-аналогами. Если все дети простые — не усиливать.

**Соответствие элементов и класс-аналогов:**

| Кастомный тег / тег | Класс-аналог |
|---------------------|--------------|
| `<e-message>` | `.element--message` |
| `<e-body>` | `.element--body` |
| `<e-badge>` | `.element--badge` |
| `<e-group>` | `.element--group` |
| `<e-icon>` | `.element--icon` |
| `<e-line>` | `.element--line` |
| `<e-tag>` | `.element--tag` |
| `<e-truncate>` | `.element--truncate` |
| `<e-popover>` | `.element--popover` |
| `<button>` | `.element--button` |
| `<h1>`…`<h6>` | `.element--h1`…`.element--h6` |
| `<sub>` / `<sup>` | `.element--sub` / `.element--sup` |

---

## Гравитация (масштабирование)

Все метрики С4 заданы в `em`, поэтому **любой элемент** масштабируется через утилиты размера шрифта `font-size--s3`…`font-size--l4` (размер якоря). Изменение `font-size` тянет за собой все `em`-размеры элемента: отступы, углы, бордюры, иконки, типографику. Работает для 100% элементов — created и mutated.

**Пример:**

```html
<e-badge class="font-size--l1" role="status">крупный бейдж</e-badge>
<button class="font-size--s1">Компактная кнопка</button>
```

---

## Created-элементы

### `<e-message>`

**Класс-аналог:** `.element--message` на `<div>`; тело — `.element--body` на `<div>`.

**Назначение:** контейнер для информационных сообщений.

**Атрибуты:**

| Атрибут | Значения |
|---------|----------|
| `class` | `negative`, `prime`, `second`, `success`, `danger` (без класса — нейтральный) |
| `role` | `status` (по умолч.), `alert` (только для danger) |

**Дочерние элементы:**

```
<e-message role="status">
    <header>   опционально
    <e-body>   обязательно (тело сообщения)
    <footer>   опционально
</e-message>
```

- `<header>` — заголовок сообщения.
- `<e-body>` — тело: контент **всегда** обёрнут в `<e-body>`, никаких `<p>`/`<div>` напрямую.
- `<footer>` — подвал (кнопки действия).

**Цветовые акценты:**

| Класс | Role |
|-------|------|
| _(нет)_ | `status` |
| `negative` | `status` |
| `prime` | `status` |
| `second` | `status` |
| `success` | `status` |
| `danger` | `alert` |

**Правила:**

- Заголовок и подвал опциональны; если есть хотя бы один — сообщение считается составным.
- `<e-body>` внутри `<e-message>` обязателен. Текст напрямую внутри `<e-message>` — ошибка.
- `danger` → `role="alert"`, все остальные → `role="status"`.
- Для ссылок на MDN на страницах других элементов: `<e-message class="second" role="status">`.

**Пример:**

```html
<e-message role="status">
    <header>Заголовок</header>
    <e-body>Тело сообщения.</e-body>
    <footer>
        <button>Кнопка</button>
    </footer>
</e-message>
```

### `<e-badge>`

**Класс-аналог:** `.element--badge` (на `<span>`).

**Назначение:** компактная неинтерактивная статусная метка (счётчик, пометка, статус).

**Атрибуты:**

| Атрибут | Значения |
|---------|----------|
| `class` | `negative`, `prime`, `second`, `success`, `danger`, (без класса — нейтральный) |

**Role:** `status` (всегда).

**Правила:**
- Неинтерактивен — только отображение. Не использовать как кнопку или ссылку.
- Цвета совпадают с цветовой схемой С4 (6 вариантов).
- Можно использовать как кастомный тег `<e-badge>`, так и класс `.element--badge` на `<span>`.

**Пример:**

```html
<e-badge role="status">новый</e-badge>
<e-badge class="prime" role="status">prime</e-badge>
<e-badge class="font-size--l1" role="status">крупный</e-badge>
<span class="element--badge success" role="status">успех</span>
```

### `<e-group>`

**Класс-аналог:** `.element--group` (на `<div>`).

**Назначение:** группировка смежных интерактивных элементов (кнопки, радиокнопки, флажки) в единый блок с углами и разделителями. Также применяется к блокам деталей (`details`), сообщениям (`e-message`) и т.п.

**Атрибуты:**

| Атрибут | Значения |
|---------|----------|
| `class` | направление (см. ниже), опционально `element--group`, `justify-content--*` |
| `role` | `group` (кнопки/деталей), `radiogroup` (для группы переключателей) |

**Направление** задаётся парой утилит `display--*` + ось потока:

| Направление | Flex | Grid |
|-------------|------|------|
| Горизонтальная | `display--inline-flex flex-direction--row` | `display--inline-grid grid-auto-flow--column` |
| Горизонтальная (бл.) | `display--flex flex-direction--row` | `display--grid grid-auto-flow--column` |
| Вертикальная | `display--inline-flex flex-direction--column` | `display--inline-grid grid-auto-flow--row` |
| Вертикальная (бл.) | `display--flex flex-direction--column` | `display--grid grid-auto-flow--row` |

Используется как `display--inline-*` (inline-вариант), так и блочный `display--flex` / `display--grid` (тянется на всю ширину; с `justify-content--center` для центрирования).

**Дочерние элементы:** смежные элементы-компоненты (`button`, `label` с флажком/радиокнопкой, `details`) и `<e-line role="separator">` между ними. Простые `<div>`-ячейки применяются редко.

**Правила:**
- Направление задаётся утилитами `display`/`flex-direction`/`grid-auto-flow`, а не самим тегом или тэгом `<e-group>`.
- Разделители `<e-line role="separator">` ставятся **между** элементами, без замыкающего после последнего.
- При совмещённых детях с класс-аналогами (вес `0.1.1`) родителя усиливают класс-аналогом `element--group` и утилитами (см. «Класс-аналоги и вес»).
- Для `radiogroup` группа: `class="element--group display--inline-grid grid-auto-flow--row"` + `role="radiogroup"`.

**Пример (группа кнопок):**

```html
<e-group class="display--inline-flex flex-direction--row" role="group">
    <button>Кнопка 1</button>
    <button>Кнопка 2</button>
    <button>Кнопка 3</button>
</e-group>
```

### `<e-icon>`

**Класс-аналог:** `.element--icon` (на `<span>`).

**Назначение:** инлайн-иконка (SVG или изображение), масштабируемая размером шрифта.

**Атрибуты:**

| Атрибут | Значения |
|---------|----------|
| `style` | `--image: url(...)` (обязателен) |
| `aria-hidden` | `true` (для декоративных иконок) |
| `uncheck` | флаг состояния «не выбран» (для флажков/переключателей) |
| `check` | флаг состояния «выбран» (для флажков/переключателей) |
| `class` | утилиты `font-size--*` (размер), `color--*` (цвет), `background-color--*` (фон) |

**Правила:**
- Цвет — через `color--*`; фон — через `background-color--*`.
- Декоративная иконка (без смысла для ассистивных технологий) — `aria-hidden="true"`.
- Для визуального состояния флажка/переключателя — `uncheck`/`check` (обе иконки кладутся рядом, видимость переключает пресет).

**Пример:**

```html
<e-icon aria-hidden="true" style="--image: url(/icons/icon.svg);"></e-icon>
<e-icon class="font-size--l2 color--prime" style="--image: url(/icons/icon.svg)" aria-hidden="true"></e-icon>
<span class="element--icon font-size--md" style="--image: url(/icons/icon.svg)"></span>
```

### `<e-line>`

**Класс-аналог:** `.element--line` (на `<div>`).

**Назначение:** декоративный разделитель (линия).

**Атрибуты:**

| Атрибут | Значения |
|---------|----------|
| `role` | `separator` (внутри группы), опционально |

**Правила:**
- Может существовать самостоятельно и независимо (разделитель контента, примеры на страницах и т.п.).
- Направление (горизонтальная/вертикальная) внутри группы наследуется; у самостоятельного — задаётся контекстом или утилитами или наследуется.
- Чаще всего — между элементами внутри `<menu>` или `<e-group>`.

**Пример:**

```html
<e-group class="display--inline-grid grid-auto-flow--row gap--md" role="group">
    <div>Ячейка</div>
    <e-line role="separator"></e-line>
    <div>Ячейка</div>
</e-group>
```

### `<e-popover>`

**Класс-аналог:** `.element--popover` (на `<div>`).

**Назначение:** всплывающий блок с триггером и содержимым.

**Атрибуты:**

| Атрибут | Значения |
|---------|----------|
| `mode` | `focus` (по фокусу), `hover` (по наведению) |
| `position` | комбинация «блок × инлайн» (см. таблицу ниже) |

**Позиции** (`position`) — пара значений «блок × инлайн»:

| Значение | Позиция |
|----------|---------|
| `center` | по центру триггера |
| `block-start inline-start` | сверху, у начала строки |
| `block-start center` | сверху, по центру |
| `block-start inline-end` | сверху, у конца строки |
| `inline-start block-start` | слева, сверху |
| `inline-start center` | слева, по центру |
| `inline-start block-end` | слева, снизу |
| `inline-end block-start` | справа, сверху |
| `inline-end center` | справа, по центру |
| `inline-end block-end` | справа, снизу |
| `block-end inline-start` | снизу, у начала строки |
| `block-end center` | снизу, по центру |
| `block-end inline-end` | снизу, у конца строки |

Первое слово — ось основного раскрытия (`block-start`/`block-end` либо `inline-start`/`inline-end`), второе — выравнивание на перпендикулярной оси (`inline-start`/`center`/`inline-end` либо `block-start`/`center`/`block-end`). `center` — единственная позиция из одного слова.

**Структура:**

```
<e-popover mode="..." position="...">
    <button>                //триггер
        текст
    </button>
    <e-body role="region">  //содержимое
        содержимое
    </e-body>
</e-popover>
```

**Правила:**
- Триггер — `<button>` первым ребёнком (текст оборачивают `<e-truncate>`).
- Содержимое — `<e-body role="region">` вторым ребёнком.
- `position` — пара «блок × инлайн» из таблицы выше.

**Пример:**

```html
<e-popover mode="focus" position="block-end inline-end">
    <button title="Кнопка">
        <e-icon aria-hidden="true" style="--image: url(/icons/icon.svg);"></e-icon>
        <e-truncate>Меню</e-truncate>
    </button>
    <e-body role="region">
        <menu class="max-inline-size" style="--max-inline-size: 16em;" type="context">
            <li><button class="justify-content--start">Пункт</button></li>
        </menu>
    </e-body>
</e-popover>
```

### `<e-truncate>`

**Класс-аналог:** `.element--truncate` (на `<p>`/`<div>`).

**Назначение:** однострочный текст с сокращением многоточием при переполнении.

**Атрибуты:**

| Атрибут | Значения |
|---------|----------|
| `class` | `display--block` (при необходимости) |
| `title` | полный текст (для класс-аналога) |

**Правила:**
- Обрезает в одну строку; ограничение ширины — от родителя.
- Для скрытого полного текста используется `title`.

**Пример:**

```html
<e-truncate class="display--block">Длинный текст…</e-truncate>
<p class="element--truncate" title="Полный текст">Длинный текст…</p>
```

---

## Mutated-элементы

*Будут добавлены по мере создания страниц.*
