<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'

const router = useRouter()
const activeTab = ref('findId')

const findIdForm = reactive({
  name: '',
  tel: '',
  email: '',
})

const resetPwForm = reactive({
  userId: '',
  name: '',
  tel: '',
  email: '',
  verificationCode: '',
  newPassword: '',
})

const state = reactive({
  foundUserId: '',
  findIdMsg: '',
  findIdError: '',
  resetPwMsg: '',
  resetPwError: '',
  resetPwStep: 1,
  loading: false,
})

const findId = async () => {
  state.findIdMsg = ''
  state.findIdError = ''
  state.foundUserId = ''

  if (!findIdForm.name || !findIdForm.tel || !findIdForm.email) {
    state.findIdError = '이름, 연락처, 이메일을 모두 입력해 주세요.'
    return
  }

  try {
    state.loading = true
    const resultData = await userService.findId({ ...findIdForm })
    state.foundUserId = resultData?.userId ?? ''
    state.findIdMsg = state.foundUserId ? '가입된 아이디를 찾았습니다.' : '일치하는 계정을 찾지 못했습니다.'
  } catch (err) {
    state.findIdError = err.response?.data?.resultMessage ?? '아이디 찾기에 실패했습니다.'
  } finally {
    state.loading = false
  }
}

const requestResetPwCode = async () => {
  state.resetPwMsg = ''
  state.resetPwError = ''

  if (!resetPwForm.userId || !resetPwForm.name || !resetPwForm.tel || !resetPwForm.email) {
    state.resetPwError = '아이디, 이름, 연락처, 이메일을 모두 입력해 주세요.'
    return
  }

  try {
    state.loading = true
    const res = await userService.resetPwCode({
      userId: resetPwForm.userId,
      name: resetPwForm.name,
      tel: resetPwForm.tel,
      email: resetPwForm.email,
    })
    state.resetPwStep = 2
    state.resetPwMsg = res?.resultMessage ?? '인증코드를 이메일로 발송했습니다.'
  } catch (err) {
    state.resetPwError = err.response?.data?.resultMessage ?? '인증코드 요청에 실패했습니다.'
  } finally {
    state.loading = false
  }
}

const onVerificationCodeInput = () => {
  resetPwForm.verificationCode = resetPwForm.verificationCode.replace(/\D/g, '').slice(0, 6)
}

const resetPw = async () => {
  state.resetPwMsg = ''
  state.resetPwError = ''

  if (!resetPwForm.verificationCode || resetPwForm.verificationCode.length !== 6) {
    state.resetPwError = '인증코드 6자리를 입력해 주세요.'
    return
  }

  if (!resetPwForm.newPassword) {
    state.resetPwError = '새 비밀번호를 입력해 주세요.'
    return
  }

  try {
    state.loading = true
    const res = await userService.resetPw({ ...resetPwForm })
    state.resetPwMsg = res?.resultMessage ?? '비밀번호가 재설정되었습니다.'
    setTimeout(() => router.push('/customer/signin'), 800)
  } catch (err) {
    state.resetPwError = err.response?.data?.resultMessage ?? '비밀번호 재설정에 실패했습니다.'
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <div class="account_page">
    <div class="account_card">
      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="account_logo" />
      </div>

      <h2 class="account_title">계정 찾기</h2>

      <div class="tab_group">
        <button :class="['tab_btn', { active: activeTab === 'findId' }]" @click="activeTab = 'findId'">아이디 찾기</button>
        <button :class="['tab_btn', { active: activeTab === 'resetPw' }]" @click="activeTab = 'resetPw'">비밀번호 재설정</button>
      </div>

      <form v-if="activeTab === 'findId'" class="account_form" @submit.prevent="findId">
        <input v-model="findIdForm.name" type="text" class="inp" placeholder="이름" />
        <input v-model="findIdForm.tel" type="tel" class="inp" placeholder="010-1234-5678" />
        <input v-model="findIdForm.email" type="email" class="inp" placeholder="test@example.com" />

        <p v-if="state.findIdError" class="error_msg">{{ state.findIdError }}</p>
        <p v-if="state.findIdMsg" class="success_msg">{{ state.findIdMsg }}</p>
        <div v-if="state.foundUserId" class="result_box">
          <span class="result_label">아이디</span>
          <strong>{{ state.foundUserId }}</strong>
        </div>

        <button class="btn_primary" :disabled="state.loading">아이디 찾기</button>
      </form>

      <form v-else class="account_form" @submit.prevent="state.resetPwStep === 1 ? requestResetPwCode() : resetPw()">
  <template v-if="state.resetPwStep === 1">
    <input v-model="resetPwForm.userId" type="text" class="inp" placeholder="아이디" />
    <input v-model="resetPwForm.name" type="text" class="inp" placeholder="이름" />
    <input v-model="resetPwForm.tel" type="tel" class="inp" placeholder="010-1234-5678" />
    <input v-model="resetPwForm.email" type="email" class="inp" placeholder="test@example.com" />
  </template>

  <template v-else>
    <input
      v-model="resetPwForm.verificationCode"
      type="text"
      inputmode="numeric"
      maxlength="6"
      class="inp"
      placeholder="인증코드 6자리"
      @input="onVerificationCodeInput"
    />
    <input v-model="resetPwForm.newPassword" type="password" class="inp" placeholder="새 비밀번호" />

    <button type="button" class="text_btn" @click="state.resetPwStep = 1">
      인증 정보 다시 입력
    </button>
  </template>

  <p v-if="state.resetPwError" class="error_msg">{{ state.resetPwError }}</p>
  <p v-if="state.resetPwMsg" class="success_msg">{{ state.resetPwMsg }}</p>

  <button class="btn_primary" :disabled="state.loading">
    {{ state.resetPwStep === 1 ? '인증코드 받기' : '비밀번호 재설정' }}
  </button>
</form>

      <div class="auth_link">
        <button type="button" class="text_btn" @click="router.back()">로그인으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account_page { min-height: 100vh; background: #fff; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
.account_card { width: 100%; max-width: 420px; background: #fff; border-radius: 20px; box-shadow: 0 4px 32px rgba(0,0,0,0.10); padding: 10px 40px 40px; display: flex; flex-direction: column; gap: 16px; }
.logo_wrap { text-align: center; }
.account_logo { width: 130px; height: 130px; object-fit: contain; }
.account_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }
.tab_group { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
.tab_btn { height: 42px; border: 0; background: #fff; color: #666; font-weight: 700; cursor: pointer; }
.tab_btn.active { background: var(--primary); color: #fff; }
.account_form { display: flex; flex-direction: column; gap: 14px; }
.success_msg { color: #198754; font-size: 13px; text-align: center; margin: 0; }
.result_box { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e8e8e8; border-radius: 8px; padding: 12px 14px; background: #fafafa; }
.result_label { color: #666; font-size: 13px; }
.text_btn { border: 0; background: none; color: var(--gray); cursor: pointer; font-size: 13px; }
.text_btn:hover { color: var(--primary); }
</style>
