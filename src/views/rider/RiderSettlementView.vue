<script setup>
import { onMounted, ref, computed } from 'vue'
import RiderHeader from '@/components/rider/RiderHeader.vue'
import settlementService from '@/services/settlementService'
import { useMessageModalStore } from '@/stores/messageModalStore'

const messageModalStore = useMessageModalStore()

const settlements = ref([])
const account = ref({ accountBank: '', accountNo: '', accountHolder: '' })
const loading = ref(true)

const accountModalOpen = ref(false)
const accountForm = ref({ accountBank: '', accountNo: '', accountHolder: '' })

const thisWeek = computed(() => {
  // 가장 최근(periodStart DESC 첫번째) = 이번주 또는 가장 최신 정산
  return settlements.value[0] ?? null
})
const pastWeeks = computed(() => settlements.value.slice(1))

const fmtMoney = (n) => (n ?? 0).toLocaleString('ko-KR') + '원'
const fmtDate = (iso) => iso ?? '-'
const fmtDistance = (m) => {
  if (m == null) return '0km'
  return (m / 1000).toFixed(1) + 'km'
}
const statusLabel = (s) => s === 'CONFIRMED' ? '정산 완료' : '검토 중'
const statusColor = (s) => s === 'CONFIRMED' ? '#2e7d32' : '#f5a623'

const load = async () => {
  loading.value = true
  try {
    const [list, acct] = await Promise.all([
      settlementService.history(),
      settlementService.getAccount(),
    ])
    settlements.value = list ?? []
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
  try {
    const res = await settlementService.updateAccount(accountForm.value)
    account.value = res
    messageModalStore.setMessage('정산 계좌가 변경되었습니다.')
    closeAccountModal()
  } catch {
    // 인터셉터 모달
  }
}

onMounted(load)
</script>

<template>
  <RiderHeader />
  <main class="content">
    <section v-if="loading" class="state">불러오는 중...</section>

    <template v-else>
      <!-- 이번주 정산 -->
      <section class="card primary">
        <h2 class="card-title">이번 주 정산</h2>
        <div v-if="!thisWeek" class="empty">집계된 정산이 없습니다.</div>
        <div v-else>
          <div class="period">{{ fmtDate(thisWeek.periodStart) }} ~ {{ fmtDate(thisWeek.periodEnd) }}</div>
          <div class="payout-row">
            <span class="payout-label">실 수령액</span>
            <span class="payout-value">{{ fmtMoney(thisWeek.payout) }}</span>
          </div>
          <div class="status-row">
            <span class="status-badge" :style="{ background: statusColor(thisWeek.status) }">
              {{ statusLabel(thisWeek.status) }}
            </span>
          </div>
          <ul class="breakdown">
            <li><span>배달 건수</span><span>{{ thisWeek.deliveryCount }}건</span></li>
            <li><span>이동 거리</span><span>{{ fmtDistance(thisWeek.totalDistanceM) }}</span></li>
            <li><span>배달료</span><span>{{ fmtMoney((thisWeek.totalBaseFee ?? 0) + (thisWeek.totalExtraFee ?? 0)) }}</span></li>
            <li class="deduction"><span>수수료</span><span>- {{ fmtMoney(thisWeek.commission) }}</span></li>
            <li class="deduction"><span>세금 (3.3%)</span><span>- {{ fmtMoney(thisWeek.tax) }}</span></li>
            <li class="deduction"><span>보험료</span><span>- {{ fmtMoney(thisWeek.insurance) }}</span></li>
          </ul>
        </div>
      </section>

      <!-- 정산 계좌 -->
      <section class="card">
        <div class="head">
          <h2 class="card-title">정산 계좌</h2>
          <button class="edit-btn" @click="openAccountModal">변경</button>
        </div>
        <div v-if="account.accountBank" class="account-info">
          <div>{{ account.accountBank }}</div>
          <div>{{ account.accountNo }}</div>
          <div>예금주: {{ account.accountHolder }}</div>
        </div>
        <div v-else class="empty">등록된 계좌가 없습니다.</div>
      </section>

      <!-- 과거 내역 -->
      <section v-if="pastWeeks.length" class="card">
        <h2 class="card-title">과거 정산 내역</h2>
        <ul class="past-list">
          <li v-for="s in pastWeeks" :key="s.settlementNo">
            <div class="past-period">{{ fmtDate(s.periodStart) }} ~ {{ fmtDate(s.periodEnd) }}</div>
            <div class="past-payout">{{ fmtMoney(s.payout) }}</div>
            <span class="status-badge small" :style="{ background: statusColor(s.status) }">
              {{ statusLabel(s.status) }}
            </span>
          </li>
        </ul>
      </section>
    </template>

    <!-- 계좌 변경 모달 -->
    <transition name="fade">
      <div v-if="accountModalOpen" class="modal-backdrop" @click.self="closeAccountModal">
        <div class="modal" role="dialog" aria-modal="true">
          <h3>정산 계좌 변경</h3>
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
            <button class="btn-secondary" @click="closeAccountModal">취소</button>
            <button class="btn-primary" @click="saveAccount">저장</button>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.content {
  padding: 12px;
  background: #f7f7f7;
  min-height: calc(100vh - 56px);
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
.card.primary { border: 2px solid #A40C0B; }
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
.period { color: #555; font-size: 13px; margin-bottom: 8px; }
.payout-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}
.payout-label { font-size: 14px; color: #333; }
.payout-value { font-size: 24px; font-weight: 700; color: #A40C0B; }
.status-row { margin: 10px 0; }
.status-badge {
  display: inline-block;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}
.status-badge.small { font-size: 11px; padding: 2px 8px; }
.breakdown {
  list-style: none;
  margin: 0; padding: 0;
}
.breakdown li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}
.breakdown li.deduction { color: #888; }
.account-info { font-size: 14px; line-height: 1.6; }
.past-list { list-style: none; margin: 0; padding: 0; }
.past-list li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.past-period { font-size: 13px; color: #555; }
.past-payout { font-size: 14px; font-weight: 600; color: #A40C0B; }

.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 300;
}
.modal {
  background: white;
  width: 320px; max-width: 86vw;
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

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
