<script setup>
/** Daftar laporan dengan filter, pencarian, dan paginasi. */
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import KartuLaporan from '@/components/report/KartuLaporan.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { useLaporanStore } from '@/stores/laporan'
import { STATUS_LABEL } from '@/utils/constants'

const store = useLaporanStore()
const auth = useAuthStore()
const route = useRoute()

const kueri = ref(route.query.q ?? '')
let timerKetik = null

/** Tunda permintaan 400 ms agar tidak memanggil API tiap ketukan tombol. */
watch(kueri, (nilai) => {
  clearTimeout(timerKetik)
  timerKetik = setTimeout(() => store.setFilter({ q: nilai }), 400)
})

function toggleStatus(kunci) {
  const daftar = [...store.filter.status]
  const i = daftar.indexOf(kunci)
  i === -1 ? daftar.push(kunci) : daftar.splice(i, 1)
  store.setFilter({ status: daftar })
}

onMounted(async () => {
  await store.muatKategori()
  await store.setFilter({ q: kueri.value })
})
</script>

<template>
  <div>
    <header class="row-between" style="margin-bottom: 18px">
      <div>
        <h1 class="page-title">Daftar Laporan</h1>
        <p class="page-subtitle" style="margin: 0">
          {{ store.meta?.count ?? 0 }} laporan sesuai filter.
        </p>
      </div>
      <RouterLink v-if="auth.isWarga" to="/app/lapor" class="btn btn-gradient btn-sm">
        <AppIcon name="plus" :size="16" /> Buat Laporan
      </RouterLink>
    </header>

    <section class="card" style="padding: 14px 16px; margin-bottom: 18px">
      <div class="row" style="gap: 10px; flex-wrap: wrap">
        <div class="input-group" style="flex: 1; min-width: 220px">
          <span class="input-icon"><AppIcon name="search" :size="17" /></span>
          <input
            v-model="kueri"
            class="input"
            type="search"
            placeholder="Cari judul, alamat, atau nomor tiket…"
            aria-label="Cari laporan"
          />
        </div>

        <select
          :value="store.filter.kategori"
          class="select"
          style="max-width: 210px"
          aria-label="Filter kategori"
          @change="store.setFilter({ kategori: $event.target.value })"
        >
          <option value="">Semua kategori</option>
          <option v-for="k in store.kategori" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>

        <button
          v-if="store.adaFilterAktif"
          class="btn btn-ghost btn-sm"
          @click="((kueri = ''), store.resetFilter())"
        >
          <AppIcon name="close" :size="15" /> Bersihkan
        </button>
      </div>

      <div class="row" style="gap: 7px; margin-top: 12px; flex-wrap: wrap">
        <button
          v-for="(label, kunci) in STATUS_LABEL"
          :key="kunci"
          class="chip"
          :class="{ 'is-active': store.filter.status.includes(kunci) }"
          @click="toggleStatus(kunci)"
        >
          {{ label }}
        </button>
      </div>
    </section>

    <div v-if="store.memuat" class="grid grid-cards">
      <div v-for="n in 6" :key="n" class="skeleton" style="height: 280px" />
    </div>

    <template v-else-if="store.daftar.length">
      <div class="grid grid-cards" style="margin-bottom: 22px">
        <KartuLaporan v-for="l in store.daftar" :key="l.id" :laporan="l" />
      </div>
      <AppPagination :meta="store.meta" @ganti="store.setFilter({ page: $event })" />
    </template>

    <EmptyState
      v-else
      icon="search"
      judul="Tidak ada laporan yang cocok"
      pesan="Coba longgarkan filter atau ubah kata kunci pencarian."
    >
      <button v-if="store.adaFilterAktif" class="btn btn-secondary btn-sm" @click="((kueri = ''), store.resetFilter())">
        Bersihkan filter
      </button>
    </EmptyState>
  </div>
</template>
