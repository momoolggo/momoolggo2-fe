<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

const summary = ref({
  expectedAmount: 0,
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

const searchForm = ref({
  startDate: '2026-04-06',
  endDate: '2026-04-12',
  targetType: null,
  status: null,
  keyword: '',
})

const onStartDateChange = (e) => { searchForm.value.startDate = e.target.value }
const onEndDateChange = (e) => { searchForm.value.endDate = e.target.value }

const targetTypeOpen = ref(false)
const targetTypeOptions = [
  { label: '전체', value: null },
  { label: '사장님(가게)', value: 'STORE' },
  { label: '라이더', value: 'RIDER' },
]
const selectedTargetLabel = ref('사장님(가게)')
const selectTargetType = (opt) => {
  searchForm.value.targetType = opt.value
  selectedTargetLabel.value = opt.label
  targetTypeOpen.value = false
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
const tableTypeOpen = ref(false)

const filterByStatus = (opt) => {
  searchForm.value.status = opt.value
  selectedStatusLabel.value = opt.label
  tableStatusOpen.value = false
}

const filterByType = (opt) => {
  searchForm.value.targetType = opt.value
  selectedTargetLabel.value = opt.label
  tableTypeOpen.value = false
}

const filteredList = computed(() => {
  return settlementList.value.filter(item => {
    const typeMatch = !searchForm.value.targetType || item.targetType === searchForm.value.targetType
    const statusMatch = !searchForm.value.status || item.status === searchForm.value.status
    const keywordMatch = !searchForm.value.keyword || targetName(item).includes(searchForm.value.keyword)
    return typeMatch && statusMatch && keywordMatch
  })
})

const currentPage = ref(1)
const totalPages = ref(3)

const statusBadge = (status) => {
  const map = {
    COMPLETED: { text: '완료', class: 'badge_complete' },
    PENDING: { text: '대기', class: 'badge_pending' },
    HOLD: { text: '보류', class: 'badge_hold' },
  }
  return map[status] ?? { text: status, class: '' }
}

const formatMoney = (v) => v != null ? `₩${v.toLocaleString()}` : '-'
const targetTypeLabel = (type) => type === 'STORE' ? '사장' : type === 'RIDER' ? '라이더' : type
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
    const params = {}
    if (searchForm.value.startDate) params.startDate = searchForm.value.startDate
    if (searchForm.value.endDate) params.endDate = searchForm.value.endDate
    const res = await adminService.getSettlementList(params)
    settlementList.value = res?.resultData ?? []
  } catch (e) {
    settlementList.value = [
      { settlementId: 1, targetType: 'STORE', targetNo: 1, targetName: '숨은집(대구 중구)', grossAmount: 1520000, feeAmount: 152000, netAmount: 1368000, periodEnd: '2026-04-13', status: 'COMPLETED' },
      { settlementId: 2, targetType: 'RIDER', targetNo: 1, targetName: '김그린(라이더)', grossAmount: 880000, feeAmount: 88000, netAmount: 792000, periodEnd: '2026-04-13', status: 'COMPLETED' },
      { settlementId: 3, targetType: 'STORE', targetNo: 2, targetName: '마왕 족발(대구 북구)', grossAmount: 2220000, feeAmount: 220000, netAmount: 1980000, periodEnd: '2026-04-13', status: 'PENDING' },
      { settlementId: 4, targetType: 'RIDER', targetNo: 2, targetName: '김블루(라이더)', grossAmount: 1200000, feeAmount: 120000, netAmount: 1080000, periodEnd: '2026-04-13', status: 'PENDING' },
    ]
  } finally {
    loading.value = false
  }
}

const openDetail = async (item) => {
  try {
    const res = await adminService.getSettlementDetail(item.settlementId)
    selectedSettlement.value = res?.resultData ?? item
  } catch (e) {
    selectedSettlement.value = {
      ...item,
      periodStart: '2026-04-06',
      periodEnd: '2026-04-12',
      netAmount: item.netAmount ?? 1300000,
      orders: [
        { orderNo: '000001A', datetime: '2026-04-10 15:26PM', menu: '파스타 외 2', total: 36000, fee: 1500 },
        { orderNo: '000001A', datetime: '2026-04-08 15:26PM', menu: '피자 외 3', total: 36000, fee: 1500 },
        { orderNo: '000001A', datetime: '2026-04-07 15:26PM', menu: '파스타 외 2', total: 36000, fee: 1500 },
        { orderNo: '000001A', datetime: '2026-04-06 12:35PM', menu: '피자 외 1', total: 36000, fee: 1500 },
      ]
    }
  }
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedSettlement.value = null
}

const completeSettlement = async (settlementId) => {
  try {
    await adminService.completeSettlement(settlementId)
    await fetchList()
    closeDetail()
  } catch (e) { alert('처리 실패') }
}

const holdSettlement = async (settlementId) => {
  try {
    await adminService.holdSettlement(settlementId)
    await fetchList()
    closeDetail()
  } catch (e) { alert('처리 실패') }
}

onMounted(() => {
  fetchSummary()
  fetchList()
})

const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />
    <div class="main_content">
      <AdminHeader />

      <div class="content">
        <h2 class="page_title">정산 관리</h2>

        <!-- 요약 카드 -->
        <div class="summary_grid">
          <div class="summary_card">
            <div class="card_main">
              <div class="icon_area blue_area">
                <img src="@/assets/calculator.png" alt="calculator" class="card_img" />
              </div>
              <div class="card_info">
                <p class="card_label">총 정산 예정액</p>
                <p class="card_value blue_val">{{ formatMoney(summary.expectedAmount) }}</p>
              </div>
            </div>
            <div class="card_sub_bar blue_sub">이번 주 총 예정액</div>
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
                <p class="card_value yellow_val">{{ summary.pendingCount }}건</p>
              </div>
            </div>
            <div class="card_sub_bar yellow_sub">
              확인 필요 (라이더 {{ summary.pendingRiderCount }}, 가게 {{ summary.pendingStoreCount }})
            </div>
          </div>
        </div>

        <div class="section_title">정산 상세 내역</div>

        <!-- 검색 필터 -->
        <div class="search_box">
          <div class="search_row">
            <div class="search_field">
              <label>기간 선택</label>
              <div class="date_range">
                <input type="date" class="visible_date" v-model="searchForm.startDate" @change="onStartDateChange" />
                <span class="date_sep">~</span>
                <input type="date" class="visible_date" v-model="searchForm.endDate" @change="onEndDateChange" />
              </div>
            </div>

            <div class="search_field">
              <label>대상 구분</label>
              <div class="dropdown_wrap">
                <button class="dropdown_btn" @click="targetTypeOpen = !targetTypeOpen">
                  {{ selectedTargetLabel }}<span class="dropdown_arrow">▼</span>
                </button>
                <div v-if="targetTypeOpen" class="dropdown_menu">
                  <button v-for="opt in targetTypeOptions" :key="opt.label" class="dropdown_item" @click="selectTargetType(opt)">{{ opt.label }}</button>
                </div>
              </div>
            </div>

            <div class="search_field">
              <label>정산 상태</label>
              <div class="dropdown_wrap">
                <button class="dropdown_btn" @click="statusOpen = !statusOpen">
                  {{ selectedStatusLabel }}<span class="dropdown_arrow">▼</span>
                </button>
                <div v-if="statusOpen" class="dropdown_menu">
                  <button v-for="opt in statusOptions" :key="opt.label" class="dropdown_item" @click="selectStatus(opt)">{{ opt.label }}</button>
                </div>
              </div>
            </div>

            <div class="search_field">
              <label>&nbsp;</label>
              <input v-model="searchForm.keyword" type="text" placeholder="가게명 / 라이더 검색" class="keyword_input" />
            </div>

            <button class="search_btn" @click="handleSearch">검색</button>
          </div>
        </div>

        <!-- 테이블 -->
        <div class="table_wrap">
          <table class="settlement_table">
            <thead>
              <tr>
                <th>대상자(가게/라이더)</th>
                <th>
                  <div class="th_dropdown_wrap">
                    정산 유형
                    <span class="sort_arrow" @click.stop="tableTypeOpen = !tableTypeOpen">▼</span>
                    <div v-if="tableTypeOpen" class="th_dropdown_menu">
                      <button v-for="opt in targetTypeOptions" :key="opt.label" class="dropdown_item" @click="filterByType(opt)">{{ opt.label }}</button>
                    </div>
                  </div>
                </th>
                <th>총 금액</th>
                <th>수수료</th>
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
              <template v-if="filteredList.length > 0">
                <tr v-for="item in filteredList" :key="item.settlementId" class="clickable_row" @click="openDetail(item)">
                  <td>{{ targetName(item) }}</td>
                  <td>
                    <span :class="['type_badge', item.targetType === 'STORE' ? 'badge_store' : 'badge_rider']">
                      {{ targetTypeLabel(item.targetType) }}
                    </span>
                  </td>
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
              <tr v-if="filteredList.length === 0">
                <td colspan="7" class="empty_td">조회된 정산 내역이 없습니다.</td>
              </tr>
              <tr v-for="i in Math.max(0, 10 - filteredList.length)" :key="'e'+i" class="empty_row">
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination">
          <button @click="currentPage > 1 && currentPage--">◀</button>
          <button v-for="p in totalPages" :key="p" :class="{ active: currentPage === p }" @click="currentPage = p">{{ p }}</button>
          <button @click="currentPage < totalPages && currentPage++">▶</button>
        </div>
      </div>
    </div>

    <!-- 정산 상세 모달 -->
    <div v-if="showDetailModal && selectedSettlement" class="modal_overlay" @click.self="closeDetail">
      <div class="modal">
        <div class="modal_header">
          <div class="modal_title_row">
            <span class="modal_title">정산 상세 - {{ targetName(selectedSettlement) }}</span>
          </div>
          <button class="modal_close" @click="closeDetail">✕</button>
        </div>

        <!-- 피그마 스타일 모달 카드 -->
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

        <p class="modal_sub_title">주문 건별 상세 내역</p>

        <div class="modal_table_wrap">
          <table class="modal_table">
            <thead>
              <tr>
                <th>주문 번호</th>
                <th>일시</th>
                <th>메뉴</th>
                <th>총 결제액</th>
                <th>수수료</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="selectedSettlement.orders?.length > 0">
                <tr v-for="(order, idx) in selectedSettlement.orders" :key="idx">
                  <td>{{ order.orderNo }}</td>
                  <td>{{ order.datetime }}</td>
                  <td>{{ order.menu }}</td>
                  <td>₩{{ order.total?.toLocaleString() }}</td>
                  <td><span class="fee_text">수수료(5%)<br />{{ order.fee?.toLocaleString() }}₩</span></td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="5" class="empty_td">주문 내역이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="selectedSettlement.status === 'PENDING'" class="modal_actions">
          <button class="action_hold" @click="holdSettlement(selectedSettlement.settlementId)">보류</button>
          <button class="action_complete" @click="completeSettlement(selectedSettlement.settlementId)">정산 완료</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Noto Sans KR', sans-serif; }
.main_content { margin-left: 190px; flex: 1; display: flex; flex-direction: column; }
.content { padding: 36px 60px; display: flex; flex-direction: column; gap: 20px; }
.page_title { font-size: 20px; font-weight: 700; color: #222; margin: 0; }
.section_title { font-size: 20px; font-weight: 700; color: #222; margin-bottom: -8px; margin-top: 10px; }

/* 요약 카드 */
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
.green_val { color: #4caf50; }
.yellow_val { color: #f5a623; }
.card_sub_bar { padding: 9px 20px; font-size: 12px; text-align: center; font-weight: 500; }
.blue_sub { background: #ddeeff; color: #2c6fbb; }
.green_sub { background: #ddf5dd; color: #2e7d32; }
.yellow_sub { background: #fff3d6; color: #b07800; }

/* 검색 */
.search_box { background: #fff; border-radius: 10px; padding: 20px 24px; }
.search_row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.search_field { display: flex; flex-direction: column; gap: 6px; }
.search_field label { font-size: 12px; color: #666; font-weight: 500; }
.date_range { display: flex; align-items: center; gap: 6px; }
.date_sep { color: #999; font-size: 13px; }
.visible_date { border: 1px solid #ddd; border-radius: 6px; padding: 7px 10px; font-size: 13px; color: #333; outline: none; cursor: pointer; }
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 7px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 120px; }
.dropdown_btn:hover { border-color: #aaa; }
.dropdown_arrow { font-size: 10px; color: #999; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 120px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 9px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown_item:hover { background: #f5f5f5; }
.keyword_input { border: 1px solid #ddd; border-radius: 6px; padding: 7px 10px; font-size: 13px; color: #333; outline: none; min-width: 160px; }
.search_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; height: 34px; align-self: flex-end; }
.search_btn:hover { background: #7f1515; }

/* 테이블 */
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
.badge_store { background: #4a90d9; }
.badge_rider { background: #4caf50; }
.status_badge { border-radius: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge_complete { background: #e0e0e0; color: #555; }
.badge_pending { background: #f5a623; color: #fff; }
.badge_hold { background: #cc1f1f; color: #fff; }

/* 페이지네이션 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 0; }
.pagination button { background: none; border: none; font-size: 13px; color: #666; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.pagination button.active { font-weight: 700; color: #cc1f1f; }
.pagination button:hover { background: #f0f0f0; }

/* 모달 */
.modal_overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 700px; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; }
.modal_header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 16px; border-bottom: 1px solid #eee; }
.modal_title_row { display: flex; align-items: center; gap: 10px; }
.modal_title { font-size: 18px; font-weight: 700; color: #222; }
.modal_close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; padding: 4px 8px; }
.modal_close:hover { color: #333; }

/* 모달 요약 카드 - 피그마 스타일 */
.modal_summary { display: flex; gap: 12px; padding: 20px 28px; }

.modal_info_card {
  display: flex;
  align-items: stretch;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eee;
  flex: 1;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.modal_icon_area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  flex-shrink: 0;
}

.blue_icon_area { background: #4a90d9; }
.green_icon_area { background: #4caf50; }

.modal_icon_img { width: 28px; height: auto; }

.modal_card_text {
  display: flex;
  align-items: center;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.modal_sub_title { font-size: 14px; font-weight: 700; color: #222; padding: 4px 28px 10px; }
.modal_table_wrap { padding: 0 28px; overflow-x: auto; }
.modal_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.modal_table thead tr { background: #f0f0f0; }
.modal_table th { padding: 10px 12px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; }
.modal_table td { padding: 10px 12px; text-align: center; color: #333; border-bottom: 1px solid #f5f5f5; }
.fee_text { font-size: 11px; color: #888; line-height: 1.5; }
.modal_actions { display: flex; gap: 10px; padding: 20px 28px; justify-content: flex-end; }
.action_hold { padding: 9px 24px; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; font-weight: 500; }
.action_hold:hover { background: #f5f5f5; }
.action_complete { padding: 9px 24px; border: none; background: #9b1b1b; border-radius: 8px; font-size: 13px; color: #fff; cursor: pointer; font-weight: 700; }
.action_complete:hover { background: #7f1515; }
</style>