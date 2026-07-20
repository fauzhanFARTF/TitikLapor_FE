<script setup>
/** Halaman publik: penjelasan singkat + jalur masuk ke fitur utama. */
import { onMounted, ref } from 'vue'

import { publikApi } from '@/api/laporan'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTheme } from '@/composables/useTheme'
import { APP_NAME } from '@/utils/constants'
import { formatAngka } from '@/utils/format'

const { tema, toggle } = useTheme()
const jumlahLaporan = ref(null)

const LANGKAH = [
  {
    icon: 'mapPin',
    judul: 'Tandai lokasi',
    teks: 'Ambil foto dan tandai titik masalah langsung di peta, akurat sampai tingkat jalan.',
  },
  {
    icon: 'route',
    judul: 'Diteruskan otomatis',
    teks: 'Kategori laporan menentukan instansi tujuan, jadi tidak ada laporan yang tersesat.',
  },
  {
    icon: 'clock',
    judul: 'Pantau sampai tuntas',
    teks: 'Setiap perubahan status tercatat pada linimasa yang bisa Anda buka kapan saja.',
  },
]

onMounted(async () => {
  try {
    const geo = await publikApi.petaLaporan()
    jumlahLaporan.value = geo?.features?.length ?? 0
  } catch {
    // Beranda tetap tampil walau API belum siap.
    jumlahLaporan.value = null
  }
})
</script>

<template>
  <div class="beranda">
    <header class="nav">
      <span class="row" style="gap: 10px">
        <span class="mark"><AppIcon name="logo" :size="19" /></span>
        <strong>{{ APP_NAME }}</strong>
      </span>
      <nav class="row" style="gap: 6px">
        <button class="btn btn-ghost btn-sm" aria-label="Ganti tema" @click="toggle">
          <AppIcon :name="tema === 'dark' ? 'sun' : 'moon'" :size="18" />
        </button>
        <RouterLink to="/lacak" class="btn btn-ghost btn-sm">Lacak Tiket</RouterLink>
        <RouterLink to="/masuk" class="btn btn-primary btn-sm">Masuk</RouterLink>
      </nav>
    </header>

    <section class="hero">
      <span class="badge badge-brand">Platform pelaporan warga</span>
      <h1>Lapor masalah di sekitar Anda, pantau tindak lanjutnya.</h1>
      <p>
        Jalan berlubang, drainase tersumbat, lampu jalan mati, atau sampah menumpuk —
        laporkan sekali, lalu ikuti perkembangannya sampai selesai.
      </p>

      <div class="row" style="gap: 10px; flex-wrap: wrap; justify-content: center">
        <RouterLink to="/daftar" class="btn btn-gradient btn-lg">
          <AppIcon name="send" :size="18" /> Mulai Melapor
        </RouterLink>
        <RouterLink to="/peta-publik" class="btn btn-outline btn-lg">
          <AppIcon name="map" :size="18" /> Lihat Peta Publik
        </RouterLink>
      </div>

      <p v-if="jumlahLaporan !== null" class="text-muted" style="margin-top: 18px">
        <strong>{{ formatAngka(jumlahLaporan) }}</strong> laporan sudah terverifikasi dan
        terbuka untuk publik.
      </p>
    </section>

    <section class="langkah">
      <article v-for="l in LANGKAH" :key="l.judul" class="card hover-lift">
        <span class="langkah-ikon"><AppIcon :name="l.icon" :size="21" /></span>
        <h3 class="card-title">{{ l.judul }}</h3>
        <p class="text-muted" style="margin: 0; font-size: 0.88rem">{{ l.teks }}</p>
      </article>
    </section>

    <footer class="kaki">
      <span class="text-muted">© {{ new Date().getFullYear() }} {{ APP_NAME }}</span>
      <RouterLink to="/peta-publik" class="text-muted">Peta Publik</RouterLink>
    </footer>
  </div>
</template>

<style scoped>
.beranda {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 20px 60px;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}
.mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--brand-gradient);
  color: #fff;
}
.hero {
  text-align: center;
  padding: 56px 0 48px;
}
.hero h1 {
  margin: 16px auto 14px;
  max-width: 720px;
  font-size: clamp(1.9rem, 5vw, 3rem);
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.035em;
}
.hero > p {
  margin: 0 auto 28px;
  max-width: 560px;
  font-size: 1.02rem;
  color: var(--muted);
}
.langkah {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
.langkah-ikon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  background: rgba(99, 102, 241, 0.14);
  color: var(--brand-2);
  margin-bottom: 12px;
}
.kaki {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  font-size: 0.84rem;
}
</style>
