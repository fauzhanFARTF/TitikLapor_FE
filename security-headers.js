/**
 * Sumber tunggal definisi header keamanan HTTP frontend.
 *
 * Berkas ini dipakai tiga hal sekaligus agar nilainya tidak pernah menyimpang
 * antar-platform:
 *   1. `npm run gen:headers` → menulis ulang vercel.json & deploy/nginx,
 *   2. pengujian Vitest (memastikan direktif berbahaya tidak masuk),
 *   3. rujukan saat menambah host baru (mis. penyedia tile peta lain).
 *
 * Ubah di sini, jalankan generator, lalu commit hasilnya.
 */

/** Host penyedia tile peta yang dipakai komponen Leaflet. */
export const HOST_TILE = [
  'https://*.tile.openstreetmap.org',
  'https://*.tile.opentopomap.org',
]

/**
 * Origin API & penyimpanan media.
 *
 * Ganti nilai ini dengan domain produksi Anda sebelum deploy. Bila frontend
 * dan API berbagi domain (mis. lewat proxy Nginx), cukup sisakan `'self'` dan
 * kosongkan array ini.
 */
export const HOST_API = [
  'https://api.titiklapor.id',
  'https://*.supabase.co', // media laporan di Supabase Storage
]

/**
 * Content-Security-Policy.
 *
 * Catatan pilihan direktif:
 * - `script-src` tanpa 'unsafe-inline'/'unsafe-eval'. Vite mengeluarkan
 *   seluruh JavaScript sebagai berkas terpisah, dan skrip inisialisasi tema
 *   sengaja diletakkan di /theme-init.js supaya aturan ini bisa dipertahankan.
 * - `style-src` memuat 'unsafe-inline' karena Leaflet mengatur posisi tile &
 *   penanda lewat atribut style pada elemen — tidak ada cara mematikannya
 *   tanpa mem-fork pustakanya.
 * - `img-src` membuka `data:` (ikon SVG sebaris) dan `blob:` (pratinjau foto
 *   sebelum diunggah).
 */
export const CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', ...HOST_TILE, ...HOST_API],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", ...HOST_API],
  'media-src': ["'self'", 'blob:'],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'none'"],
}

/** Fitur browser yang dimatikan. `geolocation` tetap dibuka untuk 'self'. */
export const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'autoplay=()',
  'camera=(self)', // unggah foto laporan langsung dari kamera
  'display-capture=()',
  'encrypted-media=()',
  'fullscreen=(self)',
  'geolocation=(self)', // menandai lokasi laporan
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'usb=()',
  'xr-spatial-tracking=()',
  'interest-cohort=()',
].join(', ')

export function bangunCSP() {
  const direktif = Object.entries(CSP).map(([nama, nilai]) => `${nama} ${nilai.join(' ')}`)
  direktif.push('upgrade-insecure-requests')
  return direktif.join('; ')
}

/** Daftar header lengkap sebagai pasangan nama→nilai. */
export function daftarHeader() {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': bangunCSP(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': PERMISSIONS_POLICY,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-DNS-Prefetch-Control': 'off',
  }
}
