<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'

const router = useRouter()

const reviews = ref([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = 6
const totalPages = ref(5)

const loadReviews = async (page) => {
  currentPage.value = page
  const result = await userService.getReviews({ currentPage: page, size: pageSize })
  reviews.value = result.list || result || []
  totalCount.value = result.totalCount || reviews.value.length
  totalPages.value = result.totalPages || Math.ceil(totalCount.value / pageSize) || 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => loadReviews(1))

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

const editReview = (reviewId) => {
  router.push(`/mypage/review/edit/${reviewId}`)
}

const deleteReview = async (reviewId) => {
  if (!confirm('리뷰를 삭제하시겠습니까?')) return
  await userService.deleteReview(reviewId)
  await loadReviews(currentPage.value)
}
</script>

<template>
  <div class="wrap">
    <div class="container">
      <h2 class="page-title">리뷰 관리</h2>

      <p class="total-count">총 {{ totalCount }}개</p>

      <div class="review-list">
        <div class="review-card" v-for="review in reviews" :key="review.reviewId">

          <div class="card-top">
            <div class="store-menu">
              <span class="store-name">{{ review.storeName }}</span>
              <span class="menu-name">{{ review.menuName }}</span>
            </div>
            <div class="btn-group">
              <button class="btn-edit" @click="editReview(review.reviewId)">수정</button>
              <button class="btn-delete" @click="deleteReview(review.reviewId)">삭제</button>
            </div>
          </div>

          <div class="rating-row">
            <div class="stars">
              <img
                v-for="idx in 5"
                :key="idx"
                :src="review.rating >= idx
                  ? 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
                  : 'https://cdn-icons-png.flaticon.com/512/1828/1828970.png'"
                class="star-img"
              />
            </div>
            <div class="review-tags">
              <span class="tag">가게 배달</span>
            </div>
            <span class="review-date">{{ review.date }}</span>
          </div>

          <p class="review-text">{{ review.contents }}</p>

          <div class="hashtags" v-if="review.tags">
            <span v-for="tag in review.tags" :key="tag" class="hashtag">#{{ tag }}</span>
          </div>

        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-container">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="loadReviews(currentPage - 1)"
        >&lt;</button>

        <button
          v-for="pageNum in pageNumbers"
          :key="pageNum"
          class="page-btn"
          :class="{ active: currentPage === pageNum }"
          @click="loadReviews(pageNum)"
        >{{ pageNum }}</button>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="loadReviews(currentPage + 1)"
        >&gt;</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
}

.container {
  width: 100%;
  max-width: 480px;
  padding: 20px 16px 100px;
  box-sizing: border-box;
  font-family: 'Pretendard', sans-serif;
}

.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #111;
  margin-bottom: 6px;
}

.total-count {
  font-size: 14px;
  color: #444;
  font-weight: 600;
  margin-bottom: 16px;
}

.review-card {
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.store-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.store-name {
  font-size: 16px;
  font-weight: 800;
  color: #111;
}

.menu-name {
  font-size: 11px;
  font-weight: 600;
  color: #ff99aa;
}

.btn-group {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-edit,
.btn-delete {
  padding: 5px 12px;
  border-radius: 20px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-edit {
  background: #f0f0f0;
  color: #444;
}

.btn-delete {
  background: #ff0044;
  color: #fff;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.stars {
  display: flex;
  gap: 2px;
}

.star-img {
  width: 18px;
  height: 18px;
}

.review-tags {
  display: flex;
  gap: 4px;
}

.tag {
  font-size: 11px;
  color: #888;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 2px 8px;
}

.review-date {
  font-size: 11px;
  color: #bbb;
  margin-left: auto;
}

.review-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
}

.hashtags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hashtag {
  font-size: 12px;
  color: #888;
}

/* 페이지네이션 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}

.page-btn {
  border: 1px solid #ddd;
  background: white;
  color: #666;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  font-weight: bold;
}

.page-btn:disabled {
  background: #eee;
  color: #ccc;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: #f0f4ff;
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
