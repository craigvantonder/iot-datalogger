<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
// @ts-ignore
import logoUrl from '@/assets/logo.png'

const router = useRouter()
const route = useRoute()
function navigate(name: string): void {
  router.push({ name })
}
</script>

<template>
  <div class="container pb-2 mb-2">
    <span class="navbar-brand"><img :src="logoUrl" alt="IOT DATALOGGER" /></span>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <li class="nav-item me-1">
          <span :class="['nav-link', route.name === 'telemetry' ? ' active' : '']" role="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show" title="View hardware telemetry" @click="navigate('telemetry')">TELEMETRY</span>
        </li>
        <li class="nav-item me-1">
          <span :class="['nav-link', route.name === 'config' ? ' active' : '']" role="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show" title="View hardware config" @click="navigate('config')">CONFIG</span>
        </li>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  border-bottom: 2px solid black;
}
.nav-link {
  font-family: 'open_sanssemibold';
}
</style>