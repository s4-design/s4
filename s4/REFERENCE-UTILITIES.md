# Справочник утилит С4

> См. также: [S4.md](S4.md), [REFERENCE-ELEMENTS.md](REFERENCE-ELEMENTS.md)

## Список: Свойство и их модификаторы

| Свойство | Модификаторы |
|---|---|
| `align-content` | `baseline`, `space-around`, `space-between`, `center`, `end`, `space-evenly`, `start`, `stretch` |
| `align-items` | `anchor-center`, `baseline`, `center`, `end`, `start`, `stretch` |
| `align-self` | `baseline`, `center`, `end`, `start`, `stretch` |
| `aspect-ratio` | `1/1`, `4/3`, `3/4`, `16/9`, `9/16`, `16/10`, `10/16`, `21/9`, `9/21`, `32/9`, `9/32` |
| `backdrop-filter` | |
| `background-attachment` | `scroll`, `fixed`, `local` |
| `background-clip` | `border-box`, `padding-box`, `content-box`, `text` |
| `background-color` | `transparent`, все цвета из пресета (white, black, white--01...09, black--01...09, positive, negative, prime, second, success, danger + их light/dark/mute) |
| `background-image` | |
| `background-origin` | `border-box`, `content-box`, `padding-box` |
| `background-position` | `left`, `top-left`, `left-top`, `top`, `top-right`, `right-top`, `right`, `bottom-right`, `right-bottom`, `bottom`, `bottom-left`, `left-bottom`, `center` |
| `background-repeat` | `repeat-x`, `repeat-y`, `space`, `round`, `no-repeat` |
| `background-size` | `cover`, `contain` |
| `block-size` | `25`, `50`, `75`, `100`, `fit-content`, `min-content`, `max-content`, `stretch`, `unset` |
| `border-block-end-style` | `dotted`, `dashed`, `solid`, `none` |
| `border-block-start-style` | `dotted`, `dashed`, `solid`, `none` |
| `border-collapse` | `collapse`, `separate` |
| `border-color` | `transparent`, все цвета из пресета (white, black, white--01...09, black--01...09, positive, negative, prime, second, success, danger + их light/dark/mute) |
| `border-end-end-radius` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `oval`, `pill`, `unset` |
| `border-end-start-radius` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `oval`, `pill`, `unset` |
| `border-inline-end-style` | `dotted`, `dashed`, `solid`, `none` |
| `border-inline-start-style` | `dotted`, `dashed`, `solid`, `none` |
| `border-radius` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `oval`, `pill`, `unset` |
| `border-spacing` | |
| `border-start-end-radius` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `oval`, `pill`, `unset` |
| `border-start-start-radius` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `oval`, `pill`, `unset` |
| `border-style` | `dotted`, `dashed`, `solid`, `none` |
| `border-width` | `thin`, `medium`, `thick` |
| `box-shadow` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `box-sizing` | `border-box`, `content-box` |
| `break-after` | |
| `break-before` | |
| `break-inside` | |
| `color` | `transparent`, все цвета из пресета (white, black, white--01...09, black--01...09, positive, negative, prime, second, success, danger + их light/dark/mute) |
| `column-count` | `auto` |
| `column-fill` | `auto`, `balance` |
| `column-gap` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `column-rule-color` | |
| `column-rule-style` | `dotted`, `dashed`, `solid`, `none` |
| `column-rule-width` | `thin`, `medium`, `thick` |
| `column-span` | `auto`, `none` |
| `column-style` | (алиас column-rule-style, только Formula 3) |
| `column-width` | |
| `cursor` | |
| `direction` | `ltr`, `rtl` |
| `display` | `inline`, `block`, `flow-root`, `flex`, `grid`, `inline-block`, `inline-flex`, `inline-grid`, `contents`, `none` |
| `filter` | |
| `flex` | `none`, `initial`, `auto` |
| `flex-basis` | `max-content`, `min-content`, `fit-content` |
| `flex-direction` | `row`, `row-reverse`, `column`, `column-reverse` |
| `flex-grow` | `0`, `1` |
| `flex-shrink` | `0`, `1` |
| `flex-wrap` | `wrap`, `wrap-reverse`, `nowrap`, `balance` |
| `float` | `inline-start`, `inline-end`, `none` |
| `font-size` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4` |
| `font-weight` | `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `unset` |
| `gap` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `grid-auto-columns` | |
| `grid-auto-flow` | `column`, `row`, `dense`, `row-dense`, `column-dense` |
| `grid-auto-rows` | |
| `grid-column` | `span-1`...`span-12`, `full` |
| `grid-column-end` | `1`...`12` |
| `grid-column-start` | `1`...`12` |
| `grid-row` | `span-1`...`span-12`, `full` |
| `grid-row-end` | `1`...`12` |
| `grid-row-start` | `1`...`12` |
| `grid-template-areas` | |
| `grid-template-columns` | `1`...`12`, `none`, `subgrid` |
| `grid-template-rows` | `1`...`12`, `none`, `subgrid` |
| `inline-size` | `25`, `50`, `75`, `100`, `fit-content`, `min-content`, `max-content`, `stretch`, `unset` |
| `inset` | |
| `inset-block-end` | `0`, `50`, `100` |
| `inset-block-start` | `0`, `50`, `100` |
| `inset-inline-end` | `0`, `50`, `100` |
| `inset-inline-start` | `0`, `50`, `100` |
| `justify-content` | `space-around`, `space-between`, `center`, `end`, `space-evenly`, `start`, `stretch` |
| `justify-items` | `center`, `end`, `start`, `stretch` |
| `justify-self` | `center`, `end`, `start`, `stretch` |
| `letter-spacing` |  |
| `line-height` | `0`, `1`, `unset` |
| `margin-block` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `auto`, `unset` |
| `margin-block-end` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `auto`, `unset` |
| `margin-block-start` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `auto`, `unset` |
| `margin-inline` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `auto`, `unset` |
| `margin-inline-end` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `auto`, `unset` |
| `margin-inline-start` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `auto`, `unset` |
| `max-block-size` | `25`, `50`, `75`, `100`, `fit-content`, `min-content`, `max-content`, `stretch`, `unset` |
| `max-inline-size` | `25`, `50`, `75`, `100`, `fit-content`, `min-content`, `max-content`, `stretch`, `unset` |
| `min-block-size` | `25`, `50`, `75`, `100`, `fit-content`, `min-content`, `max-content`, `stretch`, `unset` |
| `min-inline-size` | `25`, `50`, `75`, `100`, `fit-content`, `min-content`, `max-content`, `stretch`, `unset` |
| `object-fit` | `contain`, `cover`, `fill`, `none` |
| `object-position` | `top`, `bottom`, `left`, `right`, `center` |
| `order` | `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `unset` |
| `outline-color` | `transparent`, все цвета из пресета (white, black, white--01...09, black--01...09, positive, negative, prime, second, success, danger + их light/dark/mute) |
| `outline-offset` | |
| `outline-style` | `dotted`, `dashed`, `solid`, `none` |
| `outline-width` | `thin`, `medium`, `thick` |
| `overflow` | `auto`, `hidden`, `visible`, `scroll`, `clip` |
| `overflow-block` | `auto`, `hidden`, `visible`, `scroll`, `clip` |
| `overflow-inline` | `auto`, `hidden`, `visible`, `scroll`, `clip` |
| `overflow-wrap` | `normal`, `break-word`, `anywhere` |
| `padding-block` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `padding-block-end` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `padding-block-start` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `padding-inline` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `padding-inline-end` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `padding-inline-start` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `pointer-events` | `none` |
| `position` | `static`, `relative`, `absolute`, `fixed`, `sticky` |
| `resize` | `both`, `horizontal`, `vertical`, `none` |
| `rotate` | |
| `row-gap` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `scrollbar-color` | `auto` |
| `scrollbar-width` | `auto`, `thin`, `none` |
| `scale` | |
| `table-layout` | `auto`, `fixed` |
| `text-align` | `start`, `center`, `end`, `justify` |
| `text-decoration` | `none` |
| `text-decoration-color` | |
| `text-decoration-line` | |
| `text-decoration-style` | |
| `text-decoration-thickness` | |
| `text-shadow` | `s3`, `s2`, `s1`, `md`, `l1`, `l2`, `l3`, `l4`, `unset` |
| `text-transform` | `lowercase`, `uppercase`, `capitalize` |
| `text-wrap` | `wrap`, `nowrap`, `balance` |
| `transform` | |
| `translate` | |
| `user-select` | `none`, `auto`, `text`, `all` |
| `vertical-align` | `baseline`, `sub`, `super`, `top`, `middle`, `bottom`, `text-bottom`, `text-top` |
| `white-space` | `normal`, `nowrap`, `pre`, `pre-wrap`, `pre-line`, `preserve`, `break-spaces`, `unset` |
| `word-break` | `normal`, `break-all`, `keep-all`, `auto-phrase`, `unset` |
| `writing-mode` | `vertical-rl`, `vertical-lr` |
| `z-index` | `-1`, `0`, `1` |
| `zoom` | |

## Формула 1 — базовый слой (base)

Классы без префикса устройства и ориентации. Всегда активны на всех устройствах. Расположены в `utilities.css`.

Делятся на два типа:
- **base** — жёсткие значения: `.display--flex { display: flex }`
- **xtra** — значения из пресета: `.padding--md { padding: var(--padding--md) }`

Если нужного модификатора нет в таблице — используй класс-активатор `.property` (Формула 3) вместо Формулы 1.

## Формула 2 — адаптивная (device-специфичная)

Те же модификаторы, что в Формуле 1, но с префиксом устройства и ориентации.

| Префикс | Устройство | Ориентация | Файл |
|---|---|---|---|
| `d_l_` | desktop | landscape | `desktop/landscape-utilities.css` |
| `d_p_` | desktop | portrait | `desktop/portrait-utilities.css` |
| `t_l_` | tablet | landscape | `tablet/landscape-utilities.css` |
| `t_p_` | tablet | portrait | `tablet/portrait-utilities.css` |
| `m_l_` | mobile | landscape | `mobile/landscape-utilities.css` |
| `m_p_` | mobile | portrait | `mobile/portrait-utilities.css` |

Пример: `d_l_display--flex`, `m_p_padding-block--md`, `t_l_font-size--l1`.

## Формула 3 — активатор (переменная)

Для любого свойства можно использовать класс `.property` — он подключает свойство к CSS-переменной:

- в `utilities.css`: `.property { property: var(--property) }`
- в `{device}/{orientation}-utilities.css`: `.property { property: var(--{device}_{orientation}_property, var(--property)) }`

Значение задаётся через `style` как CSS-переменная:

```html
<div class="color" style="--color: var(--prime)">текст</div>
<div class="d_l_color" style="--d_l_color: var(--prime)">текст</div>
```

Также для любого свойства из таблицы можно использовать класс-активатор `.property` (Формула 3), если нужного модификатора нет в списке. Например, `display` есть с модификатором `block`, но если нужно `display: inline-table` — используй `.display` + `style="--display: inline-table"`.

### Если свойства нет в таблице

Свойства, отсутствующего в таблице, не существует в ядре. Используй инлайн-стиль напрямую — но только для логических CSS-свойств (`block-size`, `margin-inline` и т.п.); физические свойства (`width`, `height`, `margin-top`, `padding-left` …) запрещены (см. AGENT.md, «Запреты»). Сообщи об этом пользователю.

```html
<div style="clip-path: circle(50%)">...</div>
```

---

## Префиксы `{device}_{orientation}_`

### 1. Анатомия

```
{device}_{orientation}_{property}--{modifier}
    ↓          ↓            ↓          ↓
    d          l         display      flex
```

Префикс `d_l_` — буква устройства + подчёркивание + буква ориентации + подчёркивание. Всё после второго подчёркивания — имя класса.

Для Формулы 3 то же самое, но без модификатора:

```
{device}_{orientation}_{property}
    ↓          ↓           ↓
    d          l         color
```

| Префикс | Устройство | Ориентация |
|---------|-----------|------------|
| `d_l_` | desktop | landscape |
| `d_p_` | desktop | portrait |
| `t_l_` | tablet | landscape |
| `t_p_` | tablet | portrait |
| `m_l_` | mobile | landscape |
| `m_p_` | mobile | portrait |

### 2. Где используется

**В классах (Формула 2).** Префикс — часть имени класса. Класс `d_l_display--flex` существует только в `desktop/landscape-utilities.css`. На мобильном этого класса в CSS нет — правило не сработает.

```html
<div class="d_l_display--flex  m_p_display--none">...</div>
<!-- На десктопе landscape: flex. На мобильном portrait: none -->
```

**В CSS-переменных (Формула 3).** Класс-активатор `.display` один для всех устройств, но цепочка `var()` подставляет нужную переменную. Префикс — в имени переменной:

```css
/* desktop/landscape-utilities.css */
.display { display: var(--d_l_display, var(--display)); }

/* mobile/portrait-utilities.css */
.display { display: var(--m_p_display, var(--display)); }
```

```html
<div class="display" style="--d_l_display: flex; --m_p_display: none">...</div>
```

Если переменная с префиксом не задана ни в `style`, ни в `config.css` — срабатывает общая `var(--display)`. Приоритет: `--d_l_display` → `--display`.

### 3. Когда какой подход брать

| Сценарий | Берёшь | Пример |
|----------|--------|--------|
| Значение разное на разных устройствах | **Ф2** — префикс в классе | `d_l_font-size--l1  m_p_font-size--md` |
| Значение из пресета, может различаться по устройству | **Ф3** — префикс в переменной | `class="padding" style="--d_p_padding: 2em; --m_p_padding: 1em"` |
| Значение одинаково на всех устройствах | **Ф1** — без префикса | `display--flex` |
| Значение из пресета, устройство неважно | **Ф3** с общей переменной | `class="color"` (пресет сам решит `--color`) |

### 4. Как работает под капотом

`S4()` при старте:

1. Определяет устройство (`desktop`/`tablet`/`mobile`) и ориентацию (`landscape`/`portrait`)
2. Добавляет на `<html>` классы: `<html class="desktop landscape">`
3. Загружает `utilities.css` — Ф1 и Ф3 (базовый слой, всегда активен)
4. Загружает `desktop/landscape-utilities.css` — только для текущей комбинации. Классы Ф2 с другими префиксами не загружены — не работают
5. Загружает `desktop/config.css` — значения пресета для этого устройства. `--color` на десктопе и `--color` на мобильном могут различаться
