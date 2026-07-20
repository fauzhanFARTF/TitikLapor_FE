<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { errorField, pesanError } from '@/api/client'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const form = ref({
  nama_lengkap: '',
  email: '',
  nomor_telepon: '',
  password: '',
  password_konfirmasi: '',
})
const error = ref('')
const errorPerField = ref({})

/** Indikator kekuatan sandi sederhana — memandu, bukan menggantikan validasi
    server (Django tetap menjalankan validator resmi). */
const kekuatan = computed(() => {
  const s = form.value.password
  if (!s) return { skor: 0, label: '', warna: 'var(--muted)' }
  let skor = 0
  if (s.length >= 8) skor++
  if (s.length >= 12) skor++
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) skor++
  if (/\d/.test(s)) skor++
  if (/[^A-Za-z0-9]/.test(s)) skor++

  const peta = [
    { label: 'Sangat lemah', warna: 'var(--danger)' },
    { label: 'Lemah', warna: 'var(--danger)' },
    { label: 'Cukup', warna: 'var(--warning)' },
    { label: 'Baik', warna: 'var(--info)' },
    { label: 'Kuat', warna: 'var(--success)' },
    { label: 'Sangat kuat', warna: 'var(--success)' },
  ]
  return { skor, ...peta[skor] }
})

const cocok = computed(
  () => !form.value.password_konfirmasi || form.value.password === form.value.password_konfirmasi
)

async function kirim() {
  error.value = ''
  errorPerField.value = {}
  try {
    await auth.daftar(form.value)
    ui.sukses('Akun berhasil dibuat. Selamat datang di Titik Lapor.')
    router.push('/app')
  } catch (e) {
    error.value = pesanError(e, 'Pendaftaran gagal.')
    errorPerField.value = errorField(e)
  }
}
</script>

<template>
  <div class="halaman">
    <div class="kotak card">
      <RouterLink to="/masuk" class="btn btn-ghost btn-sm" style="margin-bottom: 8px">
        <AppIcon name="chevronLeft" :size="16" /> Kembali
      </RouterLink>

      <h1 class="page-title">Daftar Akun Warga</h1>
      <p class="page-subtitle">
        Akun petugas dan administrator dibuat oleh pengelola — halaman ini khusus warga.
      </p>

      <div v-if="error" class="alert alert-danger" style="margin-bottom: 16px">
        <AppIcon name="alert" :size="18" />
        <span>{{ error }}</span>
      </div>

      <form @submit.prevent="kirim">
        <div class="field">
          <label class="label" for="nama">Nama Lengkap <span class="req">*</span></label>
          <input id="nama" v-model.trim="form.nama_lengkap" class="input" required />
          <span v-if="errorPerField.nama_lengkap" class="error-text">
            {{ errorPerField.nama_lengkap }}
          </span>
        </div>

        <div class="field">
          <label class="label" for="email">Email <span class="req">*</span></label>
          <input
            id="email"
            v-model.trim="form.email"
            class="input"
            type="email"
            autocomplete="email"
            required
          />
          <span v-if="errorPerField.email" class="error-text">{{ errorPerField.email }}</span>
        </div>

        <div class="field">
          <label class="label" for="telepon">Nomor Telepon</label>
          <input
            id="telepon"
            v-model.trim="form.nomor_telepon"
            class="input"
            type="tel"
            placeholder="08xxxxxxxxxx"
          />
          <span class="hint">Dipakai petugas bila perlu konfirmasi lokasi laporan.</span>
        </div>

        <div class="field">
          <label class="label" for="sandi">Kata Sandi <span class="req">*</span></label>
          <input
            id="sandi"
            v-model="form.password"
            class="input"
            type="password"
            autocomplete="new-password"
            required
          />
          <div v-if="form.password" class="kekuatan">
            <div class="bar">
              <span
                :style="{ width: `${(kekuatan.skor / 5) * 100}%`, background: kekuatan.warna }"
              />
            </div>
            <span :style="{ color: kekuatan.warna }">{{ kekuatan.label }}</span>
          </div>
          <span v-if="errorPerField.password" class="error-text">
            {{ errorPerField.password }}
          </span>
        </div>

        <div class="field">
          <label class="label" for="konfirmasi">
            Ulangi Kata Sandi <span class="req">*</span>
          </label>
          <input
            id="konfirmasi"
            v-model="form.password_konfirmasi"
            class="input"
            :class="{ 'is-invalid': !cocok }"
            type="password"
            autocomplete="new-password"
            required
          />
          <span v-if="!cocok" class="error-text">Konfirmasi kata sandi belum cocok.</span>
        </div>

        <button class="btn btn-gradient btn-lg btn-block" :disabled="auth.memuat || !cocok">
          <span v-if="auth.memuat" class="spinner" />
          {{ auth.memuat ? 'Mendaftarkan…' : 'Buat Akun' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.halaman {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
}
.kotak {
  width: 100%;
  max-width: 460px;
}
.kekuatan {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.75rem;
  font-weight: 650;
}
.bar {
  flex: 1;
  height: 5px;
  border-radius: 999px;
  background: var(--raised);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 220ms var(--ease);
}
</style>
