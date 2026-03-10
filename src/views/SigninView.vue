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
  { label: '고객',   value: 'CUSTOMER' },
  { label: '업주',   value: 'OWNER'    },
  { label: '라이더', value: 'RIDER'    },
]

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

    <!-- 중앙 — 로그인 카드 -->
    <div class="signin_card">
      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="signin_logo" />
      </div>

      <div class="role_tabs">
        <label
          v-for="tab in tabs"
          :key="tab.value"
          :class="['role_tab', { active: state.form.role === tab.value }]"
        >
          <input v-model="state.form.role" type="radio" :value="tab.value" hidden />
          {{ tab.label }}
        </label>
      </div>

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
        <router-link to="/signup">회원가입</router-link>
      </div>
    </div>

    <!-- 오른쪽 끝 — 마스코트 -->
    <img src="@/assets/뭐물꼬_마스코트.png" alt="뭐물꼬 마스코트" class="mascot_img" />

  </div>
</template>

<style scoped>
.signin_page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 로그인 카드 — 정중앙 */
.signin_card {
  width: 460px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.10);
  padding: 48px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
}
.logo_wrap { text-align: center; }
.signin_logo { height: 64px; }

/* 역할 탭 */
.role_tabs {
  display: flex;
  gap: 10px;
}
.role_tab {
  flex: 1;
  padding: 11px 0;
  border: 1.5px solid #E0E0E0;
  border-radius: 10px;
  background: #F5F5F5;
  color: #999;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.role_tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}

/* 마스코트 — 오른쪽 끝에 고정 */
.mascot_img {
  position: absolute;
  right: -250px;
  bottom: 380px;
  width: 1000px;
  object-fit: contain;
  pointer-events: none;
}
</style>