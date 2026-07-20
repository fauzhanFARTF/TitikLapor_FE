<script setup>
/** Kartu ringkas satu laporan untuk tampilan daftar. */
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { waktuRelatif } from '@/utils/format'

defineProps({
  laporan: { type: Object, required: true },
})
</script>

<template>
  <RouterLink :to="`/app/laporan/${laporan.id}`" class="kartu card hover-lift">
    <div class="kartu-media">
      <img
        v-if="laporan.foto"
        :src="laporan.foto"
        :alt="`Foto laporan ${laporan.judul}`"
        loading="lazy"
      />
      <div v-else class="kartu-media-kosong" :style="{ color: laporan.kategori_warna }">
        <AppIcon name="camera" :size="26" />
      </div>
      <StatusBadge :status="laporan.status" class="kartu-status" />
    </div>

    <div class="kartu-isi">
      <span class="kartu-kategori" :style="{ color: laporan.kategori_warna }">
        {{ laporan.kategori_nama }}
      </span>
      <h3 class="kartu-judul clamp-2">{{ laporan.judul }}</h3>

      <p class="kartu-alamat truncate">
        <AppIcon name="mapPin" :size="14" />
        {{ laporan.alamat || laporan.kelurahan || 'Lokasi ditandai di peta' }}
      </p>

      <div class="kartu-kaki">
        <span class="mono">{{ laporan.nomor_tiket }}</span>
        <span class="row" style="gap: 5px">
          <AppIcon name="thumbsUp" :size="14" />
          {{ laporan.jumlah_dukungan }}
        </span>
        <span>{{ waktuRelatif(laporan.created_at) }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.kartu {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
.kartu-media {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--surface-sunken);
}
.kartu-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.kartu-media-kosong {
  display: grid;
  place-items: center;
  height: 100%;
  opacity: 0.45;
}
.kartu-status {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--glass-bg) !important;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.kartu-isi {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.kartu-kategori {
  font-size: 0.72rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.kartu-judul {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
}
.kartu-alamat {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
}
.kartu-kaki {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--line-soft);
  font-size: 0.75rem;
  color: var(--muted);
}
</style>
