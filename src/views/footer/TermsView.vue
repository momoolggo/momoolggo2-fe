<template>
  <div class="info_wrap">
    <h2 class="page_title">이용약관</h2>
    <div class="info_card">
      <div class="section" v-for="item in terms" :key="item.title">
        <h3 class="section_title">{{ item.title }}</h3>
        <p class="section_text">{{ item.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const terms = [
  { title: '제1조 (목적)', content: '이 약관은 뭐물꼬(이하 "회사")가 제공하는 배달 중개 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.' },
  { title: '제2조 (정의)', content: '"서비스"란 회사가 제공하는 음식 배달 중개 플랫폼 및 관련 제반 서비스를 의미합니다. "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.' },
  { title: '제3조 (약관의 효력 및 변경)', content: '본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있습니다.' },
  { title: '제4조 (서비스의 제공)', content: '회사는 안정적인 서비스 제공을 위해 최선을 다하며, 시스템 점검 및 장애 발생 시 서비스가 일시 중단될 수 있습니다. 회사는 서비스 중단 시 사전 또는 사후에 공지합니다.' },
  { title: '제5조 (이용자의 의무)', content: '이용자는 관계 법령, 본 약관의 규정, 이용안내 등을 준수하여야 합니다. 이용자는 타인의 정보를 도용하거나 허위 정보를 등록하는 행위를 하여서는 안 됩니다.' },
]
</script>

<style scoped>
.info_wrap { max-width: 720px; margin: 40px auto; padding: 0 16px 60px; }
.page_title { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
.info_card { background: #fff; border-radius: var(--radius-lg); border: 1.5px solid var(--border); padding: 36px; display: flex; flex-direction: column; gap: 28px; }
.section_title { font-size: 15px; font-weight: 700; color: var(--black); margin-bottom: 10px; padding-left: 10px; border-left: 3px solid var(--primary); }
.section_text { font-size: 14px; color: var(--gray-dark); line-height: 1.8; }
</style>