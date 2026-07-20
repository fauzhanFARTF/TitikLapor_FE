/**
 * Definisi rute & penjaga akses.
 *
 * Semua komponen halaman dimuat secara lazy sehingga bundel awal hanya berisi
 * kerangka aplikasi — halaman peta yang berat baru diunduh saat dibuka.
 */

import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { APP_NAME, ROLE } from '@/utils/constants'

const routes = [
  // ── Publik ────────────────────────────────────────────────────────────────
  {
    path: '/',
    name: 'beranda',
    component: () => import('@/views/BerandaView.vue'),
    meta: { judul: 'Beranda', publik: true },
  },
  {
    path: '/peta-publik',
    name: 'peta-publik',
    component: () => import('@/views/PetaPublikView.vue'),
    meta: { judul: 'Peta Laporan Publik', publik: true },
  },
  {
    path: '/lacak/:nomorTiket?',
    name: 'lacak',
    component: () => import('@/views/LacakView.vue'),
    meta: { judul: 'Lacak Laporan', publik: true },
  },
  {
    path: '/masuk',
    name: 'masuk',
    component: () => import('@/views/auth/MasukView.vue'),
    meta: { judul: 'Masuk', publik: true, hanyaTamu: true },
  },
  {
    path: '/daftar',
    name: 'daftar',
    component: () => import('@/views/auth/DaftarView.vue'),
    meta: { judul: 'Daftar Akun', publik: true, hanyaTamu: true },
  },

  // ── Terautentikasi ────────────────────────────────────────────────────────
  {
    path: '/app',
    component: () => import('@/components/layout/AppShell.vue'),
    children: [
      {
        path: '',
        name: 'dasbor',
        component: () => import('@/views/DasborView.vue'),
        meta: { judul: 'Dasbor' },
      },
      {
        path: 'peta',
        name: 'peta',
        component: () => import('@/views/PetaView.vue'),
        meta: { judul: 'Peta Laporan' },
      },
      {
        path: 'laporan',
        name: 'laporan',
        component: () => import('@/views/laporan/DaftarLaporanView.vue'),
        meta: { judul: 'Daftar Laporan' },
      },
      {
        path: 'laporan/:id',
        name: 'laporan-detail',
        component: () => import('@/views/laporan/DetailLaporanView.vue'),
        meta: { judul: 'Detail Laporan' },
      },
      {
        path: 'lapor',
        name: 'lapor',
        component: () => import('@/views/warga/BuatLaporanView.vue'),
        meta: { judul: 'Buat Laporan', peran: [ROLE.WARGA] },
      },
      {
        path: 'antrean',
        name: 'antrean',
        component: () => import('@/views/petugas/AntreanView.vue'),
        meta: { judul: 'Antrean Instansi', peran: [ROLE.PETUGAS, ROLE.ADMIN] },
      },
      {
        path: 'analitik',
        name: 'analitik',
        component: () => import('@/views/petugas/AnalitikView.vue'),
        meta: { judul: 'Analitik Spasial', peran: [ROLE.PETUGAS, ROLE.ADMIN] },
      },
      {
        path: 'pengguna',
        name: 'pengguna',
        component: () => import('@/views/admin/PenggunaView.vue'),
        meta: { judul: 'Manajemen Pengguna', peran: [ROLE.ADMIN] },
      },
      {
        path: 'instansi',
        name: 'instansi',
        component: () => import('@/views/admin/InstansiView.vue'),
        meta: { judul: 'Manajemen Instansi', peran: [ROLE.ADMIN] },
      },
      {
        path: 'kategori',
        name: 'kategori',
        component: () => import('@/views/admin/KategoriView.vue'),
        meta: { judul: 'Kategori Laporan', peran: [ROLE.ADMIN] },
      },
      {
        path: 'profil',
        name: 'profil',
        component: () => import('@/views/ProfilView.vue'),
        meta: { judul: 'Profil Saya' },
      },
    ],
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  {
    path: '/403',
    name: 'terlarang',
    component: () => import('@/views/errors/TerlarangView.vue'),
    meta: { judul: 'Akses Ditolak', publik: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'tidak-ditemukan',
    component: () => import('@/views/errors/TidakDitemukanView.vue'),
    meta: { judul: 'Halaman Tidak Ditemukan', publik: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, tersimpan) => tersimpan ?? { top: 0 },
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.hanyaTamu && auth.sudahMasuk) return { path: '/app' }
  if (to.meta.publik) return true

  if (!auth.sudahMasuk) {
    // Simpan tujuan agar pengguna kembali ke sana setelah berhasil masuk.
    return { path: '/masuk', query: { lanjut: to.fullPath } }
  }

  if (to.meta.peran && !to.meta.peran.includes(auth.peran)) return { path: '/403' }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.judul ? `${to.meta.judul} — ${APP_NAME}` : APP_NAME
})

export default router
