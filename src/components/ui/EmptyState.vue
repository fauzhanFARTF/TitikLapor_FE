<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'inbox' },
  judul: { type: String, default: 'Belum ada data' },
  pesan: { type: String, default: '' },
})
</script>

<template>
  <div class="empty-state">
    <AppIcon :name="icon" :size="44" :stroke="1.4" />
    <h3>{{ judul }}</h3>
    <p v-if="pesan">{{ pesan }}</p>
    <slot />
  </div>
</template>
