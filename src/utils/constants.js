/** Konstanta domain — sumber tunggal label & warna status. */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Titik Lapor'

export const ROLE = {
  ADMIN: 'ADMIN',
  PETUGAS: 'PETUGAS',
  WARGA: 'WARGA',
}

export const ROLE_LABEL = {
  ADMIN: 'Administrator',
  PETUGAS: 'Petugas Instansi',
  WARGA: 'Warga',
}

export const STATUS = {
  BARU: 'BARU',
  DIVERIFIKASI: 'DIVERIFIKASI',
  DIPROSES: 'DIPROSES',
  SELESAI: 'SELESAI',
  DITOLAK: 'DITOLAK',
}

export const STATUS_LABEL = {
  BARU: 'Baru',
  DIVERIFIKASI: 'Diverifikasi',
  DIPROSES: 'Sedang Diproses',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak',
}

/** Warna diambil dari token CSS agar tema terang & gelap ikut menyesuaikan. */
export const STATUS_VAR = {
  BARU: 'var(--st-baru)',
  DIVERIFIKASI: 'var(--st-verifikasi)',
  DIPROSES: 'var(--st-proses)',
  SELESAI: 'var(--st-selesai)',
  DITOLAK: 'var(--st-tolak)',
}

/** Warna heksadesimal untuk penanda peta (Leaflet tidak membaca var CSS). */
export const STATUS_HEX = {
  BARU: '#64748b',
  DIVERIFIKASI: '#0284c7',
  DIPROSES: '#d97706',
  SELESAI: '#059669',
  DITOLAK: '#be123c',
}

/** Urutan alur kerja untuk linimasa laporan. */
export const ALUR_STATUS = [STATUS.BARU, STATUS.DIVERIFIKASI, STATUS.DIPROSES, STATUS.SELESAI]

export const PRIORITAS_LABEL = {
  RENDAH: 'Rendah',
  SEDANG: 'Sedang',
  TINGGI: 'Tinggi',
}

export const MAP_DEFAULT = {
  lat: Number(import.meta.env.VITE_MAP_CENTER_LAT ?? -6.1754),
  lng: Number(import.meta.env.VITE_MAP_CENTER_LNG ?? 106.8272),
  zoom: Number(import.meta.env.VITE_MAP_ZOOM ?? 13),
}

export const STORAGE_KEY = {
  ACCESS: 'titiklapor_access',
  REFRESH: 'titiklapor_refresh',
  USER: 'titiklapor_user',
  THEME: 'titiklapor_theme',
}
