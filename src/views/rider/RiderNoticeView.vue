<script setup>
import { onMounted, ref, computed } from 'vue'
import RiderHeader from '@/components/rider/RiderHeader.vue'
import noticeService from '@/services/noticeService'

const notices = ref([])
const loading = ref(true)
const selectedCategory = ref('ALL')

const categories = [
  { key: 'ALL', label: '전체' },
  { key: 'IMPORTANT', label: '중요' },
  { key: 'SAFETY', label: '안전' },
  { key: 'GENERAL', label: '일반' },
]

const filtered = computed(() => {
  if (selectedCategory.value === 'ALL') return notices.value
  return notices.value.filter(n => n.category === selectedCategory.value)
})

const categoryColor = (c) => {
  if (c === 'IMPORTANT') return '#d0021b'
  if (c === 'SAFETY') return '#f5a623'
  return '#888'
}

const categoryLabel = (c) => {
  if (c === 'IMPORTANT') return '중요'
  if (c === 'SAFETY') return '안전'
  return '일반'
}

const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const expanded = ref({})
const toggle = (no) => {
  expanded.value = { ...expanded.value, [no]: !expanded.value[no] }
}

onMounted(async () => {
  try {
    notices.value = await noticeService.getNotices()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <RiderHeader />
  <main class="content">
    <nav class="tabs">
      <button
        v-for="c in categories"
        :key="c.key"
        class="tab"
        :class="{ active: selectedCategory === c.key }"
        @click="selectedCategory = c.key"
      >{{ c.label }}</button>
    </nav>

    <section v-if="loading" class="state">불러오는 중...</section>
    <section v-else-if="filtered.length === 0" class="state">공지사항이 없습니다.</section>

    <ul v-else class="list">
      <li v-for="n in filtered" :key="n.noticeNo" class="item" @click="toggle(n.noticeNo)">
        <header class="head">
          <span class="badge" :style="{ background: categoryColor(n.category) }">{{ categoryLabel(n.category) }}</span>
          <span class="title">{{ n.title }}</span>
          <span class="date">{{ fmtDate(n.publishedAt) }}</span>
        </header>
        <p v-if="expanded[n.noticeNo]" class="body">{{ n.content }}</p>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.content {
  padding: 0;
  background: #f7f7f7;
  min-height: calc(100vh - 56px);
}
.tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 56px;
  z-index: 10;
}
.tab {
  flex: 1;
  padding: 12px;
  border: 0;
  background: white;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: #A40C0B;
  border-bottom-color: #A40C0B;
  font-weight: 600;
}
.state {
  padding: 40px 20px;
  text-align: center;
  color: #888;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  background: white;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}
.head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.badge {
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  flex-shrink: 0;
}
.title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.date {
  font-size: 12px;
  color: #aaa;
  flex-shrink: 0;
}
.body {
  margin: 10px 0 0;
  font-size: 13px;
  color: #555;
  white-space: pre-wrap;
}
</style>
