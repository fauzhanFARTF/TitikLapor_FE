<script setup>
/** Dasbor ringkasan — isi menyesuaikan peran pengguna. */
import { onMounted, ref } from 'vue'

import { laporanApi } from '@/api/laporan'
import KartuLaporan from '@/components/report/KartuLaporan.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useAuthStore } from '@/stores/auth'
import { STATUS_HEX, STATUS_LABEL } from '@/utils/constants'
import { formatAngka } from '@/utils/format'

const auth = useAuthStore()

const statistik = ref(null)
const terbaru = ref([])
const memuat = ref(true)

onMounted(async () => {
  try {
    const [stat, laporan] = await Promise.all([
      laporanApi.statistik(),
      laporanApi.daftar({ page_size: 6 }),
    ])
    statistik.value = stat
    terbaru.value = laporan.data ?? []
  } finally {
    memuat.value = false
  }
})

/** Lebar batang tren dihitung relatif terhadap hari tersibuk. */
function tinggiBatang(nilai, maks) {
  return `${Math.max(6, (nilai / (maks || 1)) * 100)}%`
}
</script>

<template>
  <div>
    <header style="margin-bottom: 22px">
      <h1 class="page-title">Halo, {{ auth.user?.nama_lengkap?.split(' ')[0] }} 👋</h1>
      <p class="page-subtitle" style="margin: 0">
        {{
          auth.isWarga
            ? 'Berikut ringkasan laporan yang Anda kirim.'
            : 'Berikut ringkasan laporan yang menjadi tanggung jawab Anda.'
        }}
      </p>
    </header>

    <div v-if="memuat" class="grid grid-stat">
      <div v-for="n in 4" :key="n" class="skeleton" style="height: 96px" />
    </div>

    <template v-else-if="statistik">
      <div class="grid grid-stat" style="margin-bottom: 26px">
        <StatCard
          label="Total Laporan"
          :nilai="statistik.ringkasan.total"
          icon="report"
          warna="var(--brand-2)"
        />
        <StatCard
          label="Menunggu Verifikasi"
          :nilai="statistik.ringkasan.baru"
          icon="clock"
          :warna="STATUS_HEX.BARU"
        />
        <StatCard
          label="Sedang Diproses"
          :nilai="statistik.ringkasan.diproses"
          icon="refresh"
          :warna="STATUS_HEX.DIPROSES"
        />
        <StatCard
          label="Selesai"
          :nilai="statistik.ringkasan.selesai"
          icon="checkCircle"
          :warna="STATUS_HEX.SELESAI"
          :keterangan="`${statistik.ringkasan.persen_selesai}% dari seluruh laporan`"
        />
      </div>

      <div class="grid grid-2" style="margin-bottom: 26px">
        <!-- Distribusi kategori -->
        <section class="card">
          <div class="card-head">
            <h2 class="card-title">Distribusi Kategori</h2>
            <AppIcon name="tag" :size="17" style="color: var(--muted)" />
          </div>

          <div v-if="statistik.per_kategori.length" class="stack" style="gap: 11px">
            <div v-for="k in statistik.per_kategori.slice(0, 6)" :key="k.kategori__nama">
              <div class="row-between" style="font-size: 0.83rem; margin-bottom: 4px">
                <span>{{ k.kategori__nama }}</span>
                <strong>{{ formatAngka(k.jumlah) }}</strong>
              </div>
              <div class="bar">
                <span
                  :style="{
                    width: `${(k.jumlah / statistik.per_kategori[0].jumlah) * 100}%`,
                    background: k.kategori__warna,
                  }"
                />
              </div>
            </div>
          </div>
          <EmptyState v-else icon="tag" judul="Belum ada data kategori" />
        </section>

        <!-- Tren harian -->
        <section class="card">
          <div class="card-head">
            <h2 class="card-title">Tren 30 Hari Terakhir</h2>
            <AppIcon name="trending" :size="17" style="color: var(--muted)" />
          </div>

          <div v-if="statistik.tren_harian.length" class="tren">
            <span
              v-for="t in statistik.tren_harian"
              :key="t.tanggal"
              class="tren-batang"
              :style="{
                height: tinggiBatang(
                  t.jumlah,
                  Math.max(...statistik.tren_harian.map((x) => x.jumlah))
                ),
              }"
              :title="`${t.tanggal}: ${t.jumlah} laporan`"
            />
          </div>
          <EmptyState v-else icon="chart" judul="Belum ada laporan pada periode ini" />
        </section>
      </div>
    </template>

    <section>
      <div class="row-between" style="margin-bottom: 14px">
        <h2 class="section-title" style="margin: 0">Laporan Terbaru</h2>
        <RouterLink to="/app/laporan" class="btn btn-ghost btn-sm">
          Lihat semua <AppIcon name="chevronRight" :size="15" />
        </RouterLink>
      </div>

      <div v-if="terbaru.length" class="grid grid-cards">
        <KartuLaporan v-for="l in terbaru" :key="l.id" :laporan="l" />
      </div>
      <EmptyState
        v-else-if="!memuat"
        icon="inbox"
        judul="Belum ada laporan"
        pesan="Laporan yang masuk akan muncul di sini."
      >
        <RouterLink v-if="auth.isWarga" to="/app/lapor" class="btn btn-primary btn-sm">
          <AppIcon name="plus" :size="16" /> Buat Laporan
        </RouterLink>
      </EmptyState>
    </section>
  </div>
</template>

<style scoped>
.bar {
  height: 7px;
  border-radius: 999px;
  background: var(--raised);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 300ms var(--ease);
}
.tren {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 150px;
  padding-top: 8px;
}
.tren-batang {
  flex: 1;
  min-width: 3px;
  /* Batasi lebar agar satu-dua hari data tidak melebar jadi blok penuh. */
  max-width: 26px;
  border-radius: 3px 3px 0 0;
  background: var(--brand-gradient);
  opacity: 0.85;
  transition: opacity 140ms var(--ease);
}
.tren-batang:hover {
  opacity: 1;
}
</style>
