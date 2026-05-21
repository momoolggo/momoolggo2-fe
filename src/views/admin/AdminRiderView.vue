<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

/**
 * 라이더 관리 + 라이더 정산 통합 화면 (Group 8 신설 2026-05-17, Q-A14.b (3) + Q-A21 (가)).
 *
 * 탭 1 "관리": rider.status 필터 (PENDING/ACTIVE/EATING/SUSPENDED) + 승인/제재 (Q-A1 (라++) §3.1/§3.2/§3.5)
 * 탭 2 "정산": rider DB PENDING 정산 (Group 5/5.5, Q-A10.a (옵션 1) — admin DB Settlement과 결 분리)
 *
 * case-#34 FE 변종 강제: BE DTO 1:1 매핑 (RiderProfileRes 9 / RiderSettlementRowRes 15).
 * adminService.js #url 하드코딩 (Q-A23, Phase 6+ env 분리 tech-debt).
 */

const activeTab = ref('manage')  // 'manage' | 'settlement'

// ─── 탭 1 관리 ───
const statusOpen = ref(false)
const statusOptions = [
  { label: '전체', value: null },
  { label: '승인 대기 (PENDING)', value: 'PENDING' },
  { label: '활성 (ACTIVE)', value: 'ACTIVE' },
  { label: '식사중 (EATING)', value: 'EATING' },
  { label: '제재 (SUSPENDED)', value: 'SUSPENDED' },
]
const selectedStatusLabel = ref('전체')
const statusFilter = ref(null)

const riderList = ref([])
const loading = ref(false)

const selectStatus = (opt) => {
  statusFilter.value = opt.value
  selectedStatusLabel.value = opt.label
  statusOpen.value = false
  loadRiders()
}

const loadRiders = async () => {
  loading.value = true
  try {
    const res = await adminService.getRiderList(statusFilter.value)
    riderList.value = res.resultData || res || []
  } catch (e) {
    console.error('라이더 목록 조회 실패:', e)
    riderList.value = []
  } finally {
    loading.value = false
  }
}

// 승인 / 제재 모달
const showSuspendModal = ref(false)
const suspendTarget = ref(null)
const suspendReason = ref('')

const ADMIN_NO = 1  // TODO: SecurityContext / userStore에서 추출

const handleApprove = async (rider) => {
  if (!confirm(`라이더 #${rider.riderNo} 승인하시겠습니까?`)) return
  try {
    await adminService.approveRider(rider.riderNo, ADMIN_NO)
    alert('승인 완료')
    loadRiders()
  } catch (e) {
    alert('승인 실패: ' + (e.response?.data?.resultMessage || e.message))
  }
}

const openSuspendModal = (rider) => {
  suspendTarget.value = rider
  suspendReason.value = ''
  showSuspendModal.value = true
}

const handleSuspend = async () => {
  if (!suspendReason.value.trim()) {
    alert('제재 사유를 입력하세요.')
    return
  }
  try {
    await adminService.suspendRider(suspendTarget.value.riderNo, ADMIN_NO, suspendReason.value)
    alert('제재 완료')
    showSuspendModal.value = false
    loadRiders()
  } catch (e) {
    alert('제재 실패: ' + (e.response?.data?.resultMessage || e.message))
  }
}

const statusLabel = (status) => {
  const map = { PENDING: '승인 대기', ACTIVE: '활성', EATING: '식사중', SUSPENDED: '제재' }
  return map[status] || status
}

const statusClass = (status) => {
  return `status-${status?.toLowerCase()}`
}

// ─── 탭 2 정산 ───
const settlementList = ref([])
const settlementLoading = ref(false)

const showCalculateModal = ref(false)
const calculateForm = ref({
  periodStart: '',
  periodEnd: '',
})

const loadSettlementPending = async () => {
  settlementLoading.value = true
  try {
    const res = await adminService.getRiderSettlementPending()
    settlementList.value = res.resultData || res || []
  } catch (e) {
    console.error('정산 PENDING 목록 조회 실패:', e)
    settlementList.value = []
  } finally {
    settlementLoading.value = false
  }
}

const openCalculateModal = () => {
  // 기본값: 이번 주 월~일 (PENDING 재집계 허용 — admin 재트리거 시 진행 중 배달 즉시 반영)
  const today = new Date()
  const day = today.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const mon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMon)
  const sun = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMon + 6)
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  calculateForm.value.periodStart = fmt(mon)
  calculateForm.value.periodEnd = fmt(sun)
  showCalculateModal.value = true
}

const handleCalculate = async () => {
  if (!calculateForm.value.periodStart || !calculateForm.value.periodEnd) {
    alert('기간을 입력하세요.')
    return
  }
  try {
    await adminService.calculateRiderSettlement(
      calculateForm.value.periodStart,
      calculateForm.value.periodEnd
    )
    alert('정산 집계 완료')
    showCalculateModal.value = false
    loadSettlementPending()
  } catch (e) {
    alert('정산 집계 실패: ' + (e.response?.data?.resultMessage || e.message))
  }
}

const handleConfirm = async (settlement) => {
  if (!confirm(`정산 #${settlement.settlementNo} (라이더 ${settlement.riderNo}) 확정하시겠습니까?`)) return
  try {
    await adminService.confirmRiderSettlement(settlement.settlementNo, ADMIN_NO)
    alert('정산 확정 완료')
    loadSettlementPending()
  } catch (e) {
    alert('정산 확정 실패: ' + (e.response?.data?.resultMessage || e.message))
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'manage') loadRiders()
  else if (tab === 'settlement') loadSettlementPending()
}

onMounted(() => {
  loadRiders()
})
</script>

<template>
  <div class="layout">
    <AdminSidebar />
    <div class="content">
      <AdminHeader />
      <main class="main">
        <h1 class="page-title">라이더 관리</h1>

        <!-- 탭 -->
        <div class="tab-bar">
          <button
            class="tab"
            :class="{ active: activeTab === 'manage' }"
            @click="switchTab('manage')"
          >
            라이더 관리
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'settlement' }"
            @click="switchTab('settlement')"
          >
            정산 처리
          </button>
        </div>

        <!-- 탭 1: 관리 -->
        <section v-if="activeTab === 'manage'" class="tab-content">
          <div class="filter-bar">
            <div class="dropdown" @click="statusOpen = !statusOpen">
              <span>{{ selectedStatusLabel }}</span>
              <span class="arrow">▼</span>
              <ul v-if="statusOpen" class="dropdown-menu">
                <li
                  v-for="opt in statusOptions"
                  :key="opt.label"
                  @click.stop="selectStatus(opt)"
                >
                  {{ opt.label }}
                </li>
              </ul>
            </div>
            <button class="btn-refresh" @click="loadRiders">새로고침</button>
          </div>

          <div v-if="loading" class="loading">조회 중...</div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>userNo</th>
                <th>상태</th>
                <th>차량</th>
                <th>면허</th>
                <th>계좌</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="riderList.length === 0">
                <td colspan="7" class="empty">조회 결과 없음</td>
              </tr>
              <tr v-for="r in riderList" :key="r.riderNo">
                <td>{{ r.riderNo }}</td>
                <td>{{ r.userNo }}</td>
                <td><span class="status-badge" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span></td>
                <td>{{ r.vehicleType }}</td>
                <td>{{ r.licenseNo }}</td>
                <td>{{ r.accountBank }} {{ r.accountNo }}</td>
                <td class="actions">
                  <button
                    v-if="r.status === 'PENDING'"
                    class="btn-approve"
                    @click="handleApprove(r)"
                  >
                    승인
                  </button>
                  <button
                    v-if="r.status !== 'SUSPENDED'"
                    class="btn-suspend"
                    @click="openSuspendModal(r)"
                  >
                    제재
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 탭 2: 정산 -->
        <section v-if="activeTab === 'settlement'" class="tab-content">
          <div class="filter-bar">
            <button class="btn-primary" @click="openCalculateModal">주간 정산 집계</button>
            <button class="btn-refresh" @click="loadSettlementPending">새로고침</button>
          </div>

          <div v-if="settlementLoading" class="loading">조회 중...</div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>라이더</th>
                <th>기간</th>
                <th>건수</th>
                <th>총 배달료</th>
                <th>수수료</th>
                <th>세금</th>
                <th>보험</th>
                <th>지급액</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="settlementList.length === 0">
                <td colspan="10" class="empty">PENDING 정산 없음</td>
              </tr>
              <tr v-for="s in settlementList" :key="s.settlementNo">
                <td>{{ s.settlementNo }}</td>
                <td>{{ s.riderNo }}</td>
                <td>{{ s.periodStart }} ~ {{ s.periodEnd }}</td>
                <td>{{ s.deliveryCount }}</td>
                <td>{{ (s.totalBaseFee + s.totalExtraFee).toLocaleString() }}</td>
                <td>{{ s.commission?.toLocaleString() }}</td>
                <td>{{ s.tax?.toLocaleString() }}</td>
                <td>{{ s.insurance?.toLocaleString() }}</td>
                <td><strong>{{ s.payout?.toLocaleString() }}</strong></td>
                <td>
                  <button class="btn-approve" @click="handleConfirm(s)">확정</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 제재 모달 -->
        <div v-if="showSuspendModal" class="modal-backdrop" @click="showSuspendModal = false">
          <div class="modal" @click.stop>
            <h2>라이더 #{{ suspendTarget?.riderNo }} 제재</h2>
            <p>현재 상태: <strong>{{ statusLabel(suspendTarget?.status) }}</strong></p>
            <label>제재 사유:</label>
            <textarea v-model="suspendReason" rows="3" placeholder="제재 사유 입력 (필수)"></textarea>
            <div class="modal-actions">
              <button class="btn-suspend" @click="handleSuspend">제재 확정</button>
              <button class="btn-cancel" @click="showSuspendModal = false">취소</button>
            </div>
          </div>
        </div>

        <!-- calculate 모달 -->
        <div v-if="showCalculateModal" class="modal-backdrop" @click="showCalculateModal = false">
          <div class="modal" @click.stop>
            <h2>주간 정산 집계</h2>
            <label>시작일:</label>
            <input type="date" v-model="calculateForm.periodStart" />
            <label>종료일:</label>
            <input type="date" v-model="calculateForm.periodEnd" />
            <div class="modal-actions">
              <button class="btn-primary" @click="handleCalculate">집계 실행</button>
              <button class="btn-cancel" @click="showCalculateModal = false">취소</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout { display: flex; min-height: 100vh; }
.content { flex: 1; margin-left: 220px; }
.main { padding: 24px; }
.page-title { font-size: 24px; margin-bottom: 20px; }

.tab-bar { display: flex; gap: 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px; }
.tab { padding: 12px 24px; border: none; background: transparent; cursor: pointer; font-size: 16px; color: #666; }
.tab.active { color: #2563eb; border-bottom: 2px solid #2563eb; font-weight: 600; }

.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; }
.dropdown { position: relative; padding: 8px 16px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; min-width: 180px; display: flex; justify-content: space-between; }
.dropdown-menu { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #ccc; list-style: none; padding: 0; margin: 4px 0 0; z-index: 10; }
.dropdown-menu li { padding: 8px 16px; cursor: pointer; }
.dropdown-menu li:hover { background: #f3f4f6; }

.btn-refresh, .btn-primary, .btn-approve, .btn-suspend, .btn-cancel { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
.btn-refresh { background: #e5e7eb; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-approve { background: #10b981; color: #fff; margin-right: 4px; }
.btn-suspend { background: #ef4444; color: #fff; }
.btn-cancel { background: #6b7280; color: #fff; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 14px; }
.data-table th { background: #f9fafb; font-weight: 600; }
.empty { text-align: center; color: #9ca3af; padding: 40px !important; }
.loading { text-align: center; padding: 40px; color: #6b7280; }
.actions { white-space: nowrap; }

.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-active { background: #d1fae5; color: #065f46; }
.status-eating { background: #dbeafe; color: #1e40af; }
.status-suspended { background: #fee2e2; color: #991b1b; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; padding: 24px; border-radius: 8px; min-width: 400px; max-width: 500px; }
.modal h2 { margin-top: 0; }
.modal label { display: block; margin-top: 12px; margin-bottom: 4px; font-size: 14px; font-weight: 600; }
.modal textarea, .modal input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
.arrow { font-size: 10px; color: #6b7280; }
</style>
