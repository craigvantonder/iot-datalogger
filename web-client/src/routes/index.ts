import { createRouter, createWebHistory } from 'vue-router'
import Telemetry from '../views/Telemetry.vue'
import Config from '../views/Config.vue'

const routes = [
  { path: '/', name: 'telemetry', component: Telemetry },
  { path: '/config', name: 'config', component: Config }
]

export default createRouter({
  history: createWebHistory(),
  routes,
})