<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

const storeList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const today = new Date()
const formatDate = (d) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

  const searchForm = ref({
  storeName: '',
  businessNo: '',
  userId: '',
  startDate: formatDate(today),
  endDate: formatDate(today),
  category: '고객',
  name: '',
})

// 드롭다운
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

// 영업 상태 (state: 0=준비중, 1=영업중)
const stateLabel = (state) => {
  const map = { 0: '준비중', 1: '영업중' }
  return map[state] ?? '-'
}
const stateBadgeClass = (state) => {
  const map = { 0: 'badge_ready', 1: 'badge_open' }
  return map[state] ?? ''
}

const formatCreatedAt = (dateStr) => {
  if (!dateStr) return '-'
  return String(dateStr).slice(0, 10).replaceAll('-', '.')
}

// 가게 목록 조회 (팀원 API 연동 후 실제 호출로 교체)
const fetchStoreList = async () => {
  loading.value = true
  try {
    const res = await adminService.getStoreList(currentPage.value - 1)
    storeList.value = res?.resultData?.content ?? []
    totalPages.value = res?.resultData?.totalPages ?? 1
  } catch {
    // 더미 데이터 (API 연동 전)
    storeList.value = [
      { storeId: 1, storeName: '숨은집', ownerName: '김블루', location: '대구광역시 중구 동성로1길 46-23 1층', storeTel: '010-1111-1111', state: 0, createdAt: '2023-03-23' },
      { storeId: 2, storeName: '오레가노 동성로본점', ownerName: '김블루', location: '대구광역시 중구 동성로2길 27-1 1층', storeTel: '010-1111-1111', state: 1, createdAt: '2023-03-23' },
      { storeId: 3, storeName: '숨은집', ownerName: '김블루', location: '대구광역시 중구 동성로1길 46-23 1층', storeTel: '010-1111-1111', state: 0, createdAt: '2023-03-23' },
    ]
    totalPages.value = 3
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchStoreList()
}

// ── 가게 상세 모달
const showDetailModal = ref(false)
const selectedStore = ref(null)
const detailLoading = ref(false)

const openDetail = async (store) => {
  selectedStore.value = { ...store }
  showDetailModal.value = true
  detailLoading.value = true
  try {
    const res = await adminService.getStoreDetail(store.storeId)
    selectedStore.value = res?.resultData ?? store
  } catch {
    // 더미 유지
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedStore.value = null
}

onMounted(fetchStoreList)
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />
    <div class="main_content">
      <AdminHeader />
      <div class="content">
        <h2 class="page_title">가게 리스트</h2>

        <!-- 검색 필터 -->
        <div class="search_box">
            <div class="search_row">
        <div class="search_field">
            <label>가게명</label>
            <input v-model="searchForm.storeName" type="text" class="form_input" />
        </div>
        <div class="search_field">
            <label>사업자 번호</label>
            <input v-model="searchForm.businessNo" type="text" class="form_input" />
        </div>
        <div class="search_field">
            <label>아이디</label>
            <input v-model="searchForm.userId" type="text" class="form_input" />
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
        <div class="search_field">
            <label>이름</label>
            <input v-model="searchForm.name" type="text" class="form_input" />
        </div>
        <button class="search_btn" @click="handleSearch">검색</button>
    </div>
        </div>

        <!-- 테이블 -->
        <div class="table_wrap">
          <table class="store_table">
            <thead>
              <tr>
                <th>가게명</th>
                <th>대표자명</th>
                <th class="col_wide">가게 주소</th>
                <th>전화번호</th>
                <th>가게 등록일</th>
                <th>영업 상태</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="storeList.length > 0">
                <tr v-for="store in storeList" :key="store.storeId" class="clickable_row" @click="openDetail(store)">
                  <td>{{ store.storeName }}</td>
                  <td>{{ store.ownerName }}</td>
                  <td class="col_wide address_td">{{ store.location }}</td>
                  <td>{{ store.storeTel }}</td>
                  <td>{{ formatCreatedAt(store.createdAt) }}</td>
                  <td>
                    <span :class="['state_badge', stateBadgeClass(store.state)]">{{ stateLabel(store.state) }}</span>
                  </td>
                </tr>
              </template>
              <tr v-if="storeList.length === 0">
                <td colspan="6" class="empty_td">조회된 가게가 없습니다.</td>
              </tr>
              <tr v-for="i in Math.max(0, 15 - storeList.length)" :key="'e'+i" class="empty_row">
                <td></td><td></td><td></td><td></td><td></td><td></td>
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

        <!-- 가게 상세 모달 -->
    <div v-if="showDetailModal && selectedStore" class="modal_overlay" @click.self="closeDetail">
    <div class="modal">
        <div class="modal_header">
        <span class="modal_header_title">가게 상세 정보 모달</span>
        <button class="modal_close" @click="closeDetail">✕</button>
        </div>
        <div class="modal_body" v-if="!detailLoading">
        <div class="info_row"><span class="info_label">가게명</span><span class="info_value">{{ selectedStore.storeName }}</span></div>
        <div class="info_row"><span class="info_label">대표자명</span><span class="info_value">{{ selectedStore.ownerName }}</span></div>
        <div class="info_row"><span class="info_label">카테고리</span><span class="info_value">{{ selectedStore.category ?? '-' }}</span></div>
        <div class="info_row"><span class="info_label">주소</span><span class="info_value">{{ selectedStore.location }} {{ selectedStore.detailLocation }}</span></div>
        <div class="info_row"><span class="info_label">전화번호</span><span class="info_value">{{ selectedStore.storeTel }}</span></div>
        <div class="info_row"><span class="info_label">가게 등록일</span><span class="info_value">{{ formatCreatedAt(selectedStore.createdAt) }}</span></div>
        <div class="info_row">
            <span class="info_label">영업 상태</span>
            <span :class="['state_badge_pill', stateBadgeClass(selectedStore.state)]">{{ stateLabel(selectedStore.state) }}</span>
        </div>
        </div>

        <!-- 통계 (항상 표시, 영업중 아닐 때는 0) -->
        <div class="stats_bottom" v-if="!detailLoading">
        <div class="stat_card_item">
            <span class="stat_card_label">주문 수</span>
            <span class="stat_card_value">{{ (selectedStore.orderCount ?? 0).toLocaleString() }}</span>
        </div>
        <div class="stat_card_item">
            <span class="stat_card_label">리뷰 수</span>
            <span class="stat_card_value">{{ selectedStore.ratingCount ?? 0 }}</span>
        </div>
        <div class="stat_card_item">
            <span class="stat_card_label">평균 평점</span>
            
            <span class="stat_card_value">
                <img src="@/assets/star.png" alt="star" class="star_img" />
                 {{ selectedStore.ratingAvg ?? 0 }}</span>
        </div>
        </div>

        <div class="modal_body" v-if="detailLoading">
        <p style="text-align:center; color:#aaa; padding: 20px 0;">불러오는 중...</p>
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
.search_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; height: 34px; align-self: flex-end; }
.search_btn:hover { background: #7f1515; }
.table_wrap { background: #fff; border-radius: 10px; overflow: hidden; }
.store_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.store_table thead tr { background: #e8e8e8; }
.store_table th { padding: 12px 14px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; white-space: nowrap; }
.store_table th:last-child { border-right: none; }
.store_table td { padding: 11px 14px; text-align: center; color: #333; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
.store_table td:last-child { border-right: none; }
.col_wide { width: 30%; }
.address_td { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.empty_row td { height: 38px; }
.empty_td { color: #aaa; padding: 24px; text-align: center; }
.clickable_row { cursor: pointer; }
.clickable_row:hover { background: #fafafa; }
.state_badge_pill { border-radius: 150px; padding: 3px 12px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.badge_ready { background: #fff3d6; color: #b07800; border-radius: 15px; padding: 3px 12px; font-size: 12px; font-weight: 700; white-space: nowrap;}
.badge_open { background: #e8f5e9; color: #2e7d32; border-radius: 15px; padding: 3px 12px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 0; }
.pagination button { background: none; border: none; font-size: 13px; color: #666; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.pagination button.active { font-weight: 700; color: #cc1f1f; }
.pagination button:hover { background: #f0f0f0; }
.modal_overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 490px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: visible; }
.modal_header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #eee; }
.modal_header_title { font-size: 15px; font-weight: 700; color: #222; }
.modal_close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }
.modal_close:hover { color: #333; }
.modal_body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.info_row { display: flex; align-items: center; gap: 16px; }
.info_label { width: 100px; font-size: 13px; font-weight: 600; color: #555; flex-shrink: 0; }
.info_value { font-size: 13px; color: #222; }
.divider { height: 1px; background: #eee; margin: 4px 0; }
.stats_row { display: flex; gap: 12px; }
.stat_item { flex: 1; background: #f5f5f5; border-radius: 8px; padding: 12px; text-align: center; }
.stat_label { display: block; font-size: 11px; color: #888; margin-bottom: 6px; font-weight: 500; }
.stat_value { font-size: 16px; font-weight: 700; color: #222; }
.modal_btns { display: flex; gap: 10px; justify-content: flex-end; padding: 0 24px 20px; }
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 7px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 80px; }
.dropdown_btn:hover { border-color: #aaa; }
.dropdown_arrow { font-size: 10px; color: #999; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 80px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 9px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown_item:hover { background: #f5f5f5; }
.stats_bottom { display: flex; gap: 12px; padding: 0 24px 16px; }
.stat_card_item { flex: 1; border: 1px solid #e0e0e0; border-radius: 30px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
.stat_card_label { font-size: 12px; color: #888; font-weight: 500; }
.stat_card_value { font-size: 15px; font-weight: 700; color: #222; display: flex; align-items: center; gap: 4px; }
.star_img {width: 16px; height: 16px; }
</style>