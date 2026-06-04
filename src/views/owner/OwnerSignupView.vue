<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import ownerService from '@/services/ownerService'
import NaverMap from '@/components/common/NaverMap.vue'
import TermsModal from '@/components/common/TermsModal.vue'
import { showAlert } from '@/composables/useAlert'

const router = useRouter()

const state = reactive({
  form: {
    name: '',
    userId: '',
    email: '',
    userPw: '',
    userPwConfirm: '',
    address: '',
    addressDetail: '',
    lat: null,
    lng: null,
    gender: null,
    birth: '',
    tel: '',
    role: 'OWNER',
    businessNumber: '',
    businessLicenseUrl: '',
    mailOrderLicenseUrl: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
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

// 은행명
const bankOptions = [
  '국민은행',
  '신한은행',
  '하나은행',
  '우리은행',
  '농협은행',
]

// 필수약관동의했는지
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
  } catch (err) {
    state.emailAvailable = false
    state.emailMsg = err.response?.status === 409
    ? '이미 사용 중인 이메일입니다.' : err.response?.data?.resultMessage ?? '이메일 중복확인에 실패했습니다.'
    }
}

const uploadOwnerDocument = async (e, targetKey, docType) => {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await ownerService.uploadSignupDoc(formData, docType)
    state.form[targetKey] = res.resultData
  } catch {
    state.form[targetKey] = ''
    state.errorMsg = '서류 업로드에 실패했습니다.'
  }
}

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '')

const formatTel = (value) => {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

const formatBusinessNumber = (value) => {
  const digits = onlyDigits(value).slice(0, 10)

  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

const formatAccountNumber = (value) => {
  const digits = onlyDigits(value).slice(0, 14)

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11)}`
}

const onTelInput = () => {
  state.form.tel = formatTel(state.form.tel)
}

const onBusinessNumberInput = () => {
  state.form.businessNumber = formatBusinessNumber(state.form.businessNumber)
}

const onAccountNumberInput = () => {
  state.form.accountNumber = formatAccountNumber(state.form.accountNumber)
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
  if (!state.form.address)     { state.errorMsg = '주소를 입력해 주세요.';         return }
  if (!state.form.tel)         { state.errorMsg = '연락처를 입력해 주세요.';       return }
  if (!state.form.businessNumber)      { state.errorMsg = '사업자 등록 번호를 입력해 주세요.'; return }
  if (!state.form.businessLicenseUrl)  { state.errorMsg = '영업 신고증을 업로드해 주세요.'; return }
  if (!state.form.mailOrderLicenseUrl) { state.errorMsg = '통신판매업 신고증을 업로드해 주세요.'; return }
  if (!state.form.bankName)            { state.errorMsg = '정산 은행을 선택해 주세요.'; return }
  if (!state.form.accountNumber)       { state.errorMsg = '정산 계좌번호를 입력해 주세요.'; return }
  if (!state.form.accountHolder)       { state.errorMsg = '예금주를 입력해 주세요.'; return }
  if (!requiredAgreed.value)   { state.errorMsg = '필수 약관에 동의해 주세요.';    return }

  try {
    state.errorMsg = ''
    await userService.signup({
    name: state.form.name,
    userId: state.form.userId,
    userPw: state.form.userPw,
    gender: state.form.gender,
    birth: state.form.birth,
    tel: state.form.tel,
    email: state.form.email,
    role: 'OWNER',
    address: state.form.address,
    addressDetail: state.form.addressDetail,
    lat: state.form.lat,
    lng: state.form.lng,
    agreedToTerms: requiredAgreed.value,
    businessNumber: state.form.businessNumber,
    businessLicenseUrl: state.form.businessLicenseUrl,
    mailOrderLicenseUrl: state.form.mailOrderLicenseUrl,
    bankName: state.form.bankName,
    accountNumber: state.form.accountNumber,
    accountHolder: state.form.accountHolder,
  })
    await showAlert('회원가입이 완료되었습니다!\n관리자 승인 후 로그인이 가능합니다.', { title: '가입 완료', type: 'success' })
    router.push('/owner/signin')
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
      <h2 class="signup_title">사장님 회원가입</h2>
      <p class="signup_notice">ℹ️ 업주 가입 신청 후 관리자 승인이 필요합니다.</p>

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
          <button type="button" class="pw_toggle" @click="state.showPw = !state.showPw">
            <i :class="state.showPw ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">비밀번호 확인 <span class="required">*</span></label>
        <div class="input_wrap">
          <input v-model="state.form.userPwConfirm" :type="state.showPwConfirm ? 'text' : 'password'" class="inp" placeholder="비밀번호를 한번 더 입력하세요" />
          <button type="button" class="pw_toggle" @click="state.showPwConfirm = !state.showPwConfirm">
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
        <input v-model="state.form.tel" type="tel" inputmode="numeric" maxlength="13"
        class="inp" placeholder="010-0000-0000" @input="onTelInput"/>
      </div>

      <div class="field">
        <label class="label">사업자 등록 번호 <span class="required">*</span></label>
        <input v-model="state.form.businessNumber" type="text" inputmode="numeric" maxlength="12"
        class="inp" placeholder="사업자 등록 번호를 입력하세요" @input="onBusinessNumberInput"/>
      </div>

      <div class="field">
        <label class="label">영업 신고증 <span class="required">*</span></label>
        <input type="file" class="inp" accept="image/*,.pdf"@change="(e) => uploadOwnerDocument(e, 'businessLicenseUrl', 'BUSINESS_LICENSE')" />
        <p v-if="state.form.businessLicenseUrl" class="field_msg ok">{{ state.form.businessLicenseUrl }}</p>
      </div>

      <div class="field">
        <label class="label">통신판매업 신고증 <span class="required">*</span></label>
        <input type="file" class="inp" accept="image/*,.pdf"  @change="(e) => uploadOwnerDocument(e, 'mailOrderLicenseUrl', 'MAIL_ORDER_LICENSE')" />
        <p v-if="state.form.mailOrderLicenseUrl" class="field_msg ok">{{ state.form.mailOrderLicenseUrl }}</p>
      </div>

      <div class="field">
        <label class="label">정산 은행 <span class="required">*</span></label>
        <select v-model="state.form.bankName" class="inp">
          <option value="" disabled>정산 은행을 선택하세요</option>
          <option v-for="bank in bankOptions" :key="bank" :value="bank">
            {{ bank }}
          </option>
        </select> 
      </div>

      <div class="field">
        <label class="label">정산 계좌번호 <span class="required">*</span></label>
        <input v-model="state.form.accountNumber" type="text" inputmode="numeric" maxlength="17"
        class="inp" placeholder="계좌번호를 입력하세요" @input="onAccountNumberInput" />
      </div>

      <div class="field">
        <label class="label">예금주 <span class="required">*</span></label>
        <input v-model="state.form.accountHolder" type="text" class="inp" placeholder="예: 홍길동" />
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
          <button type="button" class="view_btn" @click.prevent="openTerms('이용약관')">보기</button>
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
          <button type="button" class="view_btn" @click.prevent="openTerms('개인정보')">보기</button>
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
          <button type="button" class="view_btn" @click.prevent="openTerms('마케팅')">보기</button>
        </label>
      </div>

      <TermsModal :type="termsModalType" :show="showTermsModal" @close="closeTerms" />

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

      <button class="btn_primary" @click="signup">가입하기</button>

      <div class="auth_link">
        이미 계정이 있으신가요?
        <router-link to="/owner/signin">로그인</router-link>
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
.signup_notice { font-size: 12px; color: #F59E0B; background: #FFFBEB; border: 1px solid #FCD34D; border-radius: var(--radius-sm); padding: 8px 12px; }
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
