<script setup>
/** Kategori laporan & pemetaannya ke instansi. */
import { onMounted, ref } from 'vue'

import { instansiApi } from '@/api/auth'
import { pesanError } from '@/api/client'
import { kategoriApi } from '@/api/laporan'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

const daftar = ref([])
const instansi = ref([])
const memuat = ref(true)
const modal = ref(false)
const mengirim = ref(false)
const sedangDiubah = ref(null)

const kosong = () => ({
  nama: '',
  slug: '',
  warna: '#dc2626',
  ikon: 'fa-triangle-exclamation',
  instansi_default: '',
  sla_hari: 7,
  is_active: true,
})
const form = ref(kosong())

/** Slug dibuat otomatis dari nama supaya admin tidak perlu mengetiknya. */
function buatSlug() {
  if (sedangDiubah.value) return
  form.value.slug = form.value.nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function muat() {
  memuat.value = true
  try {
    const [k, i] = await Promise.all([kategoriApi.daftar(), instansiApi.daftar()])
    daftar.value = k ?? []
    instansi.value = i ?? []
  } finally {
    memuat.value = false
  }
}

function buka(kategori = null) {
  sedangDiubah.value = kategori
  form.value = kategori ? { ...kategori } : kosong()
  modal.value = true
}

async function simpan() {
  mengirim.value = true
  try {
    const payload = { ...form.value, instansi_default: form.value.instansi_default || null }
    if (sedangDiubah.value) {
      await kategoriApi.perbarui(sedangDiubah.value.id, payload)
      ui.sukses('Kategori diperbarui.')
    } else {
      await kategoriApi.buat(payload)
      ui.sukses('Kategori ditambahkan.')
    }
    modal.value = false
    muat()
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal menyimpan kategori.'))
  } finally {
    mengirim.value = false
  }
}

onMounted(muat)
</script>

<template>
  <div>
    <header class="row-between" style="margin-bottom: 18px">
      <div>
        <h1 class="page-title">Kategori Laporan</h1>
        <p class="page-subtitle" style="margin: 0">
          Kategori menentukan instansi tujuan dan target penyelesaian (SLA).
        </p>
      </div>
      <button class="btn btn-gradient btn-sm" @click="buka()">
        <AppIcon name="plus" :size="16" /> Tambah Kategori
      </button>
    </header>

    <div v-if="memuat" class="skeleton" style="height: 300px" />

    <div v-else-if="daftar.length" class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Instansi Tujuan</th>
            <th>SLA</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in daftar" :key="k.id">
            <td>
              <div class="row" style="gap: 9px">
                <span class="titik" :style="{ background: k.warna }" />
                <span>
                  <strong style="display: block">{{ k.nama }}</strong>
                  <span class="text-muted mono" style="font-size: 0.74rem">{{ k.slug }}</span>
                </span>
              </div>
            </td>
            <td>{{ k.instansi_nama || '— belum dipetakan' }}</td>
            <td>{{ k.sla_hari }} hari</td>
            <td>
              <span class="badge" :class="k.is_active ? 'badge-SELESAI' : 'badge-neutral'">
                {{ k.is_active ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td>
              <button class="btn btn-secondary btn-sm" @click="buka(k)">
                <AppIcon name="edit" :size="14" /> Ubah
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmptyState v-else icon="tag" judul="Belum ada kategori" />

    <AppModal
      v-if="modal"
      :judul="sedangDiubah ? 'Ubah Kategori' : 'Tambah Kategori'"
      @tutup="modal = false"
    >
      <div class="field">
        <label class="label" for="nama">Nama Kategori</label>
        <input id="nama" v-model.trim="form.nama" class="input" required @input="buatSlug" />
      </div>
      <div class="field">
        <label class="label" for="slug">Slug</label>
        <input id="slug" v-model.trim="form.slug" class="input mono" required />
      </div>
      <div class="field">
        <label class="label" for="instansi">Instansi Tujuan</label>
        <select id="instansi" v-model="form.instansi_default" class="select">
          <option value="">Belum dipetakan</option>
          <option v-for="i in instansi" :key="i.id" :value="i.id">
            {{ i.kode }} — {{ i.nama }}
          </option>
        </select>
      </div>
      <div class="grid grid-2">
        <div class="field">
          <label class="label" for="warna">Warna Penanda</label>
          <input id="warna" v-model="form.warna" class="input" type="color" />
        </div>
        <div class="field">
          <label class="label" for="sla">Target Penyelesaian (hari)</label>
          <input id="sla" v-model.number="form.sla_hari" class="input" type="number" min="1" />
        </div>
      </div>
      <label class="row" style="gap: 8px">
        <input v-model="form.is_active" type="checkbox" /> Kategori aktif
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

<style scoped>
.titik {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex-shrink: 0;
}
</style>
