<script setup>
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useStore } from '@/stores/useStore'
import userService from '@/services/userService'
import ownerService from '@/services/ownerService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const ownerStore = useStore()

const state = reactive({
  form: {
    userId: route.query.userId || '',
    userPw: '',
  },
  showPw: false,
  loading: false,
  errorMsg: '',
})

const redirectByRole = async (role) => {
  if (role === 'OWNER') {
    try {
      const storeData = await ownerService.getMyStores()
      const stores = storeData?.resultData || []
      if (stores.length > 0) {
        ownerStore.setStores(stores)
        ownerStore.setStore(stores[0].storeName, stores[0].storeId)
        router.push('/ownerservice')
      } else {
        ownerStore.clearStore()
        router.push('/ownerservice/addstore')
      }
    } catch {
      router.push('/ownerservice')
    }
  } else if (role === 'RIDER') {
    router.push('/riderservice')
  } else if (role === 'CUSTOMER') {
    router.push('/home')
  } else {
    router.push('/')
  }
}

const recover = async () => {
  if (!state.form.userId || !state.form.userPw) {
    state.errorMsg = '아이디와 비밀번호를 입력해 주세요.'
    return
  }
  if (state.loading) return
  state.loading = true
  state.errorMsg = ''
  try {
    const data = await userService.recover({
      userId: state.form.userId,
      userPw: state.form.userPw,
    })
    userStore.signIn(data)
    await redirectByRole(data.role)
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage ?? '계정 복구에 실패했습니다.'
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <div class="recover_page">
    <div class="recover_card">
      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="recover_logo" />
      </div>

      <h2 class="recover_title">계정 복구</h2>
      <p class="recover_desc">탈퇴 후 14일 이내에 복구할 수 있습니다.<br />아이디와 비밀번호를 입력해 주세요.</p>

      <input
        v-model="state.form.userId"
        type="text"
        placeholder="아이디"
        class="inp"
        @keyup.enter="recover"
      />

      <div class="input_wrap">
        <input
          v-model="state.form.userPw"
          :type="state.showPw ? 'text' : 'password'"
          placeholder="비밀번호"
          class="inp"
          @keyup.enter="recover"
        />
        <button class="pw_toggle" type="button" @click="state.showPw = !state.showPw">
          <i :class="state.showPw ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
        </button>
      </div>

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

      <button class="btn_primary" :disabled="state.loading" @click="recover">
        {{ state.loading ? '복구 중...' : '계정 복구하기' }}
      </button>

      <div class="back_link">
        <button type="button" class="back_btn" @click="router.back()">← 로그인으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recover_page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.recover_card {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.10);
  padding: 10px 45px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 1;
}
.logo_wrap { text-align: center; }
.recover_logo { width: 140px; }
.recover_title {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--black);
}
.recover_desc {
  text-align: center;
  font-size: 13px;
  color: var(--gray-dark);
  line-height: 1.6;
  margin: 0;
}
.back_link { text-align: center; }
.back_btn {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--gray);
  cursor: pointer;
  padding: 0;
}
.back_btn:hover { color: var(--primary); }
</style>
