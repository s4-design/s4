# Вёрстка утилитами С4 (краткий гайд для ИИ)

Дополняет [`AGENT.md`](AGENT.md) (там — формулы и алгоритм вывода класса). Здесь — фундаментальные правила адаптива и готовые паттерны. Работает офлайн: только файлы папки `s4/`, словарь имён — [`index.md`](index.md).

## 1. Адаптив без брейкпоинтов (фундаментально)

- Три **независимых, неизменных** раскладки: `desktop`, `tablet`, `mobile`. Каждая грузит свой CSS-файл (`s4/css/<device>/`). Нет mobile-first, нет «`md:` перебивает desktop».
- Устройство всегда остаётся самим собой. Ты не «адаптируешь под экран» — ты задаёшь три отдельных макета.
- **Ф2 = префикс устройства + ориентации, а НЕ медиа-запрос.** Перевод привычки: Tailwind `md:` → `d_p_` (десктоп, портретная), `lg:` → `d_l_` (десктоп, альбомная).
- Ф2 нужна только если значение **отличается от базового** на этом устройстве; одинаково везде — одна Ф1.

## 2. Переменные

- Все переменные (палитра, размеры, типографика) — в `config.css` → `:scope {}` для каждого устройства + 2 пресета (light/dark).
- Для утилитарной вёрстки используй пресет-переменные напрямую в Ф3: `var(--positive--mute)`, `var(--size--4)` и т.п.
- Цвет = **акцент × оттенок**: акценты `prime` / `second` / `positive` / `negative` / `success` / `danger`; оттенки `base` / `light` / `dark` / `mute`. Модификатор класса: `--{accent}--{shade}` (напр. `background-color--positive--mute`, `:hover` → `background-color--positive--dark:hover`).
- Элементный API позже уточнит, какие переменные «принадлежат» элементам; для утилитарной вёрстки сейчас это не нужно.

## 3. Много-значные свойства

- Используй логические свойства. Общий класс перебивается частным (каскад, как в CSS): задал всем углам `border-radius--md`, один поменял `border-end-end-radius--unset` — не перечисляй все по отдельности.
- Сокращения раскрывай в лонгхенды: `flex` → `flex-grow` / `flex-shrink` / `flex-basis`; `inset` → `inset-block` / `inset-inline`; `gap` → `row-gap` / `column-gap` (или `gap--*`); `place-*` → `align-*` / `justify-*`.
- Нет готового класса и нет активатора → Ф3 со значением; значением может быть любой CSS: `clamp()`, `calc()`, пресет-переменная.

## 4. Псевдоэлементы

Пока в словаре нет классов для `::before` / `::after` (появятся позже, вид `display--none::before`). Сейчас крайне редко — при необходимости ИИ создаёт частный случай сам; в базовой вёрстке не используй.

## 5. Cookbook (готовые сниппеты)

### Центрированный блок с макс. шириной
```html
<div class="margin-inline--auto inline-size--100" style="--max-inline-size: 72em">…</div>
```

### Сетка колонок (16em + 1fr)
```html
<div class="display--grid" style="--grid-template-columns: 16em 1fr">…</div>
```

### Карточная колонка (flex, отступы, дети БЕЗ комбинаторов)
```html
<div class="display--flex flex-direction--column gap--md">
  <div class="padding-inline--l4 padding-block--s1 background-color--positive--mute">…</div>
  <div class="padding-inline--l4 padding-block--s1 background-color--positive--mute">…</div>
</div>
```
Правило: нет селекторов вида `.parent > *`. Утилиты навешивай на каждый дочерний узел. `:has()` появится позже.

### Hover-переход цвета
```html
<button class="background-color--positive--mute background-color--positive--dark:hover">Кнопка</button>
```
Анимация идёт от пресет-переменных `--transition-duration` / `--transition-timing-function` (в `config.css`). Per-element transition-утилит в словаре **нет** — не выдумывай `.transition`.

### Соотношение сторон
```html
<div class="aspect-ratio--1/1">…</div>
<div class="d_l_aspect-ratio--16/9">…</div> <!-- адаптивный модификатор -->
```
Нет нужного значения → Ф3 `style="--aspect-ratio: 3/2"`.

### Адаптив вне словаря (Ф2 + Ф3)
```html
<div class="min-block-size" style="--m_p_min-block-size: 100dvb">…</div>
```
Префикс устройства + ориентации ставится в имя переменной.

### Сброс радиуса одного угла
```html
<div class="border-radius--md border-end-end-radius--unset">…</div>
```

## 6. Ссылки

- [`AGENT.md`](AGENT.md) — формулы и алгоритм вывода класса.
- [`index.md`](index.md) — словарь всех классов (имя → свойство).
- `config.css` (desktop / mobile / tablet + пресеты) — `:scope {}` все переменные.
- [`REFERENCE-ELEMENTS.md`](REFERENCE-ELEMENTS.md) — базовые значения элементов (когда будет API).
