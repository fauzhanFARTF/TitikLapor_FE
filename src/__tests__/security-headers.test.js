/**
 * Menjaga agar kebijakan keamanan tidak melonggar tanpa disengaja.
 *
 * Pengujian ini membaca sumber definisi header dan hasil generatornya,
 * sehingga perubahan berbahaya (mis. menambah 'unsafe-eval') langsung gagal
 * di CI, bukan baru ketahuan saat pemindaian keamanan setelah rilis.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CSP, bangunCSP, daftarHeader } from '../../security-headers.js'

describe('Content-Security-Policy', () => {
  const csp = bangunCSP()

  it('tidak pernah mengizinkan skrip inline atau eval', () => {
    expect(CSP['script-src']).not.toContain("'unsafe-inline'")
    expect(CSP['script-src']).not.toContain("'unsafe-eval'")
    expect(csp).not.toContain('script-src-elem')
  })

  it('melarang penyematan situs dalam iframe', () => {
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })

  it('mengunci base-uri & form-action ke origin sendiri', () => {
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
  })

  it('menaikkan sub-resource http ke https', () => {
    expect(csp).toContain('upgrade-insecure-requests')
  })

  it('tidak memakai wildcard telanjang pada sumber apa pun', () => {
    for (const [direktif, sumber] of Object.entries(CSP)) {
      expect(sumber, `${direktif} memakai wildcard '*'`).not.toContain('*')
      expect(sumber, `${direktif} mengizinkan http polos`).not.toContain('http:')
    }
  })

  it('membuka host tile peta lewat https saja', () => {
    expect(CSP['img-src'].some((s) => s.includes('tile.openstreetmap.org'))).toBe(true)
    expect(CSP['img-src'].every((s) => !s.startsWith('http://'))).toBe(true)
  })
})

describe('Header keamanan wajib', () => {
  const header = daftarHeader()

  it.each([
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ])('%s terdefinisi', (nama) => {
    expect(header[nama]).toBeTruthy()
  })

  it('HSTS berlaku minimal satu tahun dan siap preload', () => {
    expect(header['Strict-Transport-Security']).toMatch(/max-age=(\d+)/)
    expect(Number(header['Strict-Transport-Security'].match(/max-age=(\d+)/)[1]))
      .toBeGreaterThanOrEqual(31536000)
    expect(header['Strict-Transport-Security']).toContain('includeSubDomains')
    expect(header['Strict-Transport-Security']).toContain('preload')
  })

  it('mematikan mikrofon namun membuka geolokasi untuk origin sendiri', () => {
    expect(header['Permissions-Policy']).toContain('microphone=()')
    expect(header['Permissions-Policy']).toContain('geolocation=(self)')
  })
})

describe('vercel.json hasil generator', () => {
  const vercel = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'))
  const global = vercel.headers.find((h) => h.source === '/(.*)')

  it('memuat seluruh header dari sumber definisi', () => {
    const terpasang = Object.fromEntries(global.headers.map((h) => [h.key, h.value]))
    expect(terpasang).toEqual(daftarHeader())
  })

  it('menyetel SPA rewrite ke index.html', () => {
    expect(vercel.rewrites[0].destination).toBe('/index.html')
  })

  it('tidak meng-cache index.html', () => {
    const html = vercel.headers.find((h) => h.source === '/index.html')
    expect(html.headers[0].value).toContain('no-cache')
  })
})
