<template>
  <div class="info_wrap">
    <h2 class="page_title">회사소개</h2>
    <div class="info_card">
      <div class="logo_section">
        <h1 class="brand">뭐물꼬</h1>
        <p class="slogan">대구 배달은 뭐물꼬!</p>
      </div>
      <div class="section">
        <h3 class="section_title">뭐물꼬는?</h3>
        <p class="section_text">뭐물꼬는 대구·경상도 지역 특화 배달 플랫폼입니다. 지역 상권과 소비자를 연결하여 더 빠르고 편리한 배달 서비스를 제공합니다.</p>
      </div>
      <div class="section">
        <h3 class="section_title">회사 정보</h3>
        <table class="info_table">
          <tbody>
            <tr><th>상호명</th><td>뭐물꼬</td></tr>
            <tr><th>대표자</th><td>홍길동</td></tr>
            <tr><th>사업자등록번호</th><td>000-00-00000</td></tr>
            <tr><th>주소</th><td>대구광역시 중구 동성로 1길 1</td></tr>
            <tr><th>고객센터</th><td>1588-0000</td></tr>
            <tr><th>이메일</th><td>contact@momoolggo.com</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info_wrap { max-width: 720px; margin: 40px auto; padding: 0 16px 60px; }
.page_title { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
.info_card { background: #fff; border-radius: var(--radius-lg); border: 1.5px solid var(--border); padding: 36px; display: flex; flex-direction: column; gap: 32px; }
.logo_section { text-align: center; padding: 20px 0; border-bottom: 1.5px solid var(--border); }
.brand { font-size: 40px; font-weight: 800; color: var(--primary); }
.slogan { font-size: 16px; color: var(--gray); margin-top: 8px; }
.section_title { font-size: 16px; font-weight: 700; color: var(--black); margin-bottom: 12px; padding-left: 10px; border-left: 3px solid var(--primary); }
.section_text { font-size: 14px; color: var(--gray-dark); line-height: 1.8; }
.info_table { width: 100%; border-collapse: collapse; font-size: 14px; }
.info_table th, .info_table td { padding: 10px 14px; border-bottom: 1px solid var(--border); text-align: left; }
.info_table th { width: 140px; color: var(--gray); font-weight: 600; background: #fafafa; }
.info_table td { color: var(--black); }
</style>