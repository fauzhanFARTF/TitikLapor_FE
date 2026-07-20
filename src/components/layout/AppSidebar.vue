<script setup>
/**
 * Navigasi utama.
 *
 * Daftar menu disaring berdasarkan peran pengguna. Penyaringan ini murni
 * kenyamanan tampilan — otorisasi sebenarnya tetap dijaga guard router dan,
 * yang mengikat, permission di backend.
 */
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { APP_NAME, ROLE, ROLE_LABEL } from '@/utils/constants'
import { inisial } from '@/utils/format'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const { user } = storeToRefs(auth)

const MENU = [
  {
    judul: 'Umum',
    item: [
      { ke: '/app', label: 'Dasbor', icon: 'dashboard', peran: null },
      { ke: '/app/peta', label: 'Peta Laporan', icon: 'map', peran: null },
      { ke: '/app/laporan', label: 'Daftar Laporan', icon: 'report', peran: null },
    ],
  },
  {
    judul: 'Warga',
    item: [
      { ke: '/app/lapor', label: 'Buat Laporan', icon: 'plus', peran: [ROLE.WARGA] },
    ],
  },
  {
    judul: 'Tindak Lanjut',
    item: [
      {
        ke: '/app/antrean',
        label: 'Antrean Instansi',
        icon: 'inbox',
        peran: [ROLE.PETUGAS, ROLE.ADMIN],
      },
      {
        ke: '/app/analitik',
        label: 'Analitik Spasial',
        icon: 'chart',
        peran: [ROLE.PETUGAS, ROLE.ADMIN],
      },
    ],
  },
  {
    judul: 'Administrasi',
    item: [
      { ke: '/app/pengguna', label: 'Pengguna', icon: 'users', peran: [ROLE.ADMIN] },
      { ke: '/app/instansi', label: 'Instansi', icon: 'building', peran: [ROLE.ADMIN] },
      { ke: '/app/kategori', label: 'Kategori', icon: 'tag', peran: [ROLE.ADMIN] },
    ],
  },
]

const menuTampil = computed(() =>
  MENU.map((grup) => ({
    ...grup,
    item: grup.item.filter((i) => !i.peran || i.peran.includes(user.value?.role)),
  })).filter((grup) => grup.item.length)
)

// Rute anak (mis. /app/laporan/:id) tetap menyorot menu induknya.
const aktif = (ke) => (ke === '/app' ? route.path === '/app' : route.path.startsWith(ke))
</script>

<template>
  <aside class="sidebar" :class="{ 'is-open': ui.sidebarTerbuka }">
    <div class="brand">
      <span class="brand-mark"><AppIcon name="logo" :size="20" /></span>
      <span class="brand-text">
        <strong>{{ APP_NAME }}</strong>
        <small>Pelaporan Warga</small>
      </span>
      <button
        class="btn btn-ghost btn-sm sidebar-close"
        aria-label="Tutup navigasi"
        @click="ui.toggleSidebar()"
      >
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <nav class="nav" aria-label="Navigasi utama">
      <div v-for="grup in menuTampil" :key="grup.judul" class="nav-group">
        <p class="nav-group-title">{{ grup.judul }}</p>
        <RouterLink
          v-for="item in grup.item"
          :key="item.ke"
          :to="item.ke"
          class="nav-item"
          :class="{ 'is-active': aktif(item.ke) }"
          :title="item.label"
          @click="ui.sidebarTerbuka = false"
        >
          <AppIcon :name="item.icon" :size="19" />
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="sidebar-foot">
      <RouterLink to="/app/profil" class="akun" title="Profil saya">
        <span class="avatar">{{ inisial(user?.nama_lengkap) }}</span>
        <span class="akun-teks">
          <strong class="truncate">{{ user?.nama_lengkap }}</strong>
          <small class="truncate">{{ ROLE_LABEL[user?.role] ?? '' }}</small>
        </span>
      </RouterLink>
    </div>
  </aside>

  <div
    v-if="ui.sidebarTerbuka"
    class="sidebar-scrim"
    @click="ui.toggleSidebar()"
    aria-hidden="true"
  />
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  width: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--line);
  transition:
    width 220ms var(--ease),
    transform 260ms var(--ease);
}

/* ── Brand ────────────────────────────────────────────────────────────── */
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  height: var(--topbar-h);
  padding: 0 16px;
  border-bottom: 1px solid var(--line-soft);
  flex-shrink: 0;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: var(--brand-gradient);
  color: #fff;
  box-shadow: var(--glow-brand);
  flex-shrink: 0;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  overflow: hidden;
}
.brand-text strong {
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.brand-text small {
  font-size: 0.72rem;
  color: var(--muted);
}
.sidebar-close {
  margin-left: auto;
  display: none;
}

/* ── Navigasi ─────────────────────────────────────────────────────────── */
.nav {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
}
.nav-group + .nav-group {
  margin-top: 18px;
}
.nav-group-title {
  margin: 0 0 6px 10px;
  font-size: 0.68rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  margin-bottom: 2px;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted);
  transition: all 150ms var(--ease);
}
.nav-item:hover {
  background: var(--raised);
  color: var(--text);
}
.nav-item.is-active {
  background: var(--brand-gradient);
  color: #fff;
  box-shadow: var(--glow-brand);
}
.nav-item svg {
  flex-shrink: 0;
}

/* ── Kaki: kartu akun ─────────────────────────────────────────────────── */
.sidebar-foot {
  padding: 12px;
  border-top: 1px solid var(--line-soft);
  flex-shrink: 0;
}
.akun {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  transition: background-color 150ms var(--ease);
}
.akun:hover {
  background: var(--raised);
}
.avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--brand-gradient);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
}
.akun-teks {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  overflow: hidden;
}
.akun-teks strong {
  font-size: 0.85rem;
}
.akun-teks small {
  font-size: 0.74rem;
  color: var(--muted);
}

/* ── Mode diciutkan (desktop) ─────────────────────────────────────────── */
:global(:root.sb-collapsed) .brand-text,
:global(:root.sb-collapsed) .nav-label,
:global(:root.sb-collapsed) .nav-group-title,
:global(:root.sb-collapsed) .akun-teks {
  display: none;
}
:global(:root.sb-collapsed) .nav-item,
:global(:root.sb-collapsed) .akun,
:global(:root.sb-collapsed) .brand {
  justify-content: center;
}

/* ── Mobile: sidebar menjadi laci geser ───────────────────────────────── */
@media (max-width: 980px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
  }
  .sidebar.is-open {
    transform: translateX(0);
  }
  .sidebar-close {
    display: inline-flex;
  }
  .sidebar-scrim {
    position: fixed;
    inset: 0;
    z-index: 55;
    background: var(--overlay);
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }
}
</style>
