// Генератор словарей С4 для AI-агента.
// 1) s4/index.md — базовые классы (Формула 1 + 3) из s4/css/utilities.css.
// 2) s4/variables.md — переменные (токены) из s4/css/<device>/config.css → @scope([preset]) :scope{}.
// Префиксные классы Формулы 2 лежат в device-файлах и не включаются в index.md:
// агент выводит их из базовых по правилу «добавь префикс устройства+ориентации» (см. AGENT.md).
// Назначение: агент читает оба файла офлайн и видит базовый словарь классов и значения переменных.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const utilities = join(root, 's4', 'css', 'utilities.css');
const out = join(root, 's4', 'index.md');

const ruleRe = /[^{}]+\{/g;
const classRe = /\.[^,{} \n\t>+~*(]+/g;
const classes = new Set();

function validClass(cls) {
    const body = cls.slice(1);
    if (cls.includes('--')) return true;
    return /^[a-z]+(-[a-z]+)*$/.test(body);
}

const text = readFileSync(utilities, 'utf8');
let rule;
while ((rule = ruleRe.exec(text))) {
    const pre = rule[0];
    let m;
    while ((m = classRe.exec(pre))) {
        const cls = m[0];
        if (validClass(cls)) classes.add(cls);
    }
}

const raw = [...classes].sort();
const sorted = raw.map((c) =>
    c
        .replace(/\\/g, '')
        .replace(/:([a-z-]+):[a-z-]+$/i, ':$1')
        .replace(/::([a-z-]+)::[a-z-]+$/i, '::$1')
);
const header =
    '# С4 — словарь базовых классов\n\n' +
    'Сгенерировано автоматически скриптом s4-index.mjs. Не редактировать вручную.\n\n' +
    `Базовые классы (Формула 1 и 3, без префиксов устройств). Всего: ${sorted.length}.\n\n` +
    'Имена — как в HTML `class=""` (без экранирования `\\:`).\n\n' +
    'Префиксные варианты (Формула 2: `d_`, `t_`, `m_` + `l_`/`p_`) выводятся из базовых по правилу из [AGENT.md](AGENT.md).\n\n' +
    '## Классы\n\n';
const content = header + sorted.join('\n') + '\n';

writeFileSync(out, content);
console.log(`С4 index: ${sorted.length} классов → ${out}`);

// --- Переменные (токены) из config.css -> :scope ---
function extractScopeVars(cfgText) {
    const byPreset = {};
    const scopeRe = /@scope \(\[preset=(\w+)\]\)\{:scope\{([^}]*)\}/g;
    let s;
    while ((s = scopeRe.exec(cfgText))) {
        const vars = {};
        const varRe = /(--[\w-]+)\s*:\s*([^;{}]+)/g;
        let v;
        while ((v = varRe.exec(s[2]))) vars[v[1]] = v[2].trim();
        byPreset[s[1]] = vars;
    }
    return byPreset;
}

const devices = ['desktop', 'mobile', 'tablet'];
const primaryVars = extractScopeVars(readFileSync(join(root, 's4', 'css', 'desktop', 'config.css'), 'utf8'));

let devicesAgree = true;
for (const d of devices) {
    const cv = extractScopeVars(readFileSync(join(root, 's4', 'css', d, 'config.css'), 'utf8'));
    for (const p of Object.keys(primaryVars)) {
        if (JSON.stringify(cv[p]) !== JSON.stringify(primaryVars[p])) devicesAgree = false;
    }
}

const light = primaryVars.light || {};
const dark = primaryVars.dark || {};
const allNames = [...new Set([...Object.keys(light), ...Object.keys(dark)])];

function groupOf(name) {
    const inner = name.slice(2);
    const i = inner.indexOf('--');
    return i === -1 ? inner : inner.slice(0, i);
}

const groups = {};
for (const n of allNames) (groups[groupOf(n)] ||= []).push(n);

let vcontent = '';
vcontent += '# С4 — переменные (значения из :scope)\n\n';
vcontent += 'Сгенерировано автоматически скриптом s4-index.mjs. Не редактировать вручную.\n\n';
vcontent += 'Источник: `s4/css/<device>/config.css` → `@layer presets { @scope ([preset=light|dark]) { :scope { … } } }`.\n';
vcontent += `Значения — из \`desktop/config.css\`${devicesAgree ? ' (токены совпадают по всем устройствам)' : ' (ВНИМАНИЕ: значения различаются по устройствам — показан desktop)'}.\n`;
vcontent += `Всего переменных: ${allNames.length}.\n\n`;
vcontent += 'Имена — как в CSS: `--имя`. Используй через `var(--имя)` в Ф3: `style="--property: var(--имя)"`.\n\n';

for (const g of Object.keys(groups).sort()) {
    vcontent += `## ${g}\n\n`;
    vcontent += '| Переменная | light | dark |\n|---|---|---|\n';
    for (const n of groups[g].sort()) {
        vcontent += `| \`${n}\` | ${light[n] ?? ''} | ${dark[n] ?? ''} |\n`;
    }
    vcontent += '\n';
}

const vout = join(root, 's4', 'variables.md');
writeFileSync(vout, vcontent);
console.log(`С4 variables: ${allNames.length} переменных → ${vout}${devicesAgree ? '' : ' (ВНИМАНИЕ: устройства различаются!)'}`);
