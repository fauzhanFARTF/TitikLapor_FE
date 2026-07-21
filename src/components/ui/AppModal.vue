<script setup>
/** Dialog modal dengan penutupan lewat Esc & klik latar. */
import { onBeforeUnmount, onMounted } from 'vue'

import AppIcon from './AppIcon.vue'

defineProps({
  judul: { type: String, default: '' },
  lebar: { type: String, default: '520px' },
})
const emit = defineEmits(['tutup'])

function tanganiEsc(event) {
  if (event.key === 'Escape') emit('tutup')
}

onMounted(() => {
  document.addEventListener('keydown', tanganiEsc)
  // Cegah latar ikut menggulir saat modal terbuka.
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', tanganiEsc)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('tutup')">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-label="judul"
      :style="{ maxWidth: lebar }"
    >
      <div v-if="judul" class="modal-head">
        <h2 class="card-title">{{ judul }}</h2>
        <button class="btn btn-ghost btn-sm" aria-label="Tutup" @click="emit('tutup')">
          <AppIcon name="close" :size="18" />
        </button>
      </div>
      <div class="modal-body"><slot /></div>
      <div v-if="$slots.aksi" class="modal-foot"><slot name="aksi" /></div>
    </div>
  </div>
</template>
