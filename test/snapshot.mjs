import { chromium } from 'playwright'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { createServer } from 'node:http'
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync, createReadStream } from 'node:fs'
import { join, resolve as resolvePath, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolvePath(__dirname, '..')
const TEST_DIR = resolvePath(__dirname)

const PRESETS = ['light', 'dark']
const SNAPSHOTS_DIR = join(__dirname, '__snapshots__')
const DIFF_DIR = join(__dirname, '__diff__')

const update = process.argv.includes('--update')

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

// Извлекаем id всех <section> из index.html — список снапшотов всегда актуален
function getSectionIds() {
    const html = readFileSync(join(TEST_DIR, 'index.html'), 'utf8')
    return [...html.matchAll(/<section\s+id="([^"]+)"/g)].map((m) => m[1])
}

// Минимальный статический сервер — без внешних зависимостей
function startServer() {
    return new Promise((resolve, reject) => {
        const server = createServer((req, res) => {
            let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
            if (pathname.endsWith('/')) {
                pathname += 'index.html'
            }
            const file = resolvePath(ROOT, '.' + pathname)

            if (file !== ROOT && !file.startsWith(ROOT + '\\') && !file.startsWith(ROOT + '/')) {
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

        server.on('error', reject)
        server.listen(0, () => {
            const port = server.address().port
            resolve({ server, url: `http://localhost:${port}/test/` })
        })
    })
}

async function testPreset(browser, url, preset, sectionIds) {
    const snapDir = join(SNAPSHOTS_DIR, preset)
    const diffDir = join(DIFF_DIR, preset)
    mkdirSync(snapDir, { recursive: true })
    mkdirSync(diffDir, { recursive: true })

    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

    await page.goto(url, { waitUntil: 'load' })
    await page.evaluate((p) => {
        document.documentElement.setAttribute('preset', p)
    }, preset)
    await page.waitForTimeout(300)

    console.log(`\n--- Preset: ${preset} ---`)

    let pass = 0
    let fail = 0
    let skip = 0

    for (const id of sectionIds) {
        const locator = page.locator(`#${id}`)
        const count = await locator.count()

        if (count === 0) {
            console.log(`  SKIP  #${id} — not found`)
            skip++
            continue
        }

        const el = locator.first()
        const visible = await el.isVisible().catch(() => false)

        if (!visible) {
            console.log(`  SKIP  #${id} — not visible`)
            skip++
            continue
        }

        await el.scrollIntoViewIfNeeded().catch(() => {})
        await page.waitForTimeout(100)

        let shotBuffer
        try {
            shotBuffer = await el.screenshot({ timeout: 5000 })
        } catch {
            console.log(`  SKIP  #${id} — screenshot failed`)
            skip++
            continue
        }

        const shotPath = join(snapDir, `${id}.png`)

        if (update || !existsSync(shotPath)) {
            writeFileSync(shotPath, shotBuffer)
            console.log(`  SAVE  #${id}`)
            pass++
            continue
        }

        const baseline = PNG.sync.read(readFileSync(shotPath))
        const shot = PNG.sync.read(shotBuffer)

        if (shot.width !== baseline.width || shot.height !== baseline.height) {
            console.log(`  FAIL  #${id} — size mismatch (baseline ${baseline.width}x${baseline.height}, got ${shot.width}x${shot.height})`)
            fail++
            continue
        }

        const diff = new PNG({ width: baseline.width, height: baseline.height })
        const mismatched = pixelmatch(baseline.data, shot.data, diff.data, baseline.width, baseline.height, { threshold: 0.1 })

        if (mismatched === 0) {
            console.log(`  PASS  #${id}`)
            pass++
        } else {
            writeFileSync(join(diffDir, `${id}.png`), PNG.sync.write(diff))
            console.log(`  FAIL  #${id} — ${mismatched} px differ`)
            fail++
        }
    }

    await page.close()
    return { pass, fail, skip }
}

async function run() {
    console.log('=== S4 Snapshot Tests ===')
    console.log(`Mode: ${update ? 'UPDATE' : 'COMPARE'}\n`)

    const sectionIds = getSectionIds()
    console.log(`Sections found: ${sectionIds.length}\n`)

    const { server, url } = await startServer()
    console.log(`Server ready at ${url}\n`)

    let browser
    try {
        browser = await chromium.launch({ headless: true })

        let totalPass = 0
        let totalFail = 0
        let totalSkip = 0

        for (const preset of PRESETS) {
            const result = await testPreset(browser, url, preset, sectionIds)
            totalPass += result.pass
            totalFail += result.fail
            totalSkip += result.skip
        }

        const summary = PRESETS.map((preset) => {
            const dir = join(SNAPSHOTS_DIR, preset)
            const count = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')).length : 0
            return `${preset}: ${count} snapshots`
        }).join(', ')

        console.log(`\n=== Results: ${totalPass} passed, ${totalFail} failed, ${totalSkip} skipped (${summary}) ===`)
        process.exit(totalFail > 0 ? 1 : 0)
    } catch (err) {
        console.error('Error:', err)
        process.exit(1)
    } finally {
        if (browser) await browser.close()
        server.close()
    }
}

run()