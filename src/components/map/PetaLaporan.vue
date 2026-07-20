<script setup>
/**
 * Peta laporan berbasis Leaflet.
 *
 * Instance Leaflet sengaja disimpan di variabel biasa, bukan `ref`, karena
 * objek peta punya struktur melingkar yang mahal bila dibungkus proxy reaktif
 * Vue — pembungkusan itu juga kerap memicu bug pada plugin Leaflet.
 *
 * Mendukung tiga mode tampilan: penanda berkelompok (cluster), penanda polos,
 * dan peta panas (heatmap).
 */
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.heat'
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { MAP_DEFAULT, STATUS_HEX, STATUS_LABEL } from '@/utils/constants'

const props = defineProps({
  /** GeoJSON FeatureCollection dari endpoint /laporan/geojson/. */
  fitur: { type: Object, default: null },
  /** Titik heatmap [[lat, lng, bobot], …]. */
  titikPanas: { type: Array, default: () => [] },
  tinggi: { type: String, default: '560px' },
  mode: { type: String, default: 'cluster' }, // cluster | marker | panas
  tampilkanLegenda: { type: Boolean, default: true },
})

const emit = defineEmits(['pilih', 'geser'])

const wadah = ref(null)
const modeAktif = ref(props.mode)
const basemapAktif = ref('standar')

let peta = null
let layerPenanda = null
let layerPanas = null
const basemap = shallowRef({})

const BASEMAP = {
  standar: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    label: 'Standar',
    attribution: '&copy; Kontributor OpenStreetMap',
  },
  topografi: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    label: 'Topografi',
    attribution: '&copy; OpenTopoMap (CC-BY-SA)',
  },
}

// ── Penanda ────────────────────────────────────────────────────────────────

/** Penanda dibuat dari divIcon + SVG inline: tanpa berkas gambar eksternal. */
function buatIkon(status) {
  const warna = STATUS_HEX[status] ?? STATUS_HEX.BARU
  return L.divIcon({
    className: '',
    html: `<span class="map-marker" style="background:${warna}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 8v5M12 17h.01"/></svg></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  })
}

function isiPopup(props_) {
  const status = props_.status ?? 'BARU'
  return `
    <div style="min-width:210px;font-family:inherit">
      <div style="font-weight:700;margin-bottom:4px">${escapeHtml(props_.judul ?? '')}</div>
      <div style="font-size:11px;color:#64708b;margin-bottom:6px">${escapeHtml(props_.nomor_tiket ?? '')}</div>
      <span style="display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_HEX[status]}">
        ${STATUS_LABEL[status] ?? status}
      </span>
      <div style="font-size:12px;color:#64708b;margin-top:7px">${escapeHtml(props_.alamat ?? '')}</div>
    </div>`
}

/** Isi popup dirakit sebagai HTML, jadi nilai dari server harus di-escape. */
function escapeHtml(teks) {
  const div = document.createElement('div')
  div.textContent = String(teks ?? '')
  return div.innerHTML
}

// ── Siklus hidup peta ──────────────────────────────────────────────────────

function bangunPeta() {
  peta = L.map(wadah.value, {
    center: [MAP_DEFAULT.lat, MAP_DEFAULT.lng],
    zoom: MAP_DEFAULT.zoom,
    zoomControl: true,
    // Scroll halaman tidak boleh "tersandera" peta saat pengguna menggulir.
    scrollWheelZoom: false,
  })

  Object.entries(BASEMAP).forEach(([kunci, konf]) => {
    basemap.value[kunci] = L.tileLayer(konf.url, {
      attribution: konf.attribution,
      maxZoom: 19,
    })
  })
  basemap.value.standar.addTo(peta)

  // Aktifkan zoom roda hanya setelah peta diklik — pola umum peta tertanam.
  peta.on('click', (e) => {
    peta.scrollWheelZoom.enable()
    emit('pilih', { lat: e.latlng.lat, lng: e.latlng.lng })
  })
  peta.on('mouseout', () => peta.scrollWheelZoom.disable())
  peta.on('moveend', () => {
    const b = peta.getBounds()
    emit('geser', {
      bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(','),
      zoom: peta.getZoom(),
    })
  })

  gambarUlang()
}

function bersihkanLayer() {
  if (layerPenanda) {
    peta.removeLayer(layerPenanda)
    layerPenanda = null
  }
  if (layerPanas) {
    peta.removeLayer(layerPanas)
    layerPanas = null
  }
}

function gambarUlang() {
  if (!peta) return
  bersihkanLayer()

  if (modeAktif.value === 'panas') {
    layerPanas = L.heatLayer(props.titikPanas, {
      radius: 26,
      blur: 18,
      maxZoom: 16,
      gradient: { 0.3: '#6366f1', 0.6: '#f59e0b', 1: '#dc2626' },
    }).addTo(peta)
    return
  }

  const fitur = props.fitur?.features ?? []
  if (!fitur.length) return

  layerPenanda =
    modeAktif.value === 'cluster'
      ? L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 55 })
      : L.layerGroup()

  fitur.forEach((f) => {
    const [lng, lat] = f.geometry.coordinates
    L.marker([lat, lng], { icon: buatIkon(f.properties.status) })
      .bindPopup(isiPopup(f.properties))
      .addTo(layerPenanda)
  })

  layerPenanda.addTo(peta)

  // Bingkai peta mengikuti sebaran data, tapi jangan terlalu dekat pada
  // kumpulan yang sangat rapat.
  const batas = L.latLngBounds(fitur.map((f) => f.geometry.coordinates.slice().reverse()))
  if (batas.isValid()) peta.fitBounds(batas, { padding: [40, 40], maxZoom: 16 })
}

function gantiBasemap(kunci) {
  Object.values(basemap.value).forEach((layer) => peta.removeLayer(layer))
  basemap.value[kunci].addTo(peta)
  basemapAktif.value = kunci
}

function keLokasiSaya() {
  peta?.locate({ setView: true, maxZoom: 16 })
}

watch(() => props.fitur, gambarUlang, { deep: false })
watch(() => props.titikPanas, gambarUlang)
watch(modeAktif, gambarUlang)

onMounted(bangunPeta)
onBeforeUnmount(() => {
  peta?.remove()
  peta = null
})

defineExpose({ instance: () => peta })
</script>

<template>
  <div class="map-shell" :style="{ height: tinggi }">
    <div ref="wadah" style="width: 100%; height: 100%" />

    <div class="map-toolbar">
      <div class="tool-group" role="group" aria-label="Mode tampilan peta">
        <button
          v-for="m in [
            { id: 'cluster', icon: 'layers', label: 'Kelompok' },
            { id: 'marker', icon: 'mapPin', label: 'Penanda' },
            { id: 'panas', icon: 'trending', label: 'Peta panas' },
          ]"
          :key="m.id"
          class="tool-btn"
          :class="{ 'is-active': modeAktif === m.id }"
          :title="m.label"
          :aria-pressed="modeAktif === m.id"
          @click="modeAktif = m.id"
        >
          <AppIcon :name="m.icon" :size="17" />
        </button>
      </div>

      <div class="tool-group" role="group" aria-label="Peta dasar">
        <button
          v-for="(konf, kunci) in BASEMAP"
          :key="kunci"
          class="tool-btn"
          :class="{ 'is-active': basemapAktif === kunci }"
          :title="konf.label"
          @click="gantiBasemap(kunci)"
        >
          <AppIcon :name="kunci === 'standar' ? 'map' : 'route'" :size="17" />
        </button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" title="Ke lokasi saya" @click="keLokasiSaya">
          <AppIcon name="crosshair" :size="17" />
        </button>
      </div>
    </div>

    <div v-if="tampilkanLegenda && modeAktif !== 'panas'" class="map-legend">
      <strong style="display: block; margin-bottom: 5px">Status</strong>
      <div v-for="(label, kunci) in STATUS_LABEL" :key="kunci" class="legend-row">
        <span class="legend-swatch" :style="{ background: STATUS_HEX[kunci] }" />
        <span>{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-group {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow);
}
.tool-btn {
  display: grid;
  place-items: center;
  width: 36px;
  height: 34px;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 140ms var(--ease);
}
.tool-btn + .tool-btn {
  border-top: 1px solid var(--line-soft);
}
.tool-btn:hover {
  background: var(--raised);
  color: var(--text);
}
.tool-btn.is-active {
  background: var(--brand);
  color: #fff;
}
</style>
