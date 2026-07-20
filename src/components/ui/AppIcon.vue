<script setup>
/**
 * Ikon SVG inline.
 *
 * Semua path digambar sendiri alih-alih memuat Font Awesome dari CDN, supaya
 * Content-Security-Policy tidak perlu membuka host pihak ketiga dan halaman
 * tidak menunggu unduhan font ikon sebelum bisa dirender.
 *
 * Semua path memakai viewBox 24×24 dengan gaya stroke seragam.
 */
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  stroke: { type: [Number, String], default: 1.8 },
})

const PATHS = {
  // Navigasi & antarmuka
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  refresh: 'M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2M18 3v5h-5M6 21v-5h5',
  logout: 'M15 17l5-5-5-5M20 12H9M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6',
  sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z',
  panelLeft: 'M4 5h16v14H4zM10 5v14',

  // Domain
  mapPin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  map: 'M9 4 3 7v13l6-3 6 3 6-3V4l-6 3-6-3ZM9 4v13M15 7v13',
  layers: 'M12 3 2 8l10 5 10-5-10-5ZM2 14l10 5 10-5M2 11l10 5 10-5',
  crosshair: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 3v4M12 17v4M3 12h4M17 12h4',
  route: 'M6 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 10v3a4 4 0 0 1-4 4h-4a4 4 0 0 0-4 4',
  report: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M9 13h6M9 17h4',
  dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8',
  building: 'M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M14 21V11h4a2 2 0 0 1 2 2v8M8 8h2M8 12h2M8 16h2M2 21h20',
  tag: 'M20.6 13.4 12 4.8V2H4v8h2.8l8.6 8.6a2 2 0 0 0 2.8 0l2.4-2.4a2 2 0 0 0 0-2.8ZM8 8h.01',
  camera: 'M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z',
  thumbsUp: 'M7 22V10l5-8a2.5 2.5 0 0 1 2.5 2.5V9h4.6a2 2 0 0 1 2 2.4l-1.4 8A2 2 0 0 1 17.7 21H7ZM7 10H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  check: 'M4 12.5 9 17.5 20 6.5',
  checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 12.5l2.5 2.5 4.5-5',
  xCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16v-5M12 8h.01',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  chart: 'M3 3v18h18M7 15l4-5 4 3 5-7',
  trending: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  ticket: 'M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 1 0-6V6H3v3ZM12 7v10',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  ruler: 'M2 15 15 2l7 7L9 22l-7-7ZM6 11l2 2M9 8l2 2M12 5l2 2',
  logo: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
}

const d = computed(() => PATHS[props.name] ?? PATHS.info)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="stroke"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="d" />
  </svg>
</template>
