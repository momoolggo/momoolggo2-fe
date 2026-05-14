<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

const activeTab = ref('all')
const userList = ref([])
const pendingList = ref([])
const loading = ref(false)

const today = new Date()
const formatDate = (d) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

const searchForm = ref({
  userId: '',
  name: '',
  startDate: formatDate(today),
  endDate: formatDate(today),
  category: '고객',
})

const categoryOpen = ref(false)
const categoryOptions = ['고객', '사장', '라이더']
const selectCategory = (val) => { searchForm.value.category = val; categoryOpen.value = false }

const startDateRef = ref(null)
const endDateRef = ref(null)

const onStartDateChange = (e) => {
  const [y, m, d] = e.target.value.split('-')
  searchForm.value.startDate = `${y}.${m}.${d}`
}
const onEndDateChange = (e) => {
  const [y, m, d] = e.target.value.split('-')
  searchForm.value.endDate = `${y}.${m}.${d}`
}

const currentPage = ref(1)
const totalPages = ref(3)

const statusLabel = (status) => {
  const map = { ACTIVE: '정상', SUSPENDED: '계정정지', PERMANENT: '영구정지', PENDING: '승인대기' }
  return map[status] ?? status
}
const statusBadgeClass = (status) => {
  const map = { ACTIVE: 'badge_active', SUSPENDED: 'badge_suspended', PERMANENT: 'badge_permanent', PENDING: 'badge_pending' }
  return map[status] ?? ''
}

const greenLabel = (green) => {
  if (green == null) return null
  if (green < 10) return { text: `${green}회 씨앗`, img: new URL('@/assets/seed.png', import.meta.url).href }
  if (green < 15) return { text: `${green}회 새싹`, img: new URL('@/assets/plant.png', import.meta.url).href }
  if (green < 40) return { text: `${green}회 나무`, img: new URL('@/assets/tree.png', import.meta.url).href }
  if (green < 62) return { text: `${green}회 숲`, img: new URL('@/assets/forest.png', import.meta.url).href }
  return { text: `${green}회 지구`, img: new URL('@/assets/earth.png', import.meta.url).href }
}

const roleLabel = (role) => {
  const map = { CUSTOMER: '고객', OWNER: '사장', RIDER: '라이더' }
  return map[role] ?? role
}
const roleBadgeClass = (role) => {
  const map = { CUSTOMER: 'badge_customer', OWNER: 'badge_owner', RIDER: 'badge_rider' }
  return map[role] ?? ''
}

//여기

const fetchUserList = async () => {
  loading.value = true
  try {
    const roleMap = { '고객': 'CUSTOMER', '사장': 'OWNER', '라이더': 'RIDER' }
    const role = roleMap[searchForm.value.category] ?? null
    const res = await adminService.getUserList(role, currentPage.value - 1)
    userList.value = res.resultData?.content ?? []
    totalPages.value = res.resultData?.totalPages ?? 1
  } catch {
    userList.value = []
  } finally {
    loading.value = false
  }
}

const fetchPendingList = async () => {
  loading.value = true
  try {
    const res = await adminService.getPendingUsers()
    pendingList.value = res.resultData ?? []
  } catch {
    pendingList.value = []
  } finally {
    loading.value = false
  }
}

const applySuspend = async () => {
  try {
    if (selectedSuspend.value === '정상') {
      await adminService.releaseSuspension(selectedUser.value.userNo)
    } else {
      const days = selectedSuspend.value === '계정 정지(30일)' ? 30 : 0
      await adminService.suspendUserByAdmin(selectedUser.value.userNo, days)
    }
    const idx = userList.value.findIndex(u => u.userNo === selectedUser.value.userNo)
    if (idx !== -1) {
      userList.value[idx].status = selectedSuspend.value === '계정 정지(30일)' ? 'SUSPENDED'
                                  : selectedSuspend.value === '계정 영구 정지' ? 'PERMANENT'
                                  : 'ACTIVE'
    }
    closeConfirmModal()
    closeDetail()
  } catch { alert('처리 실패') }
}

const approvePendingUser = async () => {
  if (!confirm('승인하시겠습니까?')) return
  try {
    await adminService.updateApproval(selectedPendingUser.value.userNo, 'ACTIVE')
    pendingList.value = pendingList.value.filter(u => u.userNo !== selectedPendingUser.value.userNo)
    closePendingDetail()
    handleTabChange('all')
  } catch { alert('처리 실패') }
}

const rejectPendingUser = async () => {
  if (!selectedRejectReason.value) { alert('반려 사유를 선택해주세요.'); return }
  if (!confirm('반려하시겠습니까?')) return
  try {
    await adminService.updateApproval(selectedPendingUser.value.userNo, 'REJECTED', selectedRejectReason.value)
    pendingList.value = pendingList.value.filter(u => u.userNo !== selectedPendingUser.value.userNo)
    closePendingDetail()
  } catch { alert('처리 실패') }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
  if (tab === 'all') fetchUserList()
  else fetchPendingList()
}

const handleSearch = () => { currentPage.value = 1; fetchUserList() }

// ── 고객 상세 모달
const showDetailModal = ref(false)
const selectedUser = ref(null)
const suspendOpen = ref(false)
const suspendOptions = ['정상', '계정 정지(30일)', '계정 영구 정지']
const selectedSuspend = ref('정상')

const openDetail = (user) => {
  selectedUser.value = user
  suspendOpen.value = false
  selectedSuspend.value = user.status === 'SUSPENDED' ? '계정 정지(30일)'
                        : user.status === 'PERMANENT' ? '계정 영구 정지'
                        : '정상'
  showDetailModal.value = true
}
const closeDetail = () => { showDetailModal.value = false; selectedUser.value = null }

// ── 상태변경 확인 모달
const showConfirmModal = ref(false)
const openConfirmModal = () => { showConfirmModal.value = true }
const closeConfirmModal = () => { showConfirmModal.value = false }


// ── 승인대기 상세 모달
const showPendingDetailModal = ref(false)
const selectedPendingUser = ref(null)
const rejectOpen = ref(false)
const selectedRejectReason = ref('')

const ownerRejectReasons = ['서류 정보가 불일치 합니다.', '서류 판독이 불가 합니다.', '미제출 서류를 확인해 주세요.', '이미 폐업된 사업자 입니다.']
const riderRejectReasons = ['서류 정보가 불일치 합니다.', '서류 판독이 불가 합니다.', '미제출 서류를 확인해 주세요.', '이미 만료된 보험입니다.']
const rejectReasons = (role) => role === 'OWNER' ? ownerRejectReasons : riderRejectReasons

const openPendingDetail = (user) => {
  selectedPendingUser.value = user
  rejectOpen.value = false
  selectedRejectReason.value = ''
  showPendingDetailModal.value = true
}
const closePendingDetail = () => { showPendingDetailModal.value = false; selectedPendingUser.value = null }

const openFile = (filename) => {
  window.open(`/files/${filename}`, '_blank')
}


onMounted(fetchUserList)
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />
    <div class="main_content">
      <AdminHeader />
      <div class="content">
        <h2 class="page_title">회원 리스트</h2>

        <!-- 검색 필터 -->
        <div class="search_box">
          <div class="search_row">
            <div class="search_field">
              <label>아이디</label>
              <input v-model="searchForm.userId" type="text" class="form_input" />
            </div>
            <div class="search_field">
              <label>이름</label>
              <input v-model="searchForm.name" type="text" class="form_input" />
            </div>
            <div class="search_field">
              <label>가입일</label>
              <div class="date_range">
                <div class="date_picker_wrap">
                  <img src="@/assets/calender.png" alt="calendar" class="blind_search_img" @click="startDateRef.showPicker()" />
                  <span class="date_text">{{ searchForm.startDate }}</span>
                  <input ref="startDateRef" type="date" class="hidden_date" @change="onStartDateChange" />
                </div>
                <span class="date_sep">-</span>
                <div class="date_picker_wrap">
                  <img src="@/assets/calender.png" alt="calendar" class="blind_search_img" @click="endDateRef.showPicker()" />
                  <span class="date_text">{{ searchForm.endDate }}</span>
                  <input ref="endDateRef" type="date" class="hidden_date" @change="onEndDateChange" />
                </div>
              </div>
            </div>
            <div class="search_field">
              <label>분류</label>
              <div class="dropdown_wrap">
                <button class="dropdown_btn" @click="categoryOpen = !categoryOpen">
                  {{ searchForm.category }}<span class="dropdown_arrow">▼</span>
                </button>
                <div v-if="categoryOpen" class="dropdown_menu">
                  <button v-for="opt in categoryOptions" :key="opt" class="dropdown_item" @click="selectCategory(opt)">{{ opt }}</button>
                </div>
              </div>
            </div>
            <button class="search_btn" @click="handleSearch">검색</button>
          </div>
        </div>

        <!-- 탭 -->
        <div class="tab_row">
          <button class="tab_btn" :class="{ active: activeTab === 'all' }" @click="handleTabChange('all')">전체</button>
          <button class="tab_btn tab_pending" :class="{ active: activeTab === 'pending' }" @click="handleTabChange('pending')">
            <img src="@/assets/notification.png" alt="notification" class="notification_img" />가입승인 대기
          </button>
        </div>

        <!-- 전체 회원 테이블 -->
        <div v-if="activeTab === 'all'" class="table_wrap">
          <table class="user_table">
            <thead>
              <tr>
                <th>이름</th><th>아이디</th><th class="col_wide">주소</th>
                <th>전화번호</th><th>상태</th><th>분류</th><th>가입일</th><th>친환경 점수</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="userList.length > 0">
                <tr v-for="user in userList" :key="user.userNo" class="clickable_row" @click="openDetail(user)">
                  <td>{{ user.name }}</td>
                  <td>{{ user.userId }}</td>
                  <td class="col_wide address_td">{{ user.address }}</td>
                  <td>{{ user.tel }}</td>
                  <td><span :class="['status_badge', statusBadgeClass(user.status)]">{{ statusLabel(user.status) }}</span></td>
                  <td><span :class="['role_badge', roleBadgeClass(user.role)]">{{ roleLabel(user.role) }}</span></td>
                  <td>{{ user.createdAt }}</td>
                  <td>
                    <span v-if="user.role === 'CUSTOMER' && greenLabel(user.green)" class="green_text">
                      {{ greenLabel(user.green).text }}
                      <img :src="greenLabel(user.green).img" class="green_icon" />
                    </span>
                    <span v-else class="green_dash">-</span>
                  </td>
                </tr>
              </template>
              <tr v-if="userList.length === 0"><td colspan="8" class="empty_td">조회된 회원이 없습니다.</td></tr>
              <tr v-for="i in Math.max(0, 15 - userList.length)" :key="'e'+i" class="empty_row">
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 승인 대기 테이블 -->
        <div v-if="activeTab === 'pending'" class="table_wrap">
          <table class="user_table">
            <thead>
              <tr>
                <th>이름</th><th>아이디</th><th class="col_wide">주소</th>
                <th>전화번호</th><th>상태</th><th>분류</th><th>신청일</th><th>처리</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pendingList.length > 0">
                <tr v-for="user in pendingList" :key="user.userNo">
                  <td>{{ user.name }}</td>
                  <td>{{ user.userId }}</td>
                  <td class="col_wide address_td">{{ user.address }}</td>
                  <td>{{ user.tel }}</td>
                  <td><span :class="['status_badge', statusBadgeClass(user.status)]">{{ statusLabel(user.status) }}</span></td>
                  <td><span :class="['role_badge', roleBadgeClass(user.role)]">{{ roleLabel(user.role) }}</span></td>
                  <td>{{ user.appliedAt }}</td>
                  <td>
                    <button class="approve_btn" @click="openPendingDetail(user)">승인하기</button>
                  </td>
                </tr>
              </template>
              <tr v-if="pendingList.length === 0"><td colspan="8" class="empty_td">승인 대기 중인 회원이 없습니다.</td></tr>
              <tr v-for="i in Math.max(0, 15 - pendingList.length)" :key="'e'+i" class="empty_row">
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
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

    <!-- 고객 상세 모달 -->
    <div v-if="showDetailModal && selectedUser" class="modal_overlay" @click.self="closeDetail">
      <div class="modal">
        <div class="modal_header">
          <span class="modal_header_title">고객 상세정보 모달</span>
          <button class="modal_close" @click="closeDetail">✕</button>
        </div>
        <div class="modal_body">
          <div class="info_row"><span class="info_label">이름</span><span class="info_value">{{ selectedUser.name }}</span></div>
          <div class="info_row"><span class="info_label">아이디</span><span class="info_value">{{ selectedUser.userId }}</span></div>
          <div class="info_row">
            <span class="info_label">분류</span>
            <span :class="['role_badge', roleBadgeClass(selectedUser.role)]">{{ roleLabel(selectedUser.role) }}</span>
          </div>
          <div class="info_row"><span class="info_label">주소</span><span class="info_value">{{ selectedUser.address ?? '-' }}</span></div>
          <div class="info_row"><span class="info_label">전화 번호</span><span class="info_value">{{ selectedUser.tel }}</span></div>
          <div class="info_row"><span class="info_label">가입일</span><span class="info_value">{{ selectedUser.createdAt }}</span></div>
          <div class="info_row" v-if="selectedUser.role === 'CUSTOMER'">
            <span class="info_label">친환경 점수</span>
            <span class="green_modal_text" v-if="greenLabel(selectedUser.green)">
              {{ greenLabel(selectedUser.green).text }}
              <img :src="greenLabel(selectedUser.green).img" class="green_icon" />
            </span>
            <span v-else class="info_value">-</span>
          </div>
          <div class="info_row" v-if="selectedUser.role === 'CUSTOMER'">
            <span class="info_label">회원 상태 변경</span>
            <div class="suspend_wrap">
              <div class="dropdown_wrap">
                <button class="suspend_btn_dropdown" @click="suspendOpen = !suspendOpen">
                  {{ selectedSuspend }} <span class="dropdown_arrow">▼</span>
                </button>
                <div v-if="suspendOpen" class="suspend_menu">
                  <label v-for="opt in suspendOptions" :key="opt" class="suspend_option">
                    <input type="radio" :value="opt" v-model="selectedSuspend" @change="suspendOpen = false" />
                    {{ opt }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal_btns">
          <button class="modal_cancel" @click="closeDetail">닫기</button>
          <button v-if="selectedUser.role === 'CUSTOMER'" class="modal_confirm" @click="openConfirmModal">적용</button>
        </div>
      </div>
    </div>

    <!-- 상태변경 확인 모달 -->
    <div v-if="showConfirmModal && selectedUser" class="modal_overlay" @click.self="closeConfirmModal">
      <div class="confirm_modal">
        <p class="confirm_title">회원 상태 변경</p>
        <p class="confirm_desc">
          <span class="confirm_name">{{ selectedUser.name }}</span> 님을<br/>
          <span class="confirm_status">{{ selectedSuspend }}</span> 처리하시겠습니까?
        </p>
        <div class="confirm_btns">
          <button class="modal_cancel" @click="closeConfirmModal">취소</button>
          <button class="modal_confirm" @click="applySuspend">확인</button>
        </div>
      </div>
    </div>

    <!-- 승인대기 상세 모달 (사장/라이더) -->
    <div v-if="showPendingDetailModal && selectedPendingUser" class="modal_overlay" @click.self="closePendingDetail">
      <div class="modal pending_modal">
        <div class="modal_header">
          <span class="modal_header_title">고객 상세정보 모달</span>
          <button class="modal_close" @click="closePendingDetail">✕</button>
        </div>
        <div class="modal_body">
          <div class="info_row"><span class="info_label">이름</span><span class="info_value">{{ selectedPendingUser.name }}</span></div>
          <div class="info_row"><span class="info_label">아이디</span><span class="info_value">{{ selectedPendingUser.userId }}</span></div>
          <div class="info_row">
            <span class="info_label">분류</span>
            <span :class="['role_badge', roleBadgeClass(selectedPendingUser.role)]">{{ roleLabel(selectedPendingUser.role) }}</span>
          </div>
          <div class="info_row"><span class="info_label">전화 번호</span><span class="info_value">{{ selectedPendingUser.tel }}</span></div>

          <!-- 사장 전용 -->
          <template v-if="selectedPendingUser.role === 'OWNER'">
            <div class="info_row"><span class="info_label">가게 주소</span><span class="info_value">{{ selectedPendingUser.storeAddress }}</span></div>
            <div class="info_row"><span class="info_label">사업자 등록 번호</span><span class="info_value">{{ selectedPendingUser.businessNo }}</span></div>
            <div class="info_row">
              <span class="info_label">영업 신고증</span>
              <span class="file_link" @click="openFile(selectedPendingUser.businessLicense)">{{ selectedPendingUser.businessLicense }}</span>
            </div>
            <div class="info_row">
              <span class="info_label">통신판매업 신고증</span>
              <span class="file_link" @click="openFile(selectedPendingUser.onlineLicense)">{{ selectedPendingUser.onlineLicense }}</span>
            </div>
            <div class="info_row"><span class="info_label">정산 계좌 정보</span><span class="info_value">{{ selectedPendingUser.accountInfo }}</span></div>
          </template>

          <!-- 라이더 전용 -->
          <template v-if="selectedPendingUser.role === 'RIDER'">
            <div class="info_row">
              <span class="info_label">운전 면허증</span>
              <span class="file_link" @click="openFile(selectedPendingUser.driverLicense)">{{ selectedPendingUser.driverLicense }}</span>
            </div>
            <div class="info_row">
              <span class="info_label">본인 확인 (신분증)</span>
              <span class="file_link" @click="openFile(selectedPendingUser.idCard)">{{ selectedPendingUser.idCard }}</span>
            </div>
            <div class="info_row">
              <span class="info_label">자동차 보험 증권</span>
              <span class="file_link" @click="openFile(selectedPendingUser.carInsurance)">{{ selectedPendingUser.carInsurance }}</span>
            </div>
            <div class="info_row">
              <span class="info_label">안전 교육 이수증</span>
              <span class="file_link" @click="openFile(selectedPendingUser.safetyEdu)">{{ selectedPendingUser.safetyEdu }}</span>
            </div>
            <div class="info_row"><span class="info_label">정산 계좌 정보</span><span class="info_value">{{ selectedPendingUser.accountInfo }}</span></div>
          </template>
        </div>

        <!-- 승인/반려 버튼 -->
        <div class="pending_btns">
          <button class="approve_btn_lg" @click="approvePendingUser">승인</button>
          <div class="reject_wrap">
            <button class="reject_btn_lg" @click="rejectOpen = !rejectOpen">
              반려 <span class="dropdown_arrow">▼</span>
            </button>
            <div v-if="rejectOpen" class="reject_reason_menu">
              <label v-for="reason in rejectReasons(selectedPendingUser.role)" :key="reason" class="reject_reason_option">
                <input type="radio" :value="reason" v-model="selectedRejectReason" />
                {{ reason }}
              </label>
              <button class="reject_confirm_btn" @click="rejectPendingUser">반려 확인</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #fff; font-family: 'Noto Sans KR', sans-serif; }
.main_content { margin-left: 190px; flex: 1; display: flex; flex-direction: column; }
.content { padding: 36px 60px; display: flex; flex-direction: column; gap: 16px; }
.page_title { font-size: 20px; font-weight: 700; color: #222; margin: 0; }
.search_box { background: #fff; border-radius: 10px; padding: 20px 0; }
.search_row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.search_field { display: flex; flex-direction: column; gap: 6px; }
.search_field label { font-size: 12px; color: #666; font-weight: 500; }
.form_input { border: 1px solid #ddd; border-radius: 6px; padding: 7px 10px; font-size: 13px; color: #333; outline: none; min-width: 110px; }
.date_range { display: flex; align-items: center; gap: 6px; }
.date_sep { color: #999; font-size: 13px; }
.date_picker_wrap { position: relative; display: flex; align-items: center; gap: 6px; border: 1px solid #ddd; border-radius: 6px; padding: 6px 10px; cursor: pointer; background: #fff; }
.date_picker_wrap:hover { border-color: #aaa; }
.blind_search_img { width: 16px; height: auto; cursor: pointer; flex-shrink: 0; }
.date_text { font-size: 13px; color: #333; min-width: 80px; user-select: none; }
.hidden_date { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 7px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 110px; }
.dropdown_btn:hover { border-color: #aaa; }
.dropdown_arrow { font-size: 10px; color: #999; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 110px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 9px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown_item:hover { background: #f5f5f5; }
.search_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; height: 34px; align-self: flex-end; }
.search_btn:hover { background: #7f1515; }
.tab_row { display: flex; gap: 8px; }
.notification_img { width: 15px; height: auto; margin-right: 5px; }
.tab_btn { padding: 6px 18px; border: 1px solid #ddd; background: #fff; border-radius: 6px; font-size: 13px; color: #666; cursor: pointer; font-weight: 500; display: flex; align-items: center; }
.tab_btn.active { background: #555; border-color: #555; color: #fff; font-weight: 700; }
.tab_btn.tab_pending.active { background: #f5a623; border-color: #f5a623; color: #fff; }
.table_wrap { background: #fff; border-radius: 10px; overflow: hidden; }
.user_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.user_table thead tr { background: #e8e8e8; }
.user_table th { padding: 12px 14px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; white-space: nowrap; }
.user_table th:last-child { border-right: none; }
.user_table td { padding: 11px 14px; text-align: center; color: #333; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
.user_table td:last-child { border-right: none; }
.col_wide { width: 30%; }
.address_td { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.empty_row td { height: 38px; }
.empty_td { color: #aaa; padding: 24px; text-align: center; }
.clickable_row { cursor: pointer; }
.clickable_row:hover { background: #fafafa; }
.green_icon { width: 16px; height: auto; vertical-align: middle; margin-left: 2px; }
.status_badge { border-radius: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge_active { background: #e8f5e9; color: #2e7d32; }
.badge_suspended { background: #ffdddd; color: #ff0606; }
.badge_permanent { background: #222; color: #fff; }
.badge_pending { background: #fff3d6; color: #b07800; }
.role_badge { border-radius: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #fff; white-space: nowrap; }
.badge_customer { background: #4a90d9; }
.badge_owner { background: #7150db; }
.badge_rider { background: #4caf50; }
.green_text { font-size: 13px; font-weight: 700; color: #2e7d32; display: flex; align-items: center; justify-content: center; gap: 4px; }
.green_dash { color: #aaa; font-size: 13px; }
.approve_btn { background: #4caf50; border: none; color: #fff; border-radius: 4px; padding: 4px 12px; font-size: 12px; cursor: pointer; font-weight: 600; white-space: nowrap; }
.approve_btn:hover { background: #388e3c; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 0; }
.pagination button { background: none; border: none; font-size: 13px; color: #666; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.pagination button.active { font-weight: 700; color: #cc1f1f; }
.pagination button:hover { background: #f0f0f0; }
.modal_overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 490px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: visible; }
.pending_modal { width: 520px; }
.modal_header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #eee; }
.modal_header_title { font-size: 15px; font-weight: 700; color: #222; }
.modal_close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }
.modal_close:hover { color: #333; }
.modal_body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.info_row { display: flex; align-items: center; gap: 16px; }
.info_label { width: 120px; font-size: 13px; font-weight: 600; color: #555; flex-shrink: 0; }
.info_value { font-size: 13px; color: #222; }
.file_link { font-size: 13px; color: #4a90d9; cursor: pointer; text-decoration: underline; }
.file_link:hover { color: #2c6faa; }
.green_modal_text { font-size: 15px; font-weight: 700; color: #2e7d32; display: flex; align-items: center; gap: 4px; }
.modal_btns { display: flex; gap: 10px; justify-content: flex-end; padding: 0 24px 20px; }
.confirm_btns { display: flex; gap: 10px; justify-content: center; padding: 0 0 4px; }
.modal_cancel { padding: 9px 20px; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; }
.modal_cancel:hover { background: #f5f5f5; }
.modal_confirm { padding: 9px 24px; border: none; background: #9b1b1b; border-radius: 8px; font-size: 13px; color: #fff; cursor: pointer; font-weight: 700; }
.modal_confirm:hover { background: #7f1515; }
.suspend_wrap { position: relative; }
.suspend_btn_dropdown { background: #fff; border: 1px solid #cc1f1f; border-radius: 6px; padding: 6px 12px; font-size: 13px; color: #cc1f1f; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.suspend_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 8px; min-width: 160px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; }
.suspend_option { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #333; cursor: pointer; }
.suspend_option input[type="radio"] { accent-color: #9b1b1b; }
.confirm_modal { background: #fff; border-radius: 14px; padding: 25px 35px; width: 320px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.confirm_title { font-size: 17px; font-weight: 700; color: #222; margin-bottom: 14px; }
.confirm_desc { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 28px; }
.confirm_name { font-weight: 700; color: #222; }
.confirm_status { font-weight: 700; color: #cc1f1f; }
.pending_btns { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px 24px; gap: 12px; }
.approve_btn_lg { background: #4caf50; border: none; color: #fff; border-radius: 8px; padding: 10px 32px; font-size: 14px; font-weight: 700; cursor: pointer; }
.approve_btn_lg:hover { background: #388e3c; }
.reject_wrap { position: relative; }
.reject_btn_lg { background: #fff; border: 1px solid #cc1f1f; color: #cc1f1f; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.reject_btn_lg:hover { background: #fff0f0; }
.reject_reason_menu { position: absolute; bottom: calc(100% + 8px); right: 0; background: #fff; border: 1px solid #ddd; border-radius: 10px; min-width: 220px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 30; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.reject_reason_option { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #333; cursor: pointer; }
.reject_reason_option input[type="radio"] { accent-color: #cc1f1f; }
.reject_confirm_btn { margin-top: 4px; background: #9b1b1b; border: none; color: #fff; border-radius: 6px; padding: 8px 0; font-size: 13px; font-weight: 700; cursor: pointer; width: 100%; }
.reject_confirm_btn:hover { background: #a01818; }
</style>