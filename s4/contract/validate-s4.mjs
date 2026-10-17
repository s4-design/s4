// Валидатор вёрстки С4. Единственная машино-проверяемая строгость правил.
// Читает HTML и сверяет его с rules.json + utilities.json.
// Падает (exit 1) при любом нарушении. Без внешних зависимостей.
//
// Запуск: node s4/contract/validate-s4.mjs <file.html>

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const rules = JSON.parse(readFileSync(join(root, 'rules.json'), 'utf8'));
const util = JSON.parse(readFileSync(join(root, 'utilities.json'), 'utf8'));

const knownBase = new Set(util.утилиты);
const knownProps = new Set([...knownBase].map((c) => c.split('--')[0]));

const R = (id) => rules.правила.find((r) => r.id === id).проверка;
const physicalProps = new Set(R('R1').список);
const shorthands = new Set(R('R4').список);
const forbiddenPseudo = new Set(R('R6').список);
const isPrivate = (n) => n.startsWith('--size--');

const errors = [];
const err = (line, msg) => errors.push(`строка ${line}: ${msg}`);

const file = process.argv[2];
if (!file) {
  console.error('Использование: node s4/contract/validate-s4.mjs <file.html>');
  process.exit(2);
}
const html = readFileSync(file, 'utf8');
const lineOf = (idx) => html.slice(0, idx).split('\n').length;

// Вырезаем содержимое комментариев и <script>, сохраняя длину и переносы строк,
// чтобы lineOf() продолжал считать номера строк верно.
const VOID = new Set(['hr', 'img', 'input', 'br', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr']);
const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;

const htmlScannable = html
  .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, (m) => m.replace(/[^\n]/g, ' '));

function parseAttrs(raw) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'))?/g;
  let m;
  while ((m = re.exec(raw))) {
    const name = m[1];
    const val = m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : '';
    attrs[name] = val;
  }
  return attrs;
}

const stack = [];
// Структурные расхождения не влияют на exit code: это подсказка, а не нарушение правил R1-R6.
const warnings = [];
const warn = (line, msg) => warnings.push(`строка ${line}: ${msg}`);
let tm;
while ((tm = tagRe.exec(htmlScannable))) {
  const isClose = tm[1] === '/';
  const tag = tm[2];
  const raw = tm[3];
  const selfClose = tm[4] === '/';
  const line = lineOf(tm.index);
  if (isClose) {
    const top = stack[stack.length - 1];
    if (!top) warn(line, `закрывающий </${tag}> без открывающего`);
    else if (top.tag !== tag) warn(line, `</${tag}> закрывает <${top.tag}> (несовпадение вложенности)`);
    if (stack.length) evaluate(stack.pop());
    continue;
  }
  const attrs = parseAttrs(raw);
  const classes = (attrs.class || '').split(/\s+/).filter(Boolean);
  const node = { tag, line, attrs, classes, children: [] };
  if (stack.length) stack[stack.length - 1].children.push(tag);
  if (VOID.has(tag) || selfClose) evaluate(node);
  else stack.push(node);
}

// Незакрытые элементы в конце файла тоже оцениваются.
while (stack.length) {
  const top = stack[stack.length - 1];
  warn(top.line, `<${top.tag}> не закрыт`);
  evaluate(stack.pop());
}

function evaluate(node) {
  const { tag, line, attrs, classes } = node;

  // R7 отменён: навешивание .element--{name} на <e-{name}> - легальное усиление веса селектора (не дубль).

  for (const cls of classes) {
    if (cls.startsWith('element--')) continue;
    let name = cls.startsWith('.') ? cls.slice(1) : cls;
    const dm = name.match(/^(d|t|m)_(l|p)_(.+)$/);
    if (dm) name = dm[3];
    let pseudo = '';
    if (name.includes(':')) {
      const parts = name.split(':');
      pseudo = ':' + parts.slice(1).join(':');
      name = parts[0];
      if (forbiddenPseudo.has(pseudo)) err(line, `R6: состояние ${pseudo} запрещено в утилит-классах (разрешено только :hover)`);
    }
    const hasMod = name.includes('--');
    const prop = name.split('--')[0];
    const isUtil = hasMod || knownProps.has(prop);
    if (!isUtil) continue;
    if (physicalProps.has(prop)) err(line, `R1: физическое свойство ${prop} запрещено (только логические)`);
    // Псевдокласс входит в проверяемое имя: utilities.json хранит классы вида
    // "background-color--transparent:hover", а не "background-color--transparent".
    const knownName = pseudo ? name + pseudo : name;
    if (!knownBase.has(knownName)) err(line, `R3: неизвестный utility-класс "${cls}" (нет в utilities.json)`);
  }

  if (attrs.style) checkDeclarations(attrs.style, line, '');
}

// Проверка набора CSS-объявлений: общая для инлайн-style и блоков <style>.
// where - уточнение к источнику для сообщения (например " в <style>").
function checkDeclarations(styleText, line, where) {
  for (const decl of styleText.split(';')) {
    const t = decl.indexOf(':');
    if (t === -1) continue;
    const prop = decl.slice(0, t).trim();
    const value = decl.slice(t + 1).trim();
    if (!prop) continue;
    if (value.includes('!important')) err(line, `R2: !important запрещён${where}`);
    if (prop.startsWith('--')) {
      if (isPrivate(prop)) err(line, `R5: приватная переменная ${prop}${where} в вёрстке запрещена`);
    } else {
      if (physicalProps.has(prop)) err(line, `R1: физическое свойство ${prop}${where} запрещено`);
      if (shorthands.has(prop)) err(line, `R4: сокращение ${prop}${where} запрещено (используй utility-класс)`);
    }
    if (value.includes('var(') && /--size--/.test(value))
      err(line, `R5: приватная переменная --size--* в значении${where} запрещена`);
  }
}

// Рекурсивный обход CSS с учётом вложенности (@media, @scope).
// Тело блока без вложенных фигурных скобок считается набором объявлений.
function scanCss(css, line) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    let depth = 1, j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    if (body.includes('{')) scanCss(body, line);
    else checkDeclarations(body, line, ' в <style>');
    i = j;
  }
}

const styleBlockRe = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
let sb;
while ((sb = styleBlockRe.exec(htmlScannable))) {
  scanCss(sb[1], lineOf(sb.index));
}

// Деление группы селекторов по запятым вне скобок.
function splitTopLevel(text) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// Диапазон в имени элемента: h1-h6 -> h1..h6.
function expandRange(name) {
  const m = name.match(/^([a-z]+)(\d+)-([a-z]+)(\d+)$/);
  if (!m || m[1] !== m[3]) return [name];
  const out = [];
  for (let i = Number(m[2]); i <= Number(m[4]); i++) out.push(m[1] + i);
  return out;
}

// Сверка контрактов с дистрибутивным CSS: у каждого элемента из elements/modified
// и elements/created должен быть носитель в css/elements.css - селектор-тег,
// класс-дубликат (.element--) или атрибут-дубликат ([attr=value] из значений атрибутов).
// Сироты CSS (body, служебные селекторы, производные) не проверяются.
function checkContracts() {
  const elRoot = join(root, 'elements');
  const cssText = readFileSync(join(root, '..', 'css', 'elements.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  // Головы правил верхнего уровня; тела деклараций пропускаются.
  const heads = [];
  (function walk(text) {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open === -1) return;
      const head = text.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') depth--;
        j++;
      }
      const body = text.slice(open + 1, j - 1);
      if (body.includes('{')) walk(body);
      if (head && !head.startsWith('@')) heads.push(head);
      i = j;
    }
  })(cssText);

  // Начала селекторов: тег или класс-дубликат.
  const starts = new Set();
  for (const head of heads) {
    for (const sel of splitTopLevel(head)) {
      const m = sel.match(/^(?:\.element--([a-z0-9-]+)|([a-z][a-z0-9-]*))/);
      if (m) starts.add(m[1] ? '.element--' + m[1] : m[2]);
    }
  }

  for (const dir of ['modified', 'created']) {
    const dirPath = join(elRoot, dir);
    for (const file of readdirSync(dirPath)) {
      if (!file.endsWith('.json')) continue;
      const base = file.slice(0, -5);
      const spec = JSON.parse(readFileSync(join(dirPath, file), 'utf8'))[base] || {};
      // Атрибуты-дубликаты: [attr=value] для каждого не-class значения.
      const attrSels = [];
      for (const [aname, attr] of Object.entries(spec.атрибуты || {})) {
        if (aname === 'class') continue;
        for (const value of Object.keys(attr.значения || {})) attrSels.push(`[${aname}=${value}]`);
      }
      for (const name of expandRange(base)) {
        const ok = starts.has(name)
          || starts.has('.element--' + name.replace(/^e-/, ''))
          || attrSels.some((s) => cssText.includes(s));
        if (!ok) errors.push(`элемент "${name}" (контракт ${file}): нет носителя в css/elements.css`);
      }
    }
  }
}

checkContracts();

if (warnings.length) {
  console.log('Предупреждения структуры (на exit code не влияют):');
  for (const w of warnings) console.log('  - ' + w);
}

if (errors.length) {
  console.error('Валидация НЕ пройдена:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('Валидация пройдена: нарушений нет.');
process.exit(0);
