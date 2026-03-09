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
    address: '',
    addressDetail: '',
    lat: null,
    lng: null,
    gender: null,
    birth: '',
    tel: '',
  },
  showPw: false,
  showPwConfirm: false,
  idMsg: '',
  idAvailable: false,
  addressQuery: '',
  addressResults: [],
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

// 주소 검색 — GET /api/address/search?query=xxx
const searchAddress = async () => {
  if (!state.addressQuery) return
  try {
    const res = await axios.get('/api/address/search', { params: { query: state.addressQuery } })
    state.addressResults = res.data.resultData
    if (!state.addressResults.length) alert('검색 결과가 없습니다.')
  } catch {
    alert('주소 검색에 실패했습니다.')
  }
}

const selectAddress = (item) => {
  state.form.address = item.roadAddress || item.jibunAddress
  state.form.lat = item.lat
  state.form.lng = item.lng
  state.addressResults = []
  state.addressQuery = ''
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
      name:          state.form.name,
      userId:        state.form.userId,
      userPw:        state.form.userPw,
      gender:        state.form.gender,
      birth:         state.form.birth         || null,
      tel:           state.form.tel           || null,
      address:       state.form.address       || null,
      addressDetail: state.form.addressDetail || null,
      lat:           state.form.lat,
      lng:           state.form.lng,
      role:          'CUSTOMER',
    })
    alert('회원가입이 완료되었습니다!')
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
        <router-link to="/signup/customer" class="role_tab active">고객</router-link>
        <router-link to="/signup/owner"    class="role_tab">업주</router-link>
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

      <!-- 주소 (선택) -->
      <div class="field">
        <label class="label">주소 <span class="optional">(선택)</span></label>
        <div class="inp_row">
          <input v-model="state.addressQuery" type="text" class="inp" placeholder="도로명 또는 지번 주소 입력" @keyup.enter="searchAddress" />
          <button class="btn_dark" @click="searchAddress">검색</button>
        </div>
        <ul v-if="state.addressResults.length" class="address_list">
          <li v-for="(item, idx) in state.addressResults" :key="idx" class="address_item" @click="selectAddress(item)">
            <span class="addr_road">{{ item.roadAddress }}</span>
            <span class="addr_jibun">{{ item.jibunAddress }}</span>
          </li>
        </ul>
        <div v-if="state.form.address" class="selected_addr">📍 {{ state.form.address }}</div>
        <input v-if="state.form.address" v-model="state.form.addressDetail" type="text" class="inp" placeholder="상세주소 입력" />
      </div>

      <!-- 성별 -->
      <div class="field">
        <label class="label">성별 <span class="optional">(선택)</span></label>
        <div class="radio_group">
          <label class="radio_label"><input v-model="state.form.gender" type="radio" :value="1" /> 남</label>
          <label class="radio_label"><input v-model="state.form.gender" type="radio" :value="2" /> 여</label>
        </div>
      </div>

      <!-- 생년월일 -->
      <div class="field">
        <label class="label">생년월일 <span class="optional">(선택)</span></label>
        <input v-model="state.form.birth" type="date" class="inp" />
      </div>

      <!-- 휴대폰번호 -->
      <div class="field">
        <label class="label">연락처 번호 <span class="optional">(선택)</span></label>
        <input v-model="state.form.tel" type="tel" class="inp" placeholder="010-0000-0000" />
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
.radio_group { display: flex; gap: 20px; }
.radio_label { font-size: 14px; color: var(--gray-dark); cursor: pointer; display: flex; align-items: center; gap: 4px; }
</style>