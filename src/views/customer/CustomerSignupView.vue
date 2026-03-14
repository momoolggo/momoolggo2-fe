<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import NaverMap from '@/components/common/NaverMap.vue'

const router = useRouter()

const state = reactive({
  form: {
    name: '',
    userId: '',
    userPw: '',
    userPwConfirm: '',
    address: '',
    addressDetail: '',
    lat: null,
    lng: null,
    gender: null,
    birth: '',
    tel: '',
    role: 'CUSTOMER',
  },
  showPw: false,
  showPwConfirm: false,
  idMsg: '',
  idAvailable: false,
  errorMsg: '',
})

const onAddressSelect = ({ address, lat, lng }) => {
  state.form.address = address
  state.form.lat = lat
  state.form.lng = lng
}

const checkId = async () => {
  if (!state.form.userId) {
    state.idMsg = '아이디를 입력해 주세요.'
    state.idAvailable = false
    return
  }
  try {
    await userService.checkId(state.form.userId)
    state.idAvailable = true
    state.idMsg = '사용 가능한 아이디입니다.'
  } catch {
    state.idAvailable = false
    state.idMsg = '이미 사용 중인 아이디입니다.'
  }
}

const signup = async () => {
  if (!state.form.name)        { state.errorMsg = '이름을 입력해 주세요.';         return }
  if (!state.form.userId)      { state.errorMsg = '아이디를 입력해 주세요.';       return }
  if (!state.idAvailable)      { state.errorMsg = '아이디 중복확인을 해 주세요.';  return }
  if (!state.form.userPw)      { state.errorMsg = '비밀번호를 입력해 주세요.';     return }
  if (state.form.userPw !== state.form.userPwConfirm) {
    state.errorMsg = '비밀번호가 일치하지 않습니다.'; return
  }
  if (!state.form.address)     { state.errorMsg = '주소를 입력해 주세요.';         return }
  if (!state.form.tel)         { state.errorMsg = '연락처를 입력해 주세요.';       return }

  try {
    state.errorMsg = ''
    await userService.signup({ ...state.form })
    alert('회원가입이 완료되었습니다!')
    router.push('/customer/signin')
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage ?? '회원가입에 실패했습니다.'
  }
}
</script>

<template>
  <div class="signup_page">
    <div class="signup_card">
      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="signup_logo" />
      </div>
      <h2 class="signup_title">회원가입</h2>

      <div class="field">
        <label class="label">이름 <span class="required">*</span></label>
        <input v-model="state.form.name" type="text" class="inp" placeholder="이름을 입력하세요" />
      </div>

      <div class="field">
        <label class="label">아이디 <span class="required">*</span></label>
        <div class="inp_row">
          <input v-model="state.form.userId" type="text" class="inp" placeholder="아이디를 입력하세요" />
          <button class="btn_dark" @click="checkId">중복확인</button>
        </div>
        <p v-if="state.idMsg" :class="['field_msg', state.idAvailable ? 'ok' : 'err']">{{ state.idMsg }}</p>
      </div>

      <div class="field">
        <label class="label">비밀번호 <span class="required">*</span></label>
        <div class="input_wrap">
          <input v-model="state.form.userPw" :type="state.showPw ? 'text' : 'password'" class="inp" placeholder="비밀번호를 입력하세요" />
          <button class="pw_toggle" @click="state.showPw = !state.showPw">
            <i :class="state.showPw ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">비밀번호 확인 <span class="required">*</span></label>
        <div class="input_wrap">
          <input v-model="state.form.userPwConfirm" :type="state.showPwConfirm ? 'text' : 'password'" class="inp" placeholder="비밀번호를 한번 더 입력하세요" />
          <button class="pw_toggle" @click="state.showPwConfirm = !state.showPwConfirm">
            <i :class="state.showPwConfirm ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">주소 <span class="required">*</span></label>
        <NaverMap @select="onAddressSelect" />
        <input v-if="state.form.address" v-model="state.form.addressDetail" type="text" class="inp" placeholder="상세주소 입력 (동/호수 등)" />
      </div>

      <div class="field">
        <label class="label">연락처 <span class="required">*</span></label>
        <input v-model="state.form.tel" type="tel" class="inp" placeholder="010-0000-0000" />
      </div>

      <div class="field">
        <label class="label">성별 <span class="optional">(선택)</span></label>
        <div class="radio_group">
          <label class="radio_label"><input v-model="state.form.gender" type="radio" :value="1" /> 남</label>
          <label class="radio_label"><input v-model="state.form.gender" type="radio" :value="2" /> 여</label>
        </div>
      </div>

      <div class="field">
        <label class="label">생년월일 <span class="optional">(선택)</span></label>
        <input v-model="state.form.birth" type="date" class="inp" />
      </div>

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

      <button class="btn_primary" @click="signup">가입하기</button>

      <div class="auth_link">
        이미 계정이 있으신가요?
        <router-link to="/customer/signin">로그인</router-link>
      </div>

      <div class="back_link">
        <router-link to="/">← 홈으로 돌아가기</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup_page { min-height: 100vh; background: var(--primary); display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
.signup_card { background: var(--white); border-radius: var(--radius-lg); padding: 36px 32px; width: 520px; box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 14px; }
.logo_wrap { text-align: center; }
.signup_logo { height: 56px; }
.signup_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }
.radio_group { display: flex; gap: 20px; }
.radio_label { font-size: 14px; color: var(--gray-dark); cursor: pointer; display: flex; align-items: center; gap: 4px; }
.back_link { text-align: center; font-size: 13px; }
.back_link a { color: var(--gray); text-decoration: none; }
.back_link a:hover { color: var(--primary); }
</style>