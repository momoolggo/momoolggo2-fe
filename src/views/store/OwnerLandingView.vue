<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import cafeImg from '@/assets/카페 사장.png'
import chickenImg from '@/assets/치킨 사장.png'
import bunsikImg from '@/assets/분식 사장.png'

const router = useRouter()

const img = [cafeImg, chickenImg, bunsikImg]

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
        v-for="(image, index) in img"
        :key="image"
        class="owner_img"
        :class="{ active: currentIndex === index }"
        :style="{ backgroundImage: `url(${image})` }"
        ></div>
    </div>
    </div>

    <div class="hero_card">
    <div class="hero_main">
        <p class="hero_main_text">뭐물꼬와</p>
        <p class="hero_main_text">함께라면</p>
    </div>

    <div class="hero_sub">
        <p class="hero_sub_text">배달 매출이 달라집니다</p>
        <p class="hero_sub_text">지금 바로 입점 신청하고</p>
        <p class="hero_sub_text">더 많은 고객을 만나보세요!</p>
    </div>

    <div class="hero_main_button">
        <button class="btn login_btn" @click="router.push('/owner/signin')">
        사장님 로그인
        </button>
        <button class="btn signup_btn" @click="router.push('/owner/signup')">
        사장님 회원가입
        </button>
    </div>
    </div>

    <div class="hero_bottom">
    <div class="bottom_btn">
        <i class="bi bi-telephone-fill"></i>
    </div>
    <p class="bottom_text">입점문의 0507-1414-1018</p>
    </div>
</section>

<section class="benefits">
    <div class="benefits_inner">
    
    </div>





    
</section>


</div>
</template>

<style scoped>
.ownerlanding {
background: linear-gradient(135deg, #e03400 0%, #ff6b35 50%, #ffab4e 100%);
}

.hero {
position: relative;
width: 100%;
height: 760px;
overflow: hidden;
}

.hero_inner {
width: 100%;
height: 100%;
}

.owner_wrap {
position: relative;
width: 100%;
height: 100%;
}

.owner_img {
position: absolute;
inset: 0;
background-size: cover;
background-position: center 20%;
background-repeat: no-repeat;
opacity: 0;
transition: opacity 1s ease;
}

.owner_img.active {
opacity: 1;
}

.hero_card {
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -58%);
z-index: 2;

width: 520px;
padding: 36px 32px 28px;
border-radius: 20px;
background: rgba(255, 255, 255, 0.72);
box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
backdrop-filter: blur(6px);
-webkit-backdrop-filter: blur(6px);

display: flex;
flex-direction: column;
align-items: center;
}

.hero_main {
display: flex;
flex-direction: column;
align-items: center;
gap: 6px;
}

.hero_main_text {
margin: 0;
color: #111;
font-size: 48px;
font-family: 'NanumSquareB', sans-serif;
text-align: center;
line-height: 1.15;
}

.hero_sub {
display: flex;
flex-direction: column;
align-items: center;
gap: 4px;
margin-top: 20px;
}

.hero_sub_text {
margin: 0;
color: #333;
font-size: 20px;
font-family: 'NanumSquareB', sans-serif;
text-align: center;
line-height: 1.4;
}

.hero_main_button {
display: flex;
justify-content: center;
gap: 14px;
margin-top: 28px;
}

.btn {
padding: 18px 22px;
border: none;
border-radius: 12px;
font-size: 14px;
font-weight: 800;
font-family: 'NanumSquareB', sans-serif;
cursor: pointer;
transition: all 0.15s;
}

.login_btn {
background: white;
color: #e03400;
}

.signup_btn {
background: #e95a0c;
color: white;
}

.btn:hover {
transform: translateY(-2px);
}

.hero_bottom {
display: flex;
align-items: center;
gap: 10px;
position: absolute;
right: 32px;
bottom: 24px;
z-index: 2;
}

.bottom_btn {
color: white;
font-size: 30px;
line-height: 1;
}

.bottom_text {
margin: 0;
color: white;
font-size: 30px;
font-family: 'NanumSquareB', sans-serif;
line-height: 1;
}

.benefits {
min-height: 400px;
background: #f5f5f5;
}

.benefits_inner {
max-width: 1200px;
margin: 0 auto;
}
</style>