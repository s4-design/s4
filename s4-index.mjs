// Генератор словарей С4 для AI-агента (JSON, внутри дистрибутива s4/contract/).
// 1) s4/contract/utilities.json — базовые классы (Формула 1 + 3) из s4/css/utilities.css. ТОЛЬКО для валидатора.
// 2) s4/contract/tokens.json — публичные токены (CSS-переменные) из s4/css/<device>/config.css -> @scope([preset]) :scope{}.
// Префиксные классы Формулы 2 лежат в device-файлах и не включаются в utilities.json:
// агент/валидатор выводит их из базовых по правилу «добавь префикс устройства+ориентации» (см. s4/AGENT.md).
// Назначение: s4/contract/* — единый источник правды для агента (маршрутизация/спецификации) и валидатора.
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

// --- Машинный словарь утилит-классов для валидатора (s4/contract/utilities.json) ---
const utilDesc =
    'Машинный словарь ВАЛИДНЫХ УТИЛИТ-КЛАССОВ С4 (Формула 1 и 3: базовые, без префиксов устройств). ' +
    'Сгенерировано скриптом s4-index.mjs - не редактировать вручную. ' +
    'НАЗНАЧЕНИЕ: ТОЛЬКО для валидатора (s4/contract/validate-s4.mjs) - он сверяет по этому списку, что класс в HTML существует. ' +
    'АГЕНТ ЭТОТ ФАЙЛ НЕ ЧИТАЕТ (ни целиком, ни по частям без крайней нужды): для подсказки, какие утилиты применимы к элементу, ' +
    'агент пользуется масками допустимыхУтилит в s4/contract/elements/<элемент>.json, а не этим словарем. ' +
    'Варианты Ф2 с префиксами устройств (d_/t_/m_ + l_/p_) здесь не перечислены: валидатор строит их из базового имени по правилу префикса.';
const utilArr = sorted.map((c) => c.replace(/^\./, ''));
const utilJson = JSON.stringify({ описание: utilDesc, всего: utilArr.length, утилиты: utilArr }, null, 2);
writeFileSync(join(contract, 'utilities.json'), utilJson + '\n');
console.log(`С4 utilities: ${utilArr.length} классов → ${join(contract, 'utilities.json')}`);

// --- Машинный словарь публичных токенов (s4/contract/tokens.json) ---
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
const allNames = [...new Set([...Object.keys(light), ...Object.keys(dark)])].sort();
const publicNames = allNames.filter((n) => !n.startsWith('--size--'));

const tokenMap = {};
for (const n of publicNames) tokenMap[n] = { light: light[n] ?? '', dark: dark[n] ?? '' };

const tokenDesc =
    'Машинный словарь ПУБЛИЧНЫХ ТОКЕНОВ (CSS-переменных) С4 из s4/css/<device>/config.css -> @scope([preset=light|dark]) :scope{}. ' +
    'Сгенерировано скриптом s4-index.mjs - не редактировать вручную. ' +
    'НАЗНАЧЕНИЕ: агент читает для Ф3 (var(--имя)) и чтобы знать допустимые имена; валидатор проверяет существование имени. ' +
    'ПРИВАТНЫЕ ТОКЕНЫ --size--* ИСКЛЮЧЕНЫ (агент не пишет их напрямую в вёрстке). ' +
    `Значения - из desktop/config.css${devicesAgree ? ' (токены совпадают по всем устройствам)' : ' (ВНИМАНИЕ: значения различаются по устройствам - показан desktop)'}.`;
const tokenJson = JSON.stringify({ описание: tokenDesc, всего: publicNames.length, токены: tokenMap }, null, 2);
writeFileSync(join(contract, 'tokens.json'), tokenJson + '\n');
console.log(`С4 tokens: ${publicNames.length} токенов → ${join(contract, 'tokens.json')}${devicesAgree ? '' : ' (ВНИМАНИЕ: устройства различаются!)'}`);
