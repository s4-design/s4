import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolvePath(__dirname, '..')

const ELEMENTS_DIR = join(ROOT, 's4/contract/elements')
const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

function readJson(file) {
    return JSON.parse(readFileSync(file, 'utf8'))
}

function listContracts(folder) {
    return readdirSync(join(ELEMENTS_DIR, folder))
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
}

const UTILITY_COUNT = readJson(join(ROOT, 's4/contract/utilities.json')).утилиты.length
const MODIFIED = listContracts('modified')
const CREATED = listContracts('created')
const CONTRACTS = [...MODIFIED, ...CREATED]

// README: число утилит и таблица элементов должны совпадать с контрактами
function checkReadme(file) {
    const errors = []
    const text = readFileSync(join(ROOT, file), 'utf8')

    const count = text.match(/\((\d+)\s*(?:класса|classes)\)/)
    if (!count) {
        errors.push(`${file}: не найдено число утилит вида "(N класса)"`)
    } else if (Number(count[1]) !== UTILITY_COUNT) {
        errors.push(`${file}: число утилит ${count[1]}, а в utilities.json - ${UTILITY_COUNT}`)
    }

    const tags = []
    for (const line of text.split(/\r?\n/)) {
        const cell = line.split('|')[1]
        if (!cell) continue
        for (const tag of cell.matchAll(/<([a-z][\w-]*)>/g)) tags.push(tag[1])
    }

    const listed = new Set()
    const headingRange = tags.includes('h1') && tags.includes('h6')
    for (const tag of tags) {
        if (headingRange && HEADINGS.includes(tag)) continue
        listed.add(tag)
    }
    if (headingRange) listed.add('h1-h6')

    const missing = CONTRACTS.filter((name) => !listed.has(name))
    const extra = [...listed].filter((name) => !CONTRACTS.includes(name))
    if (missing.length) errors.push(`${file}: нет в таблице элементов: ${missing.join(', ')}`)
    if (extra.length) errors.push(`${file}: лишние в таблице элементов: ${extra.join(', ')}`)

    return errors
}

// CONTEXT.md: пункты со списками элементов должны совпадать с папками контрактов
function checkList(file, label, line, expected) {
    if (!line) return [`${file}: не найден пункт "${label}"`]
    const names = []
    for (const item of line.matchAll(/`([^`]+)`/g)) {
        const name = item[1].replace(/^<|>$/g, '')
        if (/^[a-z][\w-]*(\/[a-z][\w-]*)*$/.test(name)) names.push(...name.split('/'))
    }
    const errors = []
    const missing = expected.filter((name) => !names.includes(name))
    const extra = names.filter((name) => !expected.includes(name))
    if (missing.length) errors.push(`${file} (${label}): нет: ${missing.join(', ')}`)
    if (extra.length) errors.push(`${file} (${label}): лишние: ${extra.join(', ')}`)
    return errors
}

function checkContext() {
    const file = join(ROOT, 'CONTEXT.md')
    if (!existsSync(file)) {
        console.log('CONTEXT.md не найден - проверка пропущена')
        return []
    }
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    const lineCreated = lines.find((l) => l.includes('Кастомные элементы S4'))
    const lineModified = lines.find((l) => l.includes('Стилизованные HTML-теги'))
    const namesLineModified = lineModified ? lineModified.split('Служебные')[0] : ''
    return [
        ...checkList('CONTEXT.md', 'кастомные элементы', lineCreated, CREATED),
        ...checkList('CONTEXT.md', 'стилизованные HTML-теги', namesLineModified, MODIFIED)
    ]
}

const errors = [
    ...checkReadme('README.md'),
    ...checkReadme('README.en.md'),
    ...checkContext()
]

if (errors.length) {
    console.error(`Расхождения документации и контрактов (${errors.length}):`)
    for (const error of errors) console.error('  - ' + error)
    process.exit(1)
}

console.log(`Документация согласована с контрактами: утилит ${UTILITY_COUNT}, элементов ${CONTRACTS.length}.`)
