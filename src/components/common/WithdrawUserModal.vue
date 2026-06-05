<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import { useStore } from '@/stores/useStore'
import { useRiderStore } from '@/stores/riderStore'
import { showAlert } from '@/composables/useAlert'

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()
const userStore = useUserStore()
const ownerStore = useStore()
const riderStore = useRiderStore()

const state = reactive({
  step: 'notice',
  password: '',
  errorMsg: '',
  loading: false,
})

const signinPath = {
  CUSTOMER: '/customer/signin',
  OWNER: '/owner/signin',
  RIDER: '/rider/signin',
}

const close = () => {
  if (state.loading) return
  emit('close')
}

const goPasswordStep = () => {
  state.step = 'password'
  state.errorMsg = ''
}

const resetLocalAuth = () => {
  userStore.reset()
  ownerStore.clearStore()
  riderStore.reset()
}

const submitWithdraw = async () => {
  const userPw = state.password.trim()

  if (!userPw) {
    state.errorMsg = '비밀번호를 입력해 주세요.'
    return
  }

  if (state.loading) return
  state.errorMsg = ''
  state.loading = true

  try {
    const res = await userService.withdraw(userPw)
    resetLocalAuth()
    emit('close')

    await showAlert(res.resultMessage || '회원 탈퇴가 완료되었습니다.', {
      title: '회원 탈퇴 완료',
      type: 'success',
    })

    router.push(signinPath[props.role] || '/')
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage || '회원 탈퇴에 실패했습니다.'
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="withdraw_overlay" @click.self="close">
      <div class="withdraw_modal" role="dialog" aria-modal="true" aria-labelledby="withdraw-title">
        <h3 id="withdraw-title" class="withdraw_title">회원 탈퇴</h3>

        <template v-if="state.step === 'notice'">
          <p class="withdraw_desc">탈퇴 전 아래 내용을 확인해 주세요.</p>

          <ul class="withdraw_policy">
            <li>탈퇴 후 해당 계정으로 로그인할 수 없습니다.</li>
            <li v-if="role === 'CUSTOMER'">진행 중인 주문이 있으면 탈퇴할 수 없습니다.</li>
            <li v-else-if="role === 'OWNER'">운영 중인 가게, 진행 중인 주문, 미정산 내역이 있으면 탈퇴할 수 없습니다.</li>
            <li v-else-if="role === 'RIDER'">진행 중인 배달 또는 열린 근무 세션이 있으면 탈퇴할 수 없습니다.</li>
            <li v-if= "role === 'CUSTOMER' ">작성한 리뷰의 작성자명은 &ldquo;탈퇴한 회원&rdquo;으로 표시됩니다.</li>
            <li>주소, 장바구니, 찜한 가게, 알림 등 개인 편의 데이터는 삭제됩니다.</li>
          </ul>

          <div class="withdraw_policy_note">
            주문, 결제, 리뷰, 정산성 이력은 서비스 운영상 보존됩니다.
          </div>

          <div class="withdraw_actions">
            <button class="btn_cancel" type="button" @click="close">취소</button>
            <button class="btn_danger" type="button" @click="goPasswordStep">탈퇴하기</button>
          </div>
        </template>

        <template v-else>
          <p class="withdraw_desc">본인 확인을 위해 비밀번호를 다시 입력해 주세요.</p>

          <input
            v-model="state.password"
            type="password"
            class="inp"
            placeholder="비밀번호 입력"
            autocomplete="current-password"
            :disabled="state.loading"
            @input="state.errorMsg = ''"
            @keyup.enter="submitWithdraw"
          />
          <p v-if="state.errorMsg" class="withdraw_error">{{ state.errorMsg }}</p>

          <div class="withdraw_actions">
            <button class="btn_cancel" type="button" :disabled="state.loading" @click="close">취소</button>
            <button class="btn_danger" type="button" :disabled="state.loading" @click="submitWithdraw">
              {{ state.loading ? '처리 중...' : '회원 탈퇴' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.withdraw_overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  padding: 16px;
}

.withdraw_modal {
  width: min(420px, 100%);
  padding: 28px;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.withdraw_title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--black);
}

.withdraw_desc {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray-dark);
}

.withdraw_policy {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 16px 18px;
  color: var(--gray-dark);
  line-height: 1.5;
}

.withdraw_policy_note {
  padding: 12px;
  border-radius: var(--radius-md);
  background: #f8f8f8;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.withdraw_error {
  margin: 8px 0 0;
  color: #d93025;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.withdraw_actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.btn_cancel,
.btn_danger {
  flex: 1;
  padding: 13px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 700;
}

.btn_cancel {
  background: #f5f5f5;
  color: #555;
}

.btn_danger {
  background: #9b1b1b;
  color: #fff;
}

.btn_cancel:disabled,
.btn_danger:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.inp:disabled {
  background: #f7f7f7;
  cursor: not-allowed;
}
</style>
