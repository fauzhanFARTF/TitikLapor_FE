<script setup>
/** Akar aplikasi. Layout ditentukan tiap rute; di sini hanya toast global. */
import ToastHost from '@/components/ui/ToastHost.vue'
</script>

<template>
  <RouterView />
  <ToastHost />
</template>
