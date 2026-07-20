/** Endpoint autentikasi & pengguna. */

import { ambilData, client } from './client'

export const authApi = {
  async masuk(payload) {
    return ambilData(await client.post('/auth/login/', payload))
  },

  async daftar(payload) {
    return ambilData(await client.post('/auth/register/', payload))
  },

  async profil() {
    return ambilData(await client.get('/auth/profil/'))
  },

  async perbaruiProfil(payload) {
    return ambilData(await client.patch('/auth/profil/', payload))
  },

  async ubahSandi(payload) {
    return ambilData(await client.post('/auth/ubah-sandi/', payload))
  },
}

export const penggunaApi = {
  async daftar(params) {
    return ambilData(await client.get('/auth/pengguna/', { params }))
  },

  async buatInternal(payload) {
    return ambilData(await client.post('/auth/pengguna/internal/', payload))
  },

  async nonaktifkan(id) {
    return ambilData(await client.post(`/auth/pengguna/${id}/nonaktifkan/`))
  },

  async aktifkan(id) {
    return ambilData(await client.post(`/auth/pengguna/${id}/aktifkan/`))
  },
}

export const instansiApi = {
  async daftar(params) {
    return ambilData(await client.get('/auth/instansi/', { params }))
  },

  async buat(payload) {
    return ambilData(await client.post('/auth/instansi/', payload))
  },

  async perbarui(id, payload) {
    return ambilData(await client.patch(`/auth/instansi/${id}/`, payload))
  },

  async hapus(id) {
    return ambilData(await client.delete(`/auth/instansi/${id}/`))
  },
}
