/** Pengelola tema terang/gelap. Nilai awal sudah dipasang theme-init.js. */

import { ref } from 'vue'

import { STORAGE_KEY } from '@/utils/constants'

const tema = ref(document.documentElement.getAttribute('data-theme') || 'light')

export function useTheme() {
  function terapkan(nilai) {
    tema.value = nilai
    document.documentElement.setAttribute('data-theme', nilai)
    localStorage.setItem(STORAGE_KEY.THEME, nilai)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', nilai === 'dark' ? '#0e1424' : '#4338ca')
  }

  const toggle = () => terapkan(tema.value === 'dark' ? 'light' : 'dark')

  return { tema, terapkan, toggle }
}
