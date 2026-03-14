import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import '@/assets/main.css'

// ── Axios 전역 설정
axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true  // HttpOnly 쿠키 자동 전송

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')