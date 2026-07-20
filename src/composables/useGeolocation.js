/** Akses lokasi perangkat untuk menandai titik laporan. */

import { ref } from 'vue'

export function useGeolocation() {
  const koordinat = ref(null)
  const memuat = ref(false)
  const error = ref('')

  function ambilLokasi(opsi = {}) {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        error.value = 'Perangkat ini tidak mendukung deteksi lokasi.'
        reject(new Error(error.value))
        return
      }

      memuat.value = true
      error.value = ''

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          koordinat.value = {
            lat: coords.latitude,
            lng: coords.longitude,
            akurasi: coords.accuracy,
          }
          memuat.value = false
          resolve(koordinat.value)
        },
        (gagal) => {
          memuat.value = false
          // Pesan bawaan browser berbahasa Inggris & teknis; ganti agar jelas.
          error.value =
            {
              1: 'Izin lokasi ditolak. Aktifkan lewat pengaturan situs, atau geser penanda peta secara manual.',
              2: 'Lokasi tidak dapat ditentukan. Pastikan GPS aktif.',
              3: 'Deteksi lokasi terlalu lama. Coba lagi.',
            }[gagal.code] ?? 'Gagal mendeteksi lokasi.'
          reject(new Error(error.value))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000, ...opsi }
      )
    })
  }

  return { koordinat, memuat, error, ambilLokasi }
}
