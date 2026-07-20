/** Pemformat tampilan. Semua waktu dipaksa ke WIB agar konsisten lintas zona. */

const ZONA = 'Asia/Jakarta'

export function formatTanggal(nilai, opsi = {}) {
  if (!nilai) return '—'
  return new Date(nilai).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: ZONA,
    ...opsi,
  })
}

export function formatWaktu(nilai) {
  if (!nilai) return '—'
  return new Date(nilai).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
  })
}

/** "3 jam lalu" — lebih mudah dibaca daripada timestamp penuh di daftar. */
export function waktuRelatif(nilai) {
  if (!nilai) return '—'
  const detik = Math.floor((Date.now() - new Date(nilai).getTime()) / 1000)

  const satuan = [
    ['tahun', 31536000],
    ['bulan', 2592000],
    ['minggu', 604800],
    ['hari', 86400],
    ['jam', 3600],
    ['menit', 60],
  ]
  for (const [nama, ambang] of satuan) {
    const jumlah = Math.floor(detik / ambang)
    if (jumlah >= 1) return `${jumlah} ${nama} lalu`
  }
  return 'baru saja'
}

export function formatAngka(nilai) {
  return new Intl.NumberFormat('id-ID').format(nilai ?? 0)
}

export function formatJarak(meter) {
  if (meter == null) return '—'
  return meter < 1000 ? `${Math.round(meter)} m` : `${(meter / 1000).toFixed(2)} km`
}

export function formatDurasi(menit) {
  if (menit == null) return '—'
  if (menit < 60) return `${Math.round(menit)} menit`
  const jam = Math.floor(menit / 60)
  const sisa = Math.round(menit % 60)
  return sisa ? `${jam} jam ${sisa} menit` : `${jam} jam`
}

export function inisial(nama = '') {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? '')
    .join('')
}
