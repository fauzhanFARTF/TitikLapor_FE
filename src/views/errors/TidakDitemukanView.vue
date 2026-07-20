<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
</script>

<template>
  <div class="pusat">
    <AppIcon name="mapPin" :size="56" :stroke="1.3" style="color: var(--brand-2)" />
    <h1 class="page-title" style="margin-top: 14px">404 — Halaman Tidak Ditemukan</h1>
    <p class="page-subtitle">Tautan yang Anda buka sudah tidak tersedia atau salah ketik.</p>
    <div class="row">
      <RouterLink to="/" class="btn btn-secondary">Beranda</RouterLink>
      <RouterLink to="/app" class="btn btn-primary">Buka Aplikasi</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.pusat {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
</style>
