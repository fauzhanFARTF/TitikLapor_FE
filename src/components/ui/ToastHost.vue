<script setup>
/** Wadah notifikasi global; dipasang sekali di App.vue. */
import { storeToRefs } from 'pinia'

import { useUiStore } from '@/stores/ui'
import AppIcon from './AppIcon.vue'

const ui = useUiStore()
const { toasts } = storeToRefs(ui)

const IKON = { success: 'checkCircle', error: 'xCircle', info: 'info' }
</script>

<template>
  <div class="toast-stack" role="status" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast-${t.jenis}`">
      <AppIcon :name="IKON[t.jenis] ?? 'info'" :size="18" />
      <span style="flex: 1">{{ t.pesan }}</span>
      <button
        class="btn btn-ghost btn-sm"
        style="padding: 2px"
        aria-label="Tutup notifikasi"
        @click="ui.tutupToast(t.id)"
      >
        <AppIcon name="close" :size="14" />
      </button>
    </div>
  </div>
</template>
