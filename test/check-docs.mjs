import { readFileSync, readdirSync } from 'node:fs'
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

const errors = [
    ...checkReadme('README.md'),
    ...checkReadme('README.en.md')
]

if (errors.length) {
    console.error(`Расхождения документации и контрактов (${errors.length}):`)
    for (const error of errors) console.error('  - ' + error)
    process.exit(1)
}

console.log(`Документация согласована с контрактами: утилит ${UTILITY_COUNT}, элементов ${CONTRACTS.length}.`)
