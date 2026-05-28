<script setup>
import { ref, onMounted, computed } from 'vue'
import RiderHeader from '@/components/rider/RiderHeader.vue'
import RiderLayout from '@/views/rider/RiderLayout.vue'
import riderService from '@/services/riderService'
import settlementService from '@/services/settlementService'
import { useMessageModalStore } from '@/stores/messageModalStore'
import WithdrawUserModal from '@/components/common/WithdrawUserModal.vue'

const messageModalStore = useMessageModalStore()

const me = ref(null)
const account = ref({ accountBank: '', accountNo: '', accountHolder: '' })
const loading = ref(true)

const accountModalOpen = ref(false)
const accountForm = ref({ accountBank: '', accountNo: '', accountHolder: '' })
const saving = ref(false)
const showWithdrawModal = ref(false)

const hasAccount = computed(() => !!(account.value?.accountBank && account.value?.accountNo))
const statusLabel = computed(() => {
  const s = me.value?.status
  if (s === 'ACTIVE') return '활성'
  if (s === 'EATING') return '식사중'
  if (s === 'PENDING') return '승인 대기'
  if (s === 'SUSPENDED') return '이용 제한'
  return '-'
})
const vehicleLabel = computed(() => {
  const v = me.value?.vehicleType
  if (v === 'MOTORBIKE') return '오토바이'
  if (v === 'CAR') return '자동차'
  if (v === 'BICYCLE') return '자전거'
  if (v === 'WALK') return '도보'
  return '-'
})

const load = async () => {
  loading.value = true
  try {
    const [profile, acct] = await Promise.all([
      riderService.getMe(),
      settlementService.getAccount(),
    ])
    me.value = profile
    account.value = acct ?? { accountBank: '', accountNo: '', accountHolder: '' }
  } finally {
    loading.value = false
  }
}

const openAccountModal = () => {
  accountForm.value = { ...account.value }
  accountModalOpen.value = true
}
const closeAccountModal = () => { accountModalOpen.value = false }

const saveAccount = async () => {
  const { accountBank, accountNo, accountHolder } = accountForm.value
  if (!accountBank?.trim() || !accountNo?.trim() || !accountHolder?.trim()) {
    messageModalStore.setMessage('은행/계좌번호/예금주를 모두 입력하세요.')
    return
  }
  if (saving.value) return
  saving.value = true
  try {
    const res = await settlementService.updateAccount(accountForm.value)
    account.value = res
    messageModalStore.setMessage('정산 계좌가 변경되었습니다.')
    closeAccountModal()
  } catch {
    // httpRequester 인터셉터 모달
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <RiderLayout :require-active="true">
  <RiderHeader />
  <main class="content">
    <section v-if="loading" class="state">불러오는 중...</section>

    <template v-else>
      <section class="card">
        <h2 class="card-title">내 정보</h2>
        <div class="grid">
          <div class="row"><span class="label">상태</span><span class="value">{{ statusLabel }}</span></div>
          <div class="row"><span class="label">운전면허 번호</span><span class="value">{{ me?.licenseNo ?? '-' }}</span></div>
          <div class="row"><span class="label">운전면허 종류</span><span class="value">{{ me?.licenseType ?? '-' }}</span></div>
          <div class="row"><span class="label">배달 수단</span><span class="value">{{ vehicleLabel }}</span></div>
        </div>
      </section>

      <section class="card">
        <div class="head">
          <h2 class="card-title">정산 계좌</h2>
          <button class="edit-btn" @click="openAccountModal">{{ hasAccount ? '변경' : '등록' }}</button>
        </div>
        <div v-if="hasAccount" class="account-info">
          <div>{{ account.accountBank }}</div>
          <div>{{ account.accountNo }}</div>
          <div>예금주: {{ account.accountHolder }}</div>
        </div>
        <div v-else class="empty">등록된 계좌가 없습니다. 변경 버튼을 눌러 정산 계좌를 등록해주세요.</div>
      </section>

      <section class="card photo-card">
        <h2 class="card-title">프로필 / 면허 사진</h2>
        <div class="empty">사진 업로드 기능은 준비 중입니다.</div>
      </section>

    </template>

    <div class="withdraw-text-wrap">
      <button class="withdraw-text-btn" type="button" @click="showWithdrawModal = true">회원 탈퇴</button>
    </div>

    <WithdrawUserModal
      v-if="showWithdrawModal"
      role="RIDER"
      @close="showWithdrawModal = false"
    />

    <transition name="fade">
      <div v-if="accountModalOpen" class="modal-backdrop" @click.self="closeAccountModal">
        <div class="modal" role="dialog" aria-modal="true">
          <h3>정산 계좌 {{ hasAccount ? '변경' : '등록' }}</h3>
          <label>
            <span>은행</span>
            <input v-model="accountForm.accountBank" placeholder="예: 국민" />
          </label>
          <label>
            <span>계좌번호</span>
            <input v-model="accountForm.accountNo" placeholder="예: 110-123-456789" />
          </label>
          <label>
            <span>예금주</span>
            <input v-model="accountForm.accountHolder" placeholder="예: 홍길동" />
          </label>
          <div class="actions">
            <button class="btn-secondary" :disabled="saving" @click="closeAccountModal">취소</button>
            <button class="btn-primary" :disabled="saving" @click="saveAccount">저장</button>
          </div>
        </div>
      </div>
    </transition>
  </main>
  </RiderLayout>
</template>

<style scoped>
.content {
  padding: 12px;
  background: #f7f7f7;
  min-height: calc(100dvh - 56px);
}
.state, .empty {
  padding: 24px;
  text-align: center;
  color: #888;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.card-title { font-size: 16px; margin: 0 0 12px; font-weight: 600; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.head .card-title { margin: 0; }
.edit-btn {
  padding: 4px 12px;
  border: 1px solid #A40C0B;
  background: white;
  color: #A40C0B;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.row:last-child { border-bottom: 0; }
.row .label { color: #777; font-size: 14px; }
.row .value { font-weight: 500; font-size: 14px; color: #333; }
.account-info { font-size: 14px; line-height: 1.6; }
.photo-card .empty { padding: 32px 16px; font-size: 13px; }
.withdraw-text-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 8px 4px 20px;
}
.withdraw-text-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #bbb;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
}

.modal-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 300;
}
.modal {
  background: white;
  width: 320px; max-width: 86%;
  padding: 20px;
  border-radius: 12px;
}
.modal h3 { margin: 0 0 16px; font-size: 17px; }
.modal label {
  display: flex; flex-direction: column; gap: 4px;
  margin-bottom: 12px;
}
.modal label span { font-size: 13px; color: #555; }
.modal input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
.actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-secondary, .btn-primary {
  flex: 1; padding: 10px;
  border: 0; border-radius: 6px;
  cursor: pointer; font-size: 14px;
}
.btn-secondary { background: #f0f0f0; color: #333; }
.btn-primary { background: #A40C0B; color: white; }
.btn-secondary:disabled, .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
