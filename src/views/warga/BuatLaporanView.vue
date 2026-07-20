<script setup>
/** Formulir laporan warga dengan pemilih lokasi & peringatan duplikat. */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { errorField, pesanError } from '@/api/client'
import { laporanApi } from '@/api/laporan'
import { spatialApi } from '@/api/spatial'
import PemilihLokasi from '@/components/map/PemilihLokasi.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useLaporanStore } from '@/stores/laporan'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const store = useLaporanStore()
const ui = useUiStore()

const form = ref({
  judul: '',
  deskripsi: '',
  kategori_id: '',
  alamat: '',
  kelurahan: '',
  kecamatan: '',
  is_anonim: false,
})
const lokasi = ref(null)
const foto = ref(null)
const pratinjau = ref('')
const mengirim = ref(false)
const errorPerField = ref({})
const duplikat = ref(null)

const bisaKirim = computed(
  () =>
    form.value.judul.trim().length >= 5 &&
    form.value.deskripsi.trim().length >= 10 &&
    form.value.kategori_id &&
    lokasi.value
)

function pilihFoto(event) {
  const berkas = event.target.files?.[0]
  if (!berkas) return

  // Batasi di sisi klien agar pengguna tidak menunggu unggahan yang pasti ditolak.
  if (berkas.size > 5 * 1024 * 1024) {
    ui.gagal('Ukuran foto maksimal 5 MB.')
    event.target.value = ''
    return
  }
  foto.value = berkas
  pratinjau.value = URL.createObjectURL(berkas)
}

/** Cek duplikat begitu lokasi & kategori lengkap, sebelum laporan dikirim. */
async function periksaDuplikat() {
  if (!lokasi.value || !form.value.kategori_id) return
  try {
    const hasil = await laporanApi.cekDuplikat({
      lat: lokasi.value.lat,
      lon: lokasi.value.lng,
      kategori_id: form.value.kategori_id,
    })
    duplikat.value = hasil.ada_duplikat ? hasil.laporan : null
  } catch {
    duplikat.value = null
  }
}

/** Isi otomatis kelurahan/kecamatan dari batas wilayah di backend. */
async function isiWilayah() {
  if (!lokasi.value) return
  try {
    const wilayah = await spatialApi.wilayahDariTitik(lokasi.value.lat, lokasi.value.lng)
    if (!wilayah) return
    if (wilayah.tingkat === 'KELURAHAN') {
      form.value.kelurahan = wilayah.nama
      form.value.kecamatan = wilayah.induk ?? form.value.kecamatan
    } else {
      form.value.kecamatan = wilayah.nama
    }
  } catch {
    // Data batas wilayah opsional — form tetap bisa diisi manual.
  }
}

watch([lokasi, () => form.value.kategori_id], () => {
  periksaDuplikat()
  isiWilayah()
})

async function kirim() {
  mengirim.value = true
  errorPerField.value = {}
  try {
    const laporan = await laporanApi.buat({
      ...form.value,
      latitude: lokasi.value.lat,
      longitude: lokasi.value.lng,
      foto: foto.value,
    })
    ui.sukses(`Laporan terkirim. Nomor tiket Anda: ${laporan.nomor_tiket}`)
    router.push(`/app/laporan/${laporan.id}`)
  } catch (e) {
    ui.gagal(pesanError(e, 'Laporan gagal dikirim.'))
    errorPerField.value = errorField(e)
  } finally {
    mengirim.value = false
  }
}

onMounted(store.muatKategori)
</script>

<template>
  <div class="halaman">
    <h1 class="page-title">Buat Laporan</h1>
    <p class="page-subtitle">
      Semakin jelas foto dan lokasinya, semakin cepat petugas menindaklanjuti.
    </p>

    <form @submit.prevent="kirim">
      <div class="tata-letak">
        <div class="stack">
          <section class="card">
            <h2 class="card-title">Detail Masalah</h2>

            <div class="field">
              <label class="label" for="kategori">Kategori <span class="req">*</span></label>
              <select id="kategori" v-model="form.kategori_id" class="select" required>
                <option value="">Pilih kategori…</option>
                <option v-for="k in store.kategori" :key="k.id" :value="k.id">
                  {{ k.nama }}
                </option>
              </select>
              <span class="hint">
                Kategori menentukan instansi yang akan menerima laporan Anda.
              </span>
            </div>

            <div class="field">
              <label class="label" for="judul">Judul Laporan <span class="req">*</span></label>
              <input
                id="judul"
                v-model.trim="form.judul"
                class="input"
                maxlength="200"
                required
                placeholder="Contoh: Lubang besar di Jalan Merdeka depan SDN 3"
              />
              <span v-if="errorPerField.judul" class="error-text">{{ errorPerField.judul }}</span>
            </div>

            <div class="field">
              <label class="label" for="deskripsi">Deskripsi <span class="req">*</span></label>
              <textarea
                id="deskripsi"
                v-model.trim="form.deskripsi"
                class="textarea"
                rows="5"
                required
                placeholder="Jelaskan kondisi, sejak kapan terjadi, dan dampaknya bagi warga."
              />
              <span class="hint">{{ form.deskripsi.length }} karakter (minimal 10).</span>
            </div>

            <div class="field">
              <label class="label" for="foto">Foto Bukti</label>
              <input id="foto" class="input" type="file" accept="image/*" @change="pilihFoto" />
              <span class="hint">Format gambar, maksimal 5 MB.</span>
              <img v-if="pratinjau" :src="pratinjau" alt="Pratinjau foto" class="pratinjau" />
            </div>
          </section>

          <section class="card">
            <h2 class="card-title">Lokasi Kejadian <span class="req">*</span></h2>
            <PemilihLokasi v-model="lokasi" />

            <div class="grid grid-2" style="margin-top: 16px">
              <div class="field" style="margin: 0">
                <label class="label" for="alamat">Patokan / Alamat</label>
                <input
                  id="alamat"
                  v-model.trim="form.alamat"
                  class="input"
                  placeholder="Depan minimarket, seberang halte…"
                />
              </div>
              <div class="field" style="margin: 0">
                <label class="label" for="kelurahan">Kelurahan</label>
                <input id="kelurahan" v-model.trim="form.kelurahan" class="input" />
              </div>
            </div>
          </section>
        </div>

        <aside class="stack">
          <div v-if="duplikat" class="alert alert-warning">
            <AppIcon name="alert" :size="18" />
            <div>
              <strong>Laporan serupa sudah ada</strong>
              <p style="margin: 4px 0 8px; font-size: 0.83rem">
                “{{ duplikat.judul }}” dilaporkan di sekitar titik ini pada kategori yang
                sama. Mendukung laporan yang ada lebih membantu daripada membuat duplikat.
              </p>
              <RouterLink :to="`/app/laporan/${duplikat.id}`" class="btn btn-secondary btn-sm">
                Lihat laporan itu
              </RouterLink>
            </div>
          </div>

          <section class="card">
            <h2 class="card-title">Pengaturan</h2>
            <label class="row" style="gap: 9px; align-items: flex-start">
              <input v-model="form.is_anonim" type="checkbox" style="margin-top: 3px" />
              <span>
                <strong style="font-size: 0.87rem">Laporkan sebagai anonim</strong>
                <span class="hint" style="display: block">
                  Nama Anda disembunyikan dari publik, tetapi petugas tetap dapat
                  menghubungi Anda bila diperlukan.
                </span>
              </span>
            </label>

            <div class="divider" />

            <button class="btn btn-gradient btn-block btn-lg" :disabled="!bisaKirim || mengirim">
              <span v-if="mengirim" class="spinner" />
              <AppIcon v-else name="send" :size="18" />
              {{ mengirim ? 'Mengirim…' : 'Kirim Laporan' }}
            </button>
            <p v-if="!bisaKirim" class="hint" style="margin-top: 9px; text-align: center">
              Lengkapi kategori, judul, deskripsi, dan titik lokasi.
            </p>
          </section>
        </aside>
      </div>
    </form>
  </div>
</template>

<style scoped>
.halaman {
  max-width: 1180px;
}
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
.pratinjau {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-top: 10px;
}
</style>
