<script setup>
import { computed } from 'vue'

import AppIcon from './AppIcon.vue'

const props = defineProps({
  meta: { type: Object, default: null },
})
const emit = defineEmits(['ganti'])

const halaman = computed(() => props.meta?.page ?? 1)
const total = computed(() => props.meta?.total_pages ?? 1)

/** Tampilkan maksimal 5 nomor di sekitar halaman aktif agar tidak meluber. */
const nomor = computed(() => {
  const mulai = Math.max(1, Math.min(halaman.value - 2, total.value - 4))
  const akhir = Math.min(total.value, mulai + 4)
  return Array.from({ length: akhir - mulai + 1 }, (_, i) => mulai + i)
})
</script>

<template>
  <nav v-if="meta && total > 1" class="row-between" aria-label="Navigasi halaman">
    <span class="text-muted" style="font-size: 0.82rem">
      Halaman {{ halaman }} dari {{ total }} · {{ meta.count }} laporan
    </span>
    <div class="row" style="gap: 6px">
      <button
        class="btn btn-secondary btn-sm"
        :disabled="halaman <= 1"
        aria-label="Halaman sebelumnya"
        @click="emit('ganti', halaman - 1)"
      >
        <AppIcon name="chevronLeft" :size="16" />
      </button>
      <button
        v-for="n in nomor"
        :key="n"
        class="btn btn-sm"
        :class="n === halaman ? 'btn-primary' : 'btn-secondary'"
        :aria-current="n === halaman ? 'page' : undefined"
        @click="emit('ganti', n)"
      >
        {{ n }}
      </button>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="halaman >= total"
        aria-label="Halaman berikutnya"
        @click="emit('ganti', halaman + 1)"
      >
        <AppIcon name="chevronRight" :size="16" />
      </button>
    </div>
  </nav>
</template>
