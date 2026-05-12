<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

const ADMIN_TEL = '053-111-1212'

const summary = ref({ waiting: 0, assigned: 0, delivering: 0, completed: 0 })
const deliveryList = ref([])
const loading = ref(false)

const statusFilter = ref(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const totalPages = ref(3)

const statusFilterOpen = ref(false)
const statusFilterOptions = [
  { label: '전체', value: null },
  { label: '대기', value: 'WAITING' },
  { label: '배정됨', value: 'ASSIGNED' },
  { label: '배달중', value: 'DELIVERING' },
  { label: '완료', value: 'COMPLETED' },
]
const selectedStatusLabel = ref('전체')

const selectStatusFilter = (opt) => {
  statusFilter.value = opt.value
  selectedStatusLabel.value = opt.label
  statusFilterOpen.value = false
  fetchList()
}

const filteredList = computed(() => {
  if (!searchKeyword.value.trim()) return deliveryList.value
  const kw = searchKeyword.value.trim().toLowerCase()
  return deliveryList.value.filter(item =>
    item.orderId?.toLowerCase().includes(kw) ||
    item.storeName?.toLowerCase().includes(kw) ||
    String(item.riderNo ?? '').includes(kw)
  )
})

// ── 공지 발송 모달
const showNoticeModal = ref(false)
const noticeSending = ref(false)
const noticeResult = ref('')
const totalRiderCount = ref(0)

const noticeForm = ref({
  title: '',
  targetType: 'ALL',
  selectedDistricts: [],
  content: '',
  sendType: 'NOW',
  reservedAt: '',
})

const daeguDistricts = ['동구', '서구', '남구', '북구', '중구', '수성구', '달서구', '달성군']

const toggleDistrict = (d) => {
  const idx = noticeForm.value.selectedDistricts.indexOf(d)
  if (idx === -1) noticeForm.value.selectedDistricts.push(d)
  else noticeForm.value.selectedDistricts.splice(idx, 1)
}

const openNoticeModal = async () => {
  noticeForm.value = { title: '', targetType: 'ALL', selectedDistricts: [], content: '', sendType: 'NOW', reservedAt: '' }
  noticeResult.value = ''
  showNoticeModal.value = true
  try {
    const res = await adminService.getRiderCount()
    totalRiderCount.value = res?.count ?? res?.resultData ?? 0
  } catch {
    totalRiderCount.value = 230
  }
}

const closeNoticeModal = () => { showNoticeModal.value = false }

const sendNotice = async () => {
  if (!noticeForm.value.title.trim() || !noticeForm.value.content.trim()) return
  if (noticeForm.value.sendType === 'RESERVED' && !noticeForm.value.reservedAt) return
  noticeSending.value = true
  try {
    const payload = {
      title: noticeForm.value.title.trim(),
      targetType: noticeForm.value.targetType,
      content: noticeForm.value.content.trim(),
      sendType: noticeForm.value.sendType,
      reservedAt: noticeForm.value.sendType === 'RESERVED' ? noticeForm.value.reservedAt : null,
    }
    const res = await adminService.sendRiderNotice(payload)
    noticeResult.value = res?.resultMessage ?? '공지 발송 완료'
    setTimeout(() => { showNoticeModal.value = false; noticeResult.value = ''; fetchNoticeList() }, 1200)
  } catch {
    noticeResult.value = '발송 실패. 다시 시도해주세요.'
  } finally {
    noticeSending.value = false
  }
}

// ── 공지 목록 모달
const showNoticeListModal = ref(false)
const noticeList = ref([])

const openNoticeListModal = async () => {
  showNoticeListModal.value = true
  await fetchNoticeList()
}
const closeNoticeListModal = () => { showNoticeListModal.value = false }

const fetchNoticeList = async () => {
  try {
    const res = await adminService.getNoticeList()
    // resultData가 있으면 그걸, 없으면 배열 자체를 사용
    noticeList.value = Array.isArray(res) ? res : (res?.resultData ?? [])
  } catch {
    noticeList.value = []
  }
}

// ── 공지 상세/수정 모달
const showNoticeDetailModal = ref(false)
const selectedNotice = ref(null)
const isEditMode = ref(false)
const editForm = ref({ title: '', content: '', sendType: 'NOW', reservedAt: '' })

const openNoticeDetail = (notice) => {
  selectedNotice.value = notice
  editForm.value = {
    title: notice.title,
    content: notice.content,
    sendType: notice.sendType,
    reservedAt: notice.reservedAt ?? '',
  }
  isEditMode.value = false
  showNoticeDetailModal.value = true
}

const closeNoticeDetail = () => {
  showNoticeDetailModal.value = false
  selectedNotice.value = null
  isEditMode.value = false
}

const updateNotice = async () => {
  try {
    await adminService.updateNotice(selectedNotice.value.noticeNo, {
      title: editForm.value.title,
      targetType: selectedNotice.value.targetType,
      content: editForm.value.content,
      sendType: editForm.value.sendType,
      reservedAt: editForm.value.sendType === 'RESERVED' ? editForm.value.reservedAt : null,
    })
    await fetchNoticeList()
    closeNoticeDetail()
  } catch {
    alert('수정 실패')
  }
}

const deleteNotice = async (noticeNo) => {
  if (!confirm('공지를 삭제하시겠습니까?')) return
  try {
    await adminService.deleteNotice(noticeNo)
    await fetchNoticeList()
    closeNoticeDetail()
  } catch {
    alert('삭제 실패')
  }
}

const statusBadge = (status) => {
  const map = {
    WAITING:    { text: '접수대기', class: 'badge_waiting' },
    ASSIGNED:   { text: '배차대기', class: 'badge_assigned' },
    DELIVERING: { text: '배달중',   class: 'badge_delivering' },
    COMPLETED:  { text: '배달완료', class: 'badge_completed' },
  }
  return map[status] ?? { text: status, class: '' }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await adminService.getDeliveryMonitor(statusFilter.value, currentPage.value - 1)
    if (res?.summary) summary.value = res.summary
    deliveryList.value = res?.deliveries ?? []
  } catch (e) {
    summary.value = { waiting: 3, assigned: 7, delivering: 12, completed: 54 }
    deliveryList.value = [
      { deliveryNo: 'DV-0001', orderId: '000001A', storeName: '숨은집', riderNo: 1,  status: 'DELIVERING', elapsedMinutes: 15, distanceKm: 3.2 },
      { deliveryNo: 'DV-0002', orderId: '000001A', storeName: '숨은집', riderNo: 2,  status: 'COMPLETED',  elapsedMinutes: null, distanceKm: 3.2 },
      { deliveryNo: 'DV-0003', orderId: '000001A', storeName: '숨은집', riderNo: 27, status: 'COMPLETED',  elapsedMinutes: null, distanceKm: 3.2 },
      { deliveryNo: 'DV-0004', orderId: '000001A', storeName: '숨은집', riderNo: 55, status: 'WAITING',    elapsedMinutes: 15, distanceKm: 3.2 },
      { deliveryNo: 'DV-0005', orderId: '000001A', storeName: '숨은집', riderNo: 78, status: 'ASSIGNED',   elapsedMinutes: 15, distanceKm: 3.2 },
    ]
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />

    <div class="main_content">
      <AdminHeader />

      <div class="content">
        <div class="page_title_row">
          <h2 class="page_title">배달 관제</h2>
        </div>

        <!-- 요약 카드 -->
        <div class="summary_grid">
          <div class="summary_card card_blue">
            <p class="card_label">접수 대기</p>
            <p class="card_value">{{ summary.waiting }} <span class="card_unit">개</span></p>
          </div>
          <div class="summary_card card_yellow">
            <p class="card_label">배차 대기</p>
            <p class="card_value">{{ summary.assigned }} <span class="card_unit">개</span></p>
          </div>
          <div class="summary_card card_green">
            <p class="card_label">배달 중</p>
            <p class="card_value">{{ summary.delivering }} <span class="card_unit">개</span></p>
          </div>
          <div class="summary_card card_pink">
            <p class="card_label">배달 완료</p>
            <p class="card_value">{{ summary.completed }} <span class="card_unit">개</span></p>
          </div>
        </div>

        <!-- 필터 + 검색 -->
        <div class="filter_row">
          <div class="dropdown_wrap">
            <button class="dropdown_btn" @click="statusFilterOpen = !statusFilterOpen">
              상태: {{ selectedStatusLabel }}<span class="dropdown_arrow">▼</span>
            </button>
            <div v-if="statusFilterOpen" class="dropdown_menu">
              <button
                v-for="opt in statusFilterOptions"
                :key="opt.label"
                class="dropdown_item"
                @click="selectStatusFilter(opt)"
              >{{ opt.label }}</button>
            </div>
          </div>
          <input
            v-model="searchKeyword"
            class="search_input"
            placeholder="주문번호 / 가게 / 라이더번호"
            @keyup.enter="fetchList"
          />
          <button class="search_btn" @click="fetchList">검색</button>
          <button class="notice_list_btn" @click="openNoticeListModal">라이더 공지 목록</button>
          <button class="notice_btn" @click="openNoticeModal">라이더 공지 발송</button>
        </div>

        <!-- 테이블 -->
        <div class="table_wrap">
          <table class="delivery_table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>가게</th>
                <th>라이더 번호</th>
                <th>상태</th>
                <th>진행시간</th>
                <th>거리</th>
                <th>연결</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="filteredList.length > 0">
                <tr v-for="item in filteredList" :key="item.deliveryNo">
                  <td>{{ item.orderId }}</td>
                  <td>{{ item.storeName ?? '-' }}</td>
                  <td>{{ item.riderNo ?? '-' }}</td>
                  <td>
                    <span :class="['status_badge', statusBadge(item.status).class]">
                      {{ statusBadge(item.status).text }}
                    </span>
                  </td>
                  <td>{{ item.elapsedMinutes != null ? item.elapsedMinutes + '분' : '-' }}</td>
                  <td>{{ item.distanceKm != null ? item.distanceKm + 'km' : '-' }}</td>
                  <td>
                    <a :href="item.riderPhone ? `tel:${item.riderPhone}` : '#'" class="tel_link">
                      <img src="@/assets/phone.png" alt="phone" class="phone_img" />
                    </a>
                  </td>
                </tr>
              </template>
              <tr v-if="filteredList.length === 0">
                <td colspan="7" class="empty_td">조회된 배달 내역이 없습니다.</td>
              </tr>
              <tr
                v-for="i in Math.max(0, 10 - filteredList.length)"
                :key="'e' + i"
                class="empty_row"
              >
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
      </div>
    </div>

    <!-- 공지 발송 모달 -->
    <div v-if="showNoticeModal" class="modal_overlay" @click.self="closeNoticeModal">
      <div class="modal">
        <div class="modal_header">
          <img src="@/assets/megaphone.png" alt="megaphone" class="megaphone_img" />
          <p class="modal_title">라이더 전체 공지 작성</p>
          <button class="modal_close" @click="closeNoticeModal">✕</button>
        </div>
        <div class="modal_body">
          <div class="form_group">
            <label class="form_label">공지 제목</label>
            <input v-model="noticeForm.title" class="form_input" placeholder="예) 중구 긴급 교통 정보 안내" />
          </div>
          <div class="form_group">
            <div class="form_label_row">
              <label class="form_label">수신 / 대상 설정</label>
              <span class="rider_count_badge">총 수신 라이더: {{ totalRiderCount }}명</span>
            </div>
            <div class="target_row">
              <label class="radio_label"><input type="radio" v-model="noticeForm.targetType" value="ALL" /> 전체</label>
              <label class="radio_label"><input type="radio" v-model="noticeForm.targetType" value="SPECIFIC" /> 특정 구역</label>
            </div>
            <div v-if="noticeForm.targetType === 'SPECIFIC'" class="district_grid">
              <label v-for="d in daeguDistricts" :key="d" class="check_label">
                <input type="checkbox" :checked="noticeForm.selectedDistricts.includes(d)" @change="toggleDistrict(d)" /> {{ d }}
              </label>
            </div>
          </div>
          <div class="form_two_col">
            <div class="form_group">
              <label class="form_label">공지 내용</label>
              <textarea v-model="noticeForm.content" class="notice_textarea" placeholder="내용을 입력하세요" rows="5" />
            </div>
            <div class="form_group">
              <label class="form_label">공지 전송 예약 설정</label>
              <div class="sendtype_col">
                <label class="radio_label"><input type="radio" v-model="noticeForm.sendType" value="NOW" /> 즉시 전송</label>
                <label class="radio_label"><input type="radio" v-model="noticeForm.sendType" value="RESERVED" /> 예약 전송</label>
                <input v-if="noticeForm.sendType === 'RESERVED'" type="datetime-local" v-model="noticeForm.reservedAt" class="form_input" />
              </div>
            </div>
          </div>
          <p v-if="noticeResult" class="notice_result" :class="{ error: noticeResult.includes('실패') }">{{ noticeResult }}</p>
        </div>
        <div class="modal_btns">
          <button class="modal_cancel" @click="closeNoticeModal">취소</button>
          <button class="modal_confirm" @click="sendNotice" :disabled="noticeSending || !noticeForm.title.trim() || !noticeForm.content.trim()">
            {{ noticeSending ? '발송 중...' : '전송' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 공지 목록 모달 -->
    <div v-if="showNoticeListModal" class="modal_overlay" @click.self="closeNoticeListModal">
      <div class="modal modal_list">
        <div class="modal_header">
          <img src="@/assets/megaphone.png" alt="megaphone" class="megaphone_img" />
          <p class="modal_title">라이더 전체 공지 목록</p>
          <button class="modal_close" @click="closeNoticeListModal">✕</button>
        </div>
        <div class="notice_list_body">
          <div v-if="noticeList.length === 0" class="notice_empty">등록된 공지가 없습니다.</div>
          <div
            v-for="notice in noticeList"
            :key="notice.noticeNo"
            class="notice_list_item"
            @click="openNoticeDetail(notice)"
          >
            
            <span class="notice_list_title">{{ notice.title }}</span>
            <span class="notice_list_arrow">›</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 공지 상세/수정 모달 -->
    <div v-if="showNoticeDetailModal && selectedNotice" class="modal_overlay" @click.self="closeNoticeDetail">
      <div class="modal">
        <div class="modal_header">
          <img src="@/assets/megaphone.png" alt="megaphone" class="megaphone_img" />
          <p class="modal_title">라이더 전체 공지 {{ isEditMode ? '수정' : '상세' }}</p>
          <button class="modal_close" @click="closeNoticeDetail">✕</button>
        </div>
        <div class="modal_body">
          <div class="form_group">
            <label class="form_label">공지 제목</label>
            <input v-if="isEditMode" v-model="editForm.title" class="form_input" />
            <p v-else class="detail_text">{{ selectedNotice.title }}</p>
          </div>
          <div class="form_group">
            <label class="form_label">공지 내용</label>
            <textarea v-if="isEditMode" v-model="editForm.content" class="notice_textarea" rows="5" />
            <p v-else class="detail_text detail_content">{{ selectedNotice.content }}</p>
          </div>
          <div class="form_group" v-if="isEditMode">
            <label class="form_label">공지 전송 예약 설정</label>
            <div class="sendtype_col">
              <label class="radio_label"><input type="radio" v-model="editForm.sendType" value="NOW" /> 즉시 전송</label>
              <label class="radio_label"><input type="radio" v-model="editForm.sendType" value="RESERVED" /> 예약 전송</label>
              <input v-if="editForm.sendType === 'RESERVED'" type="datetime-local" v-model="editForm.reservedAt" class="form_input" />
            </div>
          </div>
          <div v-if="!isEditMode" class="detail_meta">
            <span>전송 방식: {{ selectedNotice.sendType === 'NOW' ? '즉시 전송' : '예약 전송' }}</span>
            <span>대상: {{ selectedNotice.targetType === 'ALL' ? '전체' : '특정 구역' }}</span>
            <span>발송일: {{ selectedNotice.publishedAt?.slice(0, 10) }}</span>
          </div>
        </div>
        <div class="modal_btns">
          <button v-if="!isEditMode" class="action_delete" @click="deleteNotice(selectedNotice.noticeNo)">삭제</button>
          <button v-if="!isEditMode" class="modal_confirm" @click="isEditMode = true">수정</button>
          <template v-else>
            <button class="modal_cancel" @click="isEditMode = false">취소</button>
            <button class="modal_confirm" @click="updateNotice">저장</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #ffffff; font-family: 'Noto Sans KR', sans-serif; }
.main_content { margin-left: 190px; flex: 1; display: flex; flex-direction: column; }
.content { padding: 36px 60px; display: flex; flex-direction: column; gap: 20px; }

.page_title_row { display: flex; align-items: center; justify-content: space-between; }
.page_title { font-size: 20px; font-weight: 700; color: #222; margin: 0; }
.notice_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 6px 20px; font-size: 13px; font-weight: 600; cursor: pointer; }
.notice_btn:hover { background: #7f1515; }
.notice_list_btn {  background: #b0b0b0; color: #fff; border: none; border-radius: 6px; padding: 6px 20px; font-size: 13px; font-weight: 600; cursor: pointer; margin-left: auto; }
.notice_list_btn:hover { background: #7f1515 }

/* 요약 카드 */
.summary_grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.summary_card { border-radius: 16px; padding: 22px 24px; display: flex; flex-direction: column; gap: 10px; }
.card_label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); margin: 0; }
.card_value { font-size: 32px; font-weight: 800; color: #fff; margin: 0; line-height: 1.1; }
.card_unit { font-size: 20px; font-weight: 700; }
.card_blue   { background: #b1b7bd; }
.card_yellow { background: #4a90d9; }
.card_green  { background: #f5a623; }
.card_pink   { background: #4caf50; }

/* 필터 */
.filter_row { display: flex; align-items: center; gap: 12px; margin-top: 20px; }
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 7px 12px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; gap: 8px; min-width: 140px; }
.dropdown_btn:hover { border-color: #aaa; }
.dropdown_arrow { font-size: 10px; color: #999; margin-left: auto; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 9px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown_item:hover { background: #f5f5f5; }
.search_input { border: 1px solid #ddd; border-radius: 6px; padding: 7px 12px; font-size: 13px; color: #333; outline: none; min-width: 200px; }
.search_input:focus { border-color: #aaa; }
.search_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 6px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
.search_btn:hover { background: #7f1515; }

/* 테이블 */
.table_wrap { background: #fff; border-radius: 10px; overflow: hidden; }
.delivery_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.delivery_table thead tr { background: #e8e8e8; }
.delivery_table th { padding: 12px 14px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; white-space: nowrap; }
.delivery_table th:last-child { border-right: none; }
.delivery_table td { padding: 11px 14px; text-align: center; color: #333; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
.delivery_table td:last-child { border-right: none; }
.empty_row td { height: 38px; }
.empty_td { color: #aaa; padding: 24px; text-align: center; }
.phone_img { width: 18px; height: auto; }

/* 상태 뱃지 */
.status_badge { border-radius: 4px; padding: 3px 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge_waiting    { background: #e0e0e0; color: #555; }
.badge_assigned   { background: #ddeeff; color: #2c6fbb; }
.badge_delivering { background: #fff3d6; color: #b07800; }
.badge_completed  { background: #ddf5dd; color: #2e7d32; }

/* 전화 링크 */
.tel_link { text-decoration: none; cursor: pointer; display: inline-block; }
.tel_link:hover { opacity: 0.7; }

/* 페이지네이션 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 0; }
.pagination button { background: none; border: none; font-size: 13px; color: #666; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.pagination button.active { font-weight: 700; color: #cc1f1f; }
.pagination button:hover { background: #f0f0f0; }

/* 모달 공통 */
.modal_overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 660px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden; }
.modal_list { width: 480px; }
.modal_header { display: flex; align-items: center; gap: 8px; padding: 20px 24px 16px; border-bottom: 1px solid #eee; }
.megaphone_img { width: 35px; height: auto; }
.modal_title { font-size: 16px; font-weight: 700; color: #222; margin: 0; flex: 1; }
.modal_close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }
.modal_close:hover { color: #333; }
.modal_body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.form_group { display: flex; flex-direction: column; gap: 8px; }
.form_label { font-size: 13px; font-weight: 600; color: #333; }
.form_label_row { display: flex; align-items: center; justify-content: space-between; }
.form_input { border: 1px solid #ddd; border-radius: 8px; padding: 9px 12px; font-size: 13px; color: #333; outline: none; font-family: 'Noto Sans KR', sans-serif; width: 100%; box-sizing: border-box; }
.form_input:focus { border-color: #aaa; }
.rider_count_badge { font-size: 12px; font-weight: 600; background: #f5f5f5; color: #555; padding: 4px 10px; border-radius: 20px; }
.target_row { display: flex; gap: 20px; align-items: center; }
.radio_label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #333; cursor: pointer; }
.radio_label input[type="radio"] { accent-color: #9b1b1b; cursor: pointer; }
.district_grid { display: flex; flex-wrap: wrap; gap: 8px 16px; padding: 10px 14px; background: #fafafa; border-radius: 8px; border: 1px solid #eee; }
.check_label { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #333; cursor: pointer; }
.check_label input[type="checkbox"] { accent-color: #9b1b1b; cursor: pointer; }
.form_two_col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sendtype_col { display: flex; flex-direction: column; gap: 10px; }
.notice_textarea { width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #333; resize: vertical; outline: none; font-family: 'Noto Sans KR', sans-serif; box-sizing: border-box; }
.notice_textarea:focus { border-color: #aaa; }
.notice_result { font-size: 13px; font-weight: 600; color: #4caf50; margin: 0; }
.notice_result.error { color: #cc1f1f; }
.modal_btns { display: flex; gap: 10px; justify-content: flex-end; padding: 0 24px 20px; }
.modal_cancel { padding: 9px 20px; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; font-weight: 500; }
.modal_cancel:hover { background: #f5f5f5; }
.modal_confirm { padding: 9px 24px; border: none; background: #9b1b1b; border-radius: 8px; font-size: 13px; color: #fff; cursor: pointer; font-weight: 700; }
.modal_confirm:hover:not(:disabled) { background: #7f1515; }
.modal_confirm:disabled { background: #ccc; cursor: not-allowed; }
.action_delete { padding: 9px 20px; border: 1px solid #cc1f1f; background: #fff; border-radius: 8px; font-size: 13px; color: #cc1f1f; cursor: pointer; font-weight: 500; }
.action_delete:hover { background: #fff0f0; }

/* 공지 목록 */
.notice_list_body { padding: 12px 0; max-height: 400px; overflow-y: auto; }
.notice_empty { text-align: center; color: #aaa; font-size: 13px; padding: 32px; }
.notice_list_item { display: flex; align-items: center; gap: 12px; padding: 14px 24px; cursor: pointer; border-bottom: 1px solid #f5f5f5; transition: background 0.1s; }
.notice_list_item:hover { background: #fafafa; }
.notice_list_icon { font-size: 16px; }
.notice_list_title { flex: 1; font-size: 14px; color: #333; font-weight: 500; }
.notice_list_arrow { font-size: 18px; color: #bbb; }

/* 공지 상세 */
.detail_text { font-size: 13px; color: #333; padding: 10px 12px; background: #fafafa; border-radius: 8px; border: 1px solid #eee; margin: 0; }
.detail_content { white-space: pre-wrap; line-height: 1.6; min-height: 80px; }
.detail_meta { display: flex; gap: 16px; font-size: 12px; color: #888; flex-wrap: wrap; }
</style>