<script setup>
/** Kartu ringkasan angka untuk dashboard. */
import { formatAngka } from '@/utils/format'
import AppIcon from './AppIcon.vue'

defineProps({
  label: { type: String, required: true },
  nilai: { type: [Number, String], default: 0 },
  icon: { type: String, default: 'chart' },
  warna: { type: String, default: 'var(--brand-2)' },
  keterangan: { type: String, default: '' },
})
</script>

<template>
  <div class="card hover-lift stat">
    <div class="stat-icon" :style="{ color: warna, background: `color-mix(in srgb, ${warna} 14%, transparent)` }">
      <AppIcon :name="icon" :size="20" />
    </div>
    <div>
      <p class="stat-label">{{ label }}</p>
      <p class="stat-value">{{ typeof nilai === 'number' ? formatAngka(nilai) : nilai }}</p>
      <p v-if="keterangan" class="stat-note">{{ keterangan }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
}
.stat-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.stat-label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-value {
  margin: 2px 0 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.stat-note {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--muted);
}
</style>
