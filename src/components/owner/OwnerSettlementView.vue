<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@/stores/useStore'
import ownerService from '@/services/ownerService'


const settlementOrders = ref([])
const settlementTotalSales = ref(0)

const expectedPayoutDate = (periodEnd) => {
  if (!periodEnd) return '-'
  const date = new Date(periodEnd)
  let added = 0
  while (added < 2) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return date.toISOString().substring(0, 10) + ' 예정'
}

const storeInfo = useStore()
const settlementList = ref([])
const loading = ref(false)

const showDetailModal = ref(false)
const selectedSettlement = ref(null)
const showInquiryForm = ref(false)
const inquiryContent = ref('')
const inquirySubmitting = ref(false)

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const filteredByMonth = computed(() => {
  return settlementList.value.filter(item => {
    const d = new Date(item.periodEnd)
    return d.getFullYear() === currentYear.value
        && d.getMonth() + 1 === currentMonth.value
  })
})

const formatMoney = (v) => v != null ? `₩${Number(v).toLocaleString()}` : '-'

const statusLabel = (status) => {
  const map = {
    PENDING:   { text: '대기', class: 'badge_pending' },
    DONE:      { text: '완료', class: 'badge_done' },
    COMPLETED: { text: '완료', class: 'badge_done' },
    HELD:      { text: '보류', class: 'badge_held' },
    HOLD:      { text: '보류', class: 'badge_held' },
  }
  return map[status] ?? { text: status, class: '' }
}

const fetchSettlements = async () => {
  if (!storeInfo.myStoreId) return
  loading.value = true
  try {
    const res = await ownerService.getMySettlements(storeInfo.myStoreId)
    settlementList.value = res?.resultData ?? []
  } catch (e) {
    console.error('정산 조회 실패', e)
    console.log('storeId:', storeInfo.myStoreId)
    settlementList.value = []
  } finally {
    loading.value = false
  }
}

const openDetail = async (item) => {
  selectedSettlement.value = item
  showInquiryForm.value = false
  inquiryContent.value = ''
  settlementOrders.value = []
  settlementTotalSales.value = 0
  showDetailModal.value = true
  try {
    const res = await ownerService.getSettlementOrders(item.settlementId)
    const data = res?.resultData
    settlementOrders.value = data?.dailySales ?? []
    settlementTotalSales.value = data?.totalSales ?? 0
  } catch (e) {
    settlementOrders.value = []
  }
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedSettlement.value = null
  showInquiryForm.value = false
  inquiryContent.value = ''
  settlementOrders.value = []
  settlementTotalSales.value = 0
}

const toggleInquiryForm = () => {
  showInquiryForm.value = !showInquiryForm.value
  if (!showInquiryForm.value) inquiryContent.value = ''
}

const submitInquiry = async () => {
  if (!inquiryContent.value.trim()) {
    alert('문의 내용을 입력해주세요.')
    return
  }
  inquirySubmitting.value = true
  try {
    await ownerService.submitSettlementInquiry(inquiryContent.value)
    alert('문의가 접수되었습니다.')
    closeDetail()
  } catch (e) {
    alert('문의 접수에 실패했습니다.')
  } finally {
    inquirySubmitting.value = false
  }
}


onMounted(fetchSettlements)
</script>

<template>
  <div class="settlement-wrap">
    <h2 class="title">정산 내역</h2>

    <!-- 월 네비게이터 -->
    <div class="month-nav">
      <button class="nav-btn" @click="prevMonth">◀</button>
      <span class="month-label">{{ currentYear }}년 {{ String(currentMonth).padStart(2, '0') }}월</span>
      <button class="nav-btn" @click="nextMonth">▶</button>
    </div>

    <div v-if="loading" class="state-msg">불러오는 중...</div>

    <template v-else-if="filteredByMonth.length > 0">
      <div class="card-grid">
        <div
          v-for="item in filteredByMonth"
          :key="item.settlementId"
          class="settlement-card"
          @click="openDetail(item)"
        >
          <div class="card-period">
            <img src="@/assets/calender.png" alt="calendar" class="calendar" />
            {{ item.periodStart }} ~ {{ item.periodEnd }}</div>
          <div class="card-amount">{{ formatMoney(item.netAmount) }}</div>
          <div class="card-fee">수수료 {{ formatMoney(item.feeAmount) }} 차감</div>
          <span :class="['status-badge', statusLabel(item.status).class]">
            {{ statusLabel(item.status).text }}
          </span>
        </div>
      </div>
    </template>

    <div v-else class="state-msg">해당 월 정산 내역이 없습니다.</div>
  </div>

  <!-- 정산 상세 모달 -->
  <div v-if="showDetailModal && selectedSettlement" class="modal-overlay" @click.self="closeDetail">
    <div class="modal">
      <div class="modal-head">
        <h3>정산 상세</h3>
        <button class="modal-x" @click="closeDetail">✕</button>
      </div>

      <!-- 정산 요약 -->
      <div class="modal-summary">
        <div class="summary-row">
          <span class="label">정산 기간</span>
          <span class="value">{{ selectedSettlement.periodStart }} ~ {{ selectedSettlement.periodEnd }}</span>
        </div>
        <div class="summary-row">
          <span class="label">총 주문금액</span>
          <span class="value">{{ formatMoney(selectedSettlement.grossAmount) }}</span>
        </div>
        <div class="summary-row">
          <span class="label">수수료 (5%)</span>
          <span class="value fee">- {{ formatMoney(selectedSettlement.feeAmount) }}</span>
        </div>
        <div class="summary-row final">
          <span class="label">실 입금액</span>
          <span class="value final-val">{{ formatMoney(selectedSettlement.netAmount) }}</span>
          <span :class="['status-badge', statusLabel(selectedSettlement.status).class]">
            {{ statusLabel(selectedSettlement.status).text }}
          </span>
        </div>
      </div>

            <!-- 날짜별 매출 내역 -->
      <div class="order-section">
        <p class="section-title">날짜별 매출 내역</p>
        <table class="order-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>주문 건수</th>
              <th>일 매출</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="settlementOrders.length > 0">
              <tr v-for="row in settlementOrders" :key="row.date">
                <td>{{ row.date }}</td>
                <td>{{ row.count }}건</td>
                <td>₩{{ Number(row.amount).toLocaleString() }}</td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="3" style="text-align:center; color:#aaa; padding:16px;">
                주문 내역이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 지급 정보 -->
      <div class="payout-section">
        <p class="section-title">지급 정보</p>
        <div class="payout-grid">
          <div class="payout-row">
            <span class="payout-label">입금 계좌</span>
            <span class="payout-value">{{ selectedSettlement.bankAccount ?? '-' }}</span>
          </div>
          <div class="payout-row">
            <span class="payout-label">입금 예정일</span>
            <span class="payout-value">
              {{ selectedSettlement.status === 'PENDING'
                ? expectedPayoutDate(selectedSettlement.periodEnd)
                : selectedSettlement.paidAt
                  ? selectedSettlement.paidAt.toString().substring(0, 10) + ' 입금 완료'
                  : '-' }}
            </span>
          </div>
          <div class="payout-row">
            <span class="payout-label">정산 방식</span>
            <span class="payout-value">토스페이먼츠 지급대행</span>
          </div>
        </div>
      </div>

      <!-- 정산 문의 -->
      <div class="inquiry-section">
        <button class="inquiry-toggle-btn" @click="toggleInquiryForm">
          {{ showInquiryForm ? '닫기' : '정산 문의하기' }}
        </button>
        <div v-if="showInquiryForm" class="inquiry-form">
          <textarea
            v-model="inquiryContent"
            class="inquiry-input"
            placeholder="문의 내용을 입력해주세요."
            rows="4"
          ></textarea>
          <div class="inquiry-btns">
            <button class="inquiry-cancel-btn" @click="toggleInquiryForm">취소</button>
            <button class="inquiry-submit-btn" :disabled="inquirySubmitting" @click="submitInquiry">
              {{ inquirySubmitting ? '접수 중...' : '제출' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settlement-wrap { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0; }

/* 월 네비게이터 */
.month-nav { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 12px 0; }
.nav-btn { background: none; border: 1.5px solid #ddd; border-radius: 8px; padding: 6px 14px; font-size: 14px; cursor: pointer; color: #555; }
.nav-btn:hover { border-color: #9b1b1b; color: #9b1b1b; }
.month-label { font-size: 18px; font-weight: 700; color: #222; min-width: 120px; text-align: center; }

/* 카드 그리드 */
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.settlement-card { background: #fff; border: 1.5px solid #eee; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; transition: all 0.15s; }
.settlement-card:hover { border-color: #9b1b1b; box-shadow: 0 4px 12px rgba(155,27,27,0.08); }
.card-period { font-size: 13px; color: #888; font-weight: 500;  display: flex; align-items: center; gap: 6px;}
.card-amount { font-size: 22px; font-weight: 800; color: #1a1a1a; }
.card-fee { font-size: 12px; color: #aaa; }
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; align-self: flex-start; }
.badge_pending { background: #fff3d6; color: #b07800; }
.badge_done { background: #e8f5e9; color: #2e7d32; }
.badge_held { background: #ffdddd; color: #cc1f1f; }
.state-msg { text-align: center; padding: 60px; color: #aaa; font-size: 15px; }

/* 모달 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal { background: #fff; border-radius: 18px; padding: 30px 28px; width: 520px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
.modal-head { display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { font-size: 18px; font-weight: 700; }
.modal-x { background: none; border: none; font-size: 20px; cursor: pointer; color: #888; }
.calendar {width: 20px; height: auto;}

/* 요약 */
.modal-summary { display: flex; flex-direction: column; gap: 12px; background: #fafafa; border-radius: 12px; padding: 16px 20px; }
.summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.summary-row.final { border-top: 1px solid #eee; padding-top: 12px; }
.label { color: #777; }
.value { font-weight: 600; color: #222; }
.value.fee { color: #cc1f1f; }
.value.final-val { font-size: 16px; font-weight: 800; }

/* 주문 내역 */
.order-section { display: flex; flex-direction: column; gap: 10px; }
.section-title { font-size: 15px; font-weight: 700; color: #222; margin: 0; }
.order-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.order-table thead tr { background: #f5f5f5; }
.order-table th { padding: 10px 12px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #eee; }
.order-table td { padding: 10px 12px; text-align: center; color: #333; border-bottom: 1px solid #f5f5f5; }

/* 문의 */
.inquiry-section { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
.inquiry-toggle-btn { padding: 8px 16px; background: #fff; border: 1.5px solid #9b1b1b; color: #9b1b1b; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.inquiry-toggle-btn:hover { background: #fff4f4; }
.inquiry-form { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.inquiry-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e5e3dc; border-radius: 10px; font-size: 14px; resize: none; font-family: inherit; box-sizing: border-box; }
.inquiry-input:focus { outline: none; border-color: #9b1b1b; }
.inquiry-btns { display: flex; gap: 8px; justify-content: flex-end; }
.inquiry-cancel-btn { padding: 9px 20px; background: #f4f4f4; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.inquiry-submit-btn { padding: 9px 20px; background: #9b1b1b; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.inquiry-submit-btn:hover { background: #7f1515; }
.inquiry-submit-btn:disabled { background: #ccc; cursor: default; }

.payout-section { display: flex; flex-direction: column; gap: 10px; }
.payout-grid { display: flex; flex-direction: column; gap: 10px; background: #fafafa; border-radius: 12px; padding: 16px 20px; }
.payout-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
.payout-label { color: #777; }
.payout-value { font-weight: 600; color: #222; }
.bank-account-row { align-items: flex-start; flex-wrap: wrap; gap: 8px; }
.bank-input-wrap { display: flex; gap: 8px; flex: 1; }
.bank-input { flex: 1; border: 1.5px solid #ddd; border-radius: 8px; padding: 7px 12px; font-size: 13px; outline: none; min-width: 0; }
.bank-input:focus { border-color: #9b1b1b; }
.bank-save-btn { padding: 7px 16px; background: #9b1b1b; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.bank-save-btn:disabled { background: #ccc; cursor: default; }
.bank-display-wrap { display: flex; align-items: center; gap: 10px; }
.bank-edit-btn { padding: 4px 12px; background: #fff; border: 1.5px solid #9b1b1b; color: #9b1b1b; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.bank-edit-btn:hover { background: #fff4f4; }

</style>