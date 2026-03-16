<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '@/components/common/TheHeader.vue'
import { useUserStore } from '@/stores/userStore'
import TokenExpiryModal from '@/components/common/TokenExpiryModal.vue'

const route  = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 헤더를 숨길 페이지
const noHeaderPages = ['/', '/owner/signin', '/owner/signup']
const showHeader = computed(() => !noHeaderPages.includes(route.path));

onMounted(() => {
  userStore.checkAuth()
})

// 로그아웃
const signout = async () => {
  await userStore.signOut()
  router.push('/signin')
}
</script>

<template>
  <TheHeader
    v-if="showHeader"
    :is-signed-in="userStore.state.isSignedIn"
    :user-info="userStore.state"
    @signout="signout"
  />
  <router-view />
  <TokenExpiryModal />
</template>

<style scoped>
</style>