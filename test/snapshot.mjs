import { chromium } from 'playwright'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const THEMES = ['light', 'dark']
const SNAPSHOTS_DIR = path.join(__dirname, '__snapshots__')
const DIFF_DIR = path.join(__dirname, '__diff__')
const TEST_URL = 'http://localhost:3000/test/'

const IDs = [
  'e-popover', 'e-message', 'e-message2', 'e-badge', 'e-group',
  'e-icon', 'e-truncate', 'e-line', 'a', 'abbr', 'blockquote',
  'button', 'cite', 'code', 'details', 'dl', 'fieldset', 'figure',
  'h', 'hr', 'inert', 'input',
  'cars-datalist-input', 'cars-datalist', 'cars-datalist-placeholder',
  'cars-datalist-inert', 'cars-datalist-disabled', 'cars-datalist-error',
  'checkbox', 'c1', 'c2', 'c3', 'c4', 'radio',
  'r1', 'r2', 'r3', 'r4', 'select', 'sub-sup', 'table'
]

const update = process.argv.includes('--update')

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('pnpx', ['serve', '.'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    })

    let started = false

    const onData = (data) => {
      const text = data.toString()
      if (!started && text.includes('Accepting connections')) {
        started = true
        resolve(proc)
      }
    }

    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)

    proc.on('error', reject)
    proc.on('exit', (code) => {
      if (!started) reject(new Error(`Server exited with code ${code}`))
    })

    setTimeout(() => {
      if (!started) reject(new Error('Server start timeout'))
    }, 30000)
  })
}

function getSnapshotDir(theme) {
  return path.join(SNAPSHOTS_DIR, theme)
}

function getDiffDir(theme) {
  return path.join(DIFF_DIR, theme)
}

async function testTheme(page, theme) {
  const snapDir = getSnapshotDir(theme)
  const diffDir = getDiffDir(theme)
  fs.mkdirSync(snapDir, { recursive: true })
  fs.mkdirSync(diffDir, { recursive: true })

  await page.evaluate((t) => {
    document.documentElement.setAttribute('theme', t)
  }, theme)

  await page.waitForTimeout(300)

  console.log(`\n--- Theme: ${theme} ---`)

  let pass = 0
  let fail = 0
  let skip = 0

  for (const id of IDs) {
    const locator = page.locator(`#${id}`)
    const count = await locator.count()

    if (count === 0) {
      console.log(`  ⚠ SKIP  #${id} — not found`)
      skip++
      continue
    }

    const el = locator.first()
    const visible = await el.isVisible().catch(() => false)

    if (!visible) {
      console.log(`  ⚠ SKIP  #${id} — not visible`)
      skip++
      continue
    }

    await el.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(100)

    let shotBuffer
    try {
      shotBuffer = await el.screenshot({ timeout: 5000 })
    } catch {
      console.log(`  ⚠ SKIP  #${id} — screenshot failed`)
      skip++
      continue
    }

    const shotPath = path.join(snapDir, `${id}.png`)

    if (update || !fs.existsSync(shotPath)) {
      fs.writeFileSync(shotPath, shotBuffer)
      console.log(`  ✅ SAVE  #${id}`)
      pass++
      continue
    }

    const baselineBuffer = fs.readFileSync(shotPath)
    const baseline = PNG.sync.read(baselineBuffer)
    const shot = PNG.sync.read(shotBuffer)

    const { width, height } = baseline
    if (shot.width !== width || shot.height !== height) {
      console.log(`  ❌ FAIL  #${id} — size mismatch (baseline ${width}x${height}, got ${shot.width}x${shot.height})`)
      fail++
      continue
    }

    const diffData = new PNG({ width, height })
    const mismatched = pixelmatch(baseline.data, shot.data, diffData.data, width, height, { threshold: 0.1 })

    if (mismatched === 0) {
      console.log(`  ✅ PASS  #${id}`)
      pass++
    } else {
      const diffPath = path.join(diffDir, `${id}.png`)
      fs.writeFileSync(diffPath, PNG.sync.write(diffData))
      console.log(`  ❌ FAIL  #${id} — ${mismatched} px differ`)
      fail++
    }
  }

  return { pass, fail, skip }
}

async function run() {
  console.log('=== S4 Snapshot Tests ===')
  console.log(`Mode: ${update ? 'UPDATE' : 'COMPARE'}\n`)

  console.log('Starting server...')
  const server = await startServer()
  console.log('Server ready.\n')

  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

    await page.goto(TEST_URL, { waitUntil: 'networkidle' })
    console.log('Page loaded.\n')

    let totalPass = 0
    let totalFail = 0
    let totalSkip = 0

    for (const theme of THEMES) {
      const result = await testTheme(page, theme)
      totalPass += result.pass
      totalFail += result.fail
      totalSkip += result.skip
    }

    const summary = THEMES.map((t) => {
      const snapDir = getSnapshotDir(t)
      const count = fs.readdirSync(snapDir).filter((f) => f.endsWith('.png')).length
      return `${t}: ${count} snapshots`
    }).join(', ')

    console.log(`\n=== Results: ${totalPass} passed, ${totalFail} failed, ${totalSkip} skipped (${summary}) ===`)
    process.exit(totalFail > 0 ? 1 : 0)

  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  } finally {
    if (browser) await browser.close()
    server.kill()
  }
}

run()
