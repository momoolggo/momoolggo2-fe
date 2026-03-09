<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const state = reactive({
  form: {
    name: '',
    userId: '',
    userPw: '',
    userPwConfirm: '',
    storeName: '',
    storeTel: '',
    businessNum: '',
  },
  showPw: false,
  showPwConfirm: false,
  idMsg: '',
  idAvailable: false,
  errorMsg: '',
})

// 아이디 중복확인 — GET /api/user/check-id?userId=xxx
const checkId = async () => {
  if (!state.form.userId) {
    state.idMsg = '아이디를 입력해 주세요.'
    state.idAvailable = false
    return
  }
  try {
    await axios.get('/api/user/check-id', { params: { userId: state.form.userId } })
    state.idAvailable = true
    state.idMsg = '사용 가능한 아이디입니다.'
  } catch {
    state.idAvailable = false
    state.idMsg = '이미 사용 중인 아이디입니다.'
  }
}

const checkBusiness = () => {
  if (!state.form.businessNum) {
    alert('사업자 번호를 입력해 주세요.')
    return
  }
  alert('사업자 번호 조회 기능은 추후 연동 예정입니다.')
}

// 회원가입 — POST /api/user/join
const signup = async () => {
  if (!state.form.name || !state.form.userId || !state.form.userPw) {
    state.errorMsg = '이름, 아이디, 비밀번호는 필수 항목입니다.'
    return
  }
  if (!state.idAvailable) {
    state.errorMsg = '아이디 중복확인을 해 주세요.'
    return
  }
  if (state.form.userPw !== state.form.userPwConfirm) {
    state.errorMsg = '비밀번호가 일치하지 않습니다.'
    return
  }
  try {
    state.errorMsg = ''
    await axios.post('/api/user/join', {
      name:        state.form.name,
      userId:      state.form.userId,
      userPw:      state.form.userPw,
      storeName:   state.form.storeName   || null,
      storeTel:    state.form.storeTel    || null,
      businessNum: state.form.businessNum || null,
      role:        'OWNER',
    })
    alert('회원가입이 완료되었습니다!\n승인 후 서비스를 이용하실 수 있습니다.')
    router.push('/signin')
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage ?? '회원가입에 실패했습니다.'
  }
}
</script>

<template>
  <div class="signup_page">
    <div class="signup_card">

      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="logo_img signup_logo" />
      </div>
      <h2 class="signup_title">회원가입</h2>

      <!-- 역할 탭 -->
      <div class="role_tabs">
        <router-link to="/signup/customer" class="role_tab">고객</router-link>
        <router-link to="/signup/owner"    class="role_tab active">업주</router-link>
      </div>

      <!-- 이름 -->
      <div class="field">
        <label class="label">이름 <span class="required">*</span></label>
        <input v-model="state.form.name" type="text" class="inp" placeholder="이름을 입력하세요" />
      </div>

      <!-- 아이디 -->
      <div class="field">
        <label class="label">아이디 <span class="required">*</span></label>
        <div class="inp_row">
          <input v-model="state.form.userId" type="text" class="inp" placeholder="아이디를 입력하세요" />
          <button class="btn_dark" @click="checkId">중복확인</button>
        </div>
        <p v-if="state.idMsg" :class="['field_msg', state.idAvailable ? 'ok' : 'err']">{{ state.idMsg }}</p>
      </div>

      <!-- 비밀번호 -->
      <div class="field">
        <label class="label">비밀번호 <span class="required">*</span></label>
        <div class="input_wrap">
          <input v-model="state.form.userPw" :type="state.showPw ? 'text' : 'password'" class="inp" placeholder="비밀번호를 입력하세요" />
          <button class="pw_toggle" @click="state.showPw = !state.showPw">{{ state.showPw ? '🙈' : '👁️' }}</button>
        </div>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="field">
        <label class="label">비밀번호 확인 <span class="required">*</span></label>
        <div class="input_wrap">
          <input v-model="state.form.userPwConfirm" :type="state.showPwConfirm ? 'text' : 'password'" class="inp" placeholder="비밀번호를 한번 더 입력하세요" />
          <button class="pw_toggle" @click="state.showPwConfirm = !state.showPwConfirm">{{ state.showPwConfirm ? '🙈' : '👁️' }}</button>
        </div>
      </div>

      <!-- 가게 상호명 -->
      <div class="field">
        <label class="label">가게 상호명 <span class="optional">(선택)</span></label>
        <input v-model="state.form.storeName" type="text" class="inp" placeholder="가게 상호명을 입력하세요" />
      </div>

      <!-- 가게 번호 -->
      <div class="field">
        <label class="label">가게 번호 <span class="optional">(선택)</span></label>
        <input v-model="state.form.storeTel" type="tel" class="inp" placeholder="가게 전화번호를 입력하세요" />
      </div>

      <!-- 사업자 번호 -->
      <div class="field">
        <label class="label">사업자 번호 <span class="optional">(선택)</span></label>
        <div class="inp_row">
          <input v-model="state.form.businessNum" type="text" class="inp" placeholder="사업자 등록번호" />
          <button class="btn_dark" @click="checkBusiness">조회</button>
        </div>
      </div>

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

      <button class="btn_primary" @click="signup">가입하기</button>

      <div class="auth_link">
        이미 계정이 있으신가요?
        <router-link to="/signin">로그인</router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.signup_page {
  min-height: 100vh;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}
.signup_card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  width: 480px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.logo_wrap { text-align: center; }
.signup_logo { height: 56px; }
.signup_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }
</style>