import './styles/main.scss'
import { createApp } from 'vue'
import vSelect from 'vue-select'
import Datepicker from '@vuepic/vue-datepicker'
import router from './routes'
import App from './App.vue'
import Navbar from './components/Navbar.vue'
import { connect, socket } from './lib/websocket'

// Establish a connection to the websocket server
connect()

// Initialise the header portion of the application
const navbar = createApp(Navbar)
navbar.use(router)
navbar.mount('#navbar')

// Initialise the body portion of the application
const app = createApp(App)
app.provide('socket', socket)
app.use(router)
app.component('vSelect', vSelect)
app.component('Datepicker', Datepicker)
app.mount('#app')