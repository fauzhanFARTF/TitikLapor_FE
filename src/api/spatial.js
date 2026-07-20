/** Endpoint analisis spasial. */

import { ambilData, client } from './client'

export const spatialApi = {
  async wilayah(tingkat = 'KECAMATAN') {
    return ambilData(await client.get('/spatial/wilayah/', { params: { tingkat } }))
  },

  async agregasiWilayah(tingkat = 'KECAMATAN') {
    return ambilData(
      await client.get('/spatial/wilayah/agregasi/', { params: { tingkat } })
    )
  },

  /** Tentukan kelurahan/kecamatan dari koordinat yang dipilih di peta. */
  async wilayahDariTitik(lat, lon) {
    return ambilData(await client.get('/spatial/wilayah/reverse/', { params: { lat, lon } }))
  },

  async heatmap(status) {
    return ambilData(await client.get('/spatial/heatmap/', { params: { status } }))
  },

  async laporanSekitar(lat, lon, radius = 1000) {
    return ambilData(
      await client.get('/spatial/laporan-sekitar/', { params: { lat, lon, radius } })
    )
  },

  async fasilitas(jenis) {
    return ambilData(await client.get('/spatial/fasilitas/', { params: { jenis } }))
  },

  async fasilitasTerdekat(lat, lon, jenis) {
    return ambilData(
      await client.get('/spatial/fasilitas/terdekat/', { params: { lat, lon, jenis } })
    )
  },

  async rute(payload) {
    return ambilData(await client.post('/spatial/rute/', payload))
  },
}
