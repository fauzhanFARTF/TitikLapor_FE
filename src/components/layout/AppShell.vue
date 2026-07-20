<script setup>
/** Kerangka halaman terautentikasi: sidebar + topbar + area konten. */
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
</script>

<template>
  <div class="shell">
    <a class="skip-link" href="#konten">Lompat ke konten utama</a>
    <AppSidebar />
    <div class="shell-main">
      <AppTopbar />
      <main id="konten" class="shell-konten">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}
.shell-main {
  margin-left: var(--sidebar-w);
  min-height: 100vh;
  transition: margin-left 220ms var(--ease);
}
.shell-konten {
  padding: 26px 26px 48px;
  max-width: 1440px;
}

@media (max-width: 980px) {
  .shell-main {
    margin-left: 0;
  }
  .shell-konten {
    padding: 18px 16px 40px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 180ms var(--ease),
    transform 180ms var(--ease);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
}
</style>
