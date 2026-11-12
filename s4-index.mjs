// Генератор словарей С4 для AI-агента (JSON, внутри дистрибутива s4/contract/).
// 1) s4/contract/utilities.json - базовые классы Формулы 1/Формулы 3 из s4/css/utilities.css. Для агента и валидатора.
// 2) s4/contract/variables.json - публичные переменные из s4/css/<device>/config.css -> @scope([preset]) :scope{}.
// Префиксные классы Формулы 2 лежат в device-файлах и не включаются в utilities.json:
// агент/валидатор выводит их из базовых по правилу "префикс устройства+ориентации + обязательный модификатор"
// (см. s4/AGENTS.md и s4/contract/formulas.json).
// Назначение: s4/contract/* - единый источник правды для агента (маршрутизация/спецификации) и валидатора.
// Старые MD-словари s4/index.md и s4/variables.md больше не генерируются (заменены JSON).

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const utilities = join(root, 's4', 'css', 'utilities.css');
const contract = join(root, 's4', 'contract');

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

const sorted = [...classes]
    .sort()
    .map((c) =>
        c
            .replace(/\\/g, '')
            .replace(/:([a-z-]+):[a-z-]+$/i, ':$1')
            .replace(/::([a-z-]+)::[a-z-]+$/i, '::$1')
    );

// --- Машинный словарь валидных утилит-классов (s4/contract/utilities.json) ---
const utilDesc =
    'Машинный словарь ВАЛИДНЫХ УТИЛИТ-КЛАССОВ С4 (базовые классы Формулы 1/Формулы 3; без префиксов устройств). ' +
    'Сгенерировано скриптом s4-index.mjs - не редактировать вручную. ' +
    'НАЗНАЧЕНИЕ: агент сверяется со словарём перед использованием класса - не все сочетания формулы существуют, класса нет, бери иную формулу или базовый класс; ' +
    'валидатор (s4/contract/validate-s4.mjs) сверяет по этому списку, что класс в HTML существует, в любом случае - контракт действует и при ручной вёрстке. ' +
    'Варианты Формулы 2 с префиксами устройств (d_/t_/m_ + l_/p_) здесь не перечислены: валидатор строит их из базового имени по правилу префикса и требует модификатор (см. s4/contract/formulas.json).';
const utilArr = sorted.map((c) => c.replace(/^\./, ''));
const utilJson = JSON.stringify({ описание: utilDesc, утилиты: utilArr }, null, 2);
writeFileSync(join(contract, 'utilities.json'), utilJson + '\n');
console.log(`С4 utilities: ${utilArr.length} классов → ${join(contract, 'utilities.json')}`);

// --- Машинный словарь публичных переменных (s4/contract/variables.json) ---
function extractScopeVars(cfgText) {
    const byPreset = {};
    const scopeRe = /@scope\s*\(\s*\[preset=(?:"([^"]+)"|'([^']+)'|([^\]\s]+))\]\s*\)\s*\{\s*:scope\s*\{([^}]*)\}/g;
    let s;
    while ((s = scopeRe.exec(cfgText))) {
        const preset = s[1] ?? s[2] ?? s[3];
        const vars = {};
        const varRe = /(--[\w-]+)\s*:\s*([^;{}]+)/g;
        let v;
        while ((v = varRe.exec(s[4]))) vars[v[1]] = v[2].trim();
        byPreset[preset] = vars;
    }
    return byPreset;
}

const devices = ['desktop', 'mobile', 'tablet'];
const primaryVars = extractScopeVars(readFileSync(join(root, 's4', 'css', 'desktop', 'config.css'), 'utf8'));

let devicesAgree = true;
for (const d of devices) {
    const cv = extractScopeVars(readFileSync(join(root, 's4', 'css', d, 'config.css'), 'utf8'));
    const comparedPresets = new Set([...Object.keys(primaryVars), ...Object.keys(cv)]);
    for (const p of comparedPresets) {
        if (JSON.stringify(cv[p]) !== JSON.stringify(primaryVars[p])) devicesAgree = false;
    }
}

const presetNames = Object.keys(primaryVars);
const variableMap = {};
for (const preset of presetNames) {
    const names = Object.keys(primaryVars[preset])
        .filter((n) => !n.startsWith('--size--'))
        .sort();
    variableMap[preset] = Object.fromEntries(names.map((n) => [n, primaryVars[preset][n]]));
}

const variableDesc =
    'Машинный словарь ПУБЛИЧНЫХ CSS-ПЕРЕМЕННЫХ С4 из s4/css/<device>/config.css -> @scope([preset]) :scope{}. ' +
    'Сгенерировано скриптом s4-index.mjs - не редактировать вручную. ' +
    'НАЗНАЧЕНИЕ: агент читает для Формулы 3 (var(--имя)) и чтобы знать допустимые имена; валидатор переменные в style не проверяет. ' +
    'ПЕРЕМЕННЫЕ СГРУППИРОВАНЫ ПО ПРЕСЕТАМ: доступ - переменные[пресет][имя]. ' +
    'ЗНАЧЕНИЯ СЫРЫЕ, КАК В CSS, И НЕ РАЗРЕШАЮТ АЛИАСЫ НА --size--*. ' +
    'ПРИВАТНЫЕ ПЕРЕМЕННЫЕ --size--* ИСКЛЮЧЕНЫ (агент не пишет их напрямую в вёрстке). ' +
    'ПЕРЕМЕННЫЕ ИЗ &[preset] И ВНУТРИ ЭЛЕМЕНТОВ НЕ ВХОДЯТ. ' +
    `Значения - из desktop/config.css${devicesAgree ? ' (переменные совпадают по всем устройствам)' : ' (ВНИМАНИЕ: значения различаются по устройствам - показан desktop)'}.`;
const variableJson = JSON.stringify({ описание: variableDesc, переменные: variableMap }, null, 2);
writeFileSync(join(contract, 'variables.json'), variableJson + '\n');
const presetSummary = presetNames.map((p) => `${p}: ${Object.keys(variableMap[p]).length}`).join(', ');
console.log(`С4 variables: ${presetNames.length} пресетов (${presetSummary}) → ${join(contract, 'variables.json')}${devicesAgree ? '' : ' (ВНИМАНИЕ: устройства различаются!)'}`);
