<script setup>
/** Antrean kerja instansi: laporan yang menunggu tindakan, dalam bentuk tabel. */
import { computed, onMounted, ref } from 'vue'

import { laporanApi } from '@/api/laporan'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { STATUS_LABEL } from '@/utils/constants'
import { waktuRelatif } from '@/utils/format'

const daftar = ref([])
const meta = ref(null)
const memuat = ref(true)
const tab = ref('AKTIF')

const TAB = {
  AKTIF: { label: 'Perlu Tindakan', status: ['BARU', 'DIVERIFIKASI', 'DIPROSES'] },
  SELESAI: { label: 'Selesai', status: ['SELESAI'] },
  DITOLAK: { label: 'Ditolak', status: ['DITOLAK'] },
}

const kosong = computed(() => !memuat.value && !daftar.value.length)

async function muat(halaman = 1) {
  memuat.value = true
  try {
    const hasil = await laporanApi.daftar({
      status: TAB[tab.value].status,
      page: halaman,
      page_size: 20,
    })
    daftar.value = hasil.data ?? []
    meta.value = hasil.meta
  } finally {
    memuat.value = false
  }
}

function gantiTab(kunci) {
  tab.value = kunci
  muat(1)
}

onMounted(() => muat())
</script>

<template>
  <div>
    <header class="row-between" style="margin-bottom: 18px">
      <div>
        <h1 class="page-title">Antrean Instansi</h1>
        <p class="page-subtitle" style="margin: 0">
          Laporan yang menjadi tanggung jawab instansi Anda.
        </p>
      </div>
      <button class="btn btn-secondary btn-sm" :disabled="memuat" @click="muat(meta?.page ?? 1)">
        <span v-if="memuat" class="spinner" />
        <AppIcon v-else name="refresh" :size="16" />
        Muat ulang
      </button>
    </header>

    <div class="row" style="gap: 7px; margin-bottom: 16px">
      <button
        v-for="(konf, kunci) in TAB"
        :key="kunci"
        class="chip"
        :class="{ 'is-active': tab === kunci }"
        @click="gantiTab(kunci)"
      >
        {{ konf.label }}
      </button>
    </div>

    <div v-if="memuat" class="skeleton" style="height: 320px" />

    <template v-else-if="daftar.length">
      <div class="table-wrap" style="margin-bottom: 18px">
        <table class="table">
          <thead>
            <tr>
              <th>Nomor Tiket</th>
              <th>Laporan</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Dukungan</th>
              <th>Masuk</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in daftar" :key="l.id">
              <td class="mono">{{ l.nomor_tiket }}</td>
              <td>
                <strong style="display: block">{{ l.judul }}</strong>
                <span class="text-muted" style="font-size: 0.78rem">
                  {{ l.alamat || l.kelurahan || '—' }}
                </span>
              </td>
              <td>
                <span class="badge badge-neutral" :style="{ color: l.kategori_warna }">
                  {{ l.kategori_nama }}
                </span>
              </td>
              <td><StatusBadge :status="l.status" /></td>
              <td>{{ l.jumlah_dukungan }}</td>
              <td class="text-muted" style="white-space: nowrap">
                {{ waktuRelatif(l.created_at) }}
              </td>
              <td>
                <RouterLink :to="`/app/laporan/${l.id}`" class="btn btn-secondary btn-sm">
                  Tindak lanjuti
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AppPagination :meta="meta" @ganti="muat" />
    </template>

    <EmptyState
      v-else-if="kosong"
      icon="checkCircle"
      judul="Antrean bersih"
      :pesan="
        tab === 'AKTIF'
          ? 'Tidak ada laporan yang menunggu tindakan saat ini.'
          : `Belum ada laporan berstatus ${STATUS_LABEL[TAB[tab].status[0]]}.`
      "
    />
  </div>
</template>
