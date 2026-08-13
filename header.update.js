const fs = require('fs')
const path = require('path')
const packageJson = require('./package.json')

// Шаблон комментария
const headerTemplate =
`/*!
 * ${packageJson.name.toUpperCase()} v${packageJson.version} - ${packageJson.homepage}
 *
 * Авторское право © ${new Date().getFullYear()} ${packageJson.author.name}
 * Copyright © ${new Date().getFullYear()} ${packageJson.author.name}
 *
 * Выпущен по лицензии ${packageJson.license}
 * Released under the ${packageJson.license} License
 */`

// Функция для добавления заголовка в файл
const addHeaderToFile = (filePath) => {
    // Чтение содержимого файла
    let content = fs.readFileSync(filePath, 'utf8')

    // Логирование информации о файле
    console.log(`Processing file: ${filePath}`)

    // Удаление BOM, если Sass на Windows добавил его
    content = content.replace(/^\uFEFF/, '')

    // Проверка, есть ли уже комментарий (чтобы не добавлять дубликаты)
    if (content.startsWith('/*!')) {
        console.log(`Header already exists in: ${filePath}`)
        return
    }

    // ! ВНИМАНИЕ - Удаление текущих комментариев запрещено, т.к. это приведет к уделению комментариев в файлах с лицензией, например: device-state.min.js !

    // Добавление заголовка и запись нового содержимого
    try {
        const newContent = headerTemplate + '\n' + content
        fs.writeFileSync(filePath, newContent, 'utf8')
        console.log(`Added header to: ${filePath}`)
    } catch (e) {
        console.warn(`Warning: Could not write header to ${filePath} — ${e.message}`)
    }
}

// Рекурсивная функция для обработки файлов в папке и поддиректориях
const addHeaderToFilesInDirectory = (dir) => {
    const files = fs.readdirSync(dir)

    files.forEach((file) => {
        const filePath = path.join(dir, file)
        const stats = fs.statSync(filePath)

        if (stats.isDirectory()) {
            // Если это папка, запускаем рекурсивно обработку этой папки
            console.log(`Entering directory: ${filePath}`)
            addHeaderToFilesInDirectory(filePath)
        } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.css'))) {
            // Добавляем заголовок только в файлы с расширениями .js и .css
            addHeaderToFile(filePath)
        } else {
            console.log(`Skipping file: ${filePath}`)
        }
    })
}

// Директория, где находятся файлы
const directory = path.join(__dirname, './s4')

// Запуск функции для указанной директории
addHeaderToFilesInDirectory(directory)
