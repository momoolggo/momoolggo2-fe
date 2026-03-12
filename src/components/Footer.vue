<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goAbout      = () => router.push('/about')
const goPrivacy    = () => router.push('/privacy')
const goPartner    = () => router.push('/partner')
const goTerms      = () => router.push('/terms')
const goNotice     = () => router.push('/notice')

</script>

<template>
    <footer class="footer">
        <div class="footerinner">

            <div class="footertop">
            <div class="toptext">
                <span @click="goAbout">회사 소개</span>
                &nbsp;
                <span @click="goPrivacy">개인정보처리방침</span>
                &nbsp;
                <span @click="goPartner">사장님 입점문의</span>
                &nbsp;
                <span @click="goTerms">이용약관</span>
                &nbsp;
                <span @click="goNotice">공지사항</span>
            </div>
        </div>
        
        <div class="footerline"></div>

        <div class="footercontent">
            <router-link to="/" class="logo_link">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="footerlogo"/>
        </router-link>
            <div class="footermiddle">

            <div class="middletext">
                <span>뭐물꼬</span>
                &nbsp;
                <span>대구·경상 전용 배달 서비스</span>
                </div>
                &nbsp;

            <div class="middletext2">
            <span>대표자: 김그린</span>
            &nbsp;
            <span>사업자등록번호: 504-85-37587</span>
            <br>
            <span>주소: 대구 중구 중앙대로 394 제일빌딩 5F</span>
            <br>
            <span>운영시간: 09:00~ 18:00</span>
            &nbsp;
            <span>고객센터: 0507-1414-1018</span>
            </div>
                    </div>
                </div>
            <div class="footerline"></div>
            <div class="footerbottom">
            <span>© 2025 뭐물꼬. All rights reserved. 대구광역시 서비스</span>
            </div>
            </div>


    </footer>

</template>

<style scoped>
.footer {
    max-height: none;
    min-height: 200px;
    padding-top: 1px;
    padding-bottom: 1px;
    background-color: #FEFAEE;
}

.footercontent{
    display: flex;
    align-items: center;
    padding: 7px 0 4px 40px;
    gap: 100px;
    
}

.footertop{
    display: flex;
    margin: 4px 0;
    align-items: center;
    justify-content: center;
}

.toptext{
    font-size: 13px;
    font-family: 'NanumSquare_ac', 'Pretendard', 'Noto Sans KR';
    color: #888888;
}

.toptext span {
    cursor: pointer;
    margin: 0 10px;
}
.toptext span:hover {
    color: var(--primary);
}

.middletext{
    font-size: 15px;
    font-family: 'NanumSquare_acB', 'Pretendard', 'Noto Sans KR';
    line-height: 1.4;
}
.middletext2{
    font-size: 13px;
    font-family: 'NanumSquare_ac', 'Pretendard', 'Noto Sans KR';
    color: #888888;
    line-height: 1.8;
}
.footerbottom{
    padding-top: 4px;
    text-align: center;
    font-size: 12px;
    font-family: 'NanumSquare_ac', 'Pretendard', 'Noto Sans KR';
    color: #888888;
}

.footerline {
    margin: auto;
    width: 100%;
    height: 1px;
    background-color: #d3d3d3;
    
}

.logo_link{
    display: block;
    padding-left: -20px;

}
.footerlogo { 
    width: 150px;
    height: 150px;
}


</style>