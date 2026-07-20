<script setup>
/** Pelacakan laporan lewat nomor tiket — tidak memerlukan akun. */
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { pesanError } from '@/api/client'
import { publikApi } from '@/api/laporan'
import LinimasaStatus from '@/components/report/LinimasaStatus.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { formatWaktu } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const nomor = ref(route.params.nomorTiket ?? '')
const hasil = ref(null)
const memuat = ref(false)
const error = ref('')

async function lacak() {
  const tiket = nomor.value.trim().toUpperCase()
  if (!tiket) return

  memuat.value = true
  error.value = ''
  hasil.value = null
  try {
    hasil.value = await publikApi.lacak(tiket)
    // Jadikan URL dapat dibagikan tanpa memuat ulang halaman.
    router.replace({ path: `/lacak/${tiket}` })
  } catch (e) {
    error.value = pesanError(e, 'Nomor tiket tidak ditemukan.')
  } finally {
    memuat.value = false
  }
}

onMounted(() => {
  if (nomor.value) lacak()
})
</script>

<template>
  <div class="halaman">
    <RouterLink to="/" class="btn btn-ghost btn-sm" style="margin-bottom: 10px">
      <AppIcon name="chevronLeft" :size="16" /> Beranda
    </RouterLink>

    <h1 class="page-title">Lacak Laporan</h1>
    <p class="page-subtitle">
      Masukkan nomor tiket yang Anda terima saat laporan dikirim, mis.
      <span class="mono">TL-20260115-9F2A</span>.
    </p>

    <form class="row" style="gap: 10px; margin-bottom: 22px" @submit.prevent="lacak">
      <input
        v-model="nomor"
        class="input"
        placeholder="Nomor tiket"
        aria-label="Nomor tiket"
        style="max-width: 280px"
      />
      <button class="btn btn-primary" :disabled="memuat">
        <span v-if="memuat" class="spinner" />
        <AppIcon v-else name="search" :size="17" />
        Lacak
      </button>
    </form>

    <div v-if="error" class="alert alert-danger">
      <AppIcon name="alert" :size="18" />
      <span>{{ error }}</span>
    </div>

    <div v-if="hasil" class="card">
      <div class="row-between" style="margin-bottom: 4px">
        <span class="mono text-muted">{{ hasil.nomor_tiket }}</span>
        <StatusBadge :status="hasil.status" />
      </div>
      <h2 class="section-title" style="margin-bottom: 14px">{{ hasil.judul }}</h2>

      <dl class="ringkas">
        <div><dt>Kategori</dt><dd>{{ hasil.kategori }}</dd></div>
        <div><dt>Instansi</dt><dd>{{ hasil.instansi ?? 'Belum ditentukan' }}</dd></div>
        <div><dt>Dilaporkan</dt><dd>{{ formatWaktu(hasil.created_at) }}</dd></div>
      </dl>

      <div class="divider" />
      <h3 class="section-title">Riwayat Tindak Lanjut</h3>
      <LinimasaStatus :riwayat="hasil.riwayat" />
    </div>
  </div>
</template>

<style scoped>
.halaman {
  max-width: 720px;
  margin: 0 auto;
  padding: 26px 20px 60px;
}
.ringkas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin: 0;
}
.ringkas dt {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.ringkas dd {
  margin: 3px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
