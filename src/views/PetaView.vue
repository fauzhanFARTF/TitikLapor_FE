<script setup>
/** Peta laporan internal dengan filter status & kategori. */
import { onMounted, ref, watch } from 'vue'

import { laporanApi } from '@/api/laporan'
import { spatialApi } from '@/api/spatial'
import PetaLaporan from '@/components/map/PetaLaporan.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useLaporanStore } from '@/stores/laporan'
import { STATUS_LABEL } from '@/utils/constants'

const store = useLaporanStore()

const fitur = ref(null)
const titikPanas = ref([])
const memuat = ref(true)
const statusTerpilih = ref([])
const kategoriTerpilih = ref('')

function toggleStatus(kunci) {
  const i = statusTerpilih.value.indexOf(kunci)
  i === -1 ? statusTerpilih.value.push(kunci) : statusTerpilih.value.splice(i, 1)
}

async function muat() {
  memuat.value = true
  try {
    const params = {}
    if (statusTerpilih.value.length) params.status = statusTerpilih.value
    if (kategoriTerpilih.value) params.kategori = kategoriTerpilih.value

    const [geo, panas] = await Promise.all([
      laporanApi.geojson(params),
      spatialApi.heatmap(statusTerpilih.value),
    ])
    fitur.value = geo
    titikPanas.value = panas ?? []
  } finally {
    memuat.value = false
  }
}

watch([statusTerpilih, kategoriTerpilih], muat, { deep: true })

onMounted(async () => {
  await store.muatKategori()
  await muat()
})
</script>

<template>
  <div>
    <header class="row-between" style="margin-bottom: 16px">
      <div>
        <h1 class="page-title">Peta Laporan</h1>
        <p class="page-subtitle" style="margin: 0">
          {{ fitur?.features?.length ?? 0 }} titik ditampilkan.
        </p>
      </div>
      <button class="btn btn-secondary btn-sm" :disabled="memuat" @click="muat">
        <span v-if="memuat" class="spinner" />
        <AppIcon v-else name="refresh" :size="16" />
        Muat ulang
      </button>
    </header>

    <div class="filter card" style="margin-bottom: 16px; padding: 14px 16px">
      <div class="row" style="flex-wrap: wrap; gap: 7px">
        <button
          v-for="(label, kunci) in STATUS_LABEL"
          :key="kunci"
          class="chip"
          :class="{ 'is-active': statusTerpilih.includes(kunci) }"
          @click="toggleStatus(kunci)"
        >
          {{ label }}
        </button>

        <select v-model="kategoriTerpilih" class="select" style="max-width: 220px">
          <option value="">Semua kategori</option>
          <option v-for="k in store.kategori" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
      </div>
    </div>

    <div v-if="memuat && !fitur" class="skeleton" style="height: 560px" />
    <PetaLaporan v-else :fitur="fitur" :titik-panas="titikPanas" tinggi="calc(100vh - 290px)" />
  </div>
</template>
