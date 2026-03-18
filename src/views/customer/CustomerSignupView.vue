<script setup>
import { computed, reactive } from 'vue'
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


  terms: {
    all: false,
    service: false, //서비스 이용약관
    privacy: false, //개인정보 수집 이용
    marketing: false, // 마케팅정보수신
  },
  })

  //전체동의
const toggleAll = () => {
  const val = !state.terms.all
  state.terms.all = val,
  state.terms.service = val,
  state.terms.privacy = val,
  state.terms.marketing = val
}

// 개별체크 할때 전체 동의 상태 동기화
const syncAll = () => {
  state.terms.all = state.terms.service && state.terms.privacy && state.terms.marketing
}

// 필수약관동의했는지
const requiredAgreed = computed(() => state.terms.service && state.terms.privacy)




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

      <div class="terms_box">
        <label class="terms_all" @click.prevent="toggleAll">
          <span class="custom_check" :class="{checked: state.terms.all}">
            <i class="bi bi-check"></i>
          </span>
          <span class="terms_all_text">전체 동의</span>
        </label>

        <div class="terms_divider" />

        <label class="terms_item">
          <input
            v-model="state.terms.service"
            type="checkbox"
            class="hidden_check"
            @change="syncAll"/>
            <span class="custom_check" :class="{ checked: state.terms.service }">
            <i class="bi bi-check"></i>
          </span>
          <span class="terms_label">
            서비스 이용약관 동의
            <span class="badge required_badge">필수</span>
          </span>
        </label>
 
        <!-- 개인정보 수집·이용 (필수) -->
        <label class="terms_item">
          <input
            v-model="state.terms.privacy"
            type="checkbox"
            class="hidden_check"
            @change="syncAll"
          />
          <span class="custom_check" :class="{ checked: state.terms.privacy }">
            <i class="bi bi-check"></i>
          </span>
          <span class="terms_label">
            개인정보 수집·이용 동의
            <span class="badge required_badge">필수</span>
          </span>
        </label>
 
        <!-- 마케팅 수신 (선택) -->
        <label class="terms_item">
          <input
            v-model="state.terms.marketing"
            type="checkbox"
            class="hidden_check"
            @change="syncAll"
          />
          <span class="custom_check" :class="{ checked: state.terms.marketing }">
            <i class="bi bi-check"></i>
          </span>
          <span class="terms_label">
            마케팅 정보 수신 동의
            <span class="badge optional_badge">선택</span>
          </span>
        </label>
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
.signup_logo { height: 80px; width: 80px;}
.signup_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }
.radio_group { display: flex; gap: 20px; }
.radio_label { font-size: 14px; color: var(--gray-dark); cursor: pointer; display: flex; align-items: center; gap: 4px; }
.back_link { text-align: center; font-size: 13px; }
.back_link a { color: var(--gray); text-decoration: none; }
.back_link a:hover { color: var(--primary); }
.terms_box { border: 1.5px solid #e8e8e8; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #fafafa;}
 
/* 약관 동의 */
.terms_all { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.terms_all_text { font-size: 15px; font-weight: 700; color: #566572; }
.terms_divider { height: 1px; background: #e8e8e8; margin: 0 -4px; }
.terms_item { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.hidden_check { display: none; }
.custom_check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s; color: transparent; font-size: 13px }
.custom_check.checked { background: var(--primary, #e84040); border-color: var(--primary, #e84040); color: #fff; }
.terms_label { font-size: 14px; color: #333; display: flex; align-items: center; gap: 6px; flex: 1}
.badge { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
.required_badge { background: #fff0f0; color: #e84040;}
.optional_badge { background: #f0f0f0; color: #888;}
</style>