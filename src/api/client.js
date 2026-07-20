/**
 * Klien HTTP bersama.
 *
 * Tanggung jawab:
 *  - menyisipkan token akses pada setiap permintaan,
 *  - memperbarui token yang kedaluwarsa satu kali lalu mengulang permintaan,
 *  - menormalkan amplop response backend {success, message, data, meta}.
 */

import axios from 'axios'

import { STORAGE_KEY } from '@/utils/constants'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const client = axios.create({
  baseURL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
})

// ── Permintaan ───────────────────────────────────────────────────────────────

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY.ACCESS)
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Biarkan browser menentukan boundary multipart saat mengunggah foto.
  if (config.data instanceof FormData) delete config.headers['Content-Type']
  return config
})

// ── Response & pembaruan token ───────────────────────────────────────────────

let sedangRefresh = null

async function perbaruiToken() {
  const refresh = localStorage.getItem(STORAGE_KEY.REFRESH)
  if (!refresh) throw new Error('Sesi berakhir.')

  // Instance polos: hindari interceptor memanggil dirinya sendiri.
  const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh })
  const akses = data.access ?? data?.data?.access
  localStorage.setItem(STORAGE_KEY.ACCESS, akses)
  if (data.refresh) localStorage.setItem(STORAGE_KEY.REFRESH, data.refresh)
  return akses
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const asli = error.config

    if (error.response?.status === 401 && !asli._ulang) {
      asli._ulang = true
      try {
        // Satu proses refresh dipakai bersama semua permintaan yang gagal
        // bersamaan, supaya tidak terjadi rotasi token beruntun.
        sedangRefresh = sedangRefresh || perbaruiToken()
        const token = await sedangRefresh
        sedangRefresh = null
        asli.headers.Authorization = `Bearer ${token}`
        return client(asli)
      } catch (gagal) {
        sedangRefresh = null
        localStorage.removeItem(STORAGE_KEY.ACCESS)
        localStorage.removeItem(STORAGE_KEY.REFRESH)
        localStorage.removeItem(STORAGE_KEY.USER)
        if (!window.location.pathname.startsWith('/masuk')) {
          window.location.assign('/masuk?sesi=habis')
        }
        return Promise.reject(gagal)
      }
    }

    return Promise.reject(error)
  }
)

/** Ambil isi `data` dari amplop response backend. */
export function ambilData(response) {
  const isi = response?.data
  return isi && Object.prototype.hasOwnProperty.call(isi, 'data') ? isi.data : isi
}

/** Ambil `meta` paginasi bila ada. */
export function ambilMeta(response) {
  return response?.data?.meta ?? null
}

/** Ubah error axios menjadi pesan yang layak ditampilkan ke pengguna. */
export function pesanError(error, fallback = 'Terjadi kesalahan. Coba lagi.') {
  const isi = error?.response?.data
  if (!isi) {
    return error?.code === 'ECONNABORTED'
      ? 'Permintaan terlalu lama. Periksa koneksi Anda.'
      : fallback
  }
  if (isi.message) return isi.message
  if (typeof isi.detail === 'string') return isi.detail
  return fallback
}

/** Kumpulkan error per-field untuk ditempelkan di formulir. */
export function errorField(error) {
  const errors = error?.response?.data?.errors
  if (!errors || typeof errors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(errors).map(([field, pesan]) => [
      field,
      Array.isArray(pesan) ? pesan[0] : String(pesan),
    ])
  )
}
