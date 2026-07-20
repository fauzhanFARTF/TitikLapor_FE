/** Store autentikasi — sumber kebenaran identitas & peran pengguna. */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { authApi } from '@/api/auth'
import { ROLE, STORAGE_KEY } from '@/utils/constants'

function bacaUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY.USER) || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(bacaUser())
  const accessToken = ref(localStorage.getItem(STORAGE_KEY.ACCESS))
  const memuat = ref(false)

  const sudahMasuk = computed(() => Boolean(accessToken.value && user.value))
  const peran = computed(() => user.value?.role ?? null)
  const isAdmin = computed(() => peran.value === ROLE.ADMIN)
  const isPetugas = computed(() => peran.value === ROLE.PETUGAS)
  const isWarga = computed(() => peran.value === ROLE.WARGA)

  function simpanSesi({ user: profil, tokens }) {
    user.value = profil
    accessToken.value = tokens.access
    localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(profil))
    localStorage.setItem(STORAGE_KEY.ACCESS, tokens.access)
    localStorage.setItem(STORAGE_KEY.REFRESH, tokens.refresh)
  }

  function bersihkanSesi() {
    user.value = null
    accessToken.value = null
    Object.values(STORAGE_KEY)
      .filter((k) => k !== STORAGE_KEY.THEME) // preferensi tema tetap dipertahankan
      .forEach((k) => localStorage.removeItem(k))
  }

  async function masuk(kredensial) {
    memuat.value = true
    try {
      simpanSesi(await authApi.masuk(kredensial))
      return user.value
    } finally {
      memuat.value = false
    }
  }

  async function daftar(payload) {
    memuat.value = true
    try {
      simpanSesi(await authApi.daftar(payload))
      return user.value
    } finally {
      memuat.value = false
    }
  }

  /** Sinkronkan profil dari server — dipanggil saat aplikasi dimuat ulang. */
  async function muatProfil() {
    if (!accessToken.value) return null
    const profil = await authApi.profil()
    user.value = profil
    localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(profil))
    return profil
  }

  function keluar() {
    bersihkanSesi()
  }

  return {
    user,
    accessToken,
    memuat,
    sudahMasuk,
    peran,
    isAdmin,
    isPetugas,
    isWarga,
    masuk,
    daftar,
    muatProfil,
    keluar,
  }
})
