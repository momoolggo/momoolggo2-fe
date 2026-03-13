
<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import Footer from '@/components/Footer.vue';

const router = useRouter();

const state = reactive({
  categories: [
    { label: '한식'},
    { label: '중식'},
    { label: '일식'},
    { label: '양식' },
    { label: '디저트'},
    { label: '분식' },
    { label: '패스트푸드'},
    { label: '야식'},
]

});
const goCategory = (label) => {
  router.push({ path: '/storelist', query: { category: label } })
}
</script>

<template>
  <main class="home">

  <img src="@/assets/뭐물꼬_마스코트.png" alt="뭐물꼬 마스코트" class="mascot_img" />

    <div class="wrapper">
  <div class="item" @click="goCategory('한식')">한식
  <img src="@/assets/비빔밥.png" alt="한식"/>
    </div>
  <div class="item"  @click="goCategory('중식')">중식
  <img src="@/assets/짜장면.png" alt="중식" />
  </div>
  <div class="item"  @click="goCategory('일식')">일식
  <img src="@/assets/스시.png" alt="스시" />
  </div>
  <div class="item"  @click="goCategory('양식')">양식
    <img src="@/assets/파스타.png" alt="양식" />
  </div>
  <div class="item"  @click="goCategory('디저트')">디저트
    <img src="@/assets/케잌.png" alt="디저트"/>
  </div>
  <div class="item"  @click="goCategory('분식')">분식
    <img src="@/assets/떡볶이.png" alt="분식"/>
  </div>
  <div class="item"  @click="goCategory('패스트푸드')">패스트푸드
    <img src="@/assets/햄버거.png" alt="패스트푸드"/>
  </div>
  <div class="item"  @click="goCategory('야식')">야식
    <img src="@/assets/야식.png" alt="야식"/>
  </div>
  </div>
</main>
<Footer></Footer>
</template>

<style scoped>
.home{
  position: relative;;
  background-color: #A40C0B;
  width: 100vw;
  min-height: 500px;
  padding-top: 1px;
  padding-bottom: 10px;
  overflow-x: hidden;   /* 화면 줄면 가로스크롤 */
  overflow-y: auto;
}


.wrapper {
  display: grid;
  grid-template-columns: repeat(4, 180px); /* 1fr 말고 고정값 */
  gap: 50px;
  width: max-content; /* 내용 크기만큼만 */
  margin: 50px auto 0;
  padding: 0 40px 40px;
}

.item{
  display: grid;
  position: relative;
  background-color: #FEFAEE;
  text-align: center;
  font-size: 30px;
  font-family: 'NanumSquare_acEB', 'Pretendard', 'Noto Sans KR';
  color: #A40C0B;
  padding: 24px 16px;
  border: 1px solid #FEFAEE;
  border-radius: 28px;
  height: 200px;
  width: 180px;
  z-index: 90;
  white-space: nowrap;
  box-sizing: border-box;
  overflow: hidden;
}

.item img{
  position: absolute;
  width: 150px;
  place-self: end;
  object-fit: contain;
}

.item:hover {
  border-color: var(--primary);
}

.mascot_img {
  position: absolute;
  top: -50px;
  right: -100px;
  width: 600px;
  object-fit: contain;
  pointer-events: none;
  z-index: 110;
}

@media (max-width: 1500px) {
  .mascot_img {
    position: absolute;
    z-index: 90;
  }
}
</style>
