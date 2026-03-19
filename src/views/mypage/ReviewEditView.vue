<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import userService from '@/services/userService'

const router = useRouter()
const route = useRoute()
const reviewId = route.params.reviewId

const storeName = ref('')
const menuName = ref('')
const rating = ref(0)
const reviewText = ref('')
const maxTextLength = 500
const loading = ref(true)

const textCount = computed(() => reviewText.value.length)

const setRating = (idx) => {
  rating.value = idx
}

// 기존 리뷰 데이터 불러오기
onMounted(async () => {
  try {
    const review = await userService.getReviewDetail(reviewId)
    storeName.value = review.storeName || ''
    menuName.value = review.menuName || ''
    rating.value = review.rating || 0
    reviewText.value = review.contents || ''
  } catch (error) {
    console.error('리뷰 불러오기 실패:', error)
    alert('리뷰를 불러올 수 없습니다.')
    router.back()
  } finally {
    loading.value = false
  }
})

const cancelEdit = () => {
  router.back()
}

const submitEdit = async () => {
  if (rating.value === 0 || reviewText.value.trim().length === 0) {
    alert('별점과 리뷰 내용을 입력해주세요!')
    return
  }
  try {
    await userService.updateReview(reviewId, {
      rating: rating.value,
      contents: reviewText.value
    })
    alert('리뷰가 수정되었습니다!')
    router.push('/mypage/review')
  } catch (error) {
    console.error('리뷰 수정 실패:', error)
    alert('리뷰 수정에 실패했습니다.')
  }
}
</script>

<template>
  <div class="wrap">
    <div class="container">
      <h2 class="page-title">리뷰 수정</h2>

      <div v-if="loading" class="loading">불러오는 중...</div>

      <template v-else>
        <div class="review-card">
          <div class="card-header">
            <div class="store-info">
              <span class="store-name">{{ storeName }}</span>
              <span class="menu-name">{{ menuName }}</span>
            </div>
          </div>

          <div class="rating-area">
            <div v-for="idx in 5" :key="idx" class="star" @click="setRating(idx)">
              <img
                :src="rating >= idx
                  ? 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
                  : 'https://cdn-icons-png.flaticon.com/512/1828/1828970.png'"
                alt="star"
              />
            </div>
          </div>

          <div class="divider"></div>

          <div class="text-input-area">
            <textarea
              v-model="reviewText"
              placeholder="내용 입력"
              :maxlength="maxTextLength"
            ></textarea>
            <div class="char-counter">{{ textCount }} / {{ maxTextLength }}</div>
          </div>
        </div>

        <div class="button-group">
          <button class="btn-cancel" @click="cancelEdit">취소</button>
          <button class="btn-submit" @click="submitEdit">수정</button>
        </div>
      </template>

      <div class="nav-spacer"></div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background-color: #ffffff;
}
.container {
  width: 100%;
  max-width: 480px;
  padding: 20px 16px 20px;
  box-sizing: border-box;
  font-family: 'Pretendard', sans-serif;
}
.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #111;
  margin-bottom: 20px;
}
.loading {
  text-align: center;
  padding: 60px;
  color: #888;
}
.review-card {
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 18px 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.store-info {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.store-name {
  font-size: 19px;
  font-weight: 800;
  color: #111;
}
.menu-name {
  font-size: 11px;
  font-weight: 500;
  color: #ff99aa;
  margin-bottom: 2px;
}
.rating-area {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.star {
  cursor: pointer;
}
.star img {
  width: 26px;
  height: 26px;
}
.divider {
  height: 1px;
  background: #f2f2f2;
  margin-bottom: 14px;
}
.text-input-area {
  position: relative;
}
.text-input-area textarea {
  width: 100%;
  height: 200px;
  background-color: #fcfcfc;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 14px 14px 30px;
  font-size: 14px;
  color: #111;
  font-family: inherit;
  resize: none;
  box-sizing: border-box;
  outline: none;
}
.char-counter {
  position: absolute;
  bottom: 10px;
  right: 14px;
  font-size: 12px;
  color: #ccc;
}
.button-group {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  margin-top: 40px;
}
.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 15px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}
.btn-cancel {
  background-color: #ff0044;
  color: #fff;
}
.btn-submit {
  background-color: #4a80da;
  color: #fff;
}
.nav-spacer {
  height: 80px;
}
</style>