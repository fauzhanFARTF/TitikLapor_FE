<script setup>
/** Linimasa perjalanan status laporan. */
import { formatWaktu } from '@/utils/format'
import { STATUS_LABEL } from '@/utils/constants'

defineProps({
  riwayat: { type: Array, default: () => [] },
})
</script>

<template>
  <ol class="timeline">
    <li v-for="(item, i) in riwayat" :key="item.id" class="timeline-item is-done">
      <div class="row-between" style="gap: 8px">
        <strong style="font-size: 0.88rem">
          {{ item.status_label ?? STATUS_LABEL[item.status_baru] ?? item.status_baru }}
        </strong>
        <span class="text-muted" style="font-size: 0.75rem">
          {{ formatWaktu(item.created_at ?? item.waktu) }}
        </span>
      </div>
      <p v-if="item.catatan" class="catatan">{{ item.catatan }}</p>
      <p v-if="item.nama_oleh" class="oleh">oleh {{ item.nama_oleh }}</p>
      <span v-if="i === 0" class="sr-only">Titik awal linimasa</span>
    </li>
  </ol>
</template>

<style scoped>
.catatan {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--text);
}
.oleh {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: var(--muted);
}
</style>
