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
| `class` | `negative`, `prime`, `second`, `success`, `danger` (без класса — нейтральный) |

**Размер:** через утилиты `font-size--*` (`s3`…`l4`) — размер якоря, масштабирует бейдж.

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

---

## Mutated-элементы

*Будут добавлены по мере создания страниц.*
