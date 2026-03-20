<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  reviews: { type: Array, default: () => [] },
})

const PAGE_SIZE = 5
const currentPage = ref(1)
const loaderRef = ref(null)
let observer = null

// 현재까지 보여줄 리뷰
const visibleReviews = computed(() => props.reviews.slice(0, currentPage.value * PAGE_SIZE))
const isDone = computed(() => visibleReviews.value.length >= props.reviews.length)

// 평균 평점
const avgRating = computed(() => {
  if (!props.reviews.length) return '0.0'
  const sum = props.reviews.reduce((a, r) => a + r.rating, 0)
  return (sum / props.reviews.length).toFixed(1)
})

// 별점 분포
const ratingDist = computed(() =>
  [5, 4, 3, 2, 1].map((score) => {
    const count = props.reviews.filter((r) => r.rating === score).length
    return {
      score,
      pct: props.reviews.length ? Math.round((count / props.reviews.length) * 100) : 0,
    }
  }),
)

const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now - date) / 86400000)
  if (diff === 0) return '오늘'
  if (diff < 7) return `${diff}일 전`
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('blob')) return path
  return `http://localhost:8080${path}`
}

// Intersection Observer — 무한스크롤
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isDone.value) {
        currentPage.value++
      }
    },
    { threshold: 0.1 },
  )
  if (loaderRef.value) observer.observe(loaderRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="review-wrapper">
    <!-- 리뷰 없을 때 -->
    <div v-if="!reviews.length" class="review-empty">
      <div class="empty-icon">
        <!-- 인스타 기본 프로필 실루엣 -->
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#f0f0f0" />
          <circle cx="24" cy="20" r="8" fill="#ccc" />
          <ellipse cx="24" cy="40" rx="13" ry="9" fill="#ccc" />
        </svg>
      </div>
      <p>아직 작성된 리뷰가 없습니다.</p>
    </div>

    <template v-else>
      <!-- 평점 요약 -->
      <div class="summary-box">
        <div class="avg-row">
          <div class="avg-left">
            <span class="avg-num">{{ avgRating }}</span>
            <div class="stars-row">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="i <= Math.round(Number(avgRating)) ? 'filled' : 'empty'"
                >★</span
              >
            </div>
          </div>
          <div class="bar-list">
            <div v-for="item in ratingDist" :key="item.score" class="bar-row">
              <span class="bar-label">{{ item.score }}점</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 리뷰 목록 -->
      <div class="review-list">
        <div v-for="review in visibleReviews" :key="review.reviewId" class="review-card">
          <div class="rc-top">
            <!-- 인스타 기본 프로필 아이콘 통일 -->
            <div class="avatar">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#C9C9C9" />
                <circle cx="18" cy="15" r="6" fill="#fff" />
                <ellipse cx="18" cy="30" rx="10" ry="7" fill="#fff" />
              </svg>
            </div>
            <div class="rc-meta">
              <span class="rc-name">{{ review.userName }}</span>
              <span class="rc-date">{{ formatDate(review.date) }}</span>
            </div>
          </div>

          <div class="rc-stars-row">
            <div class="rc-stars">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="i <= review.rating ? 'filled' : 'empty'"
                >★</span
              >
            </div>
            <span class="rc-date-inline">{{ formatDate(review.write_at) }}</span>
          </div>

          <div v-if="review.menuName" class="rc-tags">
            <span v-for="name in review.menuName.split(',')" :key="name" class="tag">{{
              name.trim()
            }}</span>
          </div>

          <p class="rc-text" v-html="review.contents?.replace(/\n/g, '<br>')"></p>

          <img
            v-if="review.photo"
            :src="getImageUrl(review.photo)"
            class="rc-photo"
            alt="리뷰 사진"
          />
        </div>

        <!-- 무한스크롤 감지 타겟 -->
        <div ref="loaderRef" class="loader">
          <template v-if="!isDone">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.review-wrapper {
  background: #f8f5f5;
  min-height: 60vh; /* 리뷰 적어도 화면 비어보이지 않게 */
  padding-bottom: 24px;
}

/* 요약 */
.summary-box {
  background: #fff;
  border-radius: 14px;
  padding: 20px 16px;
  margin: 0; /* 카드와 좌우 여백 통일 */
}
.avg-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avg-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 64px;
}
.avg-num {
  font-size: 42px;
  font-weight: 800;
  color: #111;
  line-height: 1;
}
.stars-row {
  display: flex;
  gap: 1px;
}

.star.filled {
  color: #ffb800;
  font-size: 13px;
}
.star.empty {
  color: #e0e0e0;
  font-size: 13px;
}

.bar-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bar-label {
  font-size: 11px;
  color: #aaa;
  width: 22px;
  text-align: right;
  flex-shrink: 0;
}
.bar-track {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: #ffb800;
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* 빈 상태 */
.review-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 50vh;
  color: #bbb;
  font-size: 14px;
}

/* 리뷰 목록 — summary-box와 좌우 여백 동일하게 12px */
.review-list {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
}

.rc-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar svg {
  width: 36px;
  height: 36px;
  display: block;
}

/* rc-meta에서 날짜 제거 → rc-name만 남김 */
.rc-meta { display: flex; flex-direction: column; }
.rc-name { font-size: 14px; font-weight: 600; color: #111; }

/* 별점 + 날짜 한 줄 */
.rc-stars-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.rc-stars { display: flex; gap: 2px; }
.rc-stars .star { font-size: 14px; }
.rc-date-inline { font-size: 11px; color: #bbb; }

.rc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}
.tag {
  font-size: 11px;
  background: #fff0f3;
  color: #e05070;
  padding: 3px 9px;
  border-radius: 20px;
}

.rc-text {
  font-size: 13px;
  color: #444;
  line-height: 1.6;
}
.rc-photo {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 10px;
}

/* 로딩 dots */
.loader {
  text-align: center;
  padding: 16px;
  min-height: 40px;
}
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
  margin: 0 2px;
  animation: bounce 1s infinite;
}
.dot:nth-child(2) {
  animation-delay: 0.15s;
}
.dot:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
}
</style>
