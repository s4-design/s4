<p align="right">
    <a href="README.md">🇷🇺 Русский</a>
</p>

<div align="center">
    <img src="https://avatars.githubusercontent.com/u/184809488" alt="S4 logo" width="160">
    <h1>System 4<br><small><small>Source code</small></small></h1>
</div>

<br>

<p>
    Code-oriented environment for building design systems.
</p>
<small>
    S4 is not a component framework - it's an environment: core (three-layer cascade + class formulas + device-specific loading) + presets. A preset is an interface configuration: metrics, colors, typography, animations, behavior. Default presets (light/dark) are ready-made configurations with an EM-centered model. A custom preset is a different configuration upon which a new design system is built. Design system = S4 + preset + components and patterns.
</small>

<br>

## Contents

- [Philosophy](#philosophy)
- [AI-friendly](#ai-friendly)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [Utility classes - 3 formulas](#utility-classes--3-formulas)
- [Elements](#elements)
- [Presets](#presets)
- [Developer](#developer)
- [Acknowledgments](#acknowledgments)
- [License](#license)

<br>

## Philosophy

S4 is an **environment for building design systems**, not a framework with a component catalog. The S4 core provides the tooling: a three-layer `@layer` cascade, deterministic class formulas, device-specific loading. Presets define an interface configuration - visual identity and behavior. A design system is formed from the S4 core, a preset, and user's components and patterns.

Default presets are built differently from most UI frameworks that revolve around components: Button, Card, Modal. Their values are independent: font-size = 16px, padding = 12px, radius = 8px.
Light/dark presets are ready-made configurations with an EM-centered parametric model where all metrics derive from a single scale.

Each preset is an independent configuration: light and dark may share metrics today, but nothing prevents them from differing entirely tomorrow.

The central object of default presets is **gravity** (relative scale), not a component. All metrics are linked through a unified size scale:

```css
--size--4: 1em;                      /* base unit */

--font-size--md:     var(--size--4); /* = 1em */
--padding--md:       var(--size--4); /* = 1em */
--gap--md:           var(--size--4); /* = 1em */
--border-radius--md: var(--size--4); /* = 1em */
```

The system describes not values, but **dependencies** between them. Changing `font-size` on `html` doesn't change just one component - it changes the entire interface, because all sizes are tied to it via `em`.

Architectural invariants of S4:

1. **Three `@layer` layers** - elements, presets, utilities - with a fixed cascade order.
2. **Deterministic class formulas** - any class parses into a CSS rule without context.
3. **Size scale `--size--*`** - 3 groups of named steps (variables) with ¼ step.
4. **Device-specific loading** - each `{device × orientation}` has its own CSS file.
5. **Presets** - interface configurations (metrics, colors, typography, animations, behavior), isolated via `@scope ([preset=...])` with separate builds for each device.

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

AI recovers CSS from a class without context. The reverse - composing a class from CSS - is also unambiguous.

### 2. Semantic HTML

S4 styles standard HTML tags: `button`, `details`, `table`, `menu`, `input`, `select`, `a`, `h1`–`h6`. `<button>Save</button>` is more intelligible to an LLM than `<PrimaryActionButton />`.

### 3. Parametric scaling

AI doesn't need to manage each size individually. All metrics are tied to `font-size` through the unified `--size--*` scale. Changing one parameter recalculates the entire interface.

### 4. Minimum entropy

No component catalog with dozens of props. There's a combination of `{element} + {modifier}`. The solution space for AI is combinatorics, not searching through specialized components.

### 5. Predictable cascade

`elements → presets → utilities`. A utility always overrides a preset, a preset overrides an element. No `!important`, no speculation.

<hr>

System 4 (S4) is an AI-friendly interface system. This is not a marketing label but a consequence of the architecture: deterministic formulas + semantic HTML + flat modifier model.

<br>

## Quick start

### Installation

Download the [latest release](https://github.com/s4-design/s4/releases/):

```
s4/
├── css/
│   ├── desktop/
│   │   ├── landscape.css
│   │   ├── portrait.css
│   │   └── config.css
│   ├── mobile/
│   │   ├── landscape.css
│   │   ├── portrait.css
│   │   └── config.css
│   ├── tablet/
│   │   ├── landscape.css
│   │   ├── portrait.css
│   │   └── config.css
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
- detects preset via `prefers-color-scheme`
- sets `[preset=light]` or `[preset=dark]` attribute on `<html>`

For a custom preset, set `[preset="..."]` on `<html>` before calling `S4()`.

### Styles structure

CSS is split into three layers in order of increasing specificity:

```
@layer elements, presets, utilities;
```

1. **elements** - styling HTML elements and custom tags via `var(--*)`
2. **presets** - CSS variable values set in the preset (`@scope ([preset=light])`, `@scope ([preset=dark])`)
3. **utilities** - utility classes (hard values + variables)

<br>

## Architecture

### Size scale

All default preset metrics are built on the `--size--*` scale - 3 groups of variables with a ¼em step:

```
Whole:     --size--0: 0em … --size--8: 2em
Halves:    --size--0_5: 0.125em … --size--7_5: 1.875em
Quarters:  --size--0_25: 0.0625em … --size--7_75: 1.9375em
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

Units (em, rem, px, etc.) are set in the preset. Default presets use `em`. A custom preset can use arbitrary values.

### Device and orientation

Each adaptive class and CSS variable is tied to a device + orientation combination via a prefix:

| Device | Orientation |
|---|---|
| `d_` - desktop | `l_` - landscape |
| `t_` - tablet | `p_` - portrait |
| `m_` - mobile | |

Prefix examples: `d_l_` (desktop, landscape), `m_p_` (mobile, portrait), `t_p_` (tablet, portrait).

CSS variables can also be adaptive. Formula 3 builds a fallback chain:

```css
var(--d_l_color, var(--color))
```

where the first argument is the value for a specific `{device × orientation}`, the second is the general one.

Additionally, `config.css` is built separately for each device, so `--d_l_color` and `--m_p_color` can have different values within the same preset.

JS framework (Svelte, React, Vue) is connected separately - S4 handles only CSS and environment detection.

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

## Utility classes - 3 formulas

### Formula 1 - adaptive

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

### Formula 2 - unified

```
.{property}--{modifier}
```

Style is the same across all devices and orientations.

| Class | CSS |
|---|---|
| `border--collapse` | `border-collapse: collapse` |
| `box-sizing--border-box` | `box-sizing: border-box` |

### Formula 3 - variable

```
.{property}
```

Connects a CSS property to the preset variable chain:

```css
color: var(--d_l_color, var(--color));
```

| Class | Result |
|---|---|
| `.color` | `color: var(--d_l_color, var(--color))` |
| `.background-color` | `background-color: var(--d_l_background-color, var(--background-color))` |

With pseudo-class: `.color\:hover:hover`

Without Formula 3 the property value would be hardcoded in CSS. Formula 3 makes it context-dependent - the preset on the device decides its value. The same element can have a different `color` on desktop vs mobile, in light vs dark preset, without changing HTML.

<br>

## Elements

HTML elements and S4 custom tags are styled via CSS variables - no hardcoded values in `elements.css`. Each custom element `<e-{name}>` has a class-duplicate `.element--{name}` for environments without custom elements (React, legacy).

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
2. **Specificity.** Class `.element--name` (0,1,0,0) - on par with S4 utilities. Custom tag `<e-name>` (0,0,1,0) - base layer. Any utility class overrides element styles without `!important`.

Base HTML is already styled - classes are optional:

```html
<button>Click</button>
<input type="text" placeholder="Enter text" />
<table>
    <tr><th>Name</th><th>Value</th></tr>
    <tr><td>Parameter</td><td>Result</td></tr>
</table>
```

<br>

## Presets

An S4 preset is an **interface configuration** defining its visual identity and behavior. A preset defines not only metrics (`--size--*`) and colors, but also typography (`--font-family`, `--font-weight`, `--line-height`), animations (`--transition-duration`, `--transition-timing-function`), behavior (`--overscroll-behavior`, `--word-break`, `--hyphens`), and any other CSS variables the project needs.

A preset is a layer of a design system, not the whole system. Design system = S4 (core: cascade, formulas, device-loading) + preset (interface configuration) + components and patterns.

Any variable declared in a preset (`--{name}`) automatically becomes available as a modifier in Formula 1 xtra utilities. For example, if a preset defines `--brand-gradient: linear-gradient(...)`, the class `d_l_background--brand-gradient` will work.

S4 detects the preset via `prefers-color-scheme` and sets the `[preset]` attribute on `<html>`:

```css
@scope ([preset=light]) { /* light preset */ }
@scope ([preset=dark])  { /* dark preset */ }
```

Each `@scope` block contains all preset variables for the given device. Example `:scope` contents:
```css
:scope {
    --position: relative;
    --background-color: var(--positive--light);
    --color: var(--negative);
    --tab-size: 4;
    --font-size: var(--font-size--md);
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans";
    --font-weight: normal;
    --line-height: var(--size--6);
    --text-underline-offset: var(--size--0_25);
    --overscroll-behavior: none;
    --word-break: normal;
    --hyphens: auto;
    --transition-duration: .15s;
    --transition-timing-function: linear;
}
```

**Device-specific presets:** each preset is built separately for each device - `desktop/config.css`, `mobile/config.css`, `tablet/config.css`. `[preset=dark]` values on desktop may differ from `[preset=dark]` on mobile. Equality between devices is not guaranteed.

**A custom preset is a different interface configuration.** Set `[preset="my-name"]` on `<html>` before calling `S4()` and write CSS:

```css
@scope ([preset=my-name]) {
    :scope {
        --size--4: 1.25em;
        --padding--md: 2em;
        --color: var(--black--07);
        --font-family: "IBM Plex Sans", system-ui;
        --transition-duration: 0.2s;
    }
}
```

For device-independent styling, use Formula 2 or explicit values. Presets affect only variables - utility classes from Formula 1 and 2 are preset-independent.

Preset switching at runtime is tracked via `matchMedia('prefers-color-scheme')`.

<br>

## Developer

**Artur Selimov**

- GitHub: [@am35a](https://github.com/am35a)
- Dribbble: [@am35a](https://dribbble.com/am35a)

<br>

## Acknowledgments

Thanks to [Matthew Hudson](https://github.com/matthewhudson) for [current-device](https://github.com/matthewhudson/current-device) - the tool that lets S4 be truly adaptive.

<br>

## License

CC BY-NC-SA. See the [LICENSE](./LICENSE) file for details (including additional consents for commercial use for citizens of the Russian Federation).

<br>

<br>

<p align="right">
    <svg height="30" fill="currentColor" viewBox="0 0 3955 1184">
        <path d="M401.8 189.1c0 8.7-3.3 12-11.4 12h-28.8v-29.5h28.8c8.1 0 11.4 4 11.4 12zm-11.4-36.8h-60v18l10.6 1.5v72.3h20.6v-23.7h28.8c23.6 0 31.8-12 31.8-30.5v-7.1c0-17.6-7.7-30.5-31.8-30.5m443.3 0h7.6V244h-20.6V179l-42.5 65h-23.6v-91.7h20.6V215l31-48c7.9-12.3 14.8-14.8 27.5-14.8M252.3 40h56.2v11.4c0 9.2-.8 16.8-2.8 23.7h-17.6V59.4h-35.8c-10.7 0-13.2 2.8-13.2 14.5v24.2c0 11.7 2.5 14.5 13.2 14.5h56.2v19.3h-56.2c-26.2 0-33.8-7.6-33.8-33.8V73.9c0-26.4 7.6-33.8 33.8-33.8m568.4 0h20.6v91.8h-20.6V95h-45.5v37h-20.6V40h20.6v35.6h45.5zm-543 184.6h-35.6V207h35.6c6.9 0 9.4 3.3 9.4 8.7s-2.5 9.1-9.4 9.1m5.4-45c0 5.6-2.8 8.7-10 8.7h-31v-16.6h31c7.2 0 10 2.6 10 8m11.7 15.9c4.8-3 8.9-9.3 8.9-19 0-12.4-7.2-24.3-28.3-24.3h-53.9V244h56c20.3 0 30.2-10.5 30.2-27.5 0-11.5-6.5-18.2-12.9-21m385.5-43.3H737v11.4c0 9.2-.7 16.8-2.8 23.7h-17.5v-15.8h-36.4c-10.7 0-13.2 2.8-13.2 14.5v24.1c0 11.7 2.5 14.5 13.2 14.5H737v19.4h-56.7c-26.2 0-33.8-7.7-33.8-33.9v-24.1c0-26.5 7.6-33.8 33.8-33.8m-173.7 58c0 11.6-2.5 14.4-13.2 14.4H469c-10.7 0-13.3-2.8-13.3-14.5v-24.1c0-11.7 2.6-14.5 13.3-14.5h24.4c10.7 0 13.2 2.8 13.2 14.5zm-13.2-58H469c-26.2 0-33.9 7.3-33.9 33.8v24.1c0 26.2 7.7 33.9 33.9 33.9h24.4c26.4 0 33.8-7.7 33.8-33.9v-24.1c0-26.5-7.4-33.8-33.8-33.8M356.6 59.4H393v50.4h-44c2.8-5 4-11.8 4.9-20.6zm57-19.3h-75.1l-4.6 46.5c-2.3 22.2-5.6 25.7-11.7 25.7H321v28.3h19.5l.8-11.7h60.5l.8 11.7h19.6V112h-8.7zm162 112.2H632v11.4c0 9.2-.8 16.8-2.8 23.7h-17.6v-15.8h-36c-10.7 0-13.3 2.8-13.3 14.5v24.1c0 11.7 2.6 14.5 13.2 14.5H632v19.4h-56.5c-26.2 0-33.8-7.7-33.8-33.9v-24.1c0-26.5 7.6-33.8 33.8-33.8M928.2 98c0 11.7-2.6 14.5-13.2 14.5h-22.7c-10.7 0-13.2-2.8-13.2-14.5V73.9c0-11.7 2.5-14.5 13.2-14.5h22.7c10.6 0 13.2 2.8 13.2 14.5zM915 40h-22.7c-26.2 0-33.8 7.4-33.8 33.8v24.2c0 26.2 10.2 33.8 36.4 33.8h17.5c26.5 0 36.4-7.6 36.4-33.8V73.9c0-26.4-7.4-33.8-33.8-33.8m-478.4 58V73.9c0-26.4 7.3-33.8 33.8-33.8h54v19.3h-55c-10.7 0-12.2 1.8-12.2 13.5v3h52.1V95h-52.1v4.1c0 11.7 1.5 13.5 12.2 13.5h55.7v19.3h-54.7c-26.5 0-33.8-... (line truncated to 2000 chars)
    </svg>
</p>
