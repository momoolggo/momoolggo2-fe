<script setup>
import { ref } from 'vue'

const notices = [
  { id: 1, title: '뭐물꼬 서비스 오픈 안내', date: '2025-03-01', content: '안녕하세요, 뭐물꼬입니다. 대구·경상도 지역 배달 플랫폼 뭐물꼬가 정식 오픈하였습니다. 많은 이용 부탁드립니다.' },
  { id: 2, title: '서비스 점검 안내 (3월 15일)', date: '2025-03-10', content: '3월 15일 새벽 2시부터 4시까지 서버 점검이 진행됩니다. 해당 시간에는 서비스 이용이 불가합니다.' },
  { id: 3, title: '개인정보처리방침 개정 안내', date: '2025-03-05', content: '개인정보처리방침이 일부 개정되었습니다. 변경된 내용을 확인해 주세요.' },
]

const openId = ref(null)
const toggle = (id) => { openId.value = openId.value === id ? null : id }
</script>

<template>
  <div class="info_wrap">
    <h2 class="page_title">공지사항</h2>
    <div class="notice_list">
      <div v-for="item in notices" :key="item.id" class="notice_item">
        <div class="notice_header" @click="toggle(item.id)">
          <div class="notice_title_wrap">
            <span class="notice_num">[공지]</span>
            <span class="notice_title">{{ item.title }}</span>
          </div>
          <div class="notice_right">
            <span class="notice_date">{{ item.date }}</span>
            <i :class="openId === item.id ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
          </div>
        </div>
        <div v-if="openId === item.id" class="notice_content">
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info_wrap { max-width: 720px; margin: 40px auto; padding: 0 16px 60px; }
.page_title { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
.notice_list { display: flex; flex-direction: column; border-top: 2px solid var(--black); }
.notice_item { border-bottom: 1px solid var(--border); }
.notice_header { display: flex; align-items: center; justify-content: space-between; padding: 16px 12px; cursor: pointer; transition: background 0.12s; }
.notice_header:hover { background: var(--primary-light); }
.notice_title_wrap { display: flex; align-items: center; gap: 8px; }
.notice_num { font-size: 12px; font-weight: 700; color: var(--primary); white-space: nowrap; }
.notice_title { font-size: 14px; font-weight: 600; color: var(--black); }
.notice_right { display: flex; align-items: center; gap: 12px; }
.notice_date { font-size: 12px; color: var(--gray); white-space: nowrap; }
.notice_content { padding: 16px 20px; background: #fafafa; font-size: 14px; color: var(--gray-dark); line-height: 1.8; border-top: 1px solid var(--border); }
</style>