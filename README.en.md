<p align="right">
    <a href="README.ru.md">🇷🇺 Русский</a>
</p>

<div align="center">
    <img src="https://avatars.githubusercontent.com/u/184809488" alt="S4 logo" width="160">
    <h1>Interface System 4</h1>
</div>

<p>
    Code-oriented parametric system for building user interfaces.
</p>
<small>
    Interface System 4 (S4) is based on a unified relative size scale, where the visual characteristics of the interface are determined by a set of interconnected rules and inherited dependencies. The system builds from primitives to compositions, and the primary object of control is the scale of the environment, not an individual component.
</small>

<br>

## Contents

- [Philosophy](#philosophy)
- [AI-friendly](#ai-friendly)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [Utility classes — 3 formulas](#utility-classes--3-formulas)
- [Elements](#elements)
- [Themes](#themes)
- [Developer](#developer)
- [Acknowledgments](#acknowledgments)
- [License](#license)

<br>

## Philosophy

S4 is built differently from most UI frameworks (design systems, etc.) that center around components: Button, Card, Modal. Their values are independent: `font-size = 16px`, `padding = 12px`, `radius = 8px`.

In S4, the central object is the **scale**, not a component. All metrics are linked through a unified size scale:

```css
--size--4: 1em;                      /* base unit */

--font-size--md:     var(--size--4); /* = 1em */
--padding--md:       var(--size--4); /* = 1em */
--gap--md:           var(--size--4); /* = 1em */
--border-radius--md: var(--size--4); /* = 1em */
```

The system describes not values, but **dependencies** between them. Changing `font-size` on `html` changes not just one component, but the entire interface — because all sizes are tied to it via `em`.

Architectural invariants of S4:

1. **Three `@layer` layers** — elements, themes, utilities — with a fixed cascade order.
2. **Deterministic class formulas** — any class parses into a CSS rule without context.
3. **Size scale `--size--*`** — 33 named steps.
4. **Device-specific loading** — each `{device × orientation}` has its own CSS file.
5. **Themes** — `@scope ([theme=...])` with separate builds for each device.

<br>

## AI-friendly

S4's architecture makes it unusually convenient for generative models (LLMs).

### 1. Deterministic formulas

Any class follows a rigid pattern:

```
d_l_display--flex        → display: flex
m_p_position--sticky     → position: sticky
color                    → var(--d_l_color, var(--color))
```

AI recovers CSS from a class without context. The reverse — composing a class from CSS — is also unambiguous.

### 2. Semantic HTML

S4 styles standard HTML tags: `button`, `details`, `table`, `menu`, `input`, `select`, `a`, `h1`–`h6`. `<button>Save</button>` is more intelligible to an LLM than `<PrimaryActionButton />`.

### 3. Parametric scaling

AI doesn't need to manage each size individually. All metrics are tied to `font-size` through the unified `--size--*` scale. Changing one parameter recalculates the entire interface.

### 4. Minimum entropy

No component catalog with dozens of props. There's a combination of `{element} + {modifier}`. The solution space for AI is combinatorics, not searching through specialized components.

### 5. Predictable cascade

`elements → themes → utilities`. AI knows: a utility always overrides a theme, a theme overrides an element. No `!important` or speculative overrides.

<hr>

System 4 (S4) is an AI-friendly interface system. This is not AI-powered marketing but a consequence of the architecture: deterministic formulas + semantic HTML + flat modifier model.

<br>

## Quick start

### Installation

Download the [latest release](https://github.com/s4-design/s4/releases/download/0.1.0/v0.1.0.zip):

```
s4/
├── css/
│   ├── desktop/
│   │   ├── landscape.css
│   │   ├── portrait.css
│   │   └── themes.css
│   ├── mobile/
│   │   ├── landscape.css
│   │   ├── portrait.css
│   │   └── themes.css
│   ├── tablet/
│   │   ├── landscape.css
│   │   ├── portrait.css
│   │   └── themes.css
│   └── elements.css
└── js/
    ├── current-device.min.js
    └── s4.min.js
```

### Setup

```html
<html>
    <head>
        <script src="/s4/js/s4.min.js"></script>
        <script>S4()</script>
    </head>
    <body>
        <button>Button</button>
        <input type="text" placeholder="Input field" />
    </body>
</html>
```

`S4()` automatically:
- detects device (desktop/tablet/mobile) and orientation
- loads the corresponding CSS files
- detects theme via `prefers-color-scheme`
- sets `[theme=light]` or `[theme=dark]` attribute on `<html>`

For a custom theme, set `[theme="..."]` on `<html>` before calling `S4()`.

### Styles structure

CSS is split into three layers in order of increasing specificity:

```
@layer elements, themes, utilities;
```

1. **elements** — styling HTML elements and custom tags via `var(--*)`
2. **themes** — CSS variable values for each theme (`@scope ([theme=light])`, `@scope ([theme=dark])`)
3. **utilities** — utility classes (hard values + variables)

<br>

## Architecture

### Size system

All S4 metrics are built on the `--size--*` scale — 33 variables with a ¼em step:

```
Whole quarters:  --size--0: 0em … --size--8: 2em
Halves:          --size--0_5: 0.125em … --size--7_5: 1.875em
Quarters:        --size--0_25: 0.0625em … --size--7_75: 1.9375em
```

From this scale via `var()` all groups are derived:

| Group | Example |
|---|---|
| `--font-size--*` | `--font-size--md: var(--size--4)` |
| `--padding--*` | `--padding--md: var(--size--4)` |
| `--margin--*` | `--margin--md: var(--size--4)` |
| `--gap--*` | `--gap--md: var(--size--4)` |
| `--border-radius--*` | `--border-radius--md: var(--size--4)` |
| `--box-shadow--*` | `--box-shadow--s1: var(--size--1)` |

### Device and orientation

Each adaptive class and CSS variable is tied to a device + orientation combination via a prefix:

| Device | Orientation |
|---|---|
| `d_` — desktop | `l_` — landscape |
| `t_` — tablet | `p_` — portrait |
| `m_` — mobile | |

Prefix examples: `d_l_` (desktop-landscape), `m_p_` (mobile-portrait), `t_p_` (tablet-portrait).

JS framework (Svelte, React, Vue) is connected separately — S4 handles only CSS and environment detection.

Additionally, `themes.css` is built separately for each device, so `--d_l_color`
and `--m_p_color` can have different values within the same theme.

### Colors

Accent colors: `positive`, `negative`, `prime`, `second`, `success`, `danger`.

Each accent color has four shades:

| Variable | Description |
|---|---|
| `--{x}` | Base color |
| `--{x}--light` | Light |
| `--{x}--dark` | Dark |
| `--{x}--mute` | Semi-transparent |

Basics: `--white`, `--black`, `--white--01`…`--white--09`, `--black--01`…`--black--09` (10% transparency steps).

<br>

## Utility classes — 3 formulas

### Formula 1 — adaptive

```
.{prefix}_{property}--{modifier}
```

Style is tied to device and orientation.

| Class | CSS |
|---|---|
| `d_l_display--flex` | `display: flex` |
| `m_p_position--sticky` | `position: sticky` |
| `d_l_align-content--space-around` | `align-content: space-around` |

With pseudo-class: `d_l_background-color--transparent\:hover:hover`

With pseudo-element: `d_l_display--none\:\:before::before`

### Formula 2 — unified

```
.{property}--{modifier}
```

Style is the same across all devices and orientations.

| Class | CSS |
|---|---|
| `border--collapse` | `border-collapse: collapse` |
| `box-sizing--border-box` | `box-sizing: border-box` |

### Formula 3 — variable

```
.{property}
```

Connects a CSS property to the theme variable chain:

```css
color: var(--d_l_color, var(--color));
```

| Class | Result |
|---|---|
| `.color` | `color: var(--d_l_color, var(--color))` |
| `.background-color` | `background-color: var(--d_l_background-color, var(--background-color))` |

With pseudo-class: `.color\:hover:hover`

Without Formula 3 the property value would be hardcoded in CSS. Formula 3 makes it context-dependent — the device's theme decides its value. The same element can have a different `color` on desktop vs mobile, in light vs dark theme, without changing HTML.

<br>

## Elements

HTML elements and S4 custom tags are styled via CSS variables — no hardcoded values in `elements.css`. Each custom element `<e-{name}>` has a class-duplicate `.element--{name}` for environments without custom elements (React, legacy).

| Custom tag | Class duplicate | Description |
|---|---|---|
| `<e-badge>` | `.element--badge` | Badge |
| `<e-icon>` | `.element--icon` | Icon |
| `<e-popover>` | `.element--popover` | Popover |
| `<e-message>` | `.element--message` | Message |
| `<e-truncate>` | `.element--truncate` | Text truncation |
| `<e-group>` | `.element--group` | Grouping |
| `<e-line>` | `.element--line` | Divider |
| `<button>` | `.element--button` | Button |
| `<input>` | `.element--input` | Input field |
| `<select>` | `.element--select` | Select |
| `<details>` | `.element--details` | Details |
| `<menu>` | `.element--menu` | Menu |

**Rules:**

1. **One selector per node.** Use either `<e-{name}>` or `<tag class="element--{name}">`. Never both.
2. **Specificity.** Class `.element--name` (0,1,0,0) — on par with S4 utilities. Custom tag `<e-name>` (0,0,1,0) — base layer. Any utility class overrides element styles without `!important`.

Base HTML is already styled — classes are optional:

```html
<button>Click</button>
<input type="text" placeholder="Enter text" />
<table>
    <tr><th>Name</th><th>Value</th></tr>
    <tr><td>Parameter</td><td>Result</td></tr>
</table>
```

<br>

## Themes

S4 detects the theme via `prefers-color-scheme` and sets the `[theme]` attribute on `<html>`:

```css
@scope ([theme=light]) { /* light values */ }
@scope ([theme=dark])  { /* dark values */ }
```

**Device-specific themes:** each theme is built separately for each device — `desktop/themes.css`, `mobile/themes.css`, `tablet/themes.css`. `[theme=dark]` values on desktop may differ from `[theme=dark]` on mobile. Equality between devices is not guaranteed.

For device-independent styling, use Formula 2 or explicit values.

Theme switching at runtime is tracked automatically.

<br>

## Developer

**Artur Selimov**

- GitHub: [@am35a](https://github.com/am35a)
- Dribbble: [@am35a](https://dribbble.com/am35a)

<br>

## Acknowledgments

Thanks to [Matthew Hudson](https://github.com/matthewhudson) for [current-device](https://github.com/matthewhudson/current-device) — the tool that lets S4 be truly adaptive.

<br>

## License

CC BY-NC-SA. See the [LICENSE](./LICENSE) file for details (including additional consent for commercial use for citizens of the Russian Federation).
