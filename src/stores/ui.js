/** Store UI: toast notifikasi & keadaan sidebar. */

import { defineStore } from 'pinia'
import { ref } from 'vue'

let idBerikutnya = 1

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])
  const sidebarTerbuka = ref(false)
  const sidebarDiciutkan = ref(document.documentElement.classList.contains('sb-collapsed'))

  function toast(pesan, jenis = 'info', durasi = 4000) {
    const id = idBerikutnya++
    toasts.value.push({ id, pesan, jenis })
    setTimeout(() => tutupToast(id), durasi)
    return id
  }

  const sukses = (pesan) => toast(pesan, 'success')
  const gagal = (pesan) => toast(pesan, 'error', 6000)

  function tutupToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function toggleSidebar() {
    sidebarTerbuka.value = !sidebarTerbuka.value
  }

  function toggleCiut() {
    sidebarDiciutkan.value = !sidebarDiciutkan.value
    document.documentElement.classList.toggle('sb-collapsed', sidebarDiciutkan.value)
  }

  return {
    toasts,
    sidebarTerbuka,
    sidebarDiciutkan,
    toast,
    sukses,
    gagal,
    tutupToast,
    toggleSidebar,
    toggleCiut,
  }
})
