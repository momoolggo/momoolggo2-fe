
<script setup>
import { computed } from 'vue';

// 부모 컴포넌트 호출 방식 (:state="state.storeInfo")을 따릅니다.
const props = defineProps({
  state: Object
});

// 날짜 포맷 (예: "2024년 03월 12일" 형식)
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
};

// 공지사항 줄바꿈 처리 (\n -> <br>)
const formattedNotice = computed(() => {
  return props.state?.notice?.replace(/\n/g, '<br>') || '등록된 알림이 없습니다.';
});
</script>


<template>
  <div class="store-info-wrapper" v-if="state">
    <div class="store-info-container">
      <section class="info-section">
        <h3 class="group-title">{{ state.storeName }}</h3>
        <dl class="info-list">
          <div class="info-row">
            <dt>상호명</dt>
            <dd>{{ state.storeName }}</dd>
          </div>
          <div class="info-row">
            <dt>주소</dt>
            <dd>{{ state.location }} {{ state.detailLocation }}</dd>
          </div>
          <div class="info-row">
            <dt>운영시간</dt>
            <dd>{{ state.businessHours }}</dd>
          </div>
          <div class="info-row">
            <dt>휴무일</dt>
            <dd>{{ state.holiday || '-' }}</dd>
          </div>
          <div class="info-row">
            <dt>전화번호</dt>
            <dd>{{ state.storeTel }}</dd>
          </div>
          <div class="info-row">
            <dt>가게 오픈일</dt>
            <dd>{{ formatDate(state.createdAt) }}</dd>
          </div>
        </dl>
      </section>

      <section class="info-section">
        <h3 class="group-title">사업자 정보</h3>
        <dl class="info-list">
          <div class="info-row">
            <dt>대표자명</dt>
            <dd>{{ state.ownerName }}</dd>
          </div>
          <div class="info-row">
            <dt>사업자등록번호</dt>
            <dd>{{ state.business_number }}</dd>
          </div>

          <div class="info-row mt-xl">
            <dt>총 주문수</dt>
            <dd>{{ state.orderCount?.toLocaleString() || 0 }} 건</dd>
          </div>

        </dl>
      </section>
    </div>

    <section class="notice-section mt-xl">
      <h3 class="group-title">가게 알림</h3>
      <div class="notice-content" v-html="formattedNotice"></div>
    </section>
  </div>
</template>

<style scoped>
.store-info-wrapper {
  padding: 30px 40px;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  letter-spacing: -0.01em;
}

.store-info-container {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  margin-bottom: 50px;
}

.group-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #111;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  font-size: 14px;
  line-height: 1.6;
}

dt {
  width: 130px;
  color: #999;
  flex-shrink: 0;
}

dd {
  flex: 1;
  color: #333;
  font-weight: 400;
}

.mt-xl {
  margin-top: 35px;
}

.notice-section {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.notice-content {
  font-size: 14px;
  line-height: 1.9;
  color: #444;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .store-info-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .store-info-wrapper {
    padding: 20px;
  }
}
</style>
