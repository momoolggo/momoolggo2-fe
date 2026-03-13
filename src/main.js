import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import '@/assets/main.css'  // 공통 CSS

// axios 기본 설정
// baseURL 을 설정하면 모든 요청이 이 주소로 날아감
// vite.config.js 에서 프록시 설정을 하면 /api → 백엔드 서버로 자동 연결됨
axios.defaults.withCredentials = true  // 쿠키(AT/RT) 자동 전송


// 이거쓰지말고 httpRequester.js에서 설정한 axios 사용하기 ㄱㄱ

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')