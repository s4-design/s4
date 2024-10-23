<div align="center">
    <img src="https://avatars.githubusercontent.com/u/184809488" alt="S4 logo" width="160">
    <h1>S4</h1>
</div>
<p>
    The customizable and truly responsive framework that provides absolute precision in user interface development. The lightweight of S4 makes it desirable in high-load systems.
</p>

<br>

## Table of contents

- [Quick start](#quick-start)
- [Developers](#developers)
- [Designers](#designers)
- [Thanks](#thanks)

<br>

## Quick start

1. Download the current release

    [v0.0.0](https://github.com/s4-design/s4/releases/download/0.0.0/v0.0.0.zip)

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
    │   └── tablet/
    │   │   ├── landscape.css
    │   │   ├── portrait.css
    │   │   └── themes.css
    │   └── elements.css
    └── js/
        ├── current-device.min.js
        └── s4.min.js
    ```


2. Include CSS and JavaScript

    Embed the \<script\> tag in the \<head\>, and add attribute \[onload\] for start JavaScript bundle in the \<body\>. Add the \[theme\] attribute in the \<html\> for CSS.

    ```
    ...
    <html theme="light">
        <head>
            ...
            <script src="s4/js/s4.min.js"></script>
        </head>
        <body onload="S4()">
            ...
        </body>
    </html>
    ```

<br>


## Developers

**Arthur Selimov**

- <https://github.com/am35a>

<br>


## Designers

**Arthur Selimov**

- <https://dribbble.com/am35a>

<br>


## Thanks

Thanks to [Matthew Hudson](https://github.com/matthewhudson) for providing [current-device](https://github.com/matthewhudson/current-device) tool that allows the S4 to be an absolutely responsive framework.
