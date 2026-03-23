<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import cafeImg from '@/assets/카페 사장.png'
import chickenImg from '@/assets/치킨 사장.png'
import bunsikImg from '@/assets/분식 사장.png'
import bgImg    from '@/assets/bg_daegu.png'
import moneyImg from '@/assets/icon_money.png'
import towerImg from '@/assets/icon_tower.png'
import storeImg from '@/assets/icon_store.png'

const router = useRouter();

const img = [ cafeImg, chickenImg, bunsikImg ]

const currentIndex = ref(0)
let timer = null

onMounted(() => {
    timer = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % img.length
    }, 3000)
})

onUnmounted(() => {
    clearInterval(timer)
})
</script>

<template>
<div class="ownerlanding">

    <section class="hero">
        <div class="hero_inner">
            <div class="owner_wrap">
                <div
                    v-for="(img, index) in img"
                    :key="img"
                    class="owner_img"
                    :class="{ active: currentIndex === index }"
                    :style="{ backgroundImage: `url(${img})` }">
                </div>
            </div>

            <div class="hero_card">
                <div class="hero_main">
                    <span class="hero_main_text">뭐물꼬와</span>
                    <p class="hero_main_text">함께라면</p>
                </div>

                <div class="hero_sub">
                    <p class="hero_sub_text">배달 매출이 달라집니다</p>
                    <p class="hero_sub_text">지금 바로 입점 신청하고</p>
                    <p class="hero_sub_text">더 많은 고객을 만나보세요!</p>
                </div>

                <div class="hero_main_button">
                    <button class="btn" @click="router.push('/owner/signin')">사장님 로그인</button>
                    <button class="btn signup_btn" @click="router.push('/owner/signup')">사장님 회원가입</button>
                </div>
            </div>
        </div>

        <div class="hero_bottom">
            <div class="bottom_icon">
                <i class="bi bi-telephone-fill"></i>
            </div>
            <p class="bottom_text">입점 문의: 0507-1414-1018</p>
        </div>
    </section>

<section class="features" :style="{ backgroundImage: `url(${bgImg})` }">
  <div class="features_inner">
    <h2 class="features_title">뭐물꼬와 함께해야 하는 이유</h2>
    <div class="features_grid">

      <div class="feature_card">
        <img :src="moneyImg" class="feature_img" />
        <h3 class="feature_card_title">신규 입점 업주<br/>3개월 수수료 반값</h3>
        <p class="feature_card_desc">처음 시작하는 사장님을 위해<br/>3개월간 수수료 50% 할인 혜택을 드립니다</p>
      </div>

      <div class="feature_card">
        <img :src="towerImg" class="feature_img" />
        <h3 class="feature_card_title">대구·경북 맞춤<br/>지역 서비스</h3>
        <p class="feature_card_desc">대구·경북 지역 특성에 맞춘<br/>현지화된 배달 서비스를 제공합니다</p>
      </div>

      <div class="feature_card">
        <img :src="storeImg" class="feature_img" />
        <h3 class="feature_card_title">이유없는 별점 테러는 그만!<br/>업주 소명 창구</h3>
        <p class="feature_card_desc">이유 없는 별점 테러에 대응하기 위해<br/>공식 창구를 운영합니다</p>
      </div>

    </div>
  </div>
</section>

</div>
</template>

<style scoped>
.ownerlanding{
    background: linear-gradient(135deg, #e03400 0%, #A40C0B 50%, #ffab4e 100%);
}

.hero{
    width: 100%;
    min-height: 100vh;
}

.hero_inner{
    position: relative;
    width: 100%;
    height: calc(100vh - 120px);
    overflow: hidden;
}

.owner_wrap{
    position: relative;
    width: 100%;
    height: 100%;
}

.owner_img{
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center 20%;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 1s ease;
}

.owner_img.active{
    opacity: 1;
}

.hero_card{
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 520px;
    padding: 36px 32px;
    transform: translate(-50%, -50%);
    z-index: 2;
    border-radius: 20px;
    background: rgba(228, 222, 219, 0.72);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    backdrop-filter: blur(-20px);
    -webkit-backdrop-filter: blur(6px);
}

.hero_main{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.hero_main_text{
    color: black;
    font-size: 48px;
    font-family: 'NanumSquareB', sans-serif;
    text-align: center;
    margin: 0;
    line-height: 1.15;
}

.hero_sub{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 20px;
}

.hero_sub_text{
    color: black;
    font-size: 20px;
    font-family: 'NanumSquareB', sans-serif;
    text-align: center;
    margin: 0;
    line-height: 1.4;
}

.hero_main_button{
    display: flex;
    justify-content: center;
    gap: 14px;
    margin-top: 28px;
}

.hero_bottom{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    width: 100%;
    height: 120px;
    padding: 0 32px;
    background: linear-gradient(135deg, #e03400 0%, #A40C0B 50%, #ffab4e 100%);
}

.bottom_icon{
    color: white;
    font-size: 30px;
    line-height: 1;
}

.bottom_text{
    color: white;
    font-size: 30px;
    font-family: 'NanumSquareB', sans-serif;
    margin: 0;
    line-height: 1;
}

.btn{
    padding: 18px 18px;
    min-height: 16px;
    min-width: 16px;
    background: white;
    color: #A40C0B;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 800;
    font-family: 'NanumSquareB', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
}

.signup_btn{
    background: #A40C0B;
    color: white;
}

.btn:hover{
    transform: translateY(-2px);
}

.features {
  width: 100%;
  padding: 100px 40px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* 배경 살짝 밝게 오버레이 */
.features::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 248, 235, 0.75);
}

.features_inner {
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.features_title {
  text-align: center;
  font-size: 36px;
  font-family: 'NanumSquareB', sans-serif;
  color: #A40C0B;
  margin-bottom: 60px;
}

.features_grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.feature_card {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(164, 12, 11, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature_card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(164, 12, 11, 0.15);
}

.feature_img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 24px;
}

.feature_card_title {
  font-size: 22px;
  font-family: 'NanumSquareB', sans-serif;
  color: #1a1a1a;
  margin: 0 0 16px;
  line-height: 1.4;
}

.feature_card_desc {
  font-size: 15px;
  color: #666;
  line-height: 1.7;
  margin: 0;
  font-family: 'NanumSquareB', sans-serif;
}

@media (max-width: 768px) {
  .features_grid { grid-template-columns: 1fr; }
  .features_title { font-size: 26px; }
}
</style>