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
  canRecover: false,
  recoverLoading: false,
})

const signin = async () => {
  if (!state.form.userId || !state.form.userPw) {
    state.errorMsg = '아이디와 비밀번호를 입력해 주세요.'
    return
  }
  try {
    state.errorMsg = ''
    state.canRecover = false
    const data = await userService.signin({
      userId: state.form.userId,
      userPw: state.form.userPw,
    })
    if (data.role !== 'CUSTOMER') {
      state.errorMsg = '고객 계정이 아닙니다.'
      return
    }
    userStore.signIn(data)
    router.push('/home')
  } catch (err) {
    const msg = err.response?.data?.resultMessage ?? '로그인에 실패했습니다.'
    state.errorMsg = msg
    state.canRecover = err.response?.status === 403 && msg.includes('14일 이내 복구 가능')
  }
}

const recoverAccount = async () => {
  if (state.recoverLoading) return
  state.recoverLoading = true
  try {
    const data = await userService.recover({
      userId: state.form.userId,
      userPw: state.form.userPw,
    })
    userStore.signIn(data)
    router.push('/home')
  } catch {
    state.canRecover = false
  } finally {
    state.recoverLoading = false
  }
}
</script>

<template>
  <div class="signin_page">
    <div class="signin_card">
      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="signin_logo" />
      </div>

      <h2 class="signin_title">로그인</h2>

      <input
        v-model="state.form.userId"
        type="text"
        placeholder="아이디 (예: aaaaa)"
        class="inp"
        autocomplete="username"
        @keyup.enter="signin"
      />

      <div class="input_wrap">
        <input
          v-model="state.form.userPw"
          :type="state.showPw ? 'text' : 'password'"
          placeholder="비밀번호 (예: 1111)"
          class="inp"
          autocomplete="current-password"
          @keyup.enter="signin"
        />
        <button type="button" class="pw_toggle" @click="state.showPw = !state.showPw">
          <i :class="state.showPw ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
        </button>
      </div>

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>
      <button
        v-if="state.canRecover"
        class="btn_recover"
        type="button"
        :disabled="state.recoverLoading"
        @click="recoverAccount"
      >{{ state.recoverLoading ? '복구 중...' : '계정 복구하기' }}</button>

      <button class="btn_primary" @click="signin">로그인</button>

      <div class="find_link">
        <router-link to="/find-account">아이디 찾기 / 비밀번호 재설정</router-link>
      </div>

      <div class="auth_link">
        <span>계정이 없으신가요?</span>
        <router-link to="/customer/signup">회원가입</router-link>
      </div>

      <div class="back_link">
        <router-link to="/">← 홈으로 돌아가기</router-link>
      </div>
    </div>

    <img src="@/assets/뭐물꼬_마스코트.png" alt="뭐물꼬 마스코트" class="mascot_img" />
  </div>
</template>

<style scoped>
.signin_page { position: relative; width: 100%; min-height: 100vh; background: #ffffff; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 40px 16px; }
.signin_card { width: 100%; max-width: 380px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 32px rgba(0,0,0,0.10); padding: 32px 45px 40px; display: flex; flex-direction: column; gap: 18px; z-index: 1; }
.logo_wrap { text-align: center; }
.signin_logo { height: 130px; width: 140px; object-fit: contain; }
.signin_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }
.mascot_img { position: absolute; right: -250px; bottom: 380px; width: 1000px; object-fit: contain; pointer-events: none; }
.back_link { text-align: center; font-size: 13px; }
.back_link a { color: var(--gray); text-decoration: none; }
.back_link a:hover { color: var(--primary); }
.find_link { text-align: center; font-size: 13px; }
.find_link a { color: var(--gray); text-decoration: none; }
.find_link a:hover { color: var(--primary); }
.btn_recover {
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #9b1b1b;
  border: 1.5px solid #9b1b1b;
  border-radius: var(--radius-md, 10px);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn_recover:hover { background: #fff4f4; }

@media (max-width: 768px) {
  .signin_page { padding: 24px 16px; align-items: center; }
  .signin_card { padding: 24px 20px 32px; gap: 14px; box-shadow: none; max-width: 100%; }
  .mascot_img { display: none; }
  .inp { font-size: 16px; touch-action: manipulation; }
  .pw_toggle { padding: 12px; min-width: 44px; min-height: 44px; }
}
</style>
