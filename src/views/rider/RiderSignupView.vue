<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import riderService from '@/services/riderService'
import { useUserStore } from '@/stores/userStore'
import { useMessageModalStore } from '@/stores/messageModalStore'
import TermsModal from '@/components/common/TermsModal.vue'
import { showAlert } from '@/composables/useAlert'
import RiderLayout from '@/views/rider/RiderLayout.vue'

const router = useRouter()
const userStore = useUserStore()
const messageModalStore = useMessageModalStore()

// BE GlobalExceptionHandler가 DataIntegrityViolationException raw 메시지를 그대로 전달하는 박제 결함(mmg-common 영역 외) 대응.
// SQL/Hibernate raw 메시지 패턴 감지해서 친화 메시지로 변환. team-handoff 등재 후 BE 정정 시 본 함수 단순화 가능.
const mapSignupError = (raw, status) => {
  const msg = typeof raw === 'string' ? raw : ''
  if (msg.includes('Duplicate entry') && msg.includes('uq_user_id')) {
    return '이미 사용 중인 아이디입니다. 다른 아이디로 가입해주세요.'
  }
  if (msg.includes('Duplicate entry') && msg.includes('uq_rider_user_no')) {
    return '이미 라이더로 등록된 계정입니다.'
  }
  if (msg.includes('Duplicate entry')) {
    return '이미 등록된 정보가 있습니다. 입력값을 확인해주세요.'
  }
  if (msg.includes('could not execute statement') || msg.includes('SQLException') || msg.includes('JDBC') || msg.includes('SQLIntegrityConstraint')) {
    return '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  if (status === 500 && (msg.includes('execute') || msg.includes('insert into') || msg.includes('update '))) {
    return '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  return msg || '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

const state = reactive({
  form: {
    name: '',
    userId: '',
    email: '',
    userPw: '',
    userPwConfirm: '',
    gender: null,
    birth: '',
    tel: '',
    licenseNo: '',
    licenseType: '',
    vehicleType: '',
    role: 'RIDER',
    address: '',
  },
  showPw: false,
  showPwConfirm: false,
  idMsg: '',
  idAvailable: false,
  emailMsg: '',
  emailAvailable: false,
  errorMsg: '',

  terms: {
    all: false,
    service: false,
    privacy: false,
    marketing: false,
  },
})

const toggleAll = () => {
  const val = !state.terms.all
  state.terms.all = val
  state.terms.service = val
  state.terms.privacy = val
  state.terms.marketing = val
}

const syncAll = () => {
  state.terms.all = state.terms.service && state.terms.privacy && state.terms.marketing
}

const requiredAgreed = computed(() => state.terms.service && state.terms.privacy)

// 작업 C (2026-05-18) — 약관 본문 모달
const termsModalType = ref(null)
const showTermsModal = ref(false)
const openTerms = (type) => {
  termsModalType.value = type
  showTermsModal.value = true
}
const closeTerms = () => {
  showTermsModal.value = false
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

const checkEmail = async () => {
  if (!state.form.email) {
    state.emailMsg = '이메일을 입력해 주세요.'
    state.emailAvailable = false
    return
  }
  try {
    await userService.checkEmail(state.form.email)
    state.emailAvailable = true
    state.emailMsg = '사용 가능한 이메일입니다.'
  } catch {
    state.emailAvailable = false
    state.emailMsg = '이미 사용 중인 이메일입니다.'
  }
}

const signup = async () => {
  if (!state.form.name)        { state.errorMsg = '이름을 입력해 주세요.';         return }
  if (!state.form.userId)      { state.errorMsg = '아이디를 입력해 주세요.';       return }
  if (!state.idAvailable)      { state.errorMsg = '아이디 중복확인을 해 주세요.';  return }
  if (!state.form.email)       { state.errorMsg = '이메일을 입력해 주세요.';       return }
  if (!state.emailAvailable)   { state.errorMsg = '이메일 중복확인을 해 주세요.';  return }
  if (!state.form.userPw)      { state.errorMsg = '비밀번호를 입력해 주세요.';     return }
  if (state.form.userPw !== state.form.userPwConfirm) {
    state.errorMsg = '비밀번호가 일치하지 않습니다.'; return
  }
  if (!state.form.tel)         { state.errorMsg = '연락처를 입력해 주세요.';       return }
  if (!state.form.licenseNo)   { state.errorMsg = '운전면허 번호를 입력해 주세요.'; return }
  if (!state.form.licenseType) { state.errorMsg = '운전면허증을 선택해 주세요.';   return }
  if (!state.form.vehicleType) { state.errorMsg = '배달 수단을 선택해 주세요.';    return }
  if (!requiredAgreed.value)   { state.errorMsg = '필수 약관에 동의해 주세요.';    return }

  try {
    state.errorMsg = ''
    // 1. auth 회원가입 (POST /api/user/join) — 응답 시점에 AT/RT 쿠키 자동 발급 (UserService.signup:73-77 박제)
    const userRes = await userService.signup({ ...state.form, agreedToTerms: requiredAgreed.value })
    const userData = userRes?.resultData
    if (userData?.userNo) {
      userStore.signIn(userData)
    }
    // 2. rider 프로필 등록 (PUT /api/rider/profile) — ADR-001 (C) 박제 2단계 흐름 일관. account_*는 마이페이지에서 (A1' 결정).
    // phone = 가입 시점 snapshot (정산 시연 UX 트랙 #9, 2026-05-21, 옵션 A) — admin 배달관리 연결 박제
    await riderService.putProfile({
      licenseNo: state.form.licenseNo,
      licenseType: state.form.licenseType,
      vehicleType: state.form.vehicleType,
      accountBank: null,
      accountNo: null,
      accountHolder: null,
      phone: state.form.tel,
    })
    await showAlert('회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다. 마이페이지에서 정산 계좌를 등록해주세요.', { title: '회원가입', type: 'success' })
    router.push('/riderservice')
  } catch (err) {
    const friendly = mapSignupError(err.response?.data?.resultMessage, err.response?.status)
    state.errorMsg = friendly
    // httpRequester 인터셉터가 이미 raw 메시지로 모달 띄웠을 수 있어 친화 메시지로 overwrite.
    messageModalStore.setMessage(friendly)
  }
}
</script>

<template>
  <RiderLayout>
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
        <label class="label">이메일 <span class="required">*</span></label>
        <div class="inp_row">
          <input v-model="state.form.email" type="email" class="inp" placeholder="test@example.com" @input="state.emailAvailable = false; state.emailMsg = ''" />
          <button class="btn_dark" @click="checkEmail">중복확인</button>
        </div>
        <p v-if="state.emailMsg" :class="['field_msg', state.emailAvailable ? 'ok' : 'err']">{{ state.emailMsg }}</p>
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

      <div class="field">
        <label class="label">휴대폰 번호 <span class="required">*</span></label>
        <input v-model="state.form.tel" type="tel" class="inp" placeholder="010-0000-0000" />
      </div>

      <div class="field">
        <label class="label">운전면허 번호 <span class="required">*</span></label>
        <input v-model="state.form.licenseNo" type="text" class="inp" placeholder="예: 11-22-333333-44" />
      </div>

      <div class="field">
        <label class="label">운전 면허증 <span class="required">*</span></label>
        <select v-model="state.form.licenseType" class="inp">
          <option value="" disabled>면허 종류를 선택하세요</option>
          <option value="1종 보통">1종 보통</option>
          <option value="1종 대형">1종 대형</option>
          <option value="2종 보통">2종 보통</option>
          <option value="2종 소형">2종 소형</option>
          <option value="원동기">원동기</option>
        </select>
      </div>

      <div class="field">
        <label class="label">배달 수단 <span class="required">*</span></label>
        <select v-model="state.form.vehicleType" class="inp">
          <option value="" disabled>배달 수단을 선택하세요</option>
          <option value="MOTORBIKE">오토바이</option>
          <option value="CAR">자동차</option>
          <option value="BICYCLE">자전거</option>
          <option value="WALK">도보</option>
        </select>
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
          <button type="button" class="view_btn" @click.prevent="openTerms('이용약관')">보기</button>
        </label>

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
          <button type="button" class="view_btn" @click.prevent="openTerms('개인정보')">보기</button>
        </label>

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
          <button type="button" class="view_btn" @click.prevent="openTerms('마케팅')">보기</button>
        </label>
      </div>

      <TermsModal :type="termsModalType" :show="showTermsModal" @close="closeTerms" />

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

      <button class="btn_primary" @click="signup">가입하기</button>

      <div class="auth_link">
        이미 계정이 있으신가요?
        <router-link to="/rider/signin">로그인</router-link>
      </div>

      <div class="back_link">
        <router-link to="/">← 홈으로 돌아가기</router-link>
      </div>
    </div>
  </div>
  </RiderLayout>
</template>

<style scoped>
.signup_page { min-height: 100dvh; background: var(--primary); display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
.signup_card { background: var(--white); border-radius: var(--radius-lg); padding: 36px 32px; width: 100%; max-width: 100%; box-shadow: var(--shadow-card); display: flex; flex-direction: column; gap: 14px; }
.logo_wrap { text-align: center; }
.signup_logo { height: 80px; width: 80px;}
.signup_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }
.radio_group { display: flex; gap: 20px; }
.radio_label { font-size: 14px; color: var(--gray-dark); cursor: pointer; display: flex; align-items: center; gap: 4px; }
.back_link { text-align: center; font-size: 13px; }
.back_link a { color: var(--gray); text-decoration: none; }
.back_link a:hover { color: var(--primary); }
.terms_box { border: 1.5px solid #e8e8e8; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #fafafa;}

.terms_all { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.terms_all_text { font-size: 15px; font-weight: 700; color: #566572; }
.terms_divider { height: 1px; background: #e8e8e8; margin: 0 -4px; }
.terms_item { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.terms_label { flex: 1; }
.view_btn {
  background: none; border: none; color: #888; font-size: 12px;
  text-decoration: underline; cursor: pointer; padding: 2px 6px;
}
.view_btn:hover { color: #9b1b1b; }
.hidden_check { display: none; }
.custom_check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s; color: transparent; font-size: 13px }
.custom_check.checked { background: var(--primary, #e84040); border-color: var(--primary, #e84040); color: #fff; }
.terms_label { font-size: 14px; color: #333; display: flex; align-items: center; gap: 6px; flex: 1}
.badge { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
.required_badge { background: #fff0f0; color: #e84040;}
.optional_badge { background: #f0f0f0; color: #888;}
</style>
