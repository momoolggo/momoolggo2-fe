<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const goSignup = () => {
  if (userStore.state.isSignedIn && userStore.state.role === 'RIDER') {
    return router.push('/riderservice')
  }
  router.push('/rider/signup')
}
</script>

<template>
  <div class="rider_landing">
    <p class="page_label">라이더 랜딩</p>

    <div class="hero_card">
      <div class="hero_image">
        <span class="scooter_emoji">🛵</span>
      </div>

      <div class="hero_chip">라이더를 위한 서비스</div>

      <h1 class="hero_title">
        배달 파트너<br />
        신청하기
      </h1>

      <p class="hero_desc">
        자유로운 시간에 원하는 만큼 일하세요.<br />
        빠른 정산과 안전한 배달 환경을 제공합니다.
      </p>

      <button class="btn_primary apply_btn" @click="goSignup">
        라이더 신청하기
      </button>
    </div>

    <footer class="brand_footer">
      <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="footer_logo" />
      <p class="brand_name">뭐물꼬</p>
      <p class="brand_sub">대구 · 경상 전용 배달 서비스</p>
      <dl class="brand_info">
        <div><dt>대표자:</dt><dd>김그린</dd></div>
        <div><dt>사업자등록번호:</dt><dd>504-85-37587</dd></div>
        <div><dt>주소:</dt><dd>대구 중구 중앙대로 394 제일빌딩 5F</dd></div>
        <div><dt>운영시간:</dt><dd>09:00 - 18:00</dd></div>
        <div><dt>고객센터:</dt><dd>0507-1414-1018</dd></div>
      </dl>
      <p class="copy">© 2025 뭐물꼬 All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.rider_landing { max-width: 420px; margin: 0 auto; background: var(--bg); min-height: 100vh; padding: 16px 0 0; }
.page_label { padding: 0 16px 12px; color: var(--gray); font-size: 13px; }

.hero_card {
  background: var(--white);
  margin: 0 16px;
  padding: 36px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.hero_image {
  width: 130px;
  height: 130px;
  background: var(--primary-light);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scooter_emoji { font-size: 70px; }

.hero_chip {
  background: var(--primary-light);
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  align-self: flex-start;
  margin-top: 8px;
}

.hero_title {
  font-size: 26px;
  font-weight: 800;
  text-align: center;
  color: var(--black);
  line-height: 1.3;
  margin-top: 4px;
}

.hero_desc {
  text-align: center;
  color: var(--gray-dark);
  font-size: 14px;
  line-height: 1.6;
}

.apply_btn {
  width: 220px;
  margin-top: 12px;
  font-size: 15px;
  padding: 14px 0;
}

.brand_footer {
  background: var(--black);
  color: var(--white);
  padding: 28px 24px;
  margin-top: 16px;
}
.footer_logo { height: 28px; margin-bottom: 8px; filter: brightness(0) invert(1); }
.brand_name { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.brand_sub { font-size: 12px; color: var(--gray-light); margin-bottom: 16px; }

.brand_info { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
.brand_info > div { display: flex; gap: 8px; }
.brand_info dt { color: var(--gray-light); min-width: 110px; }
.brand_info dd { color: var(--white); }

.copy { font-size: 11px; color: var(--gray); margin-top: 16px; }
</style>
