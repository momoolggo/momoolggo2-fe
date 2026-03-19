<script setup>
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import userService from '@/services/userService'
import { ref, computed } from 'vue'


const router = useRouter();
const route = useRoute();

const storeName = ref('코이보타루')
const rating = ref(0)
const reviewText = ref('')
const maxTextLength = 500 // 500자로 수정
const previewImage = ref(null)
const fileInput = ref(null)

const textCount = computed(() => reviewText.value.length)

const setRating = (idx) => {
  rating.value = idx
}

//사진등록인데 지금어케할지 모르겠음
const triggerFileInput = () => {
  fileInput.value.click()
}
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => {
    previewImage.value = evt.target.result
  }
  reader.readAsDataURL(file)
}

const cancelReview = () => {
  router.back()
}

const submitReview = async() => {
  if (rating.value === 0 || textCount.value === 0) {
    alert('별점과 리뷰 내용을 입력해주세요!')
    return
  }
  try{
  const params = {
    orderId: Number(route.params.id), // 주문 ID는 라우터에서 받아와야 함
    rating: rating.value,
    text: reviewText.value,
    image: '', // 실제로는 파일 업로드 API를 사용해야 함
  }
  await userService.postReview(params);
  alert('리뷰가 등록되었습니다!')
  router.push('/mypage/review') // 리뷰 목록 페이지로 이동
  }
  catch(error){

      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');

  }
}

</script>

<template>
  <div class="wrap">
    <div class="container">
      <h2 class="page-title">리뷰 등록</h2>

      <div class="review-card">
        <div class="card-header">
          <div class="store-info">
            <span class="store-name">{{ storeName }}</span>
          </div>
          <button class="btn-camera" @click="triggerFileInput">
            <img src="https://cdn-icons-png.flaticon.com/512/685/685655.png" alt="camera" />
          </button>
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
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

        <div class="image-area" @click="triggerFileInput">
          <div class="image-bg">
            <img
              v-if="previewImage"
              :src="previewImage"
              alt="review food"
              class="preview-img"
            />
            <div v-else class="image-placeholder">
              <img src="https://cdn-icons-png.flaticon.com/512/685/685655.png" alt="add photo" class="placeholder-icon"/>
              <span>사진 추가</span>
            </div>
          </div>
        </div>

        <div class="text-input-area">
          <textarea
            v-model="reviewText"
            placeholder="내용 입력"
            :maxlength="maxTextLength"
          ></textarea>
          <div class="char-counter">{{ textCount }}/ {{ maxTextLength }}</div>
        </div>
      </div>

      <div class="button-group">
        <button class="btn-cancel" @click="cancelReview">취소</button>
        <button class="btn-submit" @click="submitReview">등록</button>
      </div>

      <div class="nav-spacer"></div>
    </div>
  </div>
</template>

<style scoped>
/* 수빈님 기존 스타일 그대로 유지 */
.wrap {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background-color: #ffffff;
}

.container {
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  padding: 20px 16px 20px; /* 고정값 수정 */
  box-sizing: border-box;
  font-family: 'Pretendard', sans-serif;
  position: relative;
}

.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #111;
  margin-bottom: 20px;
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

.btn-camera {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.btn-camera img {
  width: 22px;
  height: 22px;
  opacity: 0.45;
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

.image-area {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
  cursor: pointer;
}

.image-bg {
  width: 100%;
  max-width: 280px;
  height: 190px;
  background-color: #f0f0f0;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #bbb;
  font-size: 13px;
}

.placeholder-icon {
  width: 36px;
  height: 36px;
  opacity: 0.3;
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

/* 하단 버튼 그룹 스타일 유지 */
.button-group {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  margin-top: 80px;
  box-sizing: border-box;
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

/* 📍 하단 네비게이션 공간 확보용 스페이서 */
.nav-spacer {
  height: 80px;
}
</style>
