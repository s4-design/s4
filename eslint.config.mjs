import js from '@eslint/js'
import globals from 'globals'

export default [
    js.configs.recommended,
    {
        files: ['src/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: {
                ...globals.browser,
                device: 'readonly',
            },
        },
        rules: {
            eqeqeq: ['error', 'always', { null: 'ignore' }],
        },
    },
]
