#!/usr/bin/env node
/**
 * Menghasilkan konfigurasi header keamanan untuk Vercel & Nginx dari satu
 * sumber (security-headers.js), supaya kedua platform tidak pernah berbeda.
 *
 *   npm run gen:headers
 */

import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { daftarHeader } from '../security-headers.js'

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const header = daftarHeader()

// ── vercel.json ──────────────────────────────────────────────────────────────

const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  // SPA: semua rute yang bukan berkas nyata dilayani index.html.
  rewrites: [{ source: '/((?!assets/).*)', destination: '/index.html' }],
  headers: [
    {
      source: '/(.*)',
      headers: Object.entries(header).map(([key, value]) => ({ key, value })),
    },
    {
      // Aset ber-hash dari Vite aman di-cache selamanya.
      source: '/assets/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // index.html tidak boleh di-cache, agar rilis baru langsung terpakai.
      source: '/index.html',
      headers: [{ key: 'Cache-Control', value: 'no-cache, must-revalidate' }],
    },
  ],
}

writeFileSync(resolve(AKAR, 'vercel.json'), `${JSON.stringify(vercel, null, 2)}\n`)

// ── Cuplikan Nginx ───────────────────────────────────────────────────────────

const nginx = [
  '# ============================================================================',
  '# Header keamanan — DIHASILKAN OTOMATIS oleh scripts/gen-headers.js.',
  '# Jangan sunting berkas ini langsung; ubah security-headers.js lalu jalankan',
  '#   npm run gen:headers',
  '#',
  '# Sertakan di dalam blok server:',
  '#   include /etc/nginx/snippets/titiklapor-security.conf;',
  '# ============================================================================',
  '',
  ...Object.entries(header).map(
    // "always" memastikan header tetap terkirim pada respons error (4xx/5xx).
    ([key, value]) => `add_header ${key} "${value.replace(/"/g, '\\"')}" always;`
  ),
  '',
  '# Sembunyikan versi Nginx dari respons.',
  'server_tokens off;',
  '',
].join('\n')

writeFileSync(resolve(AKAR, 'deploy/nginx/security-headers.conf'), nginx)

console.log('✓ vercel.json & deploy/nginx/security-headers.conf diperbarui.')
for (const [key, value] of Object.entries(header)) {
  console.log(`  ${key}: ${value.slice(0, 72)}${value.length > 72 ? '…' : ''}`)
}
