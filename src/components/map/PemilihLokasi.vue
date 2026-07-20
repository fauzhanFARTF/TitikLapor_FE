<script setup>
/**
 * Pemilih koordinat untuk formulir laporan.
 *
 * Tiga cara menandai lokasi, karena GPS sering tidak akurat di dalam gedung:
 * deteksi otomatis, klik pada peta, dan menggeser penanda.
 */
import L from 'leaflet'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { useGeolocation } from '@/composables/useGeolocation'
import { MAP_DEFAULT } from '@/utils/constants'

const props = defineProps({
  modelValue: { type: Object, default: null }, // { lat, lng }
  tinggi: { type: String, default: '340px' },
})
const emit = defineEmits(['update:modelValue'])

const wadah = ref(null)
const { memuat: mencariLokasi, error: errorLokasi, ambilLokasi } = useGeolocation()

let peta = null
let penanda = null

function pasangPenanda(lat, lng, geser = true) {
  if (penanda) {
    penanda.setLatLng([lat, lng])
  } else {
    penanda = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        className: '',
        html: '<span class="map-marker" style="background:var(--brand)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 8v5M12 17h.01"/></svg></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 28],
      }),
    }).addTo(peta)

    penanda.on('dragend', () => {
      const p = penanda.getLatLng()
      emit('update:modelValue', { lat: p.lat, lng: p.lng })
    })
  }

  if (geser) peta.setView([lat, lng], Math.max(peta.getZoom(), 16))
  emit('update:modelValue', { lat, lng })
}

async function deteksiLokasi() {
  try {
    const posisi = await ambilLokasi()
    pasangPenanda(posisi.lat, posisi.lng)
  } catch {
    // Pesan sudah tersimpan di errorLokasi dan ditampilkan di template.
  }
}

onMounted(() => {
  const awal = props.modelValue ?? { lat: MAP_DEFAULT.lat, lng: MAP_DEFAULT.lng }

  peta = L.map(wadah.value, {
    center: [awal.lat, awal.lng],
    zoom: props.modelValue ? 16 : MAP_DEFAULT.zoom,
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; Kontributor OpenStreetMap',
    maxZoom: 19,
  }).addTo(peta)

  if (props.modelValue) pasangPenanda(awal.lat, awal.lng, false)

  peta.on('click', (e) => pasangPenanda(e.latlng.lat, e.latlng.lng, false))
})

watch(
  () => props.modelValue,
  (nilai) => {
    // Sinkronkan bila koordinat diubah dari luar (mis. dibersihkan induk).
    if (nilai && peta && !penanda) pasangPenanda(nilai.lat, nilai.lng)
  }
)

onBeforeUnmount(() => {
  peta?.remove()
  peta = null
})
</script>

<template>
  <div class="pemilih">
    <div class="map-shell" :style="{ height: tinggi }">
      <div ref="wadah" style="width: 100%; height: 100%" />
    </div>

    <div class="row-between" style="margin-top: 10px">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="mencariLokasi"
        @click="deteksiLokasi"
      >
        <span v-if="mencariLokasi" class="spinner" />
        <AppIcon v-else name="crosshair" :size="16" />
        Gunakan lokasi saya
      </button>

      <span v-if="modelValue" class="mono text-muted">
        {{ modelValue.lat.toFixed(6) }}, {{ modelValue.lng.toFixed(6) }}
      </span>
      <span v-else class="text-muted" style="font-size: 0.82rem">
        Klik peta untuk menandai lokasi
      </span>
    </div>

    <p v-if="errorLokasi" class="alert alert-warning" style="margin-top: 10px">
      <AppIcon name="alert" :size="17" />
      <span>{{ errorLokasi }}</span>
    </p>
  </div>
</template>
