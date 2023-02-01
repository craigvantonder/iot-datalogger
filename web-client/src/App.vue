<script setup lang="ts">
import { ref, provide } from 'vue'
//@ts-ignore
import Toast from './components/Toast.vue'

// This is essentially a global notification handler, it can be called as follows:
// const toast = inject('toast')
// toast.value.show('message', 'style')
// style can be one of success, danger, info, warning
let toast = ref(null)
provide('toast', toast)
</script>

<template>
  <Toast ref="toast" />
  <router-view></router-view>
</template>