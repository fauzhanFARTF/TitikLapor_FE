<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppIcon from '@/components/ui/AppIcon.vue'
import { pesanError } from '@/api/client'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { APP_NAME } from '@/utils/constants'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()
const { tema, toggle } = useTheme()

const form = ref({ email: '', password: '' })
const tampilSandi = ref(false)
const error = ref('')

onMounted(() => {
  if (route.query.sesi === 'habis') error.value = 'Sesi Anda berakhir. Silakan masuk lagi.'
})

async function kirim() {
  error.value = ''
  try {
    const pengguna = await auth.masuk(form.value)
    ui.sukses(`Selamat datang, ${pengguna.nama_lengkap}.`)
    // Kembalikan pengguna ke halaman yang tadi ingin dibuka.
    router.push(route.query.lanjut || '/app')
  } catch (e) {
    error.value = pesanError(e, 'Gagal masuk. Periksa email dan kata sandi Anda.')
  }
}
</script>

<template>
  <div class="auth">
    <!-- Panel kiri: identitas produk -->
    <section class="auth-brand">
      <div class="auth-brand-isi">
        <span class="mark"><AppIcon name="logo" :size="26" /></span>
        <h1>{{ APP_NAME }}</h1>
        <p class="tagline">
          Laporkan masalah infrastruktur dan lingkungan di sekitar Anda. Setiap laporan
          dipetakan, diteruskan ke instansi berwenang, dan bisa dipantau sampai tuntas.
        </p>

        <ul class="poin">
          <li><AppIcon name="mapPin" :size="17" /> Titik laporan presisi di peta</li>
          <li><AppIcon name="route" :size="17" /> Diteruskan otomatis ke instansi</li>
          <li><AppIcon name="clock" :size="17" /> Linimasa tindak lanjut transparan</li>
        </ul>
      </div>
    </section>

    <!-- Panel kanan: formulir -->
    <section class="auth-form">
      <button class="btn btn-ghost btn-sm tema" :aria-label="'Ganti tema'" @click="toggle">
        <AppIcon :name="tema === 'dark' ? 'sun' : 'moon'" :size="18" />
      </button>

      <div class="auth-kotak">
        <h2 class="page-title">Masuk</h2>
        <p class="page-subtitle">Gunakan akun warga, petugas, atau administrator.</p>

        <div v-if="error" class="alert alert-danger" style="margin-bottom: 16px">
          <AppIcon name="alert" :size="18" />
          <span>{{ error }}</span>
        </div>

        <form @submit.prevent="kirim">
          <div class="field">
            <label class="label" for="email">Email</label>
            <div class="input-group">
              <span class="input-icon"><AppIcon name="mail" :size="17" /></span>
              <input
                id="email"
                v-model.trim="form.email"
                class="input"
                type="email"
                autocomplete="email"
                required
                placeholder="nama@contoh.id"
              />
            </div>
          </div>

          <div class="field">
            <label class="label" for="sandi">Kata Sandi</label>
            <div class="input-group">
              <span class="input-icon"><AppIcon name="lock" :size="17" /></span>
              <input
                id="sandi"
                v-model="form.password"
                class="input"
                :type="tampilSandi ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                class="btn btn-ghost btn-sm lihat"
                :aria-label="tampilSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                @click="tampilSandi = !tampilSandi"
              >
                <AppIcon name="eye" :size="16" />
              </button>
            </div>
          </div>

          <button class="btn btn-gradient btn-lg btn-block" :disabled="auth.memuat">
            <span v-if="auth.memuat" class="spinner" />
            {{ auth.memuat ? 'Memproses…' : 'Masuk' }}
          </button>
        </form>

        <p class="tautan">
          Belum punya akun?
          <RouterLink to="/daftar">Daftar sebagai warga</RouterLink>
        </p>
        <p class="tautan">
          <RouterLink to="/peta-publik">Lihat peta publik</RouterLink> ·
          <RouterLink to="/lacak">Lacak nomor tiket</RouterLink>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
}

.auth-brand {
  position: relative;
  display: grid;
  place-items: center;
  padding: 48px;
  background: var(--brand-gradient);
  color: #fff;
  overflow: hidden;
}
/* Pola titik halus — dibuat dengan gradient, tanpa berkas gambar. */
.auth-brand::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.7;
}
.auth-brand-isi {
  position: relative;
  z-index: 1;
  max-width: 420px;
}
.mark {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  margin-bottom: 20px;
}
.auth-brand h1 {
  margin: 0 0 12px;
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.tagline {
  margin: 0 0 26px;
  font-size: 0.98rem;
  line-height: 1.65;
  opacity: 0.92;
}
.poin {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.poin li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  font-weight: 600;
}

.auth-form {
  position: relative;
  display: grid;
  place-items: center;
  padding: 40px 24px;
}
.tema {
  position: absolute;
  top: 20px;
  right: 20px;
}
.auth-kotak {
  width: 100%;
  max-width: 380px;
}
.lihat {
  position: absolute;
  right: 6px;
  padding: 6px;
}
.tautan {
  margin: 14px 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--muted);
}
.tautan a {
  color: var(--brand-2);
  font-weight: 650;
}
.tautan a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth-brand {
    display: none;
  }
}
</style>
