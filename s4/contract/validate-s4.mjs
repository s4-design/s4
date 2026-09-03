// Валидатор вёрстки С4. Единственная машино-проверяемая строгость правил.
// Читает HTML и сверяет его с rules.json + utilities.json.
// Падает (exit 1) при любом нарушении. Без внешних зависимостей.
//
// Запуск: node s4/contract/validate-s4.mjs <file.html>

import { readFileSync } from 'node:fs';
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

const VOID = new Set(['hr', 'img', 'input', 'br', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr']);
const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;

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
let tm;
while ((tm = tagRe.exec(html))) {
  const isClose = tm[1] === '/';
  const tag = tm[2];
  const raw = tm[3];
  const selfClose = tm[4] === '/';
  const line = lineOf(tm.index);
  if (isClose) {
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

function evaluate(node) {
  const { tag, line, attrs, classes } = node;

  // R7 отменён: навешивание .element--{name} на <e-{name}> — легальное усиление веса селектора (не дубль).

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
      if (pseudo !== ':hover') err(line, `R6: состояние ${pseudo} классом не существует (только :hover)`);
    }
    const hasMod = name.includes('--');
    const prop = name.split('--')[0];
    const isUtil = hasMod || knownProps.has(prop);
    if (!isUtil) continue;
    if (physicalProps.has(prop)) err(line, `R1: физическое свойство ${prop} запрещено (только логические)`);
    if (!knownBase.has(name)) err(line, `R3: неизвестный utility-класс "${cls}" (нет в utilities.json)`);
  }

  if (attrs.style) {
    for (const decl of attrs.style.split(';')) {
      const t = decl.indexOf(':');
      if (t === -1) continue;
      const prop = decl.slice(0, t).trim();
      const value = decl.slice(t + 1).trim();
      if (!prop) continue;
      if (value.includes('!important')) err(line, 'R2: !important запрещён');
      if (prop.startsWith('--')) {
        if (isPrivate(prop)) err(line, `R5: приватный токен ${prop} в вёрстке запрещён`);
      } else {
        if (physicalProps.has(prop)) err(line, `R1: физическое свойство ${prop} в style запрещено`);
        if (shorthands.has(prop)) err(line, `R4: сокращение ${prop} в style запрещено (используй utility-класс)`);
      }
      if (value.includes('var(') && /--size--/.test(value))
        err(line, 'R5: приватный токен --size--* в значении запрещён');
    }
  }
}

if (errors.length) {
  console.error('Валидация НЕ пройдена:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('Валидация пройдена: нарушений нет.');
process.exit(0);
