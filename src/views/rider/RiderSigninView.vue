<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import userService from '@/services/userService'

const router = useRouter()
const userStore = useUserStore()

const state = reactive({
  form: {
    userId: '',
    userPw: '',
  },
  showPw: false,
  errorMsg: '',
})

const signin = async () => {
  if (!state.form.userId || !state.form.userPw) {
    state.errorMsg = '아이디와 비밀번호를 입력해 주세요.'
    return
  }
  try {
    state.errorMsg = ''
    const data = await userService.signin({
      userId: state.form.userId,
      userPw: state.form.userPw,
    })
    if (data.role !== 'RIDER') {
      state.errorMsg = '라이더 계정이 아닙니다.'
      return
    }
    userStore.signIn(data)
    router.push('/riderservice')
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage ?? '로그인에 실패했습니다.'
  }
}
</script>

<template>
  <div class="signin_page">
    <div class="signin_card">
      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="signin_logo" />
      </div>

      <h2 class="signin_title">라이더 로그인</h2>

      <input
        v-model="state.form.userId"
        type="text"
        placeholder="아이디"
        class="inp"
        @keyup.enter="signin"
      />

      <div class="input_wrap">
        <input
          v-model="state.form.userPw"
          :type="state.showPw ? 'text' : 'password'"
          placeholder="비밀번호"
          class="inp"
          @keyup.enter="signin"
        />
        <button class="pw_toggle" @click="state.showPw = !state.showPw">
          <i :class="state.showPw ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
        </button>
      </div>

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

      <button class="btn_primary" @click="signin">로그인</button>

      <div class="auth_link">
        <span>계정이 없으신가요?</span>
        <router-link to="/rider/signup">회원가입</router-link>
      </div>

      <div class="back_link">
        <router-link to="/">← 홈으로 돌아가기</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signin_page { position: relative; width: 100%; height: 100vh; background: #ffffff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.signin_card { width: 100%; max-width: 380px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 32px rgba(0,0,0,0.10); padding: 10px 45px 40px; display: flex; flex-direction: column; gap: 18px; z-index: 1; }
.logo_wrap { text-align: center; }
.signin_logo { height: 130px; width: 140px; }
.signin_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }
.back_link { text-align: center; font-size: 13px; }
.back_link a { color: var(--gray); text-decoration: none; }
.back_link a:hover { color: var(--primary); }
</style>
