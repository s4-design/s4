const fs = require('fs')
const path = require('path')
const packageJson = require('./package.json')

const LICENSE_YEAR = 2024
const LICENSE_RU = 'Лицензии: на территории Российской Федерации действует MIT, за её пределами - CC BY-NC-SA 4.0'
const LICENSE_EN = 'Licenses: MIT applies within the territory of the Russian Federation, CC BY-NC-SA 4.0 outside it'

// Шаблон комментария
const headerTemplate =
`/*!
 * ${packageJson.name.toUpperCase()} v${packageJson.version} - ${packageJson.homepage}
 *
 * Авторское право (с) ${LICENSE_YEAR} ${packageJson.author.name}
 * Copyright (c) ${LICENSE_YEAR} ${packageJson.author.name}
 *
 * ${LICENSE_RU}
 * ${LICENSE_EN}
 */`

// Функция для добавления заголовка в файл
const addHeaderToFile = (filePath) => {
    // Чтение содержимого файла
    let content = fs.readFileSync(filePath, 'utf8')

    // Логирование информации о файле
    console.log(`Обработка файла | Processing file: ${filePath}`)

    // Удаление BOM, если Sass на Windows добавил его
    content = content.replace(/^\uFEFF/, '')

    // Проверка, есть ли уже комментарий (чтобы не добавлять дубликаты)
    if (content.startsWith('/*!')) {
        console.log(`Шапка уже существует | Header is exists in: ${filePath}`)
        return
    }

    // ! ВНИМАНИЕ - Удаление текущих комментариев запрещено, т.к. это приведет к уделению комментариев в файлах с лицензией, например: device-state.min.js !

    // Добавление заголовка и запись нового содержимого
    try {
        const newContent = headerTemplate + '\n' + content
        fs.writeFileSync(filePath, newContent, 'utf8')
        console.log(`Шапка добавлена | Added header to: ${filePath}`)
    } catch (e) {
        console.warn(`Не удалось записать шапку в | Could not write header to ${filePath} - ${e.message}`)
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
            console.log(`Вход в папку | Entering directory: ${filePath}`)
            addHeaderToFilesInDirectory(filePath)
        } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.css'))) {
            // Добавляем заголовок только в файлы с расширениями .js и .css
            if (file === 'device-state.min.js') {
                // device-state.min.js - внешний компонент (s4-device-state), у него собственная лицензионная шапка.
                console.log(`Пропуск внешнего файла | Skipping external file: ${filePath}`)
            } else {
                // Добавляем заголовок только в собственные файлы .js и .css
                addHeaderToFile(filePath)
            }
        } else {
            console.log(`Пропуск файла | Skipping file: ${filePath}`)
        }
    })
}

// Директория, где находятся файлы
const directory = path.join(__dirname, './s4')

// Запуск функции для указанной директории
addHeaderToFilesInDirectory(directory)
