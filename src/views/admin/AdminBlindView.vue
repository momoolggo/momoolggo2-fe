<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

const activeTab = ref('all')
const blindList = ref([])
const loading = ref(false)

// 블라인드 해제 모달
const showReleaseModal = ref(false)
const selectedBlindId = ref(null)
const selectedStoreName = ref('')

// 고객 상세 모달
const showUserModal = ref(false)
const selectedUser = ref(null)

const userStatusLabel = (status) => {
  const map = {
    ACTIVE: { text: '정상', class: 'badge_active' },
    SUSPENDED: { text: '계정정지', class: 'badge_suspended' },
    PERMANENT: { text: '영구정지', class: 'badge_permanent' },
  }
  return map[status] ?? { text: '-', class: '' }
}

// 오늘 날짜 초기화
const today = new Date()
const formatDate = (d) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

// 검색 필터
const searchForm = ref({
  storeName: '',
  userId: '',
  startDate: formatDate(today),
  endDate: formatDate(today),
  category: '고객',
  name: '',
})

// 날짜 input ref
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

// 분류 드롭다운
const categoryOpen = ref(false)
const categoryOptions = ['고객', '사장']
const selectCategory = (val) => {
  searchForm.value.category = val
  categoryOpen.value = false
}

// 페이지네이션
const currentPage = ref(1)
const totalPages = ref(3)

const statusLabel = (status) => {
  const map = {
    BLINDED: { text: '블라인드', class: 'badge_blind' },
    RELEASED: { text: '해제됨', class: 'badge_released' },
    SUSPENDED: { text: '계정 정지', class: 'badge_suspend' },
    PERMANENT: { text: '영구 정지', class: 'badge_permanent' },
    REVIEWING: { text: '검토중', class: 'badge_reviewing' },
  }
  return map[status] ?? { text: status, class: '' }
}

const reasonLabel = (reason) => {
  const map = {
    ABUSE: '욕설 비방',
    FALSE_FACT: '허위 사실 기재',
    AD: '광고성 리뷰',
    ETC: '기타',
  }
  return map[reason] ?? reason
}

const fetchList = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'all') {
      const res = await adminService.getAllReviews(currentPage.value - 1)
      blindList.value = res?.resultData ?? []
    } else {
      const res = await adminService.getBlindList('BLINDED')
      blindList.value = res?.resultData ?? []
    }
  } catch (e) {
    console.error('목록 조회 실패', e)
    blindList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

const handleTabChange = (tab) => {
  activeTab.value = tab
  fetchList()
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}


const openUserModal = async (item) => {
  selectedUser.value = item
  showUserModal.value = true
  try {
    const res = await adminService.getUserDetail(item.userNo)
    selectedUser.value = { ...item, ...res?.resultData }
  } catch (e) {
    // 기존 데이터 유지
  }
}

// 블라인드 해제 모달
const openReleaseModal = (blindId, storeName) => {
  selectedBlindId.value = blindId
  selectedStoreName.value = storeName
  showReleaseModal.value = true
}

const confirmRelease = async () => {
  try {
    await adminService.releaseBlind(selectedBlindId.value)
    blindList.value = blindList.value.filter(item => item.blindId !== selectedBlindId.value)
  } catch (e) {
    console.error('블라인드 해제 실패', e)
  } finally {
    showReleaseModal.value = false
    selectedBlindId.value = null
    selectedStoreName.value = ''
  }
}

const cancelRelease = () => {
  showReleaseModal.value = false
  selectedBlindId.value = null
  selectedStoreName.value = ''
}

const suspendUser = async (blindId) => {
  if (!confirm('계정을 15일 정지하시겠습니까?')) return
  try {
    await adminService.suspendUser(blindId)
    await fetchList()
  } catch (e) {
    alert('계정 정지 실패')
  }
}

const permanentSuspend = async (blindId) => {
  if (!confirm('영구 정지하시겠습니까?')) return
  try {
    await adminService.permanentSuspend(blindId)
    await fetchList()
  } catch (e) {
    alert('영구 정지 실패')
  }
}

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
        <h2 class="page_title">리뷰 찾기</h2>

        <!-- 검색 필터 -->
        <div class="search_box">
          <div class="search_row">
            <div class="search_field">
              <label>가게명</label>
              <input v-model="searchForm.storeName" type="text" />
            </div>
            <div class="search_field">
              <label>아이디</label>
              <input v-model="searchForm.userId" type="text" />
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

            <!-- 분류 커스텀 드롭다운 -->
            <div class="search_field">
              <label>분류</label>
              <div class="dropdown_wrap">
                <button class="dropdown_btn" @click="categoryOpen = !categoryOpen">
                  {{ searchForm.category }}
                  <span class="dropdown_arrow">▼</span>
                </button>
                <div v-if="categoryOpen" class="dropdown_menu">
                  <button v-for="opt in categoryOptions" :key="opt" class="dropdown_item" @click="selectCategory(opt)">{{ opt }}</button>
                </div>
              </div>
            </div>

            <div class="search_field">
              <label>이름</label>
              <input v-model="searchForm.name" type="text" />
            </div>
            <button class="search_btn" @click="handleSearch">검색</button>
          </div>
        </div>

        <!-- 탭 -->
        <div class="tab_row">
          <button class="tab_btn" :class="{ active: activeTab === 'all' }" @click="handleTabChange('all')">전체 리뷰</button>
          <button class="tab_btn blind_tab" :class="{ active: activeTab === 'blind' }" @click="handleTabChange('blind')">블라인드 리뷰</button>
        </div>

        <!-- 테이블 -->
        <div class="table_wrap">
          <table class="review_table">

            <!-- 전체 리뷰 탭 -->
            <template v-if="activeTab === 'all'">
              <thead>
                <tr>
                  <th>가게명</th>
                  <th>작성자</th>
                  <th class="col_wide">내용</th>
                  <th>고객평균별점</th>
                  <th>작성일</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="blindList.length > 0">
                  <tr v-for="item in blindList" :key="item.blindId">
                    <td>{{ item.storeName }}</td>
                    <td>
                      <span class="writer_link" @click="openUserModal(item)">{{ item.writer }}</span>
                    </td>
                    <td class="col_wide content_td">{{ item.content }}</td>
                    <td>{{ item.rating }}</td>
                    <td>{{ item.createdAt?.slice(0, 10).replaceAll('-', '.') }}</td>
                  </tr>
                </template>
                <tr v-for="i in Math.max(0, 15 - blindList.length)" :key="'empty-' + i" class="empty_row">
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
              </tbody>
            </template>

            <!-- 블라인드 리뷰 탭 -->
            <template v-else>
              <thead>
                <tr>
                  <th>가게명</th>
                  <th>작성자</th>
                  <th class="col_wide">내용</th>
                  <th>평균별점</th>
                  <th>시작일</th>
                  <th>블라인드 사유</th>
                  <th>해제</th>
                  <th>회원 상태</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="blindList.length > 0">
                  <tr v-for="item in blindList" :key="item.blindId">
                    <td>{{ item.storeName }}</td>
                    <td>
                      <span class="writer_link" @click="openUserModal(item)">{{ item.writer }}</span>
                    </td>
                    <td class="col_wide content_td">{{ item.content }}</td>
                    <td>{{ item.rating }}</td>
                    <td>{{ item.startAt?.slice(0, 10).replaceAll('-', '.') ?? item.createdAt?.slice(0, 10).replaceAll('-', '.') }}</td>
                    <td><span class="reason_badge">{{ reasonLabel(item.reason) }}</span></td>
                    <td><button class="release_btn" @click="openReleaseModal(item.blindId, item.storeName)">블라인드 해제</button></td>
                    <td>
                      <div class="status_cell">
                        <span :class="['status_badge', statusLabel(item.status).class]">{{ statusLabel(item.status).text }}</span>
                        <div class="action_btns" v-if="item.status === 'BLINDED' || item.status === 'REVIEWING'">
                          <button class="suspend_btn" @click="suspendUser(item.blindId)">계정 정지</button>
                          <button class="permanent_btn" @click="permanentSuspend(item.blindId)">영구 정지</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-for="i in Math.max(0, 15 - blindList.length)" :key="'empty-' + i" class="empty_row">
                  <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              </tbody>
            </template>
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
    <div v-if="showUserModal && selectedUser" class="modal_overlay" @click.self="closeUserModal">
      <div class="user_modal">
        <div class="user_modal_header">
          <span class="user_modal_title">고객 상세정보 모달</span>
          <button class="modal_close" @click="closeUserModal">✕</button>
        </div>

        <div class="user_modal_body">
          <div class="user_info_row">
            <span class="user_info_label">이름</span>
            <span class="user_info_value">{{ selectedUser.name ?? selectedUser.writer ?? '-' }}</span>
          </div>
          <div class="user_info_row">
            <span class="user_info_label">아이디</span>
            <span class="user_info_value">{{ selectedUser.userId ?? '-' }}</span>
          </div>
          <div class="user_info_row">
            <span class="user_info_label">전화번호</span>
            <span class="user_info_value">{{ selectedUser.tel ?? '-' }}</span>
          </div>
          <div class="user_info_row">
            <span class="user_info_label">가입일</span>
            <span class="user_info_value">{{ selectedUser.createdAt ? String(selectedUser.createdAt).slice(0,10).replaceAll('-','.') : '-' }}</span>
          </div>
          <div class="user_info_row">
            <span class="user_info_label">친환경점수</span>
            <span class="user_info_value">{{ selectedUser.green ?? '-' }}</span>
          </div>
          <div class="user_info_row" v-if="activeTab === 'blind'">
            <span class="user_info_label">블라인드 사유</span>
            <span class="user_info_value">{{ reasonLabel(selectedUser.reason) }}</span>
          </div>
          <div class="user_info_row">
            <span class="user_info_label">회원 상태</span>
            <span :class="['status_badge', userStatusLabel(selectedUser.status).class]">
            {{ userStatusLabel(selectedUser.status).text }}
          </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 블라인드 해제 모달 -->
    <div v-if="showReleaseModal" class="modal_overlay" @click.self="cancelRelease">
      <div class="modal">
        <p class="modal_title">블라인드 해제</p>
        <p class="modal_desc">
          <span class="modal_store">{{ selectedStoreName }}</span> 리뷰의<br />블라인드를 해제하시겠습니까?
        </p>
        <div class="modal_btns">
          <button class="modal_cancel" @click="cancelRelease">취소</button>
          <button class="modal_confirm" @click="confirmRelease">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Noto Sans KR', sans-serif; }
.main_content { margin-left: 190px; flex: 1; display: flex; flex-direction: column; }
.content { padding: 36px 60px; display: flex; flex-direction: column; gap: 16px; }
.page_title { font-size: 20px; font-weight: 700; color: #222; margin: 0; }

/* 검색 */
.search_box { background: #fff; border-radius: 10px; padding: 20px 24px; }
.search_row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.search_field { display: flex; flex-direction: column; gap: 6px; }
.search_field label { font-size: 12px; color: #666; font-weight: 500; }
.search_field input { border: 1px solid #ddd; border-radius: 6px; padding: 7px 10px; font-size: 13px; color: #333; outline: none; min-width: 110px; }

/* 날짜 */
.date_range { display: flex; align-items: center; gap: 6px; }
.date_sep { color: #999; font-size: 13px; }
.date_picker_wrap { position: relative; display: flex; align-items: center; gap: 6px; border: 1px solid #ddd; border-radius: 6px; padding: 6px 10px; cursor: pointer; background: #fff; }
.date_picker_wrap:hover { border-color: #aaa; }
.blind_search_img { width: 16px; height: auto; cursor: pointer; flex-shrink: 0; }
.date_text { font-size: 13px; color: #333; min-width: 80px; user-select: none; }
.hidden_date { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }

/* 드롭다운 */
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 7px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 110px; }
.dropdown_btn:hover { border-color: #aaa; }
.dropdown_arrow { font-size: 10px; color: #999; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 110px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 9px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown_item:hover { background: #f5f5f5; }

.search_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; height: 34px; align-self: flex-end; }
.search_btn:hover { background: #7f1515; }

/* 탭 */
.tab_row { display: flex; gap: 8px; }
.tab_btn { padding: 6px 18px; border: 1px solid #ddd; background: #fff; border-radius: 6px; font-size: 13px; color: #666; cursor: pointer; font-weight: 500; }
.tab_btn.active { background: #555; border-color: #555; color: #fff; font-weight: 700; }
.tab_btn.blind_tab.active { background: #b2b2b2; border-color: #6b6b6b; color: #fff; }

/* 테이블 */
.table_wrap { background: #fff; border-radius: 10px; overflow: hidden; }
.review_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.review_table thead tr { background: #e8e8e8; }
.review_table th { padding: 12px 14px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; white-space: nowrap; }
.review_table th:last-child { border-right: none; }
.review_table td { padding: 11px 14px; text-align: center; color: #333; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
.review_table td:last-child { border-right: none; }
.col_wide { width: 30%; text-align: center !important; }
.content_td { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty_row td { height: 38px; }

/* 작성자 링크 */
.writer_link {
  color: #4a90d9;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
}
.writer_link:hover { color: #2c6faa; }

.reason_badge { background: #f0f0f0; border-radius: 4px; padding: 4px 10px; font-size: 11px; color: #555; white-space: nowrap; display: inline-block; }
.release_btn { background: #fff; border: 1px solid #cc1f1f; color: #cc1f1f; border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; white-space: nowrap; }
.release_btn:hover { background: #fff0f0; }

.status_cell { display: flex; flex-direction: row; align-items: center; gap: 4px; justify-content: center; flex-wrap: wrap; }
.status_badge { border-radius: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge_blind { background: #cc1f1f; color: #fff; }
.badge_released { background: #e0e0e0; color: #666; }
.badge_suspend { background: #1f6dcc; color: #fff; }
.badge_permanent { background: #222; color: #fff; }
.badge_reviewing { background: #e8a000; color: #fff; }

.action_btns { display: flex; gap: 4px; }
.suspend_btn { background: #1f6dcc; border: none; color: #fff; border-radius: 4px; padding: 3px 7px; font-size: 11px; cursor: pointer; white-space: nowrap; }
.permanent_btn { background: #222; border: none; color: #fff; border-radius: 4px; padding: 3px 7px; font-size: 11px; cursor: pointer; white-space: nowrap; }

/* 페이지네이션 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 0; }
.pagination button { background: none; border: none; font-size: 13px; color: #666; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.pagination button.active { font-weight: 700; color: #cc1f1f; }
.pagination button:hover { background: #f0f0f0; }

/* 모달 공통 */
.modal_overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal_close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }
.modal_close:hover { color: #333; }

/* 고객 상세 모달 */
.user_modal {
  background: #fff;
  border-radius: 14px;
  width: 420px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  overflow: hidden;
}
.user_modal_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
}
.user_modal_title { font-size: 16px; font-weight: 700; color: #222; }

.user_modal_body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.user_info_row {
  display: flex;
  align-items: center;
  gap: 0;
}
.user_info_label {
  width: 110px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  flex-shrink: 0;
}
.user_info_value {
  font-size: 13px;
  color: #222;
}
.user_modal_note {
  font-size: 11px;
  color: #aaa;
  margin: 4px 0 0;
}

.user_modal_btns {
  display: flex;
  justify-content: flex-end;
  padding: 0 24px 20px;
}

/* 블라인드 해제 모달 */
.modal { background: #fff; border-radius: 14px; padding: 36px 40px; width: 340px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal_title { font-size: 17px; font-weight: 700; color: #222; margin-bottom: 14px; }
.modal_desc { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 28px; }
.modal_store { font-weight: 700; color: #cc1f1f; }
.modal_btns { display: flex; gap: 10px; justify-content: center; }
.modal_cancel { flex: 1; padding: 10px 0; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-size: 14px; color: #666; cursor: pointer; font-weight: 500; }
.modal_cancel:hover { background: #f5f5f5; }
.modal_confirm { flex: 1; padding: 10px 0; border: none; background: #9b1b1b; border-radius: 8px; font-size: 14px; color: #fff; cursor: pointer; font-weight: 700; }
.modal_confirm:hover { background: #7f1515; }
.badge_active { background: #e8f5e9; color: #2e7d32; }      /* 정상 */
.badge_suspended { background: #ffdddd; color: #ff0606; }    /* 계정정지 */
.badge_permanent { background: #222; color: #fff; }
</style>