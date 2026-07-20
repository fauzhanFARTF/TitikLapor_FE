<script setup>
/** Detail laporan: peta, linimasa, tanggapan, dan aksi tindak lanjut. */
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { pesanError } from '@/api/client'
import { instansiApi } from '@/api/auth'
import { laporanApi } from '@/api/laporan'
import PetaLaporan from '@/components/map/PetaLaporan.vue'
import LinimasaStatus from '@/components/report/LinimasaStatus.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { STATUS_LABEL } from '@/utils/constants'
import { formatWaktu, waktuRelatif } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const laporan = ref(null)
const memuat = ref(true)
const mengirim = ref(false)
const tanggapanBaru = ref('')
const tanggapanInternal = ref(false)
const modalStatus = ref(null) // status tujuan yang sedang dikonfirmasi
const catatan = ref('')
const fotoPenyelesaian = ref(null)
const modalAlih = ref(false)
const daftarInstansi = ref([])
const instansiTujuan = ref('')

/** Transisi yang boleh dipilih — cerminan TRANSISI_SAH di backend. */
const TRANSISI = {
  BARU: ['DIVERIFIKASI', 'DITOLAK'],
  DIVERIFIKASI: ['DIPROSES', 'DITOLAK'],
  DIPROSES: ['SELESAI', 'DITOLAK'],
  SELESAI: [],
  DITOLAK: [],
}

const aksiTersedia = computed(() =>
  auth.isWarga || !laporan.value ? [] : (TRANSISI[laporan.value.status] ?? [])
)

const geojson = computed(() =>
  laporan.value
    ? {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [laporan.value.longitude, laporan.value.latitude],
            },
            properties: laporan.value,
          },
        ],
      }
    : null
)

async function muat() {
  memuat.value = true
  try {
    laporan.value = await laporanApi.detail(route.params.id)
  } catch (e) {
    ui.gagal(pesanError(e, 'Laporan tidak ditemukan.'))
    router.push('/app/laporan')
  } finally {
    memuat.value = false
  }
}

async function simpanStatus() {
  mengirim.value = true
  try {
    laporan.value = await laporanApi.ubahStatus(laporan.value.id, {
      status: modalStatus.value,
      catatan: catatan.value,
      catatan_penyelesaian: modalStatus.value === 'SELESAI' ? catatan.value : undefined,
      foto_penyelesaian: fotoPenyelesaian.value ?? undefined,
    })
    ui.sukses(`Status diperbarui menjadi ${STATUS_LABEL[modalStatus.value]}.`)
    modalStatus.value = null
    catatan.value = ''
    fotoPenyelesaian.value = null
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal memperbarui status.'))
  } finally {
    mengirim.value = false
  }
}

async function bukaAlih() {
  modalAlih.value = true
  if (!daftarInstansi.value.length) {
    daftarInstansi.value = (await instansiApi.daftar({ is_active: true })) ?? []
  }
}

async function simpanAlih() {
  mengirim.value = true
  try {
    laporan.value = await laporanApi.alihkan(laporan.value.id, {
      instansi_id: instansiTujuan.value,
      catatan: catatan.value,
    })
    ui.sukses('Laporan dialihkan.')
    modalAlih.value = false
    catatan.value = ''
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal mengalihkan laporan.'))
  } finally {
    mengirim.value = false
  }
}

async function dukung() {
  try {
    const hasil = await laporanApi.dukung(laporan.value.id)
    laporan.value.sudah_didukung = hasil.didukung
    laporan.value.jumlah_dukungan = hasil.jumlah_dukungan
  } catch (e) {
    ui.gagal(pesanError(e))
  }
}

async function kirimTanggapan() {
  if (!tanggapanBaru.value.trim()) return
  mengirim.value = true
  try {
    const baru = await laporanApi.tanggapi(laporan.value.id, {
      isi: tanggapanBaru.value,
      is_internal: tanggapanInternal.value,
    })
    laporan.value.tanggapan.push(baru)
    tanggapanBaru.value = ''
    ui.sukses('Tanggapan terkirim.')
  } catch (e) {
    ui.gagal(pesanError(e, 'Gagal mengirim tanggapan.'))
  } finally {
    mengirim.value = false
  }
}

onMounted(muat)
</script>

<template>
  <div v-if="memuat" class="stack">
    <div class="skeleton" style="height: 40px; max-width: 420px" />
    <div class="skeleton" style="height: 380px" />
  </div>

  <div v-else-if="laporan">
    <RouterLink to="/app/laporan" class="btn btn-ghost btn-sm" style="margin-bottom: 10px">
      <AppIcon name="chevronLeft" :size="16" /> Daftar laporan
    </RouterLink>

    <header class="row-between" style="margin-bottom: 18px">
      <div style="min-width: 0">
        <div class="row" style="gap: 9px; margin-bottom: 5px">
          <StatusBadge :status="laporan.status" />
          <span class="mono text-muted">{{ laporan.nomor_tiket }}</span>
        </div>
        <h1 class="page-title" style="margin: 0">{{ laporan.judul }}</h1>
        <p class="page-subtitle" style="margin: 4px 0 0">
          {{ laporan.kategori_nama }} · dilaporkan {{ waktuRelatif(laporan.created_at) }}
          oleh {{ laporan.pelapor_nama }}
        </p>
      </div>

      <div class="row" style="gap: 8px">
        <button
          class="btn btn-sm"
          :class="laporan.sudah_didukung ? 'btn-primary' : 'btn-secondary'"
          @click="dukung"
        >
          <AppIcon name="thumbsUp" :size="16" />
          {{ laporan.jumlah_dukungan }}
        </button>

        <button
          v-for="status in aksiTersedia"
          :key="status"
          class="btn btn-sm"
          :class="status === 'DITOLAK' ? 'btn-danger' : 'btn-primary'"
          @click="modalStatus = status"
        >
          {{ STATUS_LABEL[status] }}
        </button>

        <button v-if="auth.isAdmin" class="btn btn-secondary btn-sm" @click="bukaAlih">
          <AppIcon name="route" :size="16" /> Alihkan
        </button>
      </div>
    </header>

    <div class="tata-letak">
      <div class="stack">
        <section class="card">
          <h2 class="card-title">Deskripsi</h2>
          <p style="margin: 0; white-space: pre-line">{{ laporan.deskripsi }}</p>

          <img
            v-if="laporan.foto"
            :src="laporan.foto"
            :alt="`Foto laporan ${laporan.judul}`"
            class="foto"
            loading="lazy"
          />
        </section>

        <section class="card card-flush">
          <PetaLaporan
            :fitur="geojson"
            tinggi="320px"
            mode="marker"
            :tampilkan-legenda="false"
          />
        </section>

        <section v-if="laporan.status === 'SELESAI'" class="card">
          <h2 class="card-title">Hasil Penyelesaian</h2>
          <p style="margin: 0">{{ laporan.catatan_penyelesaian || '—' }}</p>
          <img
            v-if="laporan.foto_penyelesaian"
            :src="laporan.foto_penyelesaian"
            alt="Foto hasil penyelesaian"
            class="foto"
            loading="lazy"
          />
        </section>

        <section class="card">
          <h2 class="card-title">Tanggapan</h2>

          <div v-if="laporan.tanggapan?.length" class="stack" style="gap: 12px">
            <article
              v-for="t in laporan.tanggapan"
              :key="t.id"
              class="tanggapan"
              :class="{ internal: t.is_internal }"
            >
              <div class="row-between" style="margin-bottom: 3px">
                <strong style="font-size: 0.85rem">{{ t.nama_penulis }}</strong>
                <span class="text-muted" style="font-size: 0.74rem">
                  {{ waktuRelatif(t.created_at) }}
                </span>
              </div>
              <span v-if="t.is_internal" class="badge badge-accent" style="margin-bottom: 5px">
                Catatan internal
              </span>
              <p style="margin: 0; font-size: 0.88rem">{{ t.isi }}</p>
            </article>
          </div>
          <p v-else class="text-muted" style="font-size: 0.88rem">Belum ada tanggapan.</p>

          <form style="margin-top: 14px" @submit.prevent="kirimTanggapan">
            <textarea
              v-model="tanggapanBaru"
              class="textarea"
              rows="3"
              placeholder="Tulis tanggapan…"
              aria-label="Tanggapan baru"
            />
            <div class="row-between" style="margin-top: 9px">
              <label v-if="!auth.isWarga" class="row" style="gap: 7px; font-size: 0.83rem">
                <input v-model="tanggapanInternal" type="checkbox" />
                Catatan internal (tidak terlihat pelapor)
              </label>
              <span v-else />
              <button class="btn btn-primary btn-sm" :disabled="mengirim || !tanggapanBaru.trim()">
                <AppIcon name="send" :size="15" /> Kirim
              </button>
            </div>
          </form>
        </section>
      </div>

      <aside class="stack">
        <section class="card">
          <h2 class="card-title">Informasi</h2>
          <dl class="info">
            <div><dt>Instansi</dt><dd>{{ laporan.instansi_nama || 'Belum ditentukan' }}</dd></div>
            <div><dt>Petugas</dt><dd>{{ laporan.petugas_nama || '—' }}</dd></div>
            <div><dt>Prioritas</dt><dd>{{ laporan.prioritas }}</dd></div>
            <div><dt>Alamat</dt><dd>{{ laporan.alamat || '—' }}</dd></div>
            <div><dt>Kelurahan</dt><dd>{{ laporan.kelurahan || '—' }}</dd></div>
            <div>
              <dt>Koordinat</dt>
              <dd class="mono">
                {{ laporan.latitude?.toFixed(6) }}, {{ laporan.longitude?.toFixed(6) }}
              </dd>
            </div>
            <div><dt>Dibuat</dt><dd>{{ formatWaktu(laporan.created_at) }}</dd></div>
          </dl>
        </section>

        <section class="card">
          <h2 class="card-title">Linimasa</h2>
          <LinimasaStatus :riwayat="laporan.riwayat" />
        </section>
      </aside>
    </div>

    <!-- Konfirmasi perubahan status -->
    <AppModal
      v-if="modalStatus"
      :judul="`Ubah status ke ${STATUS_LABEL[modalStatus]}`"
      @tutup="modalStatus = null"
    >
      <div class="field">
        <label class="label" for="catatan">
          {{ modalStatus === 'SELESAI' ? 'Catatan tindakan' : 'Catatan' }}
          <span v-if="modalStatus !== 'DIVERIFIKASI'" class="req">*</span>
        </label>
        <textarea
          id="catatan"
          v-model="catatan"
          class="textarea"
          rows="4"
          :placeholder="
            modalStatus === 'DITOLAK'
              ? 'Jelaskan alasan penolakan — pelapor akan membacanya.'
              : 'Tuliskan tindakan yang dilakukan.'
          "
        />
        <span class="hint">
          Catatan ini tampil pada linimasa laporan dan dapat dibaca pelapor.
        </span>
      </div>

      <div v-if="modalStatus === 'SELESAI'" class="field">
        <label class="label" for="foto-selesai">Foto hasil penanganan</label>
        <input
          id="foto-selesai"
          class="input"
          type="file"
          accept="image/*"
          @change="fotoPenyelesaian = $event.target.files[0]"
        />
      </div>

      <template #aksi>
        <button class="btn btn-secondary" @click="modalStatus = null">Batal</button>
        <button
          class="btn"
          :class="modalStatus === 'DITOLAK' ? 'btn-danger' : 'btn-primary'"
          :disabled="mengirim || (modalStatus !== 'DIVERIFIKASI' && !catatan.trim())"
          @click="simpanStatus"
        >
          <span v-if="mengirim" class="spinner" />
          Simpan
        </button>
      </template>
    </AppModal>

    <!-- Disposisi ke instansi lain -->
    <AppModal v-if="modalAlih" judul="Alihkan ke instansi lain" @tutup="modalAlih = false">
      <div class="field">
        <label class="label" for="instansi">Instansi tujuan</label>
        <select id="instansi" v-model="instansiTujuan" class="select">
          <option value="">Pilih instansi…</option>
          <option v-for="i in daftarInstansi" :key="i.id" :value="i.id">
            {{ i.kode }} — {{ i.nama }}
          </option>
        </select>
      </div>
      <div class="field">
        <label class="label" for="catatan-alih">Alasan pengalihan</label>
        <textarea id="catatan-alih" v-model="catatan" class="textarea" rows="3" />
      </div>

      <template #aksi>
        <button class="btn btn-secondary" @click="modalAlih = false">Batal</button>
        <button class="btn btn-primary" :disabled="mengirim || !instansiTujuan" @click="simpanAlih">
          <span v-if="mengirim" class="spinner" />
          Alihkan
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.tata-letak {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
}
@media (max-width: 1080px) {
  .tata-letak {
    grid-template-columns: 1fr;
  }
}
.foto {
  width: 100%;
  border-radius: var(--radius-sm);
  margin-top: 14px;
  display: block;
}
.info {
  margin: 0;
  display: grid;
  gap: 11px;
}
.info dt {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.info dd {
  margin: 2px 0 0;
  font-size: 0.87rem;
  font-weight: 600;
}
.tanggapan {
  padding: 11px 13px;
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  border: 1px solid var(--line-soft);
}
.tanggapan.internal {
  background: var(--warning-bg);
  border-color: transparent;
}
</style>
