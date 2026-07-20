<script setup>
/** Peta terbuka: hanya laporan yang sudah diverifikasi, tanpa perlu akun. */
import { onMounted, ref } from 'vue'

import { publikApi } from '@/api/laporan'
import PetaLaporan from '@/components/map/PetaLaporan.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { APP_NAME } from '@/utils/constants'

const fitur = ref(null)
const memuat = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    fitur.value = await publikApi.petaLaporan()
  } catch {
    error.value = 'Data peta belum dapat dimuat. Coba beberapa saat lagi.'
  } finally {
    memuat.value = false
  }
})
</script>

<template>
  <div class="halaman">
    <header class="row-between" style="margin-bottom: 18px">
      <div>
        <h1 class="page-title">Peta Laporan Publik</h1>
        <p class="page-subtitle" style="margin: 0">
          Menampilkan laporan yang sudah diverifikasi petugas.
        </p>
      </div>
      <RouterLink to="/masuk" class="btn btn-primary btn-sm">
        <AppIcon name="user" :size="16" /> Masuk
      </RouterLink>
    </header>

    <div v-if="error" class="alert alert-warning" style="margin-bottom: 14px">
      <AppIcon name="alert" :size="18" />
      <span>{{ error }}</span>
    </div>

    <div v-if="memuat" class="skeleton" style="height: 560px" />
    <PetaLaporan v-else :fitur="fitur" tinggi="calc(100vh - 190px)" />
  </div>
</template>

<style scoped>
.halaman {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}
</style>
