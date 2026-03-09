<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import axios from 'axios'

const route  = useRoute()
const router = useRouter()

// 헤더를 숨길 페이지
const noHeaderPages = ['/signin', '/signup/customer', '/signup/owner']
const showHeader = computed(() => !noHeaderPages.includes(route.path))

// 로그인 상태
const isSignedIn = ref(false)
const userInfo = ref(null)  // { userNo, name, role }

// 앱 시작 시 로그인 상태 확인 — GET /api/user/me
const checkAuth = async () => {
  try {
    const res = await axios.get('/api/user/me')
    if (res.data.resultData) {
      isSignedIn.value = true
      userInfo.value = res.data.resultData
    } else {
      isSignedIn.value = false
      userInfo.value = null
    }
  } catch {
    isSignedIn.value = false
    userInfo.value = null
  }
}

onMounted(() => {
  checkAuth()
})

// 로그아웃
const signout = async () => {
  try {
    await axios.post('/api/user/logout')
  } finally {
    isSignedIn.value = false
    userInfo.value = null
    router.push('/signin')
  }
}
</script>

<template>
  <TheHeader
    v-if="showHeader"
    :is-signed-in="isSignedIn"
    :user-info="userInfo"
    @signout="signout"
  />
  <router-view @login-success="checkAuth" />
</template>

<style scoped>
</style>