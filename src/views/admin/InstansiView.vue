<script setup>
/** CRUD instansi penanggung jawab laporan. */
import { onMounted, ref } from 'vue'

import { instansiApi } from '@/api/auth'
import { pesanError } from '@/api/client'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

const daftar = ref([])
const memuat = ref(true)
const modal = ref(false)
const mengirim = ref(false)
const sedangDiubah = ref(null)

const kosong = () => ({
  nama: '',
  kode: '',
  deskripsi: '',
  email_kontak: '',
  telepon: '',
  is_active: true,
})
const form = ref(kosong())

async function muat() {
  memuat.value = true
  try {
    daftar.value = (await instansiApi.daftar()) ?? []
  } finally {
    memuat.value = false
  }
}

function buka(instansi = null) {
  sedangDiubah.value = instansi
  form.value = instansi ? { ...instansi } : kosong()
  modal.value = true
}

async function simpan() {
  mengirim.value = true
  try {
    if (sedangDiubah.value) {
      await instansiApi.perbarui(sedangDiubah.value.id, form.value)
      ui.sukses('Instansi diperbarui.')
    } else {
      await instansiApi.buat(form.value)
      ui.sukses('Instansi ditambahkan.')
    }
    modal.value = false
    muat()
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal menyimpan instansi.'))
  } finally {
    mengirim.value = false
  }
}

async function hapus(instansi) {
  if (!confirm(`Hapus instansi ${instansi.nama}? Laporan terkait tidak ikut terhapus.`)) return
  try {
    await instansiApi.hapus(instansi.id)
    ui.sukses('Instansi dihapus.')
    muat()
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
        <h1 class="page-title">Manajemen Instansi</h1>
        <p class="page-subtitle" style="margin: 0">
          Instansi menerima laporan sesuai kategori yang ditugaskan padanya.
        </p>
      </div>
      <button class="btn btn-gradient btn-sm" @click="buka()">
        <AppIcon name="plus" :size="16" /> Tambah Instansi
      </button>
    </header>

    <div v-if="memuat" class="grid grid-cards">
      <div v-for="n in 4" :key="n" class="skeleton" style="height: 140px" />
    </div>

    <div v-else-if="daftar.length" class="grid grid-cards">
      <article v-for="i in daftar" :key="i.id" class="card hover-lift">
        <div class="row-between" style="margin-bottom: 8px">
          <span class="badge badge-brand">{{ i.kode }}</span>
          <span class="badge" :class="i.is_active ? 'badge-SELESAI' : 'badge-neutral'">
            {{ i.is_active ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>
        <h3 class="card-title">{{ i.nama }}</h3>
        <p class="text-muted clamp-2" style="margin: 0 0 10px; font-size: 0.85rem">
          {{ i.deskripsi || 'Tanpa deskripsi.' }}
        </p>
        <p class="text-muted" style="margin: 0 0 12px; font-size: 0.8rem">
          <AppIcon name="users" :size="14" /> {{ i.jumlah_petugas ?? 0 }} petugas
        </p>
        <div class="row" style="gap: 7px">
          <button class="btn btn-secondary btn-sm" @click="buka(i)">
            <AppIcon name="edit" :size="14" /> Ubah
          </button>
          <button class="btn btn-ghost btn-sm" @click="hapus(i)">
            <AppIcon name="trash" :size="14" />
          </button>
        </div>
      </article>
    </div>

    <EmptyState v-else icon="building" judul="Belum ada instansi" />

    <AppModal
      v-if="modal"
      :judul="sedangDiubah ? 'Ubah Instansi' : 'Tambah Instansi'"
      @tutup="modal = false"
    >
      <div class="field">
        <label class="label" for="kode">Kode</label>
        <input id="kode" v-model.trim="form.kode" class="input" placeholder="DPUPR" required />
        <span class="hint">Singkatan resmi instansi, dipakai sebagai label ringkas.</span>
      </div>
      <div class="field">
        <label class="label" for="nama">Nama</label>
        <input id="nama" v-model.trim="form.nama" class="input" required />
      </div>
      <div class="field">
        <label class="label" for="deskripsi">Deskripsi</label>
        <textarea id="deskripsi" v-model.trim="form.deskripsi" class="textarea" rows="3" />
      </div>
      <div class="grid grid-2">
        <div class="field">
          <label class="label" for="surel">Email Kontak</label>
          <input id="surel" v-model.trim="form.email_kontak" class="input" type="email" />
        </div>
        <div class="field">
          <label class="label" for="telepon">Telepon</label>
          <input id="telepon" v-model.trim="form.telepon" class="input" type="tel" />
        </div>
      </div>
      <label class="row" style="gap: 8px">
        <input v-model="form.is_active" type="checkbox" /> Instansi aktif
      </label>

      <template #aksi>
        <button class="btn btn-secondary" @click="modal = false">Batal</button>
        <button class="btn btn-primary" :disabled="mengirim" @click="simpan">
          <span v-if="mengirim" class="spinner" />
          Simpan
        </button>
      </template>
    </AppModal>
  </div>
</template>
