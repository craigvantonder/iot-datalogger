<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Toast } from 'bootstrap'
import type { Ref } from 'vue'
import type { Toast as IToast } from 'bootstrap'

const delay = 5000
let toast: Ref<IToast | null> = ref(null)
let message = ref('')
let toastClass = ref('text-bg-success')

function show (msg: string, style: string = 'success') {
  message.value = msg
  if (toastClass.value !== style && ['success','danger','warning','info'].includes(style)) {
    toastClass.value = `text-bg-${style}`
  }
  toast.value?.show()
}

onMounted(() => {
  const toastElement = <Element>document.getElementById('liveToast')
  toast.value = new Toast(toastElement, { delay })
})

defineExpose({
  show
})
</script>

<template>
  <div aria-live="polite" aria-atomic="true" class="toast-container position-absolute start-50 translate-middle">
    <div id="liveToast" :class="['toast align-items-center ', toastClass]" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">{{ message }}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
 .position-absolute {
   top: 60px;
 }
</style>
