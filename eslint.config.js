/**
 * Konfigurasi ESLint 9 (flat config).
 *
 * Fokusnya menangkap kesalahan yang benar-benar merugikan — variabel tak
 * terpakai, `console.log` yang lolos ke produksi, komponen Vue yang salah
 * bentuk. Urusan tata letak (kutip, titik koma, lebar baris) diserahkan
 * sepenuhnya kepada Prettier supaya keduanya tidak saling menimpa.
 */

import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'public/theme-init.js'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        confirm: 'readonly',
        Intl: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      // console.log tidak boleh lolos ke produksi; warn & error tetap boleh.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',

      // Nama komponen satu kata memang disengaja pada view (App, Beranda…).
      'vue/multi-word-component-names': 'off',
      // Diserahkan ke Prettier.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attributes-order': 'off',
    },
  },

  {
    // Berkas Node (skrip build & konfigurasi) punya global berbeda.
    files: ['scripts/**/*.js', '*.config.js', 'security-headers.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      // Skrip CLI memang berkomunikasi lewat stdout — itu keluarannya, bukan
      // sisa debugging.
      'no-console': 'off',
    },
  },

  {
    files: ['src/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        process: 'readonly',
      },
    },
  },
]
