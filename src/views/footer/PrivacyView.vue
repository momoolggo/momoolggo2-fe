<template>
  <div class="info_wrap">
    <h2 class="page_title">개인정보처리방침</h2>
    <div class="info_card">
      <p class="intro">뭐물꼬는 개인정보 보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>
      <div class="section" v-for="item in privacy" :key="item.title">
        <h3 class="section_title">{{ item.title }}</h3>
        <p class="section_text">{{ item.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const privacy = [
  { title: '1. 수집하는 개인정보 항목', content: '회사는 서비스 이용을 위해 필요한 최소한의 개인정보를 수집합니다. 수집 항목: 이름, 아이디, 비밀번호, 생년월일, 성별, 휴대폰번호, 주소' },
  { title: '2. 개인정보의 수집 및 이용 목적', content: '서비스 제공 및 계약 이행, 회원 관리, 고객 상담 및 불만 처리, 서비스 개선 및 신규 서비스 개발' },
  { title: '3. 개인정보의 보유 및 이용 기간', content: '회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.' },
  { title: '4. 개인정보의 파기', content: '개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체없이 파기합니다. 전자적 파일 형태로 기록·저장된 개인정보는 복원이 불가능한 방법으로 파기합니다.' },
  { title: '5. 개인정보 보호책임자', content: '개인정보 보호책임자: 홍길동 / 이메일: privacy@momoolggo.com / 전화: 1588-0000' },
]
</script>

<style scoped>
.info_wrap { max-width: 720px; margin: 40px auto; padding: 0 16px 60px; }
.page_title { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
.info_card { background: #fff; border-radius: var(--radius-lg); border: 1.5px solid var(--border); padding: 36px; display: flex; flex-direction: column; gap: 28px; }
.intro { font-size: 14px; color: var(--gray-dark); line-height: 1.8; padding-bottom: 20px; border-bottom: 1.5px solid var(--border); }
.section_title { font-size: 15px; font-weight: 700; color: var(--black); margin-bottom: 10px; padding-left: 10px; border-left: 3px solid var(--primary); }
.section_text { font-size: 14px; color: var(--gray-dark); line-height: 1.8; }
</style>