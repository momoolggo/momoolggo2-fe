<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import { showAlert } from '@/composables/useAlert'

const userStore = useUserStore()
const router = useRouter()
const visible = ref(false)

let warningTimer = null
let logoutTimer  = null

const clearTimers = () => {
  clearTimeout(warningTimer)
  clearTimeout(logoutTimer)
  warningTimer = null
  logoutTimer  = null
}

watch(
  () => userStore.state.atExpiresAt,
  (expiresAt) => {
    clearTimers()
    if (!expiresAt) return

    const now = Date.now()
    const msUntilWarning = expiresAt - now - 60 * 1000
    const msUntilExpiry  = expiresAt - now

    if (msUntilWarning > 0) {
      warningTimer = setTimeout(() => { visible.value = true }, msUntilWarning)
    } else if (msUntilExpiry > 0) {
      visible.value = true
    }

    if (msUntilExpiry > 0) {
      logoutTimer = setTimeout(() => { doLogout() }, msUntilExpiry)
    }
  },
  { immediate: true }
)

const onExtend = async () => {
  try {
    await userService.reissue()
    userStore.refreshExpiry()
    visible.value = false
  } catch (e) {
    await showAlert('세션 연장 실패. 다시 로그인해주세요.', { title: '세션 만료', type: 'error' })
    doLogout()
  }
}

const onLogout = async () => {
  try {
    await userService.signout()
  } finally {
    doLogout()
  }
}

const doLogout = () => {
  clearTimers()
  visible.value = false
  userStore.signOut()
  router.push('/customer/signin')
}

onUnmounted(() => clearTimers())
</script>

<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-box">
      <p class="modal-title">⏰ 로그인이 곧 만료됩니다</p>
      <p class="modal-desc">1분 후 자동으로 로그아웃됩니다.</p>
      <div class="modal-buttons">
        <button class="btn-extend" @click="onExtend">로그인 연장</button>
        <button class="btn-logout" @click="onLogout">로그아웃</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 32px 28px;
  width: 320px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}
.modal-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}
.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.btn-extend {
  flex: 1;
  padding: 10px 0;
  background: #ff6b35;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-logout {
  flex: 1;
  padding: 10px 0;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}
</style>