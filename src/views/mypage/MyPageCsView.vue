<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const userName = computed(() => userStore.state?.name ?? '고객')

// 탭
const tabs = ['결제', '배달', '환불/취소', '회원']

const activeTab = ref('결제')

// 각 탭별 FAQ
const faqData = {
  결제: [
    { q: '결제가 되지 않는데 어떻게 해야 하나요?', a: '결제 수단을 확인하시고, 카드사 문제일 경우 다른 카드로 시도해 보세요. 계속 문제가 생기면 고객센터로 연락해 주세요.' },
    { q: '결제 수단은 어떤 것들이 있나요?', a: '신용카드, 체크카드, 카카오페이, 네이버페이, 토스 등 다양한 결제 수단을 지원합니다.' },
    { q: '결제 영수증은 어디서 확인하나요?', a: '마이페이지 > 주문 내역에서 각 주문의 영수증을 확인하실 수 있습니다.' },
    { q: '결제 금액이 잘못된 것 같아요.', a: '주문 내역과 결제 내역을 비교 후 차이가 있다면 상담원 연결을 통해 문의해 주세요.' },
  ],
  배달: [
    { q: '배달이 많이 지연되고 있는데 어떻게 해야 하나요?', a: '배달 현황은 주문 상세 페이지에서 실시간으로 확인하실 수 있습니다. 30분 이상 지연 시 상담원에게 문의해 주세요.' },
    { q: '배달 현황을 어떻게 확인하나요?', a: '마이페이지 > 주문 내역 > 해당 주문을 클릭하시면 실시간 배달 현황을 확인할 수 있습니다.' },
    { q: '배달 주소를 잘못 입력했어요.', a: '주문 접수 직후에는 고객센터를 통해 수정이 가능합니다. 조리가 시작된 이후에는 변경이 어려울 수 있습니다.' },
    { q: '배달 기사님과 연락이 안 돼요.', a: '앱 내 주문 상세 페이지에서 배달 기사님께 연락할 수 있습니다. 연결이 어렵다면 고객센터로 문의 주세요.' },
  ],
  '환불/취소': [
    { q: '주문한 메뉴를 변경하거나 취소하고 싶습니다.', a: '주문 접수 후 조리 시작 전까지 취소가 가능합니다. 마이페이지 > 주문 내역에서 취소 버튼을 이용해 주세요.' },
    { q: '환불 신청/완료된 내용은 어디서 확인할 수 있나요?', a: '마이페이지 > 환불 내역에서 환불 신청 및 완료 내역을 확인하실 수 있습니다.' },
    { q: '환불은 얼마나 걸리나요?', a: '카드 결제는 영업일 기준 3~5일, 간편결제는 1~3일 내 처리됩니다.' },
    { q: '음식이 잘못 왔는데 환불받을 수 있나요?', a: '사진을 첨부하여 고객센터로 문의해 주시면 확인 후 환불 처리해 드립니다.' },
  ],
  회원: [
    { q: '본인인증 시 이미 본인인증한 계정이 있다고 나와요.', a: '동일한 본인 명의로 이미 가입된 계정이 있습니다. 아이디 찾기를 이용하시거나 고객센터로 문의해 주세요.' },
    { q: '주문 성공 여부를 어떻게 알 수 있나요?', a: '주문 완료 시 앱 푸시 알림 및 문자 메시지로 안내해 드립니다. 마이페이지 > 주문 내역에서도 확인 가능합니다.' },
    { q: '비밀번호를 잊어버렸어요.', a: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시면 이메일 또는 본인인증을 통해 재설정하실 수 있습니다.' },
    { q: '회원 탈퇴는 어떻게 하나요?', a: '마이페이지 > 설정 > 회원 탈퇴에서 진행하실 수 있습니다. 탈퇴 후 데이터는 복구되지 않으니 신중히 결정해 주세요.' },
  ],
}

// 토글
const openIndex = ref(null)

const toggleFaq = (i) => {
  openIndex.value = openIndex.value === i ? null : i
}

const currentFaqs = computed(() => faqData[activeTab.value] ?? [])

const changeTab = (tab) => {
  activeTab.value = tab
  openIndex.value = null
}

const open = () => {
  window.open('https://gemini.google.com/')
}
</script>

<template>
  <div class="empty_wrap">
    <h2 class="page_title">고객센터</h2>

    <!-- 탭 -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="changeTab(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <!-- qna -->
    <div class="faq-list">
      <div
        v-for="(item, i) in currentFaqs"
        :key="i"
        class="faq-item"
        :class="{ open: openIndex === i }"
      >
        <button class="faq-q" @click="toggleFaq(i)">
          <span class="q-mark">Q.</span>
          <span class="q-text">{{ item.q }}</span>
          <span class="arrow">{{ openIndex === i ? '▲' : '▼' }}</span>
        </button>
        <div class="faq-a" v-show="openIndex === i">
          <span class="a-mark">A.</span>
          <span class="a-text">{{ item.a }}</span>
        </div>
      </div>
    </div>

    <!-- 상담원 연결 -->
    <div class="agent-card">
      <p class="agent-greeting">
        <strong>{{ userName }}</strong> 님 무엇을 도와드릴까요?
      </p>
      <button class="agent-btn" @click="open">상담원 연결</button>
    </div>
  </div>
</template>

<style scoped>

.empty_wrap { max-width: 640px; margin: 40px auto; padding: 0 16px; }
.page_title { font-size: 20px; font-weight: 700; margin-bottom: 40px; }
.cs-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 0 100px;
  background: #f2f2f2;
  min-height: 100vh;
}

/* 페이지 타이틀*/
.page-title {
  font-size: 18px;
  font-weight: 700;
  padding: 20px 16px 14px;
  background: #fff;
  margin: 0;
}

/* 탭pill 스타일*/
.tab-bar {
  display: flex;
  gap: 8px;
  background: #fff;
  padding: 10px 16px 14px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-btn {
  flex: 1;
  padding: 8px 0;
  border: 1.5px solid #ddd;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.18s;
}

.tab-btn.active {
  background: #fff;
  border-color:#e84040;
  color: #e84040;
  font-weight: 700;
}

/*FAQ 리스트*/
.faq-list {
  padding: 14px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
 
  
}

/*FAQ 카드*/
.faq-item {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
}

.faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.q-mark {
  font-size: 14px;
  font-weight: 800;
  color: #e84040;
  flex-shrink: 0;
}

.q-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #222;
  line-height: 1.5;
}

.arrow {
  font-size: 10px;
  color: #ccc;
  flex-shrink: 0;
}

/* 토글 답변 */
.faq-a {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.a-mark {
  font-size: 14px;
  font-weight: 800;
  color: #bbb;
  flex-shrink: 0;
}

.a-text {
  font-size: 13px;
  color: #555;
  line-height: 1.65;
}

/*상담원 연결 */
.agent-card {
  margin: 20px 14px 0;
  background: #fff;
  border-radius: 20px;
  padding: 32px 20px 28px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.agent-greeting {
  font-size: 20px;
  color: #222;
  margin: 0 0 20px;
  line-height: 1.5;
  letter-spacing: -0.3px;
}

.agent-greeting strong {
  font-weight: 900;
  color: #111;
}

.agent-btn {
  padding: 13px 48px;
  background: #fff;
  color: #e84040;
  border: 2px solid #e84040;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
}

.agent-btn:active {
  background: #e84040;
  color: #fff;
}
</style>