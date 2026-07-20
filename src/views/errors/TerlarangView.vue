<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
</script>

<template>
  <div class="pusat">
    <AppIcon name="shield" :size="56" :stroke="1.3" style="color: var(--danger)" />
    <h1 class="page-title" style="margin-top: 14px">403 — Akses Ditolak</h1>
    <p class="page-subtitle">
      Peran akun Anda tidak memiliki izin untuk membuka halaman ini.
    </p>
    <RouterLink to="/app" class="btn btn-primary">Kembali ke Dasbor</RouterLink>
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
