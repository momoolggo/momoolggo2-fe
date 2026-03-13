<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import TokenExpiryModal from '@/components/TokenExpiryModal.vue'

const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 헤더를 숨길 페이지
const noHeaderPages = []
const showHeader = computed(() => !noHeaderPages.includes(route.path))

onMounted(() => {
  authStore.checkAuth()
})

// 로그아웃
const signout = async () => {
  try {
    await axios.post('/api/user/logout')
  } finally {
    authStore.signOut()
    router.push('/signin')
  }
}
</script>

<template>
  <TheHeader
    v-if="showHeader"
    :is-signed-in="authStore.state.isSignedIn"
    :user-info="authStore.state"
    @signout="signout"
  />
  <router-view />
  <TokenExpiryModal />
</template>

<style scoped>
</style>