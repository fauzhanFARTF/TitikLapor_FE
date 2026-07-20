/** Endpoint laporan & kategori. */

import { ambilData, ambilMeta, client } from './client'

export const laporanApi = {
  /** Daftar laporan berpaginasi; mengembalikan {data, meta}. */
  async daftar(params) {
    const response = await client.get('/laporan/', { params })
    return { data: ambilData(response), meta: ambilMeta(response) }
  },

  async detail(id) {
    return ambilData(await client.get(`/laporan/${id}/`))
  },

  /** Kirim laporan baru. FormData dipakai karena ada unggahan foto. */
  async buat(payload) {
    const form = new FormData()
    Object.entries(payload).forEach(([kunci, nilai]) => {
      if (nilai !== null && nilai !== undefined && nilai !== '') form.append(kunci, nilai)
    })
    return ambilData(await client.post('/laporan/', form))
  },

  async ubahStatus(id, payload) {
    const adaBerkas = payload.foto_penyelesaian instanceof File
    if (!adaBerkas) return ambilData(await client.post(`/laporan/${id}/status/`, payload))

    const form = new FormData()
    Object.entries(payload).forEach(([kunci, nilai]) => {
      if (nilai !== null && nilai !== undefined && nilai !== '') form.append(kunci, nilai)
    })
    return ambilData(await client.post(`/laporan/${id}/status/`, form))
  },

  async alihkan(id, payload) {
    return ambilData(await client.post(`/laporan/${id}/alihkan/`, payload))
  },

  async dukung(id) {
    return ambilData(await client.post(`/laporan/${id}/dukungan/`))
  },

  async tanggapi(id, payload) {
    return ambilData(await client.post(`/laporan/${id}/tanggapan/`, payload))
  },

  async hapus(id) {
    return ambilData(await client.delete(`/laporan/${id}/`))
  },

  /** GeoJSON FeatureCollection untuk layer peta. */
  async geojson(params) {
    return ambilData(await client.get('/laporan/geojson/', { params }))
  },

  async statistik(params) {
    return ambilData(await client.get('/laporan/statistik/', { params }))
  },

  async cekDuplikat(params) {
    return ambilData(await client.get('/laporan/cek-duplikat/', { params }))
  },
}

export const kategoriApi = {
  async daftar(params) {
    const response = await client.get('/kategori/', { params })
    return ambilData(response)
  },

  async buat(payload) {
    return ambilData(await client.post('/kategori/', payload))
  },

  async perbarui(id, payload) {
    return ambilData(await client.patch(`/kategori/${id}/`, payload))
  },
}

export const publikApi = {
  async petaLaporan() {
    return ambilData(await client.get('/publik/laporan/'))
  },

  async lacak(nomorTiket) {
    return ambilData(await client.get(`/publik/lacak/${nomorTiket}/`))
  },
}
