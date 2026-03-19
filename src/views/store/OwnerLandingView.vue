<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const img = [
{ img: '/src/assets/카페 사장.png' },
{ img: '/src/assets/치킨 사장.png' }
]


</script>

<template>
<div class="ownerlanding">

    <div class="top">
        <div class="owner_img">
        <img src="@/assets/카페 사장.png"  class="owner_cafe" />
        <img src="@/assets/치킨 사장.png"  class="owner_chicken" />
    </div>
    </div>

    <div class="main">
    <span class="main_text">뭐물꼬와</span>
    <p class="main_text">함께라면</p> 
    <p class="sub_text">합리적인 비용과 간편한 운영으로 매장을 손쉽게 관리할 수 있습니다!</p>
    
    <div class="main_button">
    <button class="btn" @click="router.push('/owner/signin')">사장님 로그인</button>
    &nbsp;
    <button class="btn" @click="router.push('/owner/signup')">사장님 회원가입</button>
    </div>
    </div>
    

</div>

</template>


<style scoped>
.ownerlanding{
background: linear-gradient(135deg, #e03400 0%, #ff6b35 50%, #ffab4e 100%);
}


.top{
    width: 100%;
    overflow: hidden
}

.owner_img{
width: 100%;
height: 100%;
transition: all 1s ease;
object-fit: cover;
}

.main{
display: flex;
flex-direction: column;
}

.main_text{    
color: white;
font-size: 32px;
font-family: 'NanumSquareB', sans-serif;
}

.sub_text{
margin-top: 16px;
color: white;
font-size: 16px;
font-family: 'NanumSquareB', sans-serif;
}

.main_button{
position: relative;
display: flex;
gap: 10px;
}

.btn{
background: white;
color: #e03400;
border: none;
border-radius: 12px;
font-size: 16px;
font-weight: 800;
font-family: 'NanumSquareB', sans-serif;
cursor: pointer;
box-shadow: 0 4px 20px rgba(0,0,0,0.15);
transition: all 0.15s;
} 
.btn:hover{ transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }

</style>