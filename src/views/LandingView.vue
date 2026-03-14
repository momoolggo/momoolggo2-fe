<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const goOrder = () => {
  if (!userStore.state.isSignedIn) return router.push('/customer/signin')
  if (userStore.state.role === 'CUSTOMER') return router.push('/home')
  if (userStore.state.role === 'OWNER')    return router.push('/ownerservice')
  if (userStore.state.role === 'RIDER')    return router.push('/riderservice')
}
</script>

<template>
  <div class="landing">

    <!-- ────────────── 데스크탑 네비바 ────────────── -->
    <header class="navbar">
      <div class="navbar_inner">
        <router-link to="/" class="nav_logo_link">
          <img src="@/assets/뭐물꼬_로고.png" alt="뭐올꼬" class="nav_logo" />
        </router-link>
        <nav class="nav_menu">
          <router-link to="/owner/signin" class="nav_link">사장님 입점문의하기</router-link>
          <router-link to="/rider/signin" class="nav_link">라이더 신청하기</router-link>
          <button class="nav_btn_order" @click="goOrder">주문하러 가기</button>
        </nav>
      </div>
    </header>

    <!-- ────────────── 데스크탑 히어로 ────────────── -->
    <section class="hero_desktop">
      <div class="hero_desktop_inner">
        <div class="hero_text">
          <p class="hero_sub">대구·경북 배달은</p>
          <h1 class="hero_title">
            뭐올꼬<br />
            <span class="hero_accent">하나면 끝!</span>
          </h1>
          <p class="hero_desc">
            대구·경북 지역 맛집을<br />빠르고 안전하게 배달해드립니다
          </p>
          <div class="hero_btns">
            <button class="btn_main" @click="goOrder">지금 주문하기</button>
            <router-link to="/owner/signin" class="btn_sub">사장님 입점 문의</router-link>
          </div>
        </div>
        <div class="hero_image">
          <img src="@/assets/뭐물꼬_마스코트.png" alt="뭐올꼬 마스코트" class="mascot" />
        </div>
      </div>
      <!-- 물결 구분선 -->
      <div class="wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fff" />
        </svg>
      </div>
    </section>

    <!-- ────────────── 섹션: 사장님 입점 ────────────── -->
    <section class="section section_owner">
      <div class="section_inner">
        <div class="section_img_wrap">
          <div class="section_img_placeholder owner_img">
            <span>🏪</span>
          </div>
        </div>
        <div class="section_text">
          <span class="section_tag">사장님을 위한 서비스</span>
          <h2 class="section_title">사장님 입점<br/>문의하기</h2>
          <p class="section_desc">
            뭐올꼬와 함께라면 배달 매출이 달라집니다.<br/>
            지금 바로 입점 신청하고 더 많은 고객을 만나보세요.
          </p>
          <router-link to="/owner/signin" class="btn_section">입점 신청하기 →</router-link>
        </div>
      </div>
    </section>

    <!-- ────────────── 섹션: 라이더 신청 ────────────── -->
    <section class="section section_rider">
      <div class="section_inner section_inner_reverse">
        <div class="section_text">
          <span class="section_tag">라이더를 위한 서비스</span>
          <h2 class="section_title">배달 파트너<br/>신청하기</h2>
          <p class="section_desc">
            자유로운 시간에 원하는 만큼 일하세요.<br/>
            빠른 정산과 안전한 배달 환경을 제공합니다.
          </p>
          <router-link to="/rider/signin" class="btn_section">라이더 신청하기 →</router-link>
        </div>
        <div class="section_img_wrap">
          <div class="section_img_placeholder rider_img">
            <span>🛵</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ────────────── 푸터 ────────────── -->
    <footer class="footer">
      <div class="footer_inner">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐올꼬" class="footer_logo" />
        <div class="footer_info">
          <p class="footer_company">뭐올꼬</p>
          <p>대구 경북 지역 배달 서비스</p>
          <p>사업자등록번호: 000-00-00000</p>
          <p>주소: 대구 중구 달성로 56번길 50 개명빌딩 4F</p>
          <p>운영시간: 09:00 ~ 18:00</p>
          <p>고객센터: 0507-1414-1016</p>
        </div>
        <p class="footer_copy">© 2025 뭐올꼬 All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* ── 공통 리셋 */
.landing {
  font-family: 'Noto Sans KR', 'Pretendard', sans-serif;
  overflow-x: hidden;
}

/* ════════════════════════════════
   네비바 (데스크탑)
════════════════════════════════ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.navbar_inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav_logo_link { display: flex; align-items: center; }
.nav_logo { height: 44px; }
.nav_menu { display: flex; align-items: center; gap: 8px; }
.nav_link {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.15s;
}
.nav_link:hover { background: #fff3f0; color: #e03400; }
.nav_btn_order {
  padding: 10px 22px;
  background: #e03400;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  margin-left: 8px;
}
.nav_btn_order:hover { background: #c02c00; }

/* ════════════════════════════════
   데스크탑 히어로
════════════════════════════════ */
.hero_desktop {
  position: relative;
  background: linear-gradient(135deg, #e03400 0%, #ff6b35 50%, #ffab4e 100%);
  min-height: 560px;
  overflow: hidden;
}
.hero_desktop_inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 32px 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}
.hero_text { flex: 1; color: #fff; }
.hero_sub {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 12px;
}
.hero_title {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -1px;
}
.hero_accent {
  color: #fff9c4;
  text-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.hero_desc {
  font-size: 17px;
  line-height: 1.7;
  opacity: 0.9;
  margin-bottom: 36px;
}
.hero_btns { display: flex; gap: 14px; flex-wrap: wrap; }
.btn_main {
  padding: 16px 36px;
  background: #fff;
  color: #e03400;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  transition: all 0.15s;
}
.btn_main:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }
.btn_sub {
  padding: 16px 32px;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.6);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s;
  display: flex;
  align-items: center;
}
.btn_sub:hover { background: rgba(255,255,255,0.3); }
.hero_image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.mascot {
  width: 480px;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.2));
  mix-blend-mode: multiply;
}
.wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  line-height: 0;
}
.wave svg { width: 100%; height: 80px; }

/* ════════════════════════════════
   공통 섹션
════════════════════════════════ */
.section { padding: 100px 32px; }
.section_owner { background: #fff; }
.section_rider { background: #fff9f7; }
.section_inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 80px;
}
.section_inner_reverse { flex-direction: row-reverse; }
.section_img_wrap { flex: 1; }
.section_img_placeholder {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
}
.owner_img { background: linear-gradient(135deg, #fff3f0, #ffe0d8); }
.rider_img { background: linear-gradient(135deg, #fff8f0, #ffe8cc); }
.section_text { flex: 1; }
.section_tag {
  display: inline-block;
  padding: 6px 14px;
  background: #fff3f0;
  color: #e03400;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 16px;
}
.section_title {
  font-size: 40px;
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1.25;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}
.section_desc {
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 28px;
}
.btn_section {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  background: #e03400;
  color: #fff;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s;
}
.btn_section:hover { background: #c02c00; transform: translateX(4px); }

/* ════════════════════════════════
   푸터
════════════════════════════════ */
.footer {
  background: #1a1a1a;
  color: #aaa;
  padding: 48px 32px;
}
.footer_inner {
  max-width: 1200px;
  margin: 0 auto;
}
.footer_logo { height: 36px; margin-bottom: 20px; filter: brightness(0) invert(1); opacity: 0.7; }
.footer_company { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.footer_info { font-size: 13px; line-height: 2; }
.footer_copy { margin-top: 24px; font-size: 12px; opacity: 0.5; }

/* ════════════════════════════════
   모바일 반응형
════════════════════════════════ */
@media (max-width: 768px) {

  /* 네비바 모바일 */
  .navbar_inner { padding: 0 16px; }
  .nav_link { display: none; }
  .nav_btn_order { padding: 8px 14px; font-size: 13px; }

  /* 히어로 모바일 */
  .hero_desktop { min-height: auto; }
  .hero_desktop_inner {
    flex-direction: column;
    padding: 40px 20px 80px;
    text-align: center;
    gap: 0;
  }
  .hero_title { font-size: 36px; }
  .hero_sub { font-size: 15px; }
  .hero_desc { font-size: 14px; }
  .hero_btns { justify-content: center; }
  .btn_main, .btn_sub { padding: 13px 24px; font-size: 14px; }
  .mascot { width: 280px; margin-top: 20px; }

  /* 섹션 모바일 */
  .section { padding: 60px 20px; }
  .section_inner,
  .section_inner_reverse {
    flex-direction: column;
    gap: 32px;
  }
  .section_title { font-size: 28px; }
  .section_desc { font-size: 14px; }

  /* 푸터 모바일 */
  .footer { padding: 36px 20px; }
}
</style>