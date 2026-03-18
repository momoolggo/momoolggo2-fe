<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '@/components/common/TheHeader.vue'
import { useUserStore } from '@/stores/userStore'
import TokenExpiryModal from '@/components/common/TokenExpiryModal.vue'
import MobileNavi from './components/common/MobileNavi.vue'

const route  = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 헤더를 숨길 페이지
const noHeaderPages = ['/', '/owner/signin', '/owner/signup', '/customer/signin', '/customer/signup']
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
   <div class="app-outer">
    <div class="app-wrapper">
      <TheHeader
        v-if="showHeader"
        :is-signed-in="userStore.state.isSignedIn"
        :user-info="userStore.state"
        @signout="signout"
      />
      <router-view />
      <TokenExpiryModal />
      <MobileNavi 
      v-if="userStore.state.isSignedIn"/>
    </div>
  </div>
</template>

<style scoped>

.app-outer {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  justify-content: center;
}

.app-wrapper{
  width: 100%;
  
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background: #fff;

}
</style>
