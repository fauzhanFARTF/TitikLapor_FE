<script setup>
/** Badge status laporan — warna & label diambil dari konstanta bersama. */
import { computed } from 'vue'

import { STATUS_LABEL } from '@/utils/constants'

const props = defineProps({
  status: { type: String, required: true },
  dot: { type: Boolean, default: true },
})

const label = computed(() => STATUS_LABEL[props.status] ?? props.status)
</script>

<template>
  <span class="badge" :class="[`badge-${status}`, { 'badge-dot': dot }]">{{ label }}</span>
</template>
