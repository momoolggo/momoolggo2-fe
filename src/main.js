import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import '@/assets/main.css'

// ── Axios 전역 설정
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
axios.defaults.withCredentials = true  // HttpOnly 쿠키 자동 전송

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.mount('#app')
