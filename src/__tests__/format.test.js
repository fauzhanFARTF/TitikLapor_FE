import { describe, expect, it } from 'vitest'

import { formatAngka, formatDurasi, formatJarak, inisial, waktuRelatif } from '@/utils/format'

describe('formatJarak', () => {
  it('memakai meter di bawah satu kilometer', () => {
    expect(formatJarak(850)).toBe('850 m')
  })

  it('beralih ke kilometer pada jarak jauh', () => {
    expect(formatJarak(2540)).toBe('2.54 km')
  })

  it('menangani nilai kosong tanpa melempar', () => {
    expect(formatJarak(null)).toBe('—')
  })
})

describe('formatDurasi', () => {
  it('menampilkan menit saja di bawah satu jam', () => {
    expect(formatDurasi(45)).toBe('45 menit')
  })

  it('memecah jam dan menit', () => {
    expect(formatDurasi(135)).toBe('2 jam 15 menit')
  })

  it('menghilangkan menit ketika pas satu jam', () => {
    expect(formatDurasi(120)).toBe('2 jam')
  })
})

describe('waktuRelatif', () => {
  it('menyebut "baru saja" untuk kejadian di bawah semenit', () => {
    expect(waktuRelatif(new Date())).toBe('baru saja')
  })

  it('menghitung mundur dalam jam', () => {
    const tigaJamLalu = new Date(Date.now() - 3 * 3600 * 1000)
    expect(waktuRelatif(tigaJamLalu)).toBe('3 jam lalu')
  })
})

describe('inisial', () => {
  it('mengambil dua huruf pertama dari dua kata awal', () => {
    expect(inisial('Fauzan Nurrachman')).toBe('FN')
  })

  it('menangani nama satu kata', () => {
    expect(inisial('Budi')).toBe('B')
  })

  it('mengabaikan spasi berlebih', () => {
    expect(inisial('  Siti   Aminah  Putri ')).toBe('SA')
  })
})

describe('formatAngka', () => {
  it('memakai pemisah ribuan gaya Indonesia', () => {
    expect(formatAngka(1234567)).toBe('1.234.567')
  })

  it('menganggap nilai kosong sebagai nol', () => {
    expect(formatAngka(null)).toBe('0')
  })
})
