<script setup>
/** Manajemen pengguna: daftar, pembuatan akun internal, aktivasi. */
import { onMounted, ref } from 'vue'

import { instansiApi, penggunaApi } from '@/api/auth'
import { errorField, pesanError } from '@/api/client'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useUiStore } from '@/stores/ui'
import { ROLE, ROLE_LABEL } from '@/utils/constants'
import { formatTanggal, inisial } from '@/utils/format'

const ui = useUiStore()

const daftar = ref([])
const instansi = ref([])
const memuat = ref(true)
const modal = ref(false)
const mengirim = ref(false)
const filterPeran = ref('')
const errorPerField = ref({})

const form = ref({
  nama_lengkap: '',
  email: '',
  nomor_telepon: '',
  role: ROLE.PETUGAS,
  instansi_id: '',
  password: '',
})

async function muat() {
  memuat.value = true
  try {
    const params = filterPeran.value ? { role: filterPeran.value } : {}
    daftar.value = (await penggunaApi.daftar(params)) ?? []
  } finally {
    memuat.value = false
  }
}

async function buka() {
  modal.value = true
  if (!instansi.value.length) instansi.value = (await instansiApi.daftar()) ?? []
}

async function simpan() {
  mengirim.value = true
  errorPerField.value = {}
  try {
    await penggunaApi.buatInternal({
      ...form.value,
      // Backend menolak instansi kosong berupa string; kirim null.
      instansi_id: form.value.instansi_id || null,
    })
    ui.sukses('Akun internal berhasil dibuat.')
    modal.value = false
    form.value = {
      nama_lengkap: '',
      email: '',
      nomor_telepon: '',
      role: ROLE.PETUGAS,
      instansi_id: '',
      password: '',
    }
    muat()
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal membuat akun.'))
    errorPerField.value = errorField(e)
  } finally {
    mengirim.value = false
  }
}

async function ubahAktif(pengguna) {
  try {
    const hasil = pengguna.is_active
      ? await penggunaApi.nonaktifkan(pengguna.id)
      : await penggunaApi.aktifkan(pengguna.id)
    Object.assign(pengguna, hasil)
    ui.sukses(hasil.is_active ? 'Akun diaktifkan.' : 'Akun dinonaktifkan.')
  } catch (e) {
    ui.gagal(pesanError(e))
  }
}

onMounted(muat)
</script>

<template>
  <div>
    <header class="row-between" style="margin-bottom: 18px">
      <div>
        <h1 class="page-title">Manajemen Pengguna</h1>
        <p class="page-subtitle" style="margin: 0">{{ daftar.length }} akun terdaftar.</p>
      </div>
      <div class="row" style="gap: 9px">
        <select
          v-model="filterPeran"
          class="select"
          style="max-width: 180px"
          aria-label="Filter peran"
          @change="muat"
        >
          <option value="">Semua peran</option>
          <option v-for="(label, kunci) in ROLE_LABEL" :key="kunci" :value="kunci">
            {{ label }}
          </option>
        </select>
        <button class="btn btn-gradient btn-sm" @click="buka">
          <AppIcon name="plus" :size="16" /> Akun Internal
        </button>
      </div>
    </header>

    <div v-if="memuat" class="skeleton" style="height: 320px" />

    <div v-else-if="daftar.length" class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Pengguna</th>
            <th>Peran</th>
            <th>Instansi</th>
            <th>Bergabung</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in daftar" :key="p.id">
            <td>
              <div class="row">
                <span class="avatar">{{ inisial(p.nama_lengkap) }}</span>
                <span>
                  <strong style="display: block">{{ p.nama_lengkap }}</strong>
                  <span class="text-muted" style="font-size: 0.78rem">{{ p.email }}</span>
                </span>
              </div>
            </td>
            <td><span class="badge badge-brand">{{ p.role_label }}</span></td>
            <td>{{ p.instansi_nama || '—' }}</td>
            <td class="text-muted">{{ formatTanggal(p.created_at) }}</td>
            <td>
              <span class="badge" :class="p.is_active ? 'badge-SELESAI' : 'badge-DITOLAK'">
                {{ p.is_active ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td>
              <button class="btn btn-secondary btn-sm" @click="ubahAktif(p)">
                {{ p.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmptyState v-else icon="users" judul="Belum ada pengguna" />

    <AppModal v-if="modal" judul="Buat Akun Internal" @tutup="modal = false">
      <div class="field">
        <label class="label" for="nama">Nama Lengkap</label>
        <input id="nama" v-model.trim="form.nama_lengkap" class="input" required />
      </div>
      <div class="field">
        <label class="label" for="email">Email</label>
        <input id="email" v-model.trim="form.email" class="input" type="email" required />
        <span v-if="errorPerField.email" class="error-text">{{ errorPerField.email }}</span>
      </div>
      <div class="field">
        <label class="label" for="peran">Peran</label>
        <select id="peran" v-model="form.role" class="select">
          <option :value="ROLE.PETUGAS">Petugas Instansi</option>
          <option :value="ROLE.ADMIN">Administrator</option>
        </select>
      </div>
      <div v-if="form.role === ROLE.PETUGAS" class="field">
        <label class="label" for="instansi">Instansi</label>
        <select id="instansi" v-model="form.instansi_id" class="select" required>
          <option value="">Pilih instansi…</option>
          <option v-for="i in instansi" :key="i.id" :value="i.id">
            {{ i.kode }} — {{ i.nama }}
          </option>
        </select>
        <span class="hint">Petugas hanya melihat laporan milik instansinya.</span>
      </div>
      <div class="field">
        <label class="label" for="sandi">Kata Sandi Awal</label>
        <input id="sandi" v-model="form.password" class="input" type="text" required />
        <span v-if="errorPerField.password" class="error-text">{{ errorPerField.password }}</span>
        <span class="hint">Sampaikan ke pemilik akun dan minta segera diganti.</span>
      </div>

      <template #aksi>
        <button class="btn btn-secondary" @click="modal = false">Batal</button>
        <button class="btn btn-primary" :disabled="mengirim" @click="simpan">
          <span v-if="mengirim" class="spinner" />
          Buat Akun
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--brand-gradient);
  color: #fff;
  font-size: 0.74rem;
  font-weight: 800;
  flex-shrink: 0;
}
</style>
