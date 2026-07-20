<script setup>
/** Analitik spasial: sebaran laporan per wilayah & peta panas. */
import { onMounted, ref } from 'vue'

import { spatialApi } from '@/api/spatial'
import PetaLaporan from '@/components/map/PetaLaporan.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { formatAngka } from '@/utils/format'

const agregasi = ref([])
const titikPanas = ref([])
const memuat = ref(true)
const tingkat = ref('KECAMATAN')

async function muat() {
  memuat.value = true
  try {
    const [wilayah, panas] = await Promise.all([
      spatialApi.agregasiWilayah(tingkat.value),
      spatialApi.heatmap(),
    ])
    agregasi.value = wilayah ?? []
    titikPanas.value = panas ?? []
  } finally {
    memuat.value = false
  }
}

onMounted(muat)
</script>

<template>
  <div>
    <header class="row-between" style="margin-bottom: 18px">
      <div>
        <h1 class="page-title">Analitik Spasial</h1>
        <p class="page-subtitle" style="margin: 0">
          Sebaran laporan dihitung lewat spatial join titik laporan ke batas wilayah.
        </p>
      </div>
      <select
        v-model="tingkat"
        class="select"
        style="max-width: 190px"
        aria-label="Tingkat wilayah"
        @change="muat"
      >
        <option value="KECAMATAN">Per Kecamatan</option>
        <option value="KELURAHAN">Per Kelurahan</option>
      </select>
    </header>

    <section class="card card-flush" style="margin-bottom: 20px">
      <PetaLaporan :titik-panas="titikPanas" mode="panas" tinggi="420px" />
    </section>

    <section class="card">
      <div class="card-head">
        <h2 class="card-title">Peringkat Wilayah</h2>
        <AppIcon name="chart" :size="17" style="color: var(--muted)" />
      </div>

      <div v-if="memuat" class="skeleton" style="height: 240px" />

      <div v-else-if="agregasi.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Wilayah</th>
              <th>Total Laporan</th>
              <th>Selesai</th>
              <th>Rasio Penyelesaian</th>
              <th>Kepadatan / km²</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in agregasi" :key="w.id">
              <td>
                <strong>{{ w.nama }}</strong>
                <span class="text-muted mono" style="display: block; font-size: 0.74rem">
                  {{ w.kode }}
                </span>
              </td>
              <td>{{ formatAngka(w.total_laporan) }}</td>
              <td>{{ formatAngka(w.selesai) }}</td>
              <td>
                <div class="row" style="gap: 9px">
                  <div class="bar" style="width: 90px">
                    <span
                      :style="{
                        width: `${w.persen_selesai}%`,
                        background: w.persen_selesai >= 70 ? 'var(--success)' : 'var(--warning)',
                      }"
                    />
                  </div>
                  <span style="font-size: 0.8rem">{{ w.persen_selesai }}%</span>
                </div>
              </td>
              <td>{{ w.kepadatan_per_km2 ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else
        icon="map"
        judul="Data batas wilayah belum tersedia"
        pesan="Impor batas administratif (kecamatan/kelurahan) ke tabel wilayah agar peringkat ini terisi."
      />
    </section>
  </div>
</template>

<style scoped>
.bar {
  height: 6px;
  border-radius: 999px;
  background: var(--raised);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
}
</style>
