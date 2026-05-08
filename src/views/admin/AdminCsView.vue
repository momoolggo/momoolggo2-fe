<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'

// 문의 요약
const summary = ref({
  totalInquiryCount: 0,
  autoResolvedCount: 0,
  pendingInquiryCount: 0,
})

// FAQ 목록
const faqList = ref([])
const loading = ref(false)

// 미처리 문의 목록
const showInquiryList = ref(false)
const inquiryList = ref([])

// 문의 상세 모달
const showInquiryModal = ref(false)
const selectedInquiry = ref(null)
const replyText = ref('')

// 탭
const activeTab = ref(null)
const tabOptions = [
  { label: '결제', value: 'PAYMENT' },
  { label: '배달', value: 'DELIVERY' },
  { label: '환불 취소', value: 'REFUND' },
  { label: '회원', value: 'MEMBER' },
]

// 페이지네이션
const currentPage = ref(1)


// FAQ 등록 모달
const showCreateModal = ref(false)
const createForm = ref({ type: null, question: '', answer: '' })
const createCategoryOpen = ref(false)

// FAQ 수정 모달
const showEditModal = ref(false)
const editForm = ref({ faqId: null, type: null, question: '', answer: '' })
const editCategoryOpen = ref(false)

const categoryLabel = (val) => {
  const map = {
    PAYMENT: '결제',
    DELIVERY: '배달',
    REFUND: '환불/취소',
    MEMBER: '회원',
    REFUND_CANCEL: '환불/취소',
    CHATBOT: '챗봇 미분류',
  }
  return map[val] ?? val ?? '-'
}

const userTypeLabel = (val) => {
  const map = { CUSTOMER: '고객', OWNER: '사장', RIDER: '라이더' }
  return map[val] ?? val
}

const userTypeBadgeClass = (val) => {
  const map = { CUSTOMER: 'badge_customer', OWNER: 'badge_owner', RIDER: 'badge_rider' }
  return map[val] ?? ''
}

const statusLabel = (val) => {
  const map = { PENDING: '미처리(대기 중)', PROCESSING: '처리중', RESOLVED: '완료' }
  return map[val] ?? val
}

// 문의 ID 포맷 (INQ-YYYYMMDD-001)
const formatInquiryId = (inquiry) => {
  const date = inquiry.createdAt?.slice(0, 10).replaceAll('-', '') ?? '00000000'
  const id = String(inquiry.inquiryId).padStart(3, '0')
  return `INQ-${date}-${id}`
}

const fetchSummary = async () => {
  try {
    const res = await adminService.getCsSummary()
    if (res?.resultData) summary.value = res.resultData
  } catch (e) {
    summary.value = { totalInquiryCount: 30, autoResolvedCount: 22, pendingInquiryCount: 8 }
  }
}

// 미처리 문의 목록 불러오기
const fetchInquiryList = async () => {
  try {
    const res = await adminService.getInquiryList(null, 'PENDING')
    inquiryList.value = res?.resultData ?? []
  } catch (e) {
    inquiryList.value = [
  { inquiryId: 1, category: 'REFUND', content: '부분 환불 요청드립니다.', userNo: 1001, userName: 'kim***', userType: 'CUSTOMER', state: 'PENDING', createdAt: '2026-05-03T11:32:00' },
  { inquiryId: 2, category: 'PAYMENT', content: '이번 주 정산 내역이 장부랑 5,000원 차이가 납니다.', userNo: 1002, userName: 'park***', userType: 'OWNER', state: 'PENDING', createdAt: '2026-05-04T14:21:00' },
  { inquiryId: 3, category: 'MEMBER', content: '음식에서 머리카락이 나왔어요.', userNo: 1003, userName: 'lee***', userType: 'CUSTOMER', state: 'PENDING', createdAt: '2026-05-05T09:15:00' },
  { inquiryId: 4, category: 'MEMBER', content: '노쇼 손님 계정 정지 부탁드립니다.', userNo: 1004, userName: 'choi***', userType: 'OWNER', state: 'PENDING', createdAt: '2026-05-06T16:44:00' },
  { inquiryId: 5, category: 'CHATBOT', content: '챗봇 미분류 : 고객 채팅 미 분류', userNo: 1005, userName: 'jung***', userType: 'CUSTOMER', state: 'PENDING', createdAt: '2026-05-07T10:05:00' },
  { inquiryId: 6, category: 'CHATBOT', content: '챗봇 미분류 : 사진 판독 어려움', userNo: 1006, userName: 'oh***', userType: 'CUSTOMER', state: 'PENDING', createdAt: '2026-05-08T08:30:00' },
]
  }
}

// 미처리 문의 버튼 클릭
const openInquiryList = async () => {
  await fetchInquiryList()
  showInquiryList.value = true
}

// 문의 상세 모달 열기
const openInquiryModal = async (inquiry) => {
  try {
    const res = await adminService.getInquiryDetail(inquiry.inquiryId)
    selectedInquiry.value = res?.resultData ?? inquiry
  } catch (e) {
    selectedInquiry.value = inquiry
  }
  replyText.value = selectedInquiry.value.answer ?? ''
  showInquiryModal.value = true
}

// 답변 전송 및 처리 완료
const submitReply = async () => {
  if (!replyText.value.trim()) {
    alert('답변을 입력해주세요.')
    return
  }
  try {
    await adminService.replyInquiry(selectedInquiry.value.inquiryId, { reply: replyText.value })
    // 목록에서 제거
    inquiryList.value = inquiryList.value.filter(i => i.inquiryId !== selectedInquiry.value.inquiryId)
    summary.value.pendingInquiryCount = Math.max(0, summary.value.pendingInquiryCount - 1)
    showInquiryModal.value = false
    selectedInquiry.value = null
    replyText.value = ''
  } catch (e) {
    // 더미: 로컬에서 제거
    inquiryList.value = inquiryList.value.filter(i => i.inquiryId !== selectedInquiry.value.inquiryId)
    summary.value.pendingInquiryCount = Math.max(0, summary.value.pendingInquiryCount - 1)
    showInquiryModal.value = false
    selectedInquiry.value = null
    replyText.value = ''
  }
}

const fetchFaqList = async () => {
  loading.value = true
  try {
    const res = await adminService.getFaqList(null)
    faqList.value = res?.resultData ?? []
  } catch (e) {
    faqList.value = [
      { faqId: 1, type: 'PAYMENT', question: 'Q. 결제가 되지 않는데 어떻게 해야 하나요?', answer: '결제 수단을 확인하세요.', visible: true, createdAt: '2026-04-01' },
      { faqId: 2, type: 'DELIVERY', question: 'Q. 배달 현황을 어떻게 확인하나요?', answer: '마이페이지에서 확인 가능합니다.', visible: true, createdAt: '2026-04-01' },
      { faqId: 3, type: 'REFUND', question: 'Q. 음식이 잘못 왔는데 환불받을 수 있나요?', answer: '사진 첨부 후 문의 주세요.', visible: false, createdAt: '2026-04-01' },
      { faqId: 4, type: 'MEMBER', question: 'Q. 주문 성공 여부를 어떻게 알 수 있나요?', answer: '앱 푸시 알림으로 안내드립니다.', visible: true, createdAt: '2026-04-01' },
      { faqId: 5, type: 'PAYMENT', question: 'Q. 결제 수단은 어떤 것들이 있나요?', answer: '카드, 카카오페이, 토스 등을 지원합니다.', visible: true, createdAt: '2026-04-01' },
      { faqId: 6, type: 'DELIVERY', question: 'Q. 배달 주소를 잘못 입력했어요.', answer: '조리 시작 전 고객센터를 통해 수정 가능합니다.', visible: false, createdAt: '2026-04-01' },
      { faqId: 7, type: 'REFUND', question: 'Q. 환불은 얼마나 걸리나요?', answer: '카드는 3~5 영업일 소요됩니다.', visible: true, createdAt: '2026-04-01' },
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSummary()
  fetchFaqList()
})

// 전체 필터링된 목록
const baseFilteredList = computed(() => {
  if (!activeTab.value) return faqList.value
  return faqList.value.filter(item => item.type === activeTab.value)
})

// 총 페이지 수 계산
const totalPages = computed(() => 
  Math.max(1, Math.ceil(baseFilteredList.value.length / 10))
)

// 현재 페이지에 맞게 slice
const filteredFaqList = computed(() => {
  const start = (currentPage.value - 1) * 10
  return baseFilteredList.value.slice(start, start + 10)
})

const toggleVisible = async (faq) => {
  try {
    await adminService.toggleFaqVisible(faq.faqId)
    faq.visible = !faq.visible
  } catch (e) {
    faq.visible = !faq.visible
  }
}

const openCreateModal = () => {
  createForm.value = { type: null, question: '', answer: '' }
  showCreateModal.value = true
}

const submitCreate = async () => {
  if (!createForm.value.type || !createForm.value.question || !createForm.value.answer) {
    alert('모든 항목을 입력해주세요.')
    return
  }
  try {
    await adminService.createFaq({ type: createForm.value.type, question: createForm.value.question, answer: createForm.value.answer })
    showCreateModal.value = false
    await fetchFaqList()
  } catch (e) {
    faqList.value.unshift({ faqId: Date.now(), type: createForm.value.type, question: createForm.value.question, answer: createForm.value.answer, visible: true, createdAt: new Date().toISOString().slice(0, 10) })
    showCreateModal.value = false
  }
}

const openEditModal = (faq) => {
  editForm.value = { faqId: faq.faqId, type: faq.type, question: faq.question, answer: faq.answer }
  showEditModal.value = true
}

const submitEdit = async () => {
  if (!editForm.value.question || !editForm.value.answer) {
    alert('모든 항목을 입력해주세요.')
    return
  }
  try {
    await adminService.updateFaq(editForm.value.faqId, { type: editForm.value.type, question: editForm.value.question, answer: editForm.value.answer })
    showEditModal.value = false
    await fetchFaqList()
  } catch (e) {
    const idx = faqList.value.findIndex(f => f.faqId === editForm.value.faqId)
    if (idx !== -1) faqList.value[idx] = { ...faqList.value[idx], ...editForm.value }
    showEditModal.value = false
  }
}

const deleteFaq = async (faqId) => {
  if (!confirm('FAQ를 삭제하시겠습니까?')) return
  try {
    await adminService.deleteFaq(faqId)
    await fetchFaqList()
  } catch (e) {
    faqList.value = faqList.value.filter(f => f.faqId !== faqId)
  }
}
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />
    <div class="main_content">
      <AdminHeader />

      <div class="content">
        <h2 class="page_title">고객 지원</h2>

        <!-- 실시간 문의 현황 -->
        <div class="section_label">
          <img src="@/assets/chatbot.png" alt="chatbot" class="chatbot_img" /> 실시간 문의 현황
        </div>

        <div class="summary_grid">
          <div class="summary_card">
            <div class="card_main">
              <div class="icon_area blue_area">
                <img src="@/assets/chating.png" alt="chating" class="chating_img" />
              </div>
              <div class="card_info">
                <p class="card_label">총 문의 건수</p>
                <p class="card_value blue_val">{{ summary.totalInquiryCount }}건</p>
              </div>
            </div>
          </div>

          <div class="summary_card">
            <div class="card_main">
              <div class="icon_area green_area">
                <img src="@/assets/check1.png" alt="check" class="check1_img" />
              </div>
              <div class="card_info">
                <p class="card_label">자동 응대 완료 건수</p>
                <p class="card_value green_val">{{ summary.autoResolvedCount }}건</p>
              </div>
            </div>
          </div>

          <!-- 미처리 문의 - 클릭 가능 -->
          <div class="summary_card clickable_card" @click="openInquiryList">
            <div class="card_main">
              <div class="icon_area yellow_area">
                <img src="@/assets/waiting.png" alt="waiting" class="waiting_img" />
              </div>
              <div class="card_info">
                <p class="card_label">미처리 문의</p>
                <p class="card_value yellow_val">{{ summary.pendingInquiryCount }}건</p>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ 관리 -->
        <div class="faq_header">
          <span class="faq_title">FAQ관리</span>
          <button class="create_btn" @click="openCreateModal">+ 새 FAQ 등록</button>
        </div>

        <!-- 카테고리 탭 -->
        <div class="tab_row">
          <button class="tab_btn" :class="{ active: activeTab === null }" @click="selectTab(null)">전체</button>
          <button v-for="opt in tabOptions" :key="opt.value" class="tab_btn" :class="{ active: activeTab === opt.value }" @click="selectTab(opt.value)">{{ opt.label }}</button>
        </div>

        <!-- FAQ 테이블 -->
        <div class="table_wrap">
          <table class="faq_table">
            <thead>
              <tr>
                <th>번호</th>
                <th>카테고리</th>
                <th class="col_wide">질문내용</th>
                <th>노출여부</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="filteredFaqList.length > 0">
                <tr v-for="(item, idx) in filteredFaqList" :key="item.faqId">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ categoryLabel(item.type) }}</td>
                  <td class="col_wide content_td">{{ item.question }}</td>
                  <td>
                    <div class="toggle_wrap" :class="{ on: item.visible }" @click="toggleVisible(item)">
                      <div class="toggle_thumb"></div>
                    </div>
                  </td>
                  <td>{{ item.createdAt?.slice(0, 10) }}</td>
                  <td>
                    <div class="action_btns">
                      <button class="edit_btn" @click="openEditModal(item)">수정</button>
                      <button class="delete_btn" @click="deleteFaq(item.faqId)">삭제</button>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="filteredFaqList.length === 0">
                <td colspan="6" class="empty_td">등록된 FAQ가 없습니다.</td>
              </tr>
              <tr v-for="i in Math.max(0, 10 - filteredFaqList.length)" :key="'e'+i" class="empty_row">
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

    <!-- 미처리 문의 목록 모달 -->
    <div v-if="showInquiryList" class="modal_overlay" @click.self="showInquiryList = false">
      <div class="modal inquiry_list_modal">
        <div class="modal_header">
          <span class="modal_title">미처리 문의</span>
          <button class="modal_close" @click="showInquiryList = false">✕</button>
        </div>

        <div class="inquiry_table_wrap">
          <table class="inquiry_table">
            <thead>
              <tr>
                <th>문의 ID</th>
                <th>카테고리</th>
                <th class="col_wide">질문내용</th>
                <th>구분(아이디)</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="inquiryList.length === 0">
                <td colspan="5" class="empty_td">미처리 문의가 없습니다.</td>
              </tr>
              <tr
                v-for="item in inquiryList"
                :key="item.inquiryId"
                class="clickable_row"
                @click="openInquiryModal(item)"
              >
                <td class="inquiry_id_td">{{ formatInquiryId(item) }}</td>
                <td>{{ categoryLabel(item.category) }}</td>
                <td class="col_wide content_td">{{ item.content }}</td>
                <td>
                  <div class="user_cell">
                    <span :class="['user_badge', userTypeBadgeClass(item.userType ?? 'CUSTOMER')]">
                      {{ userTypeLabel(item.userType ?? 'CUSTOMER') }}
                    </span>
                    <span class="user_id">{{ item.userName ?? `user${item.userNo}` }}</span>
                  </div>
                </td>
                <td>{{ item.createdAt?.slice(0, 10) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 문의 상세 / 답변 모달 -->
    <div v-if="showInquiryModal && selectedInquiry" class="modal_overlay" @click.self="showInquiryModal = false">
      <div class="modal reply_modal">
        <div class="reply_modal_header">
          <div>
            <p class="reply_modal_title">미처리 문의 처리</p>
            <p class="reply_modal_id">{{ formatInquiryId(selectedInquiry) }}</p>
          </div>
          <button class="modal_close" @click="showInquiryModal = false">✕</button>
        </div>

        <!-- 문의 메타 정보 -->
        <div class="inquiry_meta">
          <span>문의 일시: {{ selectedInquiry.createdAt?.slice(0, 16).replace('T', ' ') }}</span>
          <span class="meta_divider">|</span>
          <span>상태: {{ statusLabel(selectedInquiry.state) }}</span>
          <span :class="['user_badge', userTypeBadgeClass(selectedInquiry.userType ?? 'CUSTOMER')]">
            {{ userTypeLabel(selectedInquiry.userType ?? 'CUSTOMER') }}
          </span>
          <span class="meta_user">{{ selectedInquiry.userName ?? `user${selectedInquiry.userNo}` }} / 주문번호: {{ selectedInquiry.orderNo ?? '-' }}</span>
        </div>

        <!-- 문의 내용 + 답변 -->
        <div class="reply_body">
          <div class="reply_section">
            <p class="reply_section_title">문의 내용</p>
            <div class="reply_content_box">{{ selectedInquiry.content }}</div>
          </div>
          <div class="reply_section">
            <p class="reply_section_title">관리자 조치 및 답변</p>
            <textarea
              v-model="replyText"
              class="reply_textarea"
              placeholder="답변을 입력해주세요"
              :disabled="selectedInquiry.state === 'RESOLVED'"
            ></textarea>
          </div>
        </div>

        <div class="reply_actions">
          <button class="cancel_btn" @click="showInquiryModal = false">닫기</button>
          <button
            v-if="selectedInquiry.state !== 'RESOLVED'"
            class="submit_btn"
            @click="submitReply"
          >답변 전송 및 처리 완료</button>
        </div>
      </div>
    </div>

    <!-- FAQ 등록 모달 -->
    <div v-if="showCreateModal" class="modal_overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal_header">
          <div class="modal_title_row">
            <img src="@/assets/question.png" alt="question" class="question_img" />
            <span class="modal_title">FAQ 등록</span>
          </div>
          <button class="modal_close" @click="showCreateModal = false">✕</button>
        </div>
        <div class="modal_body">
          <div class="form_field">
            <label>카테고리</label>
            <div class="dropdown_wrap">
              <button class="dropdown_btn" @click="createCategoryOpen = !createCategoryOpen">
                {{ categoryLabel(createForm.type) }}<span class="dropdown_arrow">▼</span>
              </button>
              <div v-if="createCategoryOpen" class="dropdown_menu">
                <button v-for="opt in tabOptions" :key="opt.value" class="dropdown_item" @click="createForm.type = opt.value; createCategoryOpen = false">{{ opt.label }}</button>
              </div>
            </div>
          </div>
          <div class="form_field">
            <label>문의사항 제목</label>
            <div class="input_wrap">
              <input v-model="createForm.question" type="text" placeholder="Q" class="form_input" />
            </div>
          </div>
          <div class="form_field">
            <label>문의사항 답변</label>
            <textarea v-model="createForm.answer" class="form_textarea" placeholder="답변을 입력해주세요"></textarea>
          </div>
          <button class="submit_btn" @click="submitCreate">등록</button>
        </div>
      </div>
    </div>

    <!-- FAQ 수정 모달 -->
    <div v-if="showEditModal" class="modal_overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal_header">
          <div class="modal_title_row">
            <img src="@/assets/question.png" alt="question" class="question_img" />
            <span class="modal_title">FAQ 수정</span>
          </div>
          <button class="modal_close" @click="showEditModal = false">✕</button>
        </div>
        <div class="modal_body">
          <div class="form_field">
            <label>카테고리</label>
            <div class="dropdown_wrap">
              <button class="dropdown_btn" @click="editCategoryOpen = !editCategoryOpen">
                {{ categoryLabel(editForm.type) }}<span class="dropdown_arrow">▼</span>
              </button>
              <div v-if="editCategoryOpen" class="dropdown_menu">
                <button v-for="opt in tabOptions" :key="opt.value" class="dropdown_item" @click="editForm.type = opt.value; editCategoryOpen = false">{{ opt.label }}</button>
              </div>
            </div>
          </div>
          <div class="form_field">
            <label>문의사항 제목</label>
            <input v-model="editForm.question" type="text" class="form_input" />
          </div>
          <div class="form_field">
            <label>문의사항 답변</label>
            <textarea v-model="editForm.answer" class="form_textarea"></textarea>
          </div>
          <div class="edit_modal_btns">
            <button class="cancel_btn" @click="showEditModal = false">취소</button>
            <button class="submit_btn edit_submit" @click="submitEdit">수정</button>
          </div>
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

.section_label { font-size: 14px; font-weight: 600; color: #444; display: flex; align-items: center; gap: 6px; margin-bottom: -8px; }
.chatbot_img { width: 23px; height: auto; margin-right: 5px; }

/* 요약 카드 */
.summary_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.summary_card { border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 10px rgba(0,0,0,0.08); background: #fff; }
.clickable_card { cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
.clickable_card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.13); }
.card_main { display: flex; align-items: stretch; }
.icon_area { display: flex; align-items: center; justify-content: center; padding: 20px 18px; flex-shrink: 0; }
.blue_area { background: #4a90d9; }
.green_area { background: #4caf50; }
.yellow_area { background: #f5a623; }
.chating_img { width: 40px; height: auto; }
.check1_img { width: 40px; height: auto; }
.waiting_img { width: 40px; height: auto; }
.card_info { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 20px; }
.card_label { font-size: 13px; color: #888; font-weight: 500; }
.card_value { font-size: 24px; font-weight: 800; }
.blue_val { color: #4a90d9; }
.green_val { color: #4caf50; }
.yellow_val { color: #f5a623; }

/* FAQ 헤더 */
.faq_header { display: flex; align-items: center; justify-content: space-between; }
.faq_title { font-size: 18px; font-weight: 700; color: #222; }
.create_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 6px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
.create_btn:hover { background: #7f1515; }

/* 탭 */
.tab_row { display: flex; gap: 8px; }
.tab_btn { padding: 6px 18px; border: 1px solid #ddd; background: #fff; border-radius: 20px; font-size: 13px; color: #666; cursor: pointer; font-weight: 500; transition: all 0.15s; }
.tab_btn.active { background: #9b1b1b; border-color: #9b1b1b; color: #fff; font-weight: 700; }

/* 테이블 */
.table_wrap { background: #fff; border-radius: 10px; overflow: hidden; }
.faq_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.faq_table thead tr { background: #e8e8e8; }
.faq_table th { padding: 12px 14px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; white-space: nowrap; }
.faq_table th:last-child { border-right: none; }
.faq_table td { padding: 11px 14px; text-align: center; color: #333; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
.faq_table td:last-child { border-right: none; }
.col_wide { width: 40%; text-align: left !important; }
.content_td { max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty_row td { height: 38px; }
.empty_td { color: #aaa; padding: 24px; text-align: center; }

/* 토글 */
.toggle_wrap { width: 40px; height: 22px; border-radius: 11px; background: #ddd; position: relative; cursor: pointer; transition: background 0.2s; display: inline-block; }
.toggle_wrap.on { background: #9b1b1b; }
.toggle_thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle_wrap.on .toggle_thumb { left: 21px; }

.action_btns { display: flex; gap: 4px; justify-content: center; }
.edit_btn { background: #fff; border: 1px solid #aaa; color: #444; border-radius: 4px; padding: 3px 10px; font-size: 11px; cursor: pointer; }
.edit_btn:hover { background: #f5f5f5; }
.delete_btn { background: #9b1b1b; border: none; color: #fff; border-radius: 4px; padding: 3px 10px; font-size: 11px; cursor: pointer; }
.delete_btn:hover { background: #7f1515; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 0; }
.pagination button { background: none; border: none; font-size: 13px; color: #666; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.pagination button.active { font-weight: 700; color: #cc1f1f; }
.pagination button:hover { background: #f0f0f0; }

/* 모달 공통 */
.modal_overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 520px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal_header { display: flex; align-items: center; justify-content: space-between; padding: 22px 28px 16px; border-bottom: 1px solid #eee; }
.modal_title_row { display: flex; align-items: center; gap: 10px; }
.question_img { width: 40px; height: auto; }
.modal_title { font-size: 18px; font-weight: 700; color: #222; }
.modal_close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }
.modal_close:hover { color: #333; }
.modal_body { padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; }
.form_field { display: flex; flex-direction: column; gap: 8px; }
.form_field label { font-size: 13px; font-weight: 600; color: #333; }
.dropdown_wrap { position: relative; }
.dropdown_btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 10px 14px; font-size: 13px; color: #333; cursor: pointer; display: flex; align-items: center; justify-content: space-between; width: 100%; }
.dropdown_btn:hover { border-color: #aaa; }
.dropdown_arrow { font-size: 10px; color: #999; }
.dropdown_menu { position: absolute; top: calc(100% + 4px); left: 0; background: #fff; border: 1px solid #ddd; border-radius: 6px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 20; overflow: hidden; }
.dropdown_item { display: block; width: 100%; padding: 10px 14px; font-size: 13px; color: #333; background: none; border: none; text-align: left; cursor: pointer; }
.dropdown_item:hover { background: #f5f5f5; }
.input_wrap { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
.form_input { flex: 1; border: none; outline: none; padding: 10px 14px; font-size: 13px; color: #333; width: 100%; }
.form_field input.form_input { border: none; border-radius: 6px; padding: 10px 14px; font-size: 13px; color: #333; outline: none; width: 100%; box-sizing: border-box; }
.form_textarea { border: 1px solid #ddd; border-radius: 6px; padding: 12px 14px; font-size: 13px; color: #333; outline: none; resize: vertical; min-height: 140px; font-family: inherit; line-height: 1.6; width: 100%; box-sizing: border-box; }
.submit_btn { background: #9b1b1b; color: #fff; border: none; border-radius: 8px; padding: 13px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 4px; }
.submit_btn:hover { background: #7f1515; }
.edit_modal_btns { display: flex; gap: 10px; margin-top: 4px; }
.cancel_btn { flex: 1; padding: 13px; border: 1px solid #ddd; background: #fff; border-radius: 8px; font-size: 14px; color: #666; cursor: pointer; font-weight: 500; }
.cancel_btn:hover { background: #f5f5f5; }
.edit_submit { flex: 1; margin-top: 0; }

/* 미처리 문의 목록 모달 */
.inquiry_list_modal { width: 800px; max-height: 80vh; overflow-y: auto; }
.inquiry_table_wrap { padding: 0 4px; }
.inquiry_table { width: 100%; border-collapse: collapse; font-size: 13px; }
.inquiry_table thead tr { background: #e8e8e8; }
.inquiry_table th { padding: 12px 14px; text-align: center; font-weight: 600; color: #444; border-bottom: 1px solid #ddd; white-space: nowrap; }
.inquiry_table td { padding: 11px 14px; text-align: center; color: #333; border-bottom: 1px solid #f0f0f0; }
.clickable_row { cursor: pointer; }
.clickable_row:hover { background: #fafafa; }
.inquiry_id_td { font-size: 11px; color: #888; white-space: nowrap; }
.user_cell { display: flex; align-items: center; gap: 6px; justify-content: center; }
.user_badge { border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; color: #fff; white-space: nowrap; }
.badge_customer { background: #4a90d9; }
.badge_owner { background:#7150db; }
.badge_rider { background:  #4caf50; }
.user_id { font-size: 12px; color: #555; }

/* 문의 답변 모달 */
.reply_modal { width: 760px; max-height: 85vh; overflow-y: auto; }
.reply_modal_header { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 28px 16px; border-bottom: 1px solid #eee; }
.reply_modal_title { font-size: 18px; font-weight: 700; color: #222; margin: 0 0 4px; }
.reply_modal_id { font-size: 12px; color: #aaa; margin: 0; }
.inquiry_meta { display: flex; align-items: center; gap: 10px; padding: 14px 28px; background: #f8f8f8; border-bottom: 1px solid #eee; font-size: 13px; color: #555; flex-wrap: wrap; }
.meta_divider { color: #ddd; }
.meta_user { color: #555; }
.reply_body { display: flex; gap: 16px; padding: 20px 28px; }
.reply_section { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.reply_section_title { font-size: 13px; font-weight: 700; color: #333; margin: 0; }
.reply_content_box { border: 1px solid #eee; border-radius: 8px; padding: 14px; font-size: 13px; color: #444; line-height: 1.7; min-height: 180px; background: #fafafa; }
.reply_textarea { border: 1px solid #ddd; border-radius: 8px; padding: 14px; font-size: 13px; color: #333; outline: none; resize: vertical; min-height: 180px; font-family: inherit; line-height: 1.7; width: 100%; box-sizing: border-box; }
.reply_actions { display: flex; gap: 10px; padding: 16px 28px 24px; justify-content: flex-end; }
.reply_actions .cancel_btn {
  width: 80px;
  flex: none;
  padding: 9px 0;  /* 13px → 9px */
  font-size: 13px;
}

.reply_actions .submit_btn {
  width: auto;
  flex: none;
  padding: 9px 20px;  /* 13px 24px → 9px 20px */
  font-size: 13px;  /* 14px → 13px */
  margin-top: 0;
}
</style>