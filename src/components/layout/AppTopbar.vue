<script setup>
/** Bilah atas: judul halaman, pencarian cepat, tema, dan keluar. */
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/ui/AppIcon.vue'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()
const { tema, toggle } = useTheme()

const kueri = ref('')

function cari() {
  const q = kueri.value.trim()
  if (!q) return
  // Nomor tiket punya pola khas — langsung buka halaman lacak.
  const tujuan = /^TL-\d{8}-[0-9A-Za-z]{4}$/i.test(q)
    ? { path: `/lacak/${q.toUpperCase()}` }
    : { path: '/app/laporan', query: { q } }
  router.push(tujuan)
  kueri.value = ''
}

async function keluar() {
  await auth.keluar()
  ui.sukses('Anda telah keluar.')
  router.push('/masuk')
}
</script>

<template>
  <header class="topbar">
    <button
      class="btn btn-ghost btn-sm only-mobile"
      aria-label="Buka navigasi"
      @click="ui.toggleSidebar()"
    >
      <AppIcon name="menu" :size="20" />
    </button>

    <button
      class="btn btn-ghost btn-sm only-desktop"
      :aria-label="ui.sidebarDiciutkan ? 'Lebarkan navigasi' : 'Ciutkan navigasi'"
      @click="ui.toggleCiut()"
    >
      <AppIcon name="panelLeft" :size="19" />
    </button>

    <h1 class="judul truncate">{{ route.meta.judul ?? 'Titik Lapor' }}</h1>

    <form class="cari" role="search" @submit.prevent="cari">
      <span class="input-icon"><AppIcon name="search" :size="17" /></span>
      <input
        v-model="kueri"
        class="input"
        type="search"
        placeholder="Cari laporan atau nomor tiket…"
        aria-label="Cari laporan atau nomor tiket"
      />
    </form>

    <button
      class="btn btn-ghost btn-sm"
      :aria-label="tema === 'dark' ? 'Beralih ke tema terang' : 'Beralih ke tema gelap'"
      @click="toggle()"
    >
      <AppIcon :name="tema === 'dark' ? 'sun' : 'moon'" :size="19" />
    </button>

    <button class="btn btn-ghost btn-sm" aria-label="Keluar" @click="keluar">
      <AppIcon name="logout" :size="19" />
    </button>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--topbar-h);
  padding: 0 18px;
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.judul {
  margin: 0;
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: -0.015em;
}
.cari {
  position: relative;
  margin-left: auto;
  width: min(320px, 38vw);
}
.cari .input {
  padding-left: 38px;
  height: 38px;
  border-radius: 999px;
  background: var(--surface-sunken);
}
.cari .input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  display: flex;
  pointer-events: none;
}

.only-mobile {
  display: none;
}
@media (max-width: 980px) {
  .only-mobile {
    display: inline-flex;
  }
  .only-desktop {
    display: none;
  }
  .cari {
    display: none;
  }
  .judul {
    margin-left: 0;
  }
}
</style>
