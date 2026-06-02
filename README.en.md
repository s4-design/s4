<p align="right">
    <a href="README.md">🇷🇺 Русский</a>
</p>

<div align="center">
    <img src="https://avatars.githubusercontent.com/u/184809488" alt="S4 logo" width="160">
    <h1>Interface System 4<br><small><small>Source code</small></small></h1>
</div>

<p>
    Code-oriented system for building user interfaces.
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

<br>

<br>

<p align="right">
    <svg height="30" fill="currentColor" viewBox="0 0 3955 1184">
        <path d="M282.3 192.4h-40.2v-20.8h40.2c7.6 0 11.2 4 11.2 10.2 0 6-3 10.6-11.2 10.6m31.8-13c0-15.2-7.4-27.1-29-27.1h-63.6V244h20.6v-32.3H279c10.7 0 13.5 3 13.5 13.7v18.6H313v-21.9c0-11-3.9-17.3-12.5-19.5 9-3 13.5-11.7 13.5-23.2m222.8 36.2c0 17.8-9.7 28.5-31 28.5h-62.1v-19.4H505c7.9 0 11.2-3.3 11.2-9.1 0-5.6-3.3-8.7-11.2-8.7H468c-22.2 0-29.3-14-29.3-27.4 0-13.5 7.1-27.2 29.3-27.2h60.5v19.3H469q-9.8 0-9.7 8.1-.2 7.8 9.7 8h36.8c21.4 0 31 11.6 31 27.9M402 152.3h20.6V244H365c-26.5 0-33.9-7.4-33.9-33.9v-58h20.6v58c0 11.7 2.6 14.5 13.3 14.5h37zm0-70.2h-50.4v-8.2c0-10.4 1.3-14.5 13.3-14.5h37zm-71-8.2v58h20.6v-30.8h50.4V132h20.6V40.1H365c-26 0-33.9 7.1-33.9 33.8m310.6 141.7c0 17.8-9.7 28.5-31 28.5h-57.5v-19.4h56.7c7.9 0 11.2-3.3 11.2-9.1 0-5.6-3.3-8.7-11.2-8.7h-34.6c-22.1 0-29.3-14-29.3-27.4 0-13.5 7.2-27.2 29.3-27.2h55.4v19.3h-54.4q-9.8 0-9.7 8.1-.2 7.8 9.7 8h34.3c21.4 0 31 11.6 31 27.9M789.7 40v91.8h-6.9c-12.7 0-18-3-27.5-14.7L718 70.7v61.2H698V40.1h6.9c12.7 0 18 3 27.5 14.8l37.3 46.4V40.1zM769 171.6v22.6h-50.4v-8.1c0-10.4 1.3-14.5 13.2-14.5zm-37.2-19.3c-25.9 0-33.8 7-33.8 33.8v58h20.6v-30.8h50.4v30.8h20.6v-91.8zm-73.5 0H679V244h-20.6zm0-112.2H679v91.8h-20.6zm-417.3 91.8h-19.6V40.1h7.1a22 22 0 0 1 17.8 7.4l20.9 20 20.8-20A22 22 0 0 1 306 40h7v91.8h-19.5V68l-26.2 24.3L241 68zm220.8-72.5h35c10.7 0 13.3 2.8 13.3 14.5v24.2c0 11.7-2.6 14.5-13.3 14.5h-35zm68.9 38.7V73.9c0-26.4-7.4-33.8-33.9-33.8h-55.6v91.8h55.6c26.5 0 33.9-7.6 33.9-33.8m-511-78h142v244h-142zM0 284h181.6V.2H0zm121.3-131.7H142V244H76c-26.4 0-36.3-10-36.3-36.4v-55.4h20.6v56c0 11.6 4.6 16.4 15.2 16.4h45.8zm425-54.2V73.9c0-26.4 7.4-33.8 33.8-33.8H627v19.3h-47.8c-10.7 0-12.2 1.8-12.2 13.5v3h50V95h-50v4.1c0 11.7 1.5 13.5 12.2 13.5h51.1v19.3h-50c-26.5 0-34-7.6-34-33.8M111 80.3H60.3V59.4H111c7.7 0 11.2 4.1 11.2 10.2s-3 10.7-11.2 10.7m31.8-13c0-15.2-7.3-27.2-29-27.2H39.7v91.8h20.6V99.6h47.5c10.7 0 13.5 3 13.5 13.7V132H142V110c0-10.9-3.9-17.3-12.5-19.4 9-3 13.5-11.7 13.5-23.3" transform="scale(4.167)"/>
    </svg>
</p>