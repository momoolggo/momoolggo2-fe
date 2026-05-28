<script setup>
import { reactive, onMounted, watch } from 'vue'
import { useStore } from '@/stores/useStore'
import ownerService from '@/services/ownerService'
import { showAlert, showConfirm } from '@/composables/useAlert'

const state = reactive({
  reviews: [],
  loading: false,
})

const store = useStore()

const commentModal = reactive({
  show: false,
  reviewId: null,
  content: '',
})

const reportModal = reactive({
  show: false,
  reviewId: null,
  reason: '',
  detail: '',
})

const reportReasons = [
  '이유 없는 1점 리뷰',
  '허위 사실 기재',
  '부적절 콘텐츠',
  '기타',
]

const loadReviews = async () => {
  state.loading = true

  try {
    const res = await ownerService.getOwnerReviews(store.myStoreId)
    state.reviews = res.resultData?.reviews ?? []
  } catch (error) {
    console.error('리뷰 조회 실패:', error)
    state.reviews = []
  } finally {
    state.loading = false
  }
}

onMounted(loadReviews)

watch(
  () => store.myStoreId,
  () => {
    loadReviews()
  },
)
const renderStars = (score) => '★'.repeat(score) + '☆'.repeat(5 - score)

const getReviewerName = (review) => {
  if (review?.userStatus === 'WITHDRAWN' || review?.status === 'WITHDRAWN') return '탈퇴한 회원'
  if (review?.userName) return review.userName
  return '고객'
}

const openComment = (review) => {
  commentModal.reviewId = review.reviewId
  commentModal.content = review.replyContent ?? ''
  commentModal.show = true
}

const closeComment = () => {
  commentModal.show = false
  commentModal.reviewId = null
  commentModal.content = ''
}

const saveComment = async () => {
  if (!commentModal.content.trim()) {
    await showAlert('답글 내용을 입력해 주세요.', { title: '입력 필요', type: 'warning' })
    return
  }

  const review = state.reviews.find((item) => item.reviewId === commentModal.reviewId)
  if (!review) return

  try {
    if (review.replyId) {
      await ownerService.updateReviewReply(review.replyId, {
        content: commentModal.content.trim(),
      })

      review.replyContent = commentModal.content.trim()
      await showAlert('답글이 수정되었습니다.', { title: '수정 완료', type: 'success' })
      closeComment()
      return
    }

    await ownerService.saveReviewReply(commentModal.reviewId, {
      content: commentModal.content.trim(),
    })

    await loadReviews()
    await showAlert('답글이 등록되었습니다.', { title: '등록 완료', type: 'success' })
    closeComment()
  } catch (error) {
    console.error('답글 저장 실패:', error.response?.status, error.response?.data || error)

    const message =
      error.response?.data?.resultMessage ||
      error.response?.data?.message ||
      '답글 저장에 실패했습니다.'

    await showAlert(message, { title: '오류', type: 'error' })
  }
}

const deleteReply = async (review) => {
  if (!review.replyId) return

  const ok = await showConfirm('이 답글을 삭제하시겠습니까?')
  if (!ok) return

  try {
    await ownerService.deleteReviewReply(review.replyId)

    review.replyId = null
    review.replyContent = null
    review.replyWrittenAt = null

    await showAlert('답글이 삭제되었습니다.', { title: '삭제 완료', type: 'success' })
  } catch (error) {
    console.error('답글 삭제 실패:', error.response?.status, error.response?.data || error)

    const message =
      error.response?.data?.resultMessage ||
      error.response?.data?.message ||
      '답글 삭제에 실패했습니다.'

    await showAlert(message, { title: '오류', type: 'error' })
  }
}

const openReport = (review) => {
  reportModal.reviewId = review.reviewId
  reportModal.reason = ''
  reportModal.detail = ''
  reportModal.show = true
}

const closeReport = () => {
  reportModal.show = false
  reportModal.reviewId = null
  reportModal.reason = ''
  reportModal.detail = ''
}

const submitReport = async () => {
  if (!reportModal.reason) {
    await showAlert('신고 사유를 선택해 주세요.', { title: '입력 필요', type: 'warning' })
    return
  }

  const reason =
    reportModal.reason === '기타'
      ? reportModal.detail.trim()
      : reportModal.reason

  if (!reason) {
    await showAlert('신고 사유를 입력해 주세요.', { title: '입력 필요', type: 'warning' })
    return
  }

  try {
    await ownerService.reportReview(reportModal.reviewId, {
      reason,
    })

    const review = state.reviews.find((item) => item.reviewId === reportModal.reviewId)

    if (review) {
      review.reported = true
    }

    await showAlert('신고가 접수되었습니다.', { title: '신고 완료', type: 'success' })
    closeReport()
  } catch (error) {
    console.error('리뷰 신고 실패:', error.response?.status, error.response?.data || error)

    const message =
      error.response?.data?.resultMessage ||
      error.response?.data?.message ||
      '리뷰 신고에 실패했습니다.'

    await showAlert(message, { title: '오류', type: 'error' })
  }
}
</script>

<template>
  <div class="review_wrap">
    <div class="page_header">
      <h2 class="page_title">리뷰 관리</h2>
      <span class="review_count">총 {{ state.reviews.length }}개의 리뷰</span>
    </div>

    <div v-if="state.loading" class="empty_msg">불러오는 중...</div>

    <div v-else-if="!state.reviews.length" class="empty_msg">
      아직 리뷰가 없습니다.
    </div>

    <div v-else class="review_list">
      <div v-for="review in state.reviews" :key="review.reviewId" class="review_card">
        <div class="review_top">
          <div class="review_left">
            <span class="stars" :class="{ low: review.rating <= 2 }">
              {{ renderStars(review.rating) }}
            </span>

            <span class="score_num">{{ review.rating }}점</span>

            <span class="reviewer">{{ getReviewerName(review) }}</span>

            <span class="writer_stats">
              고객 평균 {{ Number(review.writerAvgRating || 0).toFixed(1) }}점
              · 작성 리뷰 {{ review.writerReviewCount || 0 }}개
            </span>
          </div>

          <span class="review_date">{{ review.writtenAt }}</span>
        </div>

        <p v-if="review.menuName" class="review_menu">🍽️ {{ review.menuName }}</p>

        <p class="review_content">{{ review.contents }}</p>

        <div v-if="review.photo" class="review_img_wrap">
          <img :src="review.photo" class="review_img" />
        </div>

        <div v-if="review.replyContent" class="owner_comment">
          <div class="comment_header">
            <span class="comment_label">사장님 답글</span>
            <button class="btn_reply_delete" @click="deleteReply(review)">삭제</button>
          </div>

          <p class="comment_text">{{ review.replyContent }}</p>
        </div>

        <div class="review_actions">
          <button class="btn_comment" @click="openComment(review)">
            {{ review.replyContent ? '답글 수정' : '답글 달기' }}
          </button>

          <button class="btn_report" @click="openReport(review)" :disabled="review.reported">
            {{ review.reported ? '신고 완료' : '리뷰 신고' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 답글 모달 -->
    <div v-if="commentModal.show" class="modal_overlay" @click.self="closeComment">
      <div class="modal_box">
        <div class="modal_header">
          <h3>사장님 답글</h3>
          <button class="modal_close" @click="closeComment">✕</button>
        </div>

        <textarea
          v-model="commentModal.content"
          class="modal_textarea"
          placeholder="고객 리뷰에 대한 답글을 작성해 주세요. (최대 300자)"
          maxlength="300"
        ></textarea>

        <span class="char_count">{{ commentModal.content.length }}/300</span>

        <div class="modal_footer">
          <button class="btn_cancel" @click="closeComment">취소</button>
          <button class="btn_primary" @click="saveComment">저장</button>
        </div>
      </div>
    </div>

    <!-- 신고 모달 -->
    <div v-if="reportModal.show" class="modal_overlay" @click.self="closeReport">
      <div class="modal_box">
        <div class="modal_header">
          <h3>리뷰 신고</h3>
          <button class="modal_close" @click="closeReport">✕</button>
        </div>

        <p class="modal_desc">
          부적절한 리뷰를 신고하면 관리자 검토 후 삭제 여부가 결정됩니다.
        </p>

        <div class="reason_list">
          <label
            v-for="reason in reportReasons"
            :key="reason"
            class="reason_item"
            :class="{ selected: reportModal.reason === reason }"
          >
            <input v-model="reportModal.reason" type="radio" :value="reason" hidden />
            {{ reason }}
          </label>
        </div>

        <textarea
          v-if="reportModal.reason === '기타'"
          v-model="reportModal.detail"
          class="modal_textarea report_detail_textarea"
          placeholder="신고 사유를 입력해 주세요"
          maxlength="100"
        ></textarea>

        <div class="modal_footer">
          <button class="btn_cancel" @click="closeReport">취소</button>
          <button class="btn_report_submit" @click="submitReport">신고 접수</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review_wrap {
  padding: 40px;
  max-width: 900px;
}

.page_header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.page_title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.review_count {
  font-size: 14px;
  color: #999;
}

.empty_msg {
  text-align: center;
  color: #aaa;
  padding: 80px 0;
  font-size: 16px;
}

.review_list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review_card {
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;
}

.review_card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.review_top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review_left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stars {
  font-size: 18px;
  color: #f59e0b;
  letter-spacing: 0;
}

.stars.low {
  color: #ef4444;
}

.score_num {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.reviewer {
  font-size: 14px;
  color: #666;
}

.writer_stats {
  padding: 4px 8px;
  border-radius: 999px;
  background: #f4f4f4;
  color: #777;
  font-size: 12px;
}

.review_date {
  font-size: 13px;
  color: #bbb;
}

.review_menu {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.review_content {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
  margin: 0;
}

.review_img_wrap {
  margin-top: 4px;
}

.review_img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.owner_comment {
  background: #f8f8f8;
  border-left: 3px solid #2d61da;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.comment_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment_label {
  font-size: 12px;
  font-weight: 700;
  color: #2d61da;
}

.comment_text {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.6;
}

.btn_reply_delete {
  border: none;
  background: transparent;
  color: #999;
  font-size: 12px;
  cursor: pointer;
}

.btn_reply_delete:hover {
  color: #ef4444;
}

.review_actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn_comment {
  padding: 8px 18px;
  border: 1.5px solid #2d61da;
  border-radius: 8px;
  background: #fff;
  color: #2d61da;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn_comment:hover {
  background: #2d61da;
  color: #fff;
}

.btn_report {
  padding: 8px 18px;
  border: 1.5px solid #ef4444;
  border-radius: 8px;
  background: #fff;
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn_report:hover:not(:disabled) {
  background: #ef4444;
  color: #fff;
}

.btn_report:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.modal_overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal_box {
  background: #fff;
  border-radius: 20px;
  padding: 32px 28px;
  width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal_header h3 {
  font-size: 18px;
  font-weight: 700;
}

.modal_close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #aaa;
}

.modal_desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.modal_textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1.5px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  font-family: inherit;
}

.report_detail_textarea {
  height: 88px;
}

.modal_textarea:focus {
  outline: none;
  border-color: #2d61da;
}

.char_count {
  font-size: 12px;
  color: #bbb;
  text-align: right;
  margin-top: -8px;
}

.modal_footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn_cancel {
  padding: 12px 24px;
  border: 1.5px solid #ddd;
  border-radius: 10px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.btn_primary {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: #2d61da;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn_primary:hover {
  background-color: #2455c5;
}

.btn_report_submit {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.reason_list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason_item {
  padding: 10px 16px;
  border: 1.5px solid #eee;
  border-radius: 10px;
  font-size: 14px;
  color: #444;
  cursor: pointer;
  transition: all 0.15s;
}

.reason_item:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.reason_item.selected {
  border-color: #ef4444;
  background: #fff5f5;
  color: #ef4444;
  font-weight: 600;
}
</style>
