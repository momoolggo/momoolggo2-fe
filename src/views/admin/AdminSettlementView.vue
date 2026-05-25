<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'




const summary = ref({
  expectedAmount: 0,
  monthlyExpectedAmount: 0,
  completedAmount: 0,
  completedCount: 0,
  pendingCount: 0,
  pendingStoreCount: 0,
  pendingRiderCount: 0,
})
const settlementList = ref([])
const loading = ref(false)
const showDetailModal = ref(false)
const selectedSettlement = ref(null)
const showRiderDetailModal = ref(false)
const selectedRiderSettlement = ref(null)

const searchForm = ref({
  targetType: null,
  status: null,
  keyword: '',
})

const settlementTab = ref('store')
const riderSettlementList = ref([])

const ADMIN_NO = 1

const fetchRiderSettlements = async () => {
  try {
    const res = await adminService.getRiderSettlementPending()
    riderSettlementList.value = res?.resultData ?? res ?? []
  } catch (e) {
    console.error('라이더 정산 조회 실패', e)
    riderSettlementList.value = []
  }
}

// riderSettlementList는 /pending 엔드포인트 → PENDING 건만 반환
const riderPendingCount = computed(() => riderSettlementList.value.length)
const totalPendingCount = computed(() => (summary.value.pendingStoreCount ?? 0) + riderPendingCount.value)

const confirmRiderSettlement = async (settlementNo) => {
  try {
    await adminService.confirmRiderSettlement(settlementNo, ADMIN_NO)
    await fetchRiderSettlements()
    closeRiderDetail()
  } catch (e) {
    alert('정산 확정 실패: ' + (e.response?.data?.resultMessage || e.message))
  }
}

const openRiderDetail = (item) => {
  selectedRiderSettlement.value = item
  showRiderDetailModal.value = true
}

const closeRiderDetail = () => {
  showRiderDetailModal.value = false
  selectedRiderSettlement.value = null
}


const statusOpen = ref(false)
const statusOptions = [
  { label: '전체', value: null },
  { label: '완료', value: 'COMPLETED' },
  { label: '대기', value: 'PENDING' },
  { label: '보류', value: 'HOLD' },
]
const selectedStatusLabel = ref('전체')
const selectStatus = (opt) => {
  searchForm.value.status = opt.value
  selectedStatusLabel.value = opt.label
  statusOpen.value = false
}

const tableStatusOpen = ref(false)

const filterByStatus = (opt) => {
  searchForm.value.status = opt.value
  selectedStatusLabel.value = opt.label
  tableStatusOpen.value = false
}


const currentPage = ref(1)
const totalPages = ref(1)

watch(currentPage, (newVal) => {
  fetchList()
})

const statusBadge = (status) => {
  const map = {
    COMPLETED: { text: '완료', class: 'badge_complete' },
    DONE: { text: '완료', class: 'badge_complete' },
    PENDING: { text: '대기', class: 'badge_pending' },
    HOLD: { text: '보류', class: 'badge_hold' },
    HELD: { text: '보류', class: 'badge_hold' },
    CONFIRMED: { text: '확정', class: 'badge_complete' },
  }
  return map[status] ?? { text: status, class: '' }
}

const formatMoney = (v) => v != null ? `${v.toLocaleString()} ₩` : '-'
const targetName = (item) => {
  if (item.targetName) return item.targetName
  return item.targetType === 'STORE' ? `가게 #${item.targetNo}` : `라이더 #${item.targetNo}`
}

const fetchSummary = async () => {
  try {
    const res = await adminService.getSettlementSummary()
    if (res?.resultData) {
      summary.value = {
        expectedAmount: res.resultData.expectedAmount ?? 0,
        monthlyExpectedAmount: res.resultData.monthlyExpectedAmount ?? 0,
        completedAmount: res.resultData.completedAmount ?? 0,
        completedCount: res.resultData.completedCount ?? 0,
        pendingCount: res.resultData.pendingCount ?? 0,
        pendingStoreCount: res.resultData.pendingStoreCount ?? 0,
        pendingRiderCount: res.resultData.pendingRiderCount ?? 0,
      }
    }
  } catch (e) {
    console.error('정산 요약 조회 실패', e)
    summary.value = { expectedAmount: 0, completedAmount: 0, completedCount: 0, pendingCount: 0, pendingStoreCount: 0, pendingRiderCount: 0 }
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await adminService.getSettlementList({
      page: currentPage.value - 1,
      size: 10,
      status: searchForm.value.status ?? undefined,
      keyword: searchForm.value.keyword || undefined,
    })
    const data = res?.resultData
    
    settlementList.value = data?.content ?? []
    totalPages.value = data?.totalPages ?? (Math.ceil((data?.totalCount ?? 0) / 10) || 1)
  } catch (e) {
    settlementList.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

const openDetail = async (item) => {
  selectedSettlement.value = item
  editBankAccount.value = item.bankAccount ?? ''
  showDetailModal.value = true
  settlementOrders.value = []
  settlementTotalSales.value = 0
  try {
    const res = await adminService.getSettlementOrders(item.settlementId)
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
  settlementOrders.value = []
  settlementTotalSales.value = 0
}


const completeSettlement = async (settlementId) => {
  try {
    await adminService.completeSettlement(settlementId)
    await fetchList()
    closeDetail()
  } catch (e) { alert('처리 실패') }
}

const editBankAccount = ref('')
const bankAccountSaving = ref(false)

const saveBankAccount = async () => {
  if (!editBankAccount.value.trim()) { alert('계좌 정보를 입력해주세요.'); return }
  bankAccountSaving.value = true
  try {
    await adminService.updateBankAccount(selectedSettlement.value.settlementId, editBankAccount.value.trim())
    selectedSettlement.value = { ...selectedSettlement.value, bankAccount: editBankAccount.value.trim() }
  } catch (e) {
    alert('계좌 변경 실패')
  } finally {
    bankAccountSaving.value = false
  }
}

const holdSettlement = async (settlementId) => {
  try {
    await adminService.holdSettlement(settlementId)
    await fetchList()
    closeDetail()
  } catch (e) { alert('처리 실패') }
}

const releaseHold = async (settlementId) => {
  try {
    await adminService.releaseHold(settlementId)
    await fetchList()
    closeDetail()
  } catch (e) { alert('처리 실패') }
}

onMounted(() => {
  fetchSummary()
  fetchList()
  fetchRiderSettlements()
})

const handleSearch = () => {
  if(currentPage.value === 1){
  fetchList()
} else {
  currentPage.value = 1
  }
}

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

</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />
    <div class="main_content">
      <AdminHeader />

      <div class="content">
        <h2 class="page_title">이번주 정산 관리</h2>

        <!-- 요약 카드 -->
        <div class="summary_grid">
          <div class="summary_card">
            <div class="card_main">
              <div class="icon_area blue_area">
                <img src="@/assets/calculator.png" alt="calculator" class="card_img" />
              </div>
              <div class="card_info card_info_dual">
                <div class="dual_section">
                  <p class="card_label">이번 주 정산 예정액</p>
                  <p class="card_value_sm blue_val">{{ formatMoney(summary.expectedAmount) }}</p>
                </div>
                <div class="dual_divider"></div>
                <div class="dual_section">
                  <p class="card_label">이번 달 전체 정산액</p>
                  <p class="card_value_sm card_monthly_val">{{ formatMoney(summary.monthlyExpectedAmount) }}</p>
                </div>
              </div>
            </div>
            <div class="card_sub_bar blue_sub">이번 주 예정 / 이번 달 전체</div>
          </div>
          <div class="summary_card">
            <div class="card_main">
              <div class="icon_area green_area">
                <img src="@/assets/checkbox.png" alt="checkbox" class="card_img" />
              </div>
              <div class="card_info">
                <p class="card_label">정산 완료 건수</p>
                <p class="card_value green_val">{{ summary.completedCount }}건</p>
              </div>
            </div>
            <div class="card_sub_bar green_sub">지급 완료</div>
          </div>
          <div class="summary_card">
            <div class="card_main">
              <div class="icon_area yellow_area">
                <img src="@/assets/check.png" alt="check" class="card_img" />
              </div>
              <div class="card_info">
                <p class="card_label">대기 건수</p>
                <p class="card_value yellow_val">{{ totalPendingCount }}건</p>
              </div>
            </div>
            <div class="card_sub_bar yellow_sub">
              확인 필요 · 가게 {{ summary.pendingStoreCount }}건 / 라이더 {{ riderPendingCount }}건
            </div>
          </div>
        </div>
        

<div class="top_control_row">

  <!-- 검색 -->
  <div class="search_box">
    <div class="search_row">

      <div class="search_field">
        <div class="dropdown_wrap">
          <button
            class="dropdown_btn"
            @click="statusOpen = !statusOpen"
          >
            {{ selectedStatusLabel }}
            <span class="dropdown_arrow">▼</span>
          </button>

          <div
            v-if="statusOpen"
            class="dropdown_menu"
          >
            <button
              v-for="opt in statusOptions"
              :key="opt.label"
              class="dropdown_item"
              @click="selectStatus(opt)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="search_field">
        

        <input
          v-model="searchForm.keyword"
          type="text"
          placeholder="가게명 검색"
          class="keyword_input"
        />
      </div>

      <button
        class="search_btn"
        @click="handleSearch"
      >
        검색
      </button>

    </div>
  </div>

  <!-- 탭 -->
  <div class="tab_row">

    <button
      class="tab_btn"
      :class="{ active: settlementTab === 'store' }"
      @click="settlementTab = 'store'"
    >
      가게 정산
    </button>

    <button
      class="tab_btn"
      :class="{ active: settlementTab === 'rider' }"
      @click="settlementTab = 'rider'"
    >
      라이더 정산
    </button>

  </div>

</div>

<!-- 가게 정산 -->
<template v-if="settlementTab === 'store'">
       
          <!-- 가게 정산 테이블 -->
          <div class="table_wrap">
            <table class="settlement_table">
              <thead>
                <tr>
                  <th>가게명</th>
                  <th>정산 기간</th>
                  <th>총 주문금액</th>
                  <th>수수료 (5%)</th>
                  <th>실지급액</th>
                  <th>정산일</th>
                  <th>
                    <div class="th_dropdown_wrap">
                      상태
                      <span class="sort_arrow" @click.stop="tableStatusOpen = !tableStatusOpen">▼</span>
                      <div v-if="tableStatusOpen" class="th_dropdown_menu">
                        <button v-for="opt in statusOptions" :key="opt.label" class="dropdown_item" @click="filterByStatus(opt)">{{ opt.label }}</button>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="settlementList.length > 0">
                  <tr v-for="item in settlementList" :key="item.settlementId" class="clickable_row" @click="openDetail(item)">
                    <td>{{ targetName(item) }}</td>
                    <td>{{ item.periodStart }} ~ {{ item.periodEnd }}</td>
                    <td>{{ formatMoney(item.grossAmount) }}</td>
                    <td>{{ formatMoney(item.feeAmount) }}</td>
                    <td>{{ formatMoney(item.netAmount) }}</td>
                    <td>{{ item.periodEnd }}</td>
                    <td>
                      <span :class="['status_badge', statusBadge(item.status).class]">
                        {{ statusBadge(item.status).text }}
                      </span>
                    </td>
                  </tr>
                </template>
                <tr v-if="settlementList.length === 0">
                  <td colspan="7" class="empty_td">조회된 정산 내역이 없습니다.</td>
                </tr>
                <tr v-for="i in Math.max(0, 10 - settlementList.length)" :key="'e'+i" class="empty_row">
                  <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 페이지네이션 -->
          <div class="pagination">
            <button @click="currentPage > 1 && currentPage--">◀</button>
            <button
              v-for="p in totalPages"
              :key="p"
              :class="{ active: currentPage === p }"
              @click="currentPage = p"
            >{{ p }}</button>
            <button @click="currentPage < totalPages && currentPage++">▶</button>
          </div>
        </template>

        <!-- 라이더 정산 -->
        <template v-if="settlementTab === 'rider'">
          <div class="table_wrap">
            <table class="settlement_table">
              <thead>
                <tr>
                  <th>라이더 번호</th>
                  <th>정산 기간</th>
                  <th>배달 건수</th>
                  <th>총 배달료</th>
                  <th>수수료 (10%)</th>
                  <th>세금 (3.3%)</th>
                  <th>보험료</th>
                  <th>실수령액</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="riderSettlementList.length > 0">
                  <tr v-for="item in riderSettlementList" :key="item.settlementNo" class="clickable_row" @click="openRiderDetail(item)">
                    <td>{{ item.riderNo }}</td>
                    <td>{{ item.periodStart }} ~ {{ item.periodEnd }}</td>
                    <td>{{ item.deliveryCount }}건</td>
                    <td>{{ formatMoney((item.totalBaseFee ?? 0) + (item.totalExtraFee ?? 0)) }}</td>
                    <td>{{ formatMoney(item.commission) }}</td>
                    <td>{{ formatMoney(item.tax) }}</td>
                    <td>{{ formatMoney(item.insurance) }}</td>
                    <td>{{ formatMoney(item.payout) }}</td>
                    <td>
                      <span :class="['status_badge', statusBadge(item.status).class]">
                        {{ statusBadge(item.status).text }}
                      </span>
                    </td>
                    <td @click.stop>
                      <button v-if="item.status === 'PENDING'" class="confirm_btn" @click="confirmRiderSettlement(item.settlementNo)">확정</button>
                      <span v-else style="color:#aaa; font-size:12px;">완료</span>
                    </td>
                  </tr>
                </template>
                <tr v-if="riderSettlementList.length === 0">
                  <td colspan="10" class="empty_td">라이더 정산 내역이 없습니다.</td>
                </tr>
                <tr v-for="i in Math.max(0, 10 - riderSettlementList.length)" :key="'r'+i" class="empty_row">
                  <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>

    <!-- 가게 정산 상세 모달 -->
    <div v-if="showDetailModal && selectedSettlement" class="modal_overlay" @click.self="closeDetail">
      <div class="modal">
        <div class="modal_header">
          <div class="modal_title_row">
            <span class="modal_title">정산 상세 - {{ targetName(selectedSettlement) }}</span>
          </div>
          <button class="modal_close" @click="closeDetail">✕</button>
        </div>

        <div class="modal_summary">
          <div class="modal_info_card">
            <div class="modal_icon_area blue_icon_area">
              <img src="@/assets/calendar-check.png" alt="calendar" class="modal_icon_img" />
            </div>
            <span class="modal_card_text">정산 기간: {{ selectedSettlement.periodStart }} ~ {{ selectedSettlement.periodEnd }}</span>
          </div>
          <div class="modal_info_card">
            <div class="modal_icon_area green_icon_area">
              <img src="@/assets/money-bag.png" alt="moneybag" class="modal_icon_img" />
            </div>
            <span class="modal_card_text">최종 정산액: {{ formatMoney(selectedSettlement.netAmount) }}</span>
          </div>
        </div>

            <!-- 기존 주문건별 상세 내역 테이블 교체 -->
            <p class="modal_sub_title">날짜별 매출 내역</p>
              <div class="modal_table_wrap">
                <table class="modal_table">
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
                        <td>{{ formatMoney(row.amount) }}</td>
                      </tr>
                    </template>
                    <tr v-else>
                      <td colspan="3" class="empty_td">주문 내역이 없습니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="modal_total_wrap">
                <div class="modal_total_row">
                  <span class="total_label">총 매출</span>
                  <span class="total_value">{{ formatMoney(selectedSettlement.grossAmount) }}</span>
                </div>
                <div class="modal_total_row">
                  <span class="total_label">수수료 (5%)</span>
                  <span class="total_value fee_color">- {{ formatMoney(selectedSettlement.feeAmount) }}</span>
                </div>
                <div class="modal_total_row total_final">
                  <span class="total_label">실 지급액</span>
                  <span class="total_value final_color">{{ formatMoney(selectedSettlement.netAmount) }}</span>
                </div>
              </div>

            <!-- 지급 정보 -->
        <div class="modal_payout_wrap">
          <p class="modal_sub_title">지급 정보</p>
          <div class="modal_payout_grid">
            <div class="payout_row">
              <span class="payout_label">입금 계좌</span>
              <span class="payout_value">{{ selectedSettlement.bankAccount ?? '-' }}</span>
            </div>
            <div class="payout_row">
              <span class="payout_label">입금 예정일</span>
              <span class="payout_value">
                {{ selectedSettlement.status === 'PENDING'
                  ? expectedPayoutDate(selectedSettlement.periodEnd)
                  : selectedSettlement.paidAt
                    ? selectedSettlement.paidAt.toString().substring(0, 10) + ' 입금 완료'
                    : '-' }}
              </span>
            </div>
            <div class="payout_row">
              <span class="payout_label">정산 방식</span>
              <span class="payout_value">토스페이먼츠 지급대행</span>
            </div>
            <div class="payout_row">
              <span class="payout_label">정산 상태</span>
              <span :class="['status_badge', statusBadge(selectedSettlement.status).class]">
                {{ statusBadge(selectedSettlement.status).text }}
              </span>
            </div>
            <div v-if="selectedSettlement.tossPayoutId" class="payout_row">
              <span class="payout_label">지급 ID</span>
              <span class="payout_value toss_id">{{ selectedSettlement.tossPayoutId }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedSettlement.status === 'PENDING'" class="modal_actions">
          <button class="action_hold" @click="holdSettlement(selectedSettlement.settlementId)">보류</button>
          <button class="action_complete" @click="completeSettlement(selectedSettlement.settlementId)">정산 완료</button>
        </div>
        <div v-else-if="selectedSettlement.status === 'HELD'" class="modal_actions">
          <button class="action_release" @click="releaseHold(selectedSettlement.settlementId)">보류 해제</button>
          <button class="action_complete" @click="completeSettlement(selectedSettlement.settlementId)">정산 완료</button>
        </div>
      </div>
    </div>

    <!-- 라이더 정산 상세 모달 -->
    <div v-if="showRiderDetailModal && selectedRiderSettlement" class="modal_overlay" @click.self="closeRiderDetail">
      <div class="modal">
        <div class="modal_header">
          <div class="modal_title_row">
            <span class="modal_title">라이더 정산 상세 - 라이더 #{{ selectedRiderSettlement.riderNo }}</span>
          </div>
          <button class="modal_close" @click="closeRiderDetail">✕</button>
        </div>

        <div class="modal_summary">
          <div class="modal_info_card">
            <div class="modal_icon_area blue_icon_area">
              <img src="@/assets/calendar-check.png" alt="calendar" class="modal_icon_img" />
            </div>
            <span class="modal_card_text">정산 기간: {{ selectedRiderSettlement.periodStart }} ~ {{ selectedRiderSettlement.periodEnd }}</span>
          </div>
          <div class="modal_info_card">
            <div class="modal_icon_area green_icon_area">
              <img src="@/assets/money-bag.png" alt="moneybag" class="modal_icon_img" />
            </div>
            <span class="modal_card_text">실수령액: {{ formatMoney(selectedRiderSettlement.payout) }}</span>
          </div>
        </div>

        <p class="modal_sub_title">배달 실적</p>
        <div class="modal_table_wrap">
          <table class="modal_table">
            <thead>
              <tr>
                <th>배달 건수</th>
                <th>총 이동거리</th>
                <th>기본 배달료</th>
                <th>추가 배달료</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ selectedRiderSettlement.deliveryCount ?? 0 }}건</td>
                <td>{{ ((selectedRiderSettlement.totalDistanceM ?? 0) / 1000).toFixed(2) }} km</td>
                <td>{{ formatMoney(selectedRiderSettlement.totalBaseFee) }}</td>
                <td>{{ formatMoney(selectedRiderSettlement.totalExtraFee) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal_total_wrap">
          <div class="modal_total_row">
            <span class="total_label">총 배달료</span>
            <span class="total_value">{{ formatMoney((selectedRiderSettlement.totalBaseFee ?? 0) + (selectedRiderSettlement.totalExtraFee ?? 0)) }}</span>
          </div>
          <div class="modal_total_row">
            <span class="total_label">수수료 (10%)</span>
            <span class="total_value fee_color">- {{ formatMoney(selectedRiderSettlement.commission) }}</span>
          </div>
          <div class="modal_total_row">
            <span class="total_label">세금 (3.3%)</span>
            <span class="total_value fee_color">- {{ formatMoney(selectedRiderSettlement.tax) }}</span>
          </div>
          <div class="modal_total_row">
            <span class="total_label">보험료</span>
            <span class="total_value fee_color">- {{ formatMoney(selectedRiderSettlement.insurance) }}</span>
          </div>
          <div class="modal_total_row total_final">
            <span class="total_label">실수령액</span>
            <span class="total_value final_color">{{ formatMoney(selectedRiderSettlement.payout) }}</span>
          </div>
        </div>

        <div class="modal_payout_wrap">
          <p class="modal_sub_title">상태 정보</p>
          <div class="modal_payout_grid">
            <div class="payout_row">
              <span class="payout_label">정산 상태</span>
              <span :class="['status_badge', statusBadge(selectedRiderSettlement.status).class]">
                {{ statusBadge(selectedRiderSettlement.status).text }}
              </span>
            </div>
            <div v-if="selectedRiderSettlement.confirmedAt" class="payout_row">
              <span class="payout_label">확정일</span>
              <span class="payout_value">{{ selectedRiderSettlement.confirmedAt.toString().substring(0, 10) }}</span>
            </div>
            <div v-if="selectedRiderSettlement.paidAt" class="payout_row">
              <span class="payout_label">지급일</span>
              <span class="payout_value">{{ selectedRiderSettlement.paidAt.toString().substring(0, 10) }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedRiderSettlement.status === 'PENDING'" class="modal_actions">
          <button class="action_complete" @click="confirmRiderSettlement(selectedRiderSettlement.settlementNo)">정산 확정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Noto Sans KR', sans-serif; }
.main_content { margin-left: 240px; flex: 1; display: flex; flex-direction: column; }
.content {
  padding: 36px 60px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
}
.page_title { font-size: 20px; font-weight: 700; color: #222; margin: 0; }
.section_title { font-size: 20px; font-weight: 700; color: #222; margin-bottom: -8px; margin-top: 10px; }
.summary_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.summary_card { border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 10px rgba(0,0,0,0.08); background: #fff; margin-bottom: 20px; }
.card_main { display: flex; align-items: stretch; flex: 1; }
.icon_area { display: flex; align-items: center; justify-content: center; padding: 20px 18px; flex-shrink: 0; }
.blue_area { background: #4a90d9; }
.green_area { background: #4caf50; }
.yellow_area { background: #f5a623; }
.card_img { width: 56px; height: auto; }
.card_info { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 20px 20px; }
.card_label { font-size: 13px; color: #888; font-weight: 500; }
.card_value { font-size: 24px; font-weight: 800; }
.blue_val { color: #222; }
.card_info_dual { justify-content: space-around; gap: 0; padding: 14px 16px; }
.dual_section { display: flex; flex-direction: column; gap: 4px; }
.dual_divider { border-top: 1px dashed #d0e4f7; margin: 6px 0; }
.card_value_sm { font-size: 18px; font-weight: 800; }
.card_monthly_val { color: #4a90d9; }
.green_val { color: #4caf50; }
.yellow_val { color: #f5a623; }
.card_sub_bar { padding: 9px 20px; font-size: 12px; text-align: center; font-weight: 500; }
.blue_sub { background: #ddeeff; color: #2c6fbb; }
.green_sub { background: #ddf5dd; color: #2e7d32; }
.yellow_sub { background: #fff3d6; color: #b07800; }
.tab_row { display: flex; gap: 8px; }
.top_control_row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
  margin-bottom: 4px;
}
.tab_row { display: flex; gap: 8px; margin-left: auto;}
.search_box { background: transparent; padding: 0;}
.tab_btn { padding: 6px 18px; border: 1px solid #ddd; background: #fff; border-radius: 6px; font-size: 13px; color: #666; cursor: pointer; font-weight: 500; }
.tab_btn.active { background: #9b1b1b; border-color: #9b1b1b; color: #fff; font-weight: 700; }
.search_row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dropdown_btn,
.keyword_input,
.search_btn,
.tab_btn {
  height: 40px;
  box-sizing: border-box;
}
.search_field {
  display: flex;
  align-items: center;
}
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 7px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 120px; }
.dropdown_btn:hover { border-color: #aaa; }
.dropdown_arrow { font-size: 10px; color: #999; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 120px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 9px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown_item:hover { background: #f5f5f5; }
.keyword_input { border: 1px solid #ddd; border-radius: 6px; padding: 7px 10px; font-size: 13px; color: #333; outline: none; min-width: 160px; }
.search_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 0 20px; font-size: 13px; font-weight: 600; cursor: pointer; }
.search_btn:hover { background: #7f1515; }
.table_wrap { background: #fff; border-radius: 10px; overflow: hidden; }
.settlement_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.settlement_table thead tr { background: #e8e8e8; }
.settlement_table th { padding: 12px 14px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; white-space: nowrap; }
.settlement_table th:last-child { border-right: none; }
.settlement_table td { padding: 11px 14px; text-align: center; color: #333; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
.settlement_table td:last-child { border-right: none; }
.clickable_row { cursor: pointer; transition: background 0.1s; }
.clickable_row:hover { background: #fafafa; }
.empty_row td { height: 38px; }
.empty_td { color: #aaa; padding: 24px; text-align: center; }
.th_dropdown_wrap { position: relative; display: flex; align-items: center; justify-content: center; gap: 4px; }
.sort_arrow { font-size: 10px; color: #999; cursor: pointer; padding: 2px 4px; border-radius: 3px; }
.sort_arrow:hover { background: #ddd; }
.th_dropdown_menu { position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 110px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); z-index: 30; overflow: hidden; }
.type_badge { border-radius: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #fff; white-space: nowrap; }
.badge_store { background: #7150db; }
.badge_rider { background: #4caf50; }
.status_badge { border-radius: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge_complete { background: #e0e0e0; color: #555; }
.badge_pending { background: #f5a623; color: #fff; }
.badge_hold { background: #cc1f1f; color: #fff; }
.confirm_btn { background: #4a90d9; border: none; color: #fff; border-radius: 4px; padding: 4px 12px; font-size: 11px; cursor: pointer; font-weight: 600; }
.confirm_btn:hover { background: #2c6faa; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 0; }
.pagination button { background: none; border: none; font-size: 13px; color: #666; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.pagination button.active { font-weight: 700; color: #cc1f1f; }
.pagination button:hover { background: #f0f0f0; }
.modal_overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 700px; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; }
.modal_header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 16px; border-bottom: 1px solid #eee; }
.modal_title_row { display: flex; align-items: center; gap: 10px; }
.modal_title { font-size: 18px; font-weight: 700; color: #222; }
.modal_close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; padding: 4px 8px; }
.modal_close:hover { color: #333; }
.modal_summary { display: flex; gap: 12px; padding: 20px 28px; }
.modal_info_card { display: flex; align-items: stretch; border-radius: 10px; overflow: hidden; border: 1px solid #eee; flex: 1; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.modal_icon_area { display: flex; align-items: center; justify-content: center; padding: 10px 16px; flex-shrink: 0; }
.blue_icon_area { background: #4a90d9; }
.green_icon_area { background: #4caf50; }
.modal_icon_img { width: 28px; height: auto; }
.modal_card_text { display: flex; align-items: center; padding: 0 18px; font-size: 13px; font-weight: 600; color: #333; }
.modal_sub_title { font-size: 14px; font-weight: 700; color: #222; padding: 4px 28px 10px; }
.modal_table_wrap { padding: 0 28px; overflow-x: auto; }
.modal_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.modal_table thead tr { background: #f0f0f0; }
.modal_table th { padding: 10px 8px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; }
.modal_table td { padding: 10px 8px; text-align: center; color: #333; border-bottom: 1px solid #f5f5f5; }
.modal_total_wrap { margin: 16px 28px 0; padding: 16px 0 20px; border-top: 1px solid #eee; display: flex; flex-direction: column; gap: 10px; }
.modal_total_row { display: flex; justify-content: space-between; align-items: center; }
.total_label { font-size: 13px; color: #666; font-weight: 500; }
.total_value { font-size: 13px; font-weight: 600; color: #333; }
.fee_color { color: #cc1f1f; }
.total_final { border-top: 1px solid #eee; padding-top: 10px; margin-top: 4px; }
.final_color { font-size: 15px; font-weight: 800; color: #222; }
.modal_actions { display: flex; gap: 10px; padding: 20px 28px; justify-content: flex-end; }
.action_hold { padding: 9px 24px; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; font-weight: 500; }
.action_hold:hover { background: #f5f5f5; }
.action_release { padding: 9px 24px; border: 1px solid #f5a623; background: #fff; border-radius: 8px; font-size: 13px; color: #f5a623; cursor: pointer; font-weight: 600; }
.action_release:hover { background: #fff8ee; }
.action_complete { padding: 9px 24px; border: none; background: #9b1b1b; border-radius: 8px; font-size: 13px; color: #fff; cursor: pointer; font-weight: 700; }
.action_complete:hover { background: #7f1515; }
.modal_payout_wrap { padding: 0 0 20px; }
.modal_payout_grid { display: flex; flex-direction: column; gap: 10px; background: #f9f9f9; border-radius: 10px; padding: 16px 28px; }
.payout_row { display: flex; justify-content: space-between; align-items: center; }
.payout_label { font-size: 13px; color: #888; font-weight: 500; }
.payout_value { font-size: 13px; font-weight: 600; color: #333; }
.bank_edit_wrap { display: flex; align-items: center; gap: 8px; }
.bank_input { border: 1px solid #ddd; border-radius: 6px; padding: 5px 10px; font-size: 13px; color: #333; outline: none; min-width: 200px; }
.bank_input:focus { border-color: #9b1b1b; }
.bank_save_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.bank_save_btn:hover { background: #7f1515; }
.bank_save_btn:disabled { background: #ccc; cursor: not-allowed; }
.toss_id { font-size: 11px; color: #aaa; font-family: monospace; }
</style>