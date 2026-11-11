/* exported S4 */
// Определение базового URL для папки фреймворка
// Define base URL for framework folder
// script: .../s4/js/s4.min.js → baseUrl: .../s4/
const baseUrl = document.currentScript.src.split('/').slice(0, -2).join('/') + '/'

// Кэш промисов скриптов для идемпотентной загрузки
// Script promise cache for idempotent loading
const scriptPromises = new Map()

// Асинхронная загрузка скрипта (идемпотентно)
// Asynchronous script loading (idempotent)
function loadScript(url) {
    // Возвращаем уже запущенный промис, если скрипт уже загружается
    // Return the already pending promise if the script is already loading
    if (scriptPromises.has(url))
        return scriptPromises.get(url)

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    }).catch(error => {
        // Отказ не кэшируем, иначе одна сетевая осечка навсегда заблокирует повторные вызовы
        // Do not cache rejections, otherwise a single network failure blocks retries forever
        scriptPromises.delete(url)
        throw error
    })

    scriptPromises.set(url, promise)
    return promise
}

// Сет для кэширования загруженных CSS файлов
// Set for caching downloaded CSS files
const loadedLinks = new Set()
let _s4PresetIsAuto = false
// Признак однократной настройки пресета, слушателя и style
// Flag for one-time setup of preset, listener, and style
let _s4OneTimeInitialized = false
// Якорь, перед которым находятся utility-ссылки
// Anchor before which utility links are placed
let utilityAnchor = null

// Допустимые ключи и значения карты зависимостей (защита от опечаток в JSON)
// Allowed dependency map keys and values (protection against typos in JSON)
function isAllowedKey(key) {
    return ['desktop', 'tablet', 'mobile'].includes(key)
}
function isAllowedValue(val) {
    return ['landscape', 'portrait'].includes(val)
}

// Формирует id и путь к CSS-файлу зависимости
// Builds dependency id and CSS file path
function getDependencyInfo(dep) {
    const [device] = Object.keys(dep)
    const orientation = dep[device]
    return {
        device,
        orientation,
        id: `${device}/${orientation}-utilities`,
        href: `${baseUrl}css/${device}/${orientation}-utilities.css`
    }
}

// Загрузка карты зависимостей из JSON с проверкой и удалением дубликатов
// Load dependency map from JSON with validation and duplicate removal
async function loadDependencyMap(url) {
    try {
        const response = await fetch(url)
        if (!response.ok)
            throw new Error(`Ошибка загрузки JSON | Loading error JSON:\n${response.statusText}`)
        const data = await response.json()

        // Проверяем все ключи и значения через whitelist
        // Validate all keys and values through whitelist
        for (const device of Object.keys(data))
            for (const orientation of Object.keys(data[device])) {
                const seen = new Set()
                const unique = []

                for (const dep of data[device][orientation]) {
                    if (!isAllowedKey(Object.keys(dep)[0]) || !isAllowedValue(Object.values(dep)[0]))
                        throw new Error('Некорректная структура dependency-map | Invalid dependency-map structure')

                    const dependency = getDependencyInfo(dep)
                    // Пропускаем повторяющиеся зависимости, но продолжаем загрузку карты
                    // Skip duplicate dependencies but continue loading the map
                    if (seen.has(dependency.id)) {
                        console.error(`Дубликат зависимости (пропуск) | Duplicate dependency (skip):\n"${dependency.href}"`)
                        continue
                    }

                    seen.add(dependency.id)
                    unique.push(dep)
                }

                data[device][orientation] = unique
            }

        return data
    } catch (error) {
        console.error('Ошибка при загрузке или парсинге dependencyMap | Error loading or parsing dependencyMap:', error)
        // Возвращаем значения по умолчанию в случае ошибки или отсутствия JSON
        // Return default values in case of error or missing JSON
        return {
            "desktop": {
                "landscape": [{"desktop": "landscape"}],
                "portrait": [{"desktop": "portrait"}]
            },
            "tablet": {
                "landscape": [{"tablet": "landscape"}],
                "portrait": [{"tablet": "portrait"}]
            },
            "mobile": {
                "landscape": [{"mobile": "landscape"}],
                "portrait": [{"mobile": "portrait"}]
            }
        }
    }
}

// Функция для загрузки CSS файлов
// Function for loading CSS files
function loadLink(href, id = '') {
    if (loadedLinks.has(href))
        console.debug(`Уже загружен (пропуск) | Already loaded (skip):\n"${href}"`)
    else {
        // Сообщаем только здесь: к этому моменту известно, что файла ещё не было в кэше
        // Logged here only: at this point we know the file was not cached yet
        console.debug(`Добавлен | Added:\n"${href}"`)

        // Создание нового <link> элемента
        // Create a new <link> element
        const link = document.createElement('link')
        link.id = id
        link.href = href
        link.rel = 'stylesheet'
        link.onerror = () => {
            console.warn(`Ошибка загрузки CSS | Error loading CSS:\n"${href}"`)
            loadedLinks.delete(href)
            link.remove()
        }
        document.head.appendChild(link)
    
        // Добавление href в кэш
        // Add href to cache
        loadedLinks.add(href)
    }
}

// Возвращает якорь, перед которым находятся utility-ссылки
// Returns the anchor before which utility links are placed
function getUtilityAnchor() {
    if (!utilityAnchor || !utilityAnchor.isConnected) {
        utilityAnchor = document.createComment('s4-utilities')
        document.head.appendChild(utilityAnchor)
    }

    return utilityAnchor
}

// Создаёт utility-ссылку и регистрирует её в кеше
// Creates a utility link and registers it in the cache
function createUtilityLink({ id, href }) {
    console.debug(`Добавлен | Added:\n"${href}"`)

    const link = document.createElement('link')
    link.id = id
    link.href = href
    link.rel = 'stylesheet'
    link.dataset.s4Utility = ''
    link.onerror = () => {
        console.warn(`Ошибка загрузки CSS | Error loading CSS:\n"${href}"`)
        loadedLinks.delete(href)
        link.remove()
    }

    loadedLinks.add(href)
    return link
}

// Обновляет utility-ссылки: загружает, удаляет и выставляет порядок по карте
// Updates utility links: loads, removes, and orders them by the map
function updateLinks(currentDepends) {
    const anchor = getUtilityAnchor()
    const desired = currentDepends.map(getDependencyInfo)
    const desiredIds = new Set(desired.map(dep => dep.id))

    // Удаляем неиспользуемые стили
    // Remove unused styles
    for (const link of document.querySelectorAll('link[data-s4-utility]')) {
        if (desiredIds.has(link.id))
            continue

        console.debug(`Убран | Removed:\n"${link.href}"`)
        loadedLinks.delete(link.href)
        loadedLinks.delete(link.getAttribute('href'))
        link.remove()
    }

    // Загружаем отсутствующие стили
    // Load missing styles
    const desiredLinks = desired.map(dep => {
        // Ищем только utility-ссылку, чтобы не удалить чужой элемент с тем же id
        // Find only a utility link so a foreign element with the same id is not removed
        let link = document.querySelector(`link[data-s4-utility][id="${dep.id}"]`)

        if (link && (link.getAttribute('href') !== dep.href || !loadedLinks.has(dep.href))) {
            loadedLinks.delete(link.getAttribute('href'))
            link.remove()
            link = null
        }

        if (!link) {
            link = createUtilityLink(dep)
            document.head.insertBefore(link, anchor)
        }

        return link
    })

    // Переставляем существующие стили строго по порядку карты
    // Reorder existing styles strictly by map order
    const currentLinks = [...document.querySelectorAll('link[data-s4-utility]')]
    const orderMatches = currentLinks.length === desiredLinks.length &&
        currentLinks.every((link, index) => link === desiredLinks[index])

    if (orderMatches)
        return

    for (const link of desiredLinks)
        document.head.insertBefore(link, anchor)
}

// Функция для установки пресета на основе системных предпочтений
// Function for setting the preset based on system preferences
function setPresetBasedOnPreference() {
    if (!_s4PresetIsAuto)
        return
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
    document.documentElement.setAttribute('preset', prefersDarkScheme.matches ? 'dark' : 'light')
}

// Функция управления загрузкой и порядком CSS в зависимости от устройства и ориентации
// Function to control CSS loading and order depending on device and orientation
async function S4() {

    // Повторный вызов после успешной инициализации ничего не делает;
    // слушатель пресета и <style> со слоями добавляются один раз даже при ретрае.
    // Repeat calls after successful initialization are no-ops;
    // the preset listener and layer <style> are added once even on retry.
    const root = document.documentElement
    if (root.hasAttribute('data-s4-initialized'))
        return
    root.setAttribute('data-s4-initialized', '')

    if (!_s4OneTimeInitialized) {
        _s4OneTimeInitialized = true

        // Установка пресета при загрузке страницы
        // Set preset on page load
        const userPreset = root.getAttribute('preset')
        if (userPreset)
            _s4PresetIsAuto = false
        else {
            _s4PresetIsAuto = true
            setPresetBasedOnPreference()
        }

        // Следить за изменениями предпочтений пресета
        // Track changes in preset preferences
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', setPresetBasedOnPreference)

        // Добавление тега <style> со списком слоев стилей
        // Adding a <style> tag with a list of style layers
        const style = document.createElement('style')
        style.textContent = '@layer elements, presets, utilities;'
        document.head.appendChild(style)
    }

    try {
        // Загружаем независимые от устройства слои сразу, не дожидаясь определения типа
        // Load device-independent layers immediately, without waiting for device type
        loadLink(`${baseUrl}css/elements.css`, 'css/elements')
        loadLink(`${baseUrl}css/utilities.css`, 'css/utilities')

        // Параллельно загружаем скрипт устройства и карту зависимостей
        // Load the device-state script and the dependency map in parallel
        const [, dependencyMap] = await Promise.all([
            loadScript(`${baseUrl}js/device-state.min.js`),
            loadDependencyMap(`${baseUrl}dependency-map.json`)
        ])
        console.debug(`Скрипт device-state загружен успешно | The device-state script loaded successfully`)

        // Проверяем, что объект device определен после загрузки скрипта
        // Check that the device object is defined after loading the script
        if (typeof device === 'undefined')
            throw new Error('Объект device не определен | The device object is not defined')

        // После загрузки скрипта инициализируем переменные
        // After loading the script, initialize the variables
        let type = device.type,
            orientation = device.orientation,
            currentDepends = dependencyMap[type]?.[orientation] || []

        // Загружаем конфигурацию для текущего типа устройства (один раз, тип не меняется)
        // Load configuration for the current device type (once, type does not change)
        loadLink(`${baseUrl}css/${device.type}/config.css`, `${device.type}/config`)

        // Загружаем и упорядочиваем device-специфичные файлы стилей (конфигурации и утилиты)
        // Load and order device-specific css files (configuration and utilities)
        updateLinks(currentDepends)

        // Обновление и упорядочивание стилей при изменении ориентации устройства
        // Update and order styles when device orientation changes
        device.onChangeOrientation(newOrientation => {
            if (orientation !== newOrientation) {
                orientation = newOrientation
                currentDepends = dependencyMap[type]?.[orientation] || []
                updateLinks(currentDepends)
            }
        })
    } catch (error) {
        // Снимаем флаг, иначе после упавшей загрузки повторный вызов S4() уже ничего не сделает
        // Clear the flag, otherwise a failed load would make every later S4() call a no-op
        root.removeAttribute('data-s4-initialized')
        console.error('Ошибка при загрузке скрипта или инициализации устройства | Error loading script or initializing device:', error)
    }
}