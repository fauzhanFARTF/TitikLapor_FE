/** Store laporan — daftar, filter, dan aksi tindak lanjut. */

import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

import { kategoriApi, laporanApi } from '@/api/laporan'

const FILTER_AWAL = {
  q: '',
  status: [],
  kategori: '',
  instansi: '',
  page: 1,
  page_size: 12,
}

export const useLaporanStore = defineStore('laporan', () => {
  const daftar = ref([])
  const meta = ref(null)
  const kategori = ref([])
  const statistik = ref(null)
  const memuat = ref(false)
  const error = ref('')
  const filter = reactive({ ...FILTER_AWAL })

  const adaFilterAktif = computed(
    () => Boolean(filter.q || filter.status.length || filter.kategori || filter.instansi)
  )

  /** Buang kunci kosong supaya URL query tetap ringkas & mudah dibaca. */
  function paramsBersih() {
    return Object.fromEntries(
      Object.entries(filter).filter(([, nilai]) =>
        Array.isArray(nilai) ? nilai.length : nilai !== '' && nilai != null
      )
    )
  }

  async function muat() {
    memuat.value = true
    error.value = ''
    try {
      const hasil = await laporanApi.daftar(paramsBersih())
      daftar.value = hasil.data ?? []
      meta.value = hasil.meta
    } catch (e) {
      error.value = e.message
      daftar.value = []
    } finally {
      memuat.value = false
    }
  }

  async function muatKategori() {
    if (kategori.value.length) return kategori.value // cukup sekali per sesi
    kategori.value = (await kategoriApi.daftar({ is_active: true })) ?? []
    return kategori.value
  }

  async function muatStatistik() {
    statistik.value = await laporanApi.statistik(paramsBersih())
    return statistik.value
  }

  function setFilter(perubahan) {
    Object.assign(filter, perubahan)
    if (!('page' in perubahan)) filter.page = 1 // filter baru selalu mulai dari halaman 1
    return muat()
  }

  function resetFilter() {
    Object.assign(filter, { ...FILTER_AWAL, status: [] })
    return muat()
  }

  /** Perbarui satu baris di daftar tanpa memuat ulang seluruh halaman. */
  function gantiSatu(laporan) {
    const indeks = daftar.value.findIndex((l) => l.id === laporan.id)
    if (indeks !== -1) daftar.value[indeks] = { ...daftar.value[indeks], ...laporan }
  }

  return {
    daftar,
    meta,
    kategori,
    statistik,
    memuat,
    error,
    filter,
    adaFilterAktif,
    muat,
    muatKategori,
    muatStatistik,
    setFilter,
    resetFilter,
    gantiSatu,
  }
})
