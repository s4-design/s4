import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, resolve as resolvePath, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolvePath(__dirname, '..')
const TEST_DIR = resolvePath(__dirname)

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
}

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const TABLET_UA = 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'

let server
let browser
let baseUrl

function startServer() {
    return new Promise((resolve, reject) => {
        const httpServer = createServer((req, res) => {
            let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
            if (pathname.endsWith('/'))
                pathname += 'index.html'

            const file = resolvePath(ROOT, '.' + pathname)

            if (file !== ROOT && !file.startsWith(ROOT + sep)) {
                res.writeHead(403)
                res.end('Forbidden')
                return
            }

            if (!existsSync(file) || statSync(file).isDirectory()) {
                res.writeHead(404)
                res.end('Not Found')
                return
            }

            res.writeHead(200, {
                'Content-Type': MIME[extname(file)] || 'application/octet-stream'
            })
            createReadStream(file).pipe(res)
        })

        httpServer.on('error', reject)
        httpServer.listen(0, '127.0.0.1', () => {
            resolve({
                server: httpServer,
                url: `http://127.0.0.1:${httpServer.address().port}/test/`
            })
        })
    })
}

async function readHeadState(page) {
    return page.evaluate(() => {
        const children = [...document.head.childNodes]
        const anchor = children.find(node => node.nodeType === Node.COMMENT_NODE && node.data === 's4-utilities')
        const anchorIndex = anchor ? children.indexOf(anchor) : -1
        const utilities = [...document.head.querySelectorAll('link[data-s4-utility]')]
        const styles = [...document.head.querySelectorAll('link[rel="stylesheet"]')]

        return {
            initialized: document.documentElement.hasAttribute('data-s4-initialized'),
            utilityIds: utilities.map(link => link.id),
            styleIds: styles.map(link => link.id),
            anchorLast: anchorIndex === children.length - 1,
            utilitiesAfterAnchor: anchorIndex === -1 || children.slice(anchorIndex + 1).some(node => node.nodeType === Node.ELEMENT_NODE && node.matches('link[data-s4-utility]')),
            deviceScripts: [...document.scripts].filter(script => script.src.endsWith('/js/device-state.min.js')).length,
            layerStyles: [...document.head.querySelectorAll('style')].filter(style => style.textContent.includes('@layer elements')).length
        }
    })
}

async function waitForSettled(page, device, expected) {
    await page.waitForFunction(({ expected, configId }) => {
        if (!document.documentElement.hasAttribute('data-s4-initialized'))
            return false

        const utilities = [...document.head.querySelectorAll('link[data-s4-utility]')].map(link => link.id)
        const hasConfig = [...document.head.querySelectorAll('link[rel="stylesheet"]')].some(link => link.id === configId)

        return hasConfig && JSON.stringify(utilities) === JSON.stringify(expected)
    }, { expected, configId: `${device}/config` })
}

function expectedStyleIds(device, utilities) {
    return ['css/elements', 'css/utilities', `${device}/config`, ...utilities]
}

async function createPage(viewport, userAgent) {
    const context = await browser.newContext({ viewport, userAgent })
    return { context, page: await context.newPage() }
}

async function routeMap(page, map) {
    await page.route('**/s4/dependency-map.json', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(map)
    }))
}

const ORDER_CASES = [
    {
        name: 'desktop landscape',
        device: 'desktop',
        userAgent: DESKTOP_UA,
        viewport: { width: 1280, height: 800 },
        utilities: ['desktop/landscape-utilities']
    },
    {
        name: 'desktop portrait',
        device: 'desktop',
        userAgent: DESKTOP_UA,
        viewport: { width: 800, height: 1280 },
        utilities: ['desktop/landscape-utilities', 'desktop/portrait-utilities']
    },
    {
        name: 'tablet landscape',
        device: 'tablet',
        userAgent: TABLET_UA,
        viewport: { width: 1180, height: 820 },
        utilities: ['tablet/landscape-utilities']
    },
    {
        name: 'tablet portrait',
        device: 'tablet',
        userAgent: TABLET_UA,
        viewport: { width: 820, height: 1180 },
        utilities: ['tablet/landscape-utilities', 'tablet/portrait-utilities']
    },
    {
        name: 'mobile landscape',
        device: 'mobile',
        userAgent: MOBILE_UA,
        viewport: { width: 844, height: 390 },
        utilities: ['mobile/portrait-utilities', 'mobile/landscape-utilities']
    },
    {
        name: 'mobile portrait',
        device: 'mobile',
        userAgent: MOBILE_UA,
        viewport: { width: 390, height: 844 },
        utilities: ['mobile/portrait-utilities']
    }
]

before(async () => {
    const started = await startServer()
    server = started.server
    baseUrl = started.url
    browser = await chromium.launch({ headless: true })
})

after(async () => {
    if (browser)
        await browser.close()
    if (server)
        server.close()
})

for (const testCase of ORDER_CASES) {
    test(`порядок utility-ссылок: ${testCase.name}`, async () => {
        const { context, page } = await createPage(testCase.viewport, testCase.userAgent)

        try {
            await page.goto(baseUrl, { waitUntil: 'load' })
            await waitForSettled(page, testCase.device, testCase.utilities)

            const state = await readHeadState(page)
            assert.equal(state.initialized, true)
            assert.deepEqual(state.utilityIds, testCase.utilities)
            assert.deepEqual(state.styleIds, expectedStyleIds(testCase.device, testCase.utilities))
            assert.equal(state.anchorLast, true)
            assert.equal(state.utilitiesAfterAnchor, false)
        } finally {
            await context.close()
        }
    })
}

test('смена ориентации перестраивает только utility-группу', async () => {
    const { context, page } = await createPage(ORDER_CASES[0].viewport, DESKTOP_UA)

    try {
        await page.goto(baseUrl, { waitUntil: 'load' })
        await waitForSettled(page, 'desktop', ORDER_CASES[0].utilities)

        await page.setViewportSize({ width: 800, height: 1280 })
        await waitForSettled(page, 'desktop', ORDER_CASES[1].utilities)

        let state = await readHeadState(page)
        assert.deepEqual(state.utilityIds, ORDER_CASES[1].utilities)
        assert.deepEqual(state.styleIds, expectedStyleIds('desktop', ORDER_CASES[1].utilities))
        assert.equal(state.anchorLast, true)

        await page.setViewportSize({ width: 1280, height: 800 })
        await waitForSettled(page, 'desktop', ORDER_CASES[0].utilities)

        state = await readHeadState(page)
        assert.deepEqual(state.utilityIds, ORDER_CASES[0].utilities)
        assert.deepEqual(state.styleIds, expectedStyleIds('desktop', ORDER_CASES[0].utilities))
        assert.equal(state.anchorLast, true)
        assert.equal(state.utilitiesAfterAnchor, false)
    } finally {
        await context.close()
    }
})

test('повторный S4 не дублирует style, скрипт и ссылки', async () => {
    const { context, page } = await createPage(ORDER_CASES[0].viewport, DESKTOP_UA)

    try {
        await page.goto(baseUrl, { waitUntil: 'load' })
        await waitForSettled(page, 'desktop', ORDER_CASES[0].utilities)

        const before = await readHeadState(page)
        await page.evaluate(() => window.S4())
        const after = await readHeadState(page)

        assert.deepEqual(after, before)
        assert.equal(after.deviceScripts, 1)
        assert.equal(after.layerStyles, 1)
    } finally {
        await context.close()
    }
})

test('повторная инициализация после снятия флага использует кеши', async () => {
    const { context, page } = await createPage(ORDER_CASES[0].viewport, DESKTOP_UA)

    try {
        await page.goto(baseUrl, { waitUntil: 'load' })
        await waitForSettled(page, 'desktop', ORDER_CASES[0].utilities)

        const before = await readHeadState(page)
        await page.evaluate(() => {
            document.documentElement.removeAttribute('data-s4-initialized')
            return window.S4()
        })
        await waitForSettled(page, 'desktop', ORDER_CASES[0].utilities)

        const after = await readHeadState(page)
        assert.deepEqual(after.utilityIds, before.utilityIds)
        assert.deepEqual(after.styleIds, before.styleIds)
        assert.equal(after.deviceScripts, 1)
        assert.equal(after.layerStyles, 1)
        assert.equal(after.anchorLast, true)
    } finally {
        await context.close()
    }
})

test('пустой массив удаляет только utility-группу', async () => {
    const { context, page } = await createPage(ORDER_CASES[0].viewport, DESKTOP_UA)

    try {
        await routeMap(page, {
            desktop: { landscape: [] }
        })
        await page.goto(baseUrl, { waitUntil: 'load' })
        await waitForSettled(page, 'desktop', [])

        const state = await readHeadState(page)
        assert.deepEqual(state.utilityIds, [])
        assert.deepEqual(state.styleIds, expectedStyleIds('desktop', []))
        assert.equal(state.anchorLast, true)
        assert.equal(state.utilitiesAfterAnchor, false)
    } finally {
        await context.close()
    }
})

test('дубликат в карте пропускается, порядок остаётся', async () => {
    const { context, page } = await createPage(ORDER_CASES[0].viewport, DESKTOP_UA)
    const errors = []

    page.on('console', message => {
        if (message.type() === 'error')
            errors.push(message.text())
    })

    try {
        await routeMap(page, {
            desktop: {
                landscape: [
                    { desktop: 'landscape' },
                    { desktop: 'landscape' },
                    { desktop: 'portrait' }
                ]
            }
        })
        await page.goto(baseUrl, { waitUntil: 'load' })

        const expected = ['desktop/landscape-utilities', 'desktop/portrait-utilities']
        await waitForSettled(page, 'desktop', expected)

        const state = await readHeadState(page)
        assert.deepEqual(state.utilityIds, expected)
        assert.ok(errors.some(text => text.includes('Дубликат')))
    } finally {
        await context.close()
    }
})

test('невалидная карта даёт базовый fallback', async () => {
    const { context, page } = await createPage(ORDER_CASES[0].viewport, DESKTOP_UA)
    const errors = []

    page.on('console', message => {
        if (message.type() === 'error')
            errors.push(message.text())
    })

    try {
        await routeMap(page, {
            desktop: { landscape: [{ unknown: 'landscape' }] }
        })
        await page.goto(baseUrl, { waitUntil: 'load' })
        await waitForSettled(page, 'desktop', ['desktop/landscape-utilities'])

        const state = await readHeadState(page)
        assert.deepEqual(state.utilityIds, ['desktop/landscape-utilities'])
        assert.ok(errors.some(text => text.includes('Ошибка при загрузке или парсинге')))
    } finally {
        await context.close()
    }
})

test('ошибка loadScript снимает флаг и разрешает retry', async () => {
    const { context, page } = await createPage(ORDER_CASES[0].viewport, DESKTOP_UA)
    const scriptPattern = '**/s4/js/device-state.min.js'

    await page.route(scriptPattern, route => route.abort())

    try {
        const errorLogged = page.waitForEvent('console', message =>
            message.type() === 'error' && message.text().includes('Ошибка при загрузке')
        )

        await page.goto(baseUrl, { waitUntil: 'load' })
        await errorLogged

        assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-s4-initialized')), false)

        await page.unroute(scriptPattern)
        await page.evaluate(() => window.S4())
        await waitForSettled(page, 'desktop', ORDER_CASES[0].utilities)

        const state = await readHeadState(page)
        assert.equal(state.initialized, true)
        assert.deepEqual(state.utilityIds, ORDER_CASES[0].utilities)
        assert.equal(state.deviceScripts, 1)
        assert.equal(state.layerStyles, 1)
    } finally {
        await context.close()
    }
})
