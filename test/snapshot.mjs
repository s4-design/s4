import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, cpSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');

const srcDir = join(root, 's4', 'css');
const snapDir = join(root, 'test', '__snapshots__', 's4', 'css');
const update = process.argv.includes('--update');

function walk(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(full));
        } else {
            files.push(full);
        }
    }
    return files;
}

function relativePath(file) {
    return relative(srcDir, file);
}

function snapPath(file) {
    return join(snapDir, relativePath(file));
}

const srcFiles = walk(srcDir);

if (update) {
    // Копируем все файлы из s4/css в __snapshots__/s4/css
    for (const file of srcFiles) {
        const dest = snapPath(file);
        const destDir = join(dest, '..');
        if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
        }
        cpSync(file, dest);
    }
    console.log(`[snapshot] Снапшоты обновлены: ${srcFiles.length} файлов`);
    process.exit(0);
}

// Режим проверки
let failed = false;
for (const file of srcFiles) {
    const rel = relativePath(file);
    const snap = snapPath(file);

    if (!existsSync(snap)) {
        console.error(`[FAIL] Снапшот не найден: ${rel} (запусти с --update)`);
        failed = true;
        continue;
    }

    const actualContent = readFileSync(file);
    const expectedContent = readFileSync(snap);

    try {
        assert.deepStrictEqual(actualContent, expectedContent);
    } catch {
        console.error(`[FAIL] ${rel} — отличается от снапшота`);
        // Показываем размеры
        const aStat = statSync(file);
        const eStat = statSync(snap);
        console.error(`  actual:   ${aStat.size} bytes`);
        console.error(`  expected: ${eStat.size} bytes`);
        failed = true;
    }
}

// Проверяем, что нет лишних файлов в снапшотах
const snapFiles = walk(snapDir);
for (const file of snapFiles) {
    const rel = relative(snapDir, file);
    const src = join(srcDir, rel);
    if (!existsSync(src)) {
        console.error(`[WARN] Файл снапшота отсутствует в исходниках: ${rel}`);
    }
}

if (failed) {
    process.exit(1);
}

console.log(`[PASS] Снапшоты совпадают: ${srcFiles.length} файлов`);
