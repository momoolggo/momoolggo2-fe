<script setup>
import { onMounted, computed } from 'vue'
import { useDeliveryStore } from '@/stores/deliveryStore'
import WaitingTab from '@/components/rider/WaitingTab.vue'
import InProgressTab from '@/components/rider/InProgressTab.vue'
import CompletedTab from '@/components/rider/CompletedTab.vue'

const deliveryStore = useDeliveryStore()

const tabs = [
  { key: 'waiting',    label: '대기' },
  { key: 'inprogress', label: '진행' },
  { key: 'completed',  label: '완료' },
]

const waitingCount = computed(() => deliveryStore.state.waiting.length)
const inProgressCount = computed(() => deliveryStore.state.inProgress.length)

onMounted(() => {
  deliveryStore.loadWaiting()
  deliveryStore.loadInProgress()
})

const switchTab = (key) => {
  deliveryStore.setTab(key)
  if (key === 'waiting') deliveryStore.loadWaiting()
  if (key === 'inprogress') deliveryStore.loadInProgress()
}

const countOf = (key) => {
  if (key === 'waiting') return waitingCount.value
  if (key === 'inprogress') return inProgressCount.value
  return 0
}
</script>

<template>
  <div class="rider_home">
    <header class="page_header">
      <h1 class="page_title">배달현황</h1>
    </header>

    <nav class="tab_nav">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab_btn"
        :class="{ active: deliveryStore.state.currentTab === t.key }"
        @click="switchTab(t.key)"
      >
        {{ t.label }}
        <span v-if="countOf(t.key) > 0" class="badge">{{ countOf(t.key) }}</span>
      </button>
    </nav>

    <main class="tab_panel">
      <WaitingTab    v-if="deliveryStore.state.currentTab === 'waiting'" />
      <InProgressTab v-else-if="deliveryStore.state.currentTab === 'inprogress'" />
      <CompletedTab  v-else />
    </main>
  </div>
</template>

<style scoped>
.rider_home { max-width: 420px; margin: 0 auto; min-height: 100vh; background: var(--bg); }

.page_header { padding: 16px 20px; background: var(--white); border-bottom: 1px solid var(--border); }
.page_title { font-size: 18px; font-weight: 700; color: var(--black); }

.tab_nav { display: flex; background: var(--white); border-bottom: 1px solid var(--border); }
.tab_btn {
  flex: 1;
  padding: 14px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.tab_btn.active { color: var(--primary); border-bottom-color: var(--primary); }
.badge {
  background: var(--primary);
  color: var(--white);
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.tab_panel { padding: 12px 0; }
</style>
