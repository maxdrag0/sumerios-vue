// import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/router.js'
import 'vue3-toastify/dist/index.css'

const pinia = createPinia()
createApp(App).use(pinia).use(router).mount('#app')
