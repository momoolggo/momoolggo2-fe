<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import cafeImg from '@/assets/카페 사장.png'
import chickenImg from '@/assets/치킨 사장.png'
import bunsikImg from '@/assets/분식 사장.png'

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
</style>