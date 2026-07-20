<script setup>
/** Profil pengguna: data diri & penggantian kata sandi. */
import { onMounted, ref } from 'vue'

import { authApi } from '@/api/auth'
import { errorField, pesanError } from '@/api/client'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { ROLE_LABEL } from '@/utils/constants'
import { formatTanggal, inisial } from '@/utils/format'

const auth = useAuthStore()
const ui = useUiStore()

const profil = ref({ nama_lengkap: '', nomor_telepon: '' })
const sandi = ref({ password_lama: '', password_baru: '' })
const menyimpan = ref(false)
const errorSandi = ref({})

onMounted(() => {
  profil.value = {
    nama_lengkap: auth.user?.nama_lengkap ?? '',
    nomor_telepon: auth.user?.nomor_telepon ?? '',
  }
})

async function simpanProfil() {
  menyimpan.value = true
  try {
    await authApi.perbaruiProfil(profil.value)
    await auth.muatProfil()
    ui.sukses('Profil diperbarui.')
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal memperbarui profil.'))
  } finally {
    menyimpan.value = false
  }
}

async function gantiSandi() {
  menyimpan.value = true
  errorSandi.value = {}
  try {
    await authApi.ubahSandi(sandi.value)
    sandi.value = { password_lama: '', password_baru: '' }
    ui.sukses('Kata sandi berhasil diubah.')
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal mengubah kata sandi.'))
    errorSandi.value = errorField(e)
  } finally {
    menyimpan.value = false
  }
}
</script>

<template>
  <div style="max-width: 780px">
    <h1 class="page-title">Profil Saya</h1>
    <p class="page-subtitle">Kelola data akun dan keamanan Anda.</p>

    <section class="card" style="margin-bottom: 18px">
      <div class="row" style="gap: 14px; margin-bottom: 18px">
        <span class="avatar-besar">{{ inisial(auth.user?.nama_lengkap) }}</span>
        <div>
          <h2 style="margin: 0; font-size: 1.1rem">{{ auth.user?.nama_lengkap }}</h2>
          <p class="text-muted" style="margin: 2px 0 6px; font-size: 0.87rem">
            {{ auth.user?.email }}
          </p>
          <div class="row" style="gap: 7px">
            <span class="badge badge-brand">{{ ROLE_LABEL[auth.user?.role] }}</span>
            <span v-if="auth.user?.instansi_nama" class="badge badge-neutral">
              {{ auth.user.instansi_nama }}
            </span>
          </div>
        </div>
      </div>

      <form @submit.prevent="simpanProfil">
        <div class="grid grid-2">
          <div class="field">
            <label class="label" for="nama">Nama Lengkap</label>
            <input id="nama" v-model.trim="profil.nama_lengkap" class="input" required />
          </div>
          <div class="field">
            <label class="label" for="telepon">Nomor Telepon</label>
            <input id="telepon" v-model.trim="profil.nomor_telepon" class="input" type="tel" />
          </div>
        </div>
        <button class="btn btn-primary" :disabled="menyimpan">
          <span v-if="menyimpan" class="spinner" />
          Simpan Perubahan
        </button>
      </form>
    </section>

    <section class="card">
      <h2 class="card-title">
        <AppIcon name="lock" :size="16" /> Ubah Kata Sandi
      </h2>

      <form @submit.prevent="gantiSandi">
        <div class="grid grid-2">
          <div class="field">
            <label class="label" for="lama">Kata Sandi Lama</label>
            <input
              id="lama"
              v-model="sandi.password_lama"
              class="input"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>
          <div class="field">
            <label class="label" for="baru">Kata Sandi Baru</label>
            <input
              id="baru"
              v-model="sandi.password_baru"
              class="input"
              type="password"
              autocomplete="new-password"
              required
            />
            <span v-if="errorSandi.password_baru" class="error-text">
              {{ errorSandi.password_baru }}
            </span>
          </div>
        </div>
        <button class="btn btn-secondary" :disabled="menyimpan">Ubah Kata Sandi</button>
      </form>

      <p class="hint" style="margin-top: 12px">
        Bergabung sejak {{ formatTanggal(auth.user?.created_at) }}.
      </p>
    </section>
  </div>
</template>

<style scoped>
.avatar-besar {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 999px;
  background: var(--brand-gradient);
  color: #fff;
  font-size: 1.3rem;
  font-weight: 800;
  flex-shrink: 0;
}
</style>
