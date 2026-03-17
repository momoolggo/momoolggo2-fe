<script setup>

import { useRouter } from 'vue-router';


const router = useRouter();

const goTo = (page) => {
  console.log(`${page} 페이지로 이동`);
  router.push(`/${page}`);
};

</script>

<template>
<nav class="bottom-nav">
    <div class="nav-item" @click="goTo('home')">
      <i class="icon-home"></i> <span>홈</span>
    </div>
    <div class="nav-item" @click="goTo('')">
      <i class="icon-map"></i>
      <span>주변 찾기</span>
    </div>
    <div class="nav-item" @click="goTo('favorite')">
      <i class="icon-heart"></i>
      <span>찜</span>
    </div>
    <div class="nav-item" @click="goTo('mypage/cs')">
      <i class="icon-pencil"></i>
      <span>고객센터</span>
    </div>
    <div class="nav-item" @click="goTo('mypage')">
      <i class="icon-user"></i>
      <span>마이페이지</span>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  /* 핵심: 하단 고정 설정 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;


  max-width: 480px; /* home-page와 동일한 너비 설정 */
  margin: 0 auto;
  height: 70px;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  flex: 1;
}

.nav-item i {
  width: 24px;
  height: 24px;
  background-size: contain;
  background-repeat: no-repeat;
}
.icon-home { background-image: url('/src/assets/홈.png'); }
.icon-map { background-image: url('/src/assets/주변찾기.png'); }
.icon-heart { background-image: url('/src/assets/찜.png'); }
.icon-pencil { background-image: url('/src/assets/고객센터.png'); }
.icon-user { background-image: url('/src/assets/마이페이지.png'); }

.nav-item span {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  font-family: 'Pretendard', sans-serif;
}
</style>
