<script setup>
import { reactive, ref, onMounted } from 'vue'

const activeTab = ref('reports')

// 신고 목록 (백엔드 연동 시 API로 교체)
const state = reactive({
  reports: [],
  loading: false,
})

// 더미 데이터 (백엔드 연동 전 테스트용)
const dummyReports = [
  {
    reportId: 1,
    storeName: '맛있는 치킨',
    reviewContent: '별로였어요 그냥',
    score: 1,
    reason: '이유 없는 1점 리뷰',
    detail: '주문도 정상적으로 배달됐는데 이유없이 1점입니다.',
    status: 'PENDING',
    createdAt: '2026-03-20',
    userName: '홍길동',
  },
  {
    reportId: 2,
    storeName: '행복한 분식',
    reviewContent: '음식에 이물질이 있었어요',
    score: 1,
    reason: '허위 사실 기재',
    detail: '절대 있을 수 없는 일입니다.',
    status: 'PENDING',
    createdAt: '2026-03-21',
    userName: '김철수',
  },
]

onMounted(() => {
  // TODO: API 연동 시 교체
  state.reports = dummyReports
})

const statusLabel = (status) => {
  if (status === 'PENDING')  return '검토 중'
  if (status === 'APPROVED') return '삭제 승인'
  if (status === 'REJECTED') return '삭제 거절'
  return status
}

const statusClass = (status) => {
  if (status === 'PENDING')  return 'badge_pending'
  if (status === 'APPROVED') return 'badge_approved'
  if (status === 'REJECTED') return 'badge_rejected'
  return ''
}

// 승인/거절 (백엔드 연동 시 API 호출로 교체)
const approve = (report) => {
  // TODO: await adminService.approveReport(report.reportId)
  report.status = 'APPROVED'
  alert(`신고 #${report.reportId} — 리뷰 삭제 승인 완료`)
}

const reject = (report) => {
  // TODO: await adminService.rejectReport(report.reportId)
  report.status = 'REJECTED'
  alert(`신고 #${report.reportId} — 삭제 거절 완료`)
}
</script>

<template>
  <div class="admin_wrap">
    <h1 class="admin_title">관리자 페이지</h1>

    <!-- 탭 -->
    <div class="tab_bar">
      <button
        class="tab_btn"
        :class="{ active: activeTab === 'reports' }"
        @click="activeTab = 'reports'"
      >
        리뷰 신고 목록
        <span v-if="state.reports.filter(r => r.status === 'PENDING').length" class="badge">
          {{ state.reports.filter(r => r.status === 'PENDING').length }}
        </span>
      </button>
      <!-- 추후 탭 추가 가능 -->
      <!-- <button class="tab_btn" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">회원 관리</button> -->
    </div>

    <!-- 리뷰 신고 목록 -->
    <div v-if="activeTab === 'reports'" class="tab_content">

      <div v-if="!state.reports.length" class="empty_msg">신고 내역이 없습니다.</div>

      <div v-else class="report_list">
        <div v-for="report in state.reports" :key="report.reportId" class="report_card">

          <div class="report_top">
            <div class="report_info">
              <span class="store_name">🏪 {{ report.storeName }}</span>
              <span :class="['status_badge', statusClass(report.status)]">{{ statusLabel(report.status) }}</span>
            </div>
            <span class="report_date">{{ report.createdAt }}</span>
          </div>

          <div class="report_review">
            <div class="review_score">
              <span class="stars">{{ '★'.repeat(report.score) }}{{ '☆'.repeat(5 - report.score) }}</span>
              <span class="reviewer">{{ report.userName }}</span>
            </div>
            <p class="review_text">"{{ report.reviewContent }}"</p>
          </div>

          <div class="report_reason">
            <span class="reason_label">신고 사유</span>
            <span class="reason_text">{{ report.reason }}</span>
          </div>

          <div v-if="report.detail" class="report_detail">
            <span class="reason_label">업주 소명</span>
            <p class="detail_text">{{ report.detail }}</p>
          </div>

          <div v-if="report.status === 'PENDING'" class="report_actions">
            <button class="btn_approve" @click="approve(report)">✓ 삭제 승인</button>
            <button class="btn_reject"  @click="reject(report)">✕ 삭제 거절</button>
          </div>

          <div v-else class="report_done">
            처리 완료 — {{ statusLabel(report.status) }}
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.admin_wrap { padding: 40px; max-width: 900px; margin: 0 auto; }
.admin_title { font-size: 28px; font-weight: 700; color: #333; margin-bottom: 32px; }

/* 탭 */
.tab_bar { display: flex; gap: 8px; border-bottom: 2px solid #eee; margin-bottom: 32px; }
.tab_btn {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 600;
  color: #aaa;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}
.tab_btn.active { color: #3f51b5; border-bottom-color: #3f51b5; }
.badge {
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
}

.empty_msg { text-align: center; color: #aaa; padding: 60px 0; font-size: 15px; }

/* 신고 카드 */
.report_list { display: flex; flex-direction: column; gap: 20px; }
.report_card {
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.report_top { display: flex; justify-content: space-between; align-items: center; }
.report_info { display: flex; align-items: center; gap: 12px; }
.store_name { font-size: 16px; font-weight: 700; color: #333; }
.report_date { font-size: 13px; color: #bbb; }

.status_badge { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
.badge_pending  { background: #fff7ed; color: #f59e0b; }
.badge_approved { background: #f0fdf4; color: #16a34a; }
.badge_rejected { background: #fef2f2; color: #ef4444; }

.report_review { background: #f9f9f9; border-radius: 12px; padding: 16px; }
.review_score { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.stars { color: #ef4444; font-size: 16px; }
.reviewer { font-size: 13px; color: #888; }
.review_text { font-size: 14px; color: #555; margin: 0; font-style: italic; line-height: 1.6; }

.report_reason { display: flex; align-items: center; gap: 10px; }
.reason_label { font-size: 12px; font-weight: 700; color: #666; background: #f0f0f0; padding: 3px 10px; border-radius: 6px; white-space: nowrap; }
.reason_text { font-size: 14px; color: #333; }

.report_detail { display: flex; flex-direction: column; gap: 6px; }
.detail_text { font-size: 14px; color: #555; margin: 0; line-height: 1.6; padding-left: 4px; }

.report_actions { display: flex; gap: 12px; }
.btn_approve {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #16a34a;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn_approve:hover { opacity: 0.85; }
.btn_reject {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn_reject:hover { opacity: 0.85; }

.report_done { text-align: center; font-size: 14px; color: #aaa; padding: 8px 0; }
</style>