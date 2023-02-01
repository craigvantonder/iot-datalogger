/// <reference types="vite/client" />

// https://vuejs.github.io/vetur/guide/setup.html#vue3
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}