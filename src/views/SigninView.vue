<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const emit = defineEmits(['login-success'])

const state = reactive({
  form: {
    userId: '',
    userPw: '',
    role: 'CUSTOMER',
  },
  showPw: false,
  errorMsg: '',
})

const tabs = [
  { label: '고객', value: 'CUSTOMER' },
  { label: '업주', value: 'OWNER' },
]

// 로그인 — POST /api/user/login
const signin = async () => {
  if (!state.form.userId || !state.form.userPw) {
    state.errorMsg = '아이디와 비밀번호를 입력해 주세요.'
    return
  }
  try {
    state.errorMsg = ''
    const res = await axios.post('/api/user/login', {
      userId: state.form.userId,
      userPw: state.form.userPw,
    })
    const data = res.data.resultData

    // App.vue 에 로그인 성공 알림 → 헤더 상태 갱신
    emit('login-success')

    if (data.role === 'OWNER')      router.push('/owner')
    else if (data.role === 'ADMIN') router.push('/admin')
    else                            router.push('/')
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage ?? '로그인에 실패했습니다.'
  }
}
</script>

<template>
  <div class="signin_page">

    <!-- 왼쪽 — 마스코트 -->
    <div class="signin_left">
      <img src="@/assets/뭐물꼬_마스코트.png" alt="뭐물꼬 마스코트" class="mascot_img" />
    </div>

    <!-- 오른쪽 — 카드 -->
    <div class="signin_right">
      <div class="signin_card">

        <div class="logo_wrap">
          <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="logo_img signin_logo" />
        </div>

        <!-- 역할 탭 -->
        <div class="role_tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="['role_tab', { active: state.form.role === tab.value }]"
            @click="state.form.role = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 아이디 -->
        <input
          v-model="state.form.userId"
          type="text"
          placeholder="아이디"
          class="inp"
          @keyup.enter="signin"
        />

        <!-- 비밀번호 -->
        <div class="input_wrap">
          <input
            v-model="state.form.userPw"
            :type="state.showPw ? 'text' : 'password'"
            placeholder="비밀번호"
            class="inp"
            @keyup.enter="signin"
          />
          <button class="pw_toggle" @click="state.showPw = !state.showPw">
            <i :class="state.showPw ? 'bi bi-eye' : 'bi bi-eye-slash'"></i> <!--비밀번호 숨김/표시 아이콘-->
          <!--{{ state.showPw ? '🙈' : '👁️' }}-->
          </button>
        </div>

        <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

        <button class="btn_primary" @click="signin">로그인</button>

        <div class="auth_link">
          <span>계정이 없으신가요?</span>
          <router-link :to="'/signup'">
            회원가입
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.signin_page {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: var(--primary);
  overflow: hidden;
}
.signin_left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mascot_img {
  width: 460px;
  max-width: 90%;
  object-fit: contain;
  mix-blend-mode: screen;
}
.signin_right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.signin_card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 36px 32px 28px;
  width: 360px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.logo_wrap { text-align: center; }
.signin_logo { height: 64px; }
</style>