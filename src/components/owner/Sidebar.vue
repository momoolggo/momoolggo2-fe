<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores/useStore'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import ownerService from '@/services/ownerService'

const store = useStore()
const userStore = useUserStore()
const router = useRouter()

const showStoreDropdown = ref(false)

defineProps({
  activeMenu: String
})
const emit = defineEmits(['menu-change'])

const toggleState = async (newState) => {
  store.setStoreState(newState)
  try {
    await ownerService.updateStoreStatus({ storeId: store.myStoreId, state: newState })
  } catch (e) {
    console.error('영업 상태 변경 실패', e)
  }
}

const toggleDropdown = () => {
  if (store.myStores.length > 1) {
    showStoreDropdown.value = !showStoreDropdown.value
  }
}

const selectStore = (s) => {
  store.switchStore(s.storeId)
  showStoreDropdown.value = false
  emit('menu-change', 'order')
}

const goToAddStore = () => {
  router.push('/ownerservice/addstore')
}
</script>

<template>
  
  <aside class="sidebar">

    <!-- 로고 -->
    <div class="logo-section">
      <img src="@/assets/logo.png" alt="뭐물꼬" class="logo" />
    </div>

    <!-- 영업 상태 토글 -->
    <div class="status-toggle">
      <button
        :class="['status-btn', { active: store.storeState === 1 }]"
        @click="toggleState(1)"
      >영업 중</button>
      <button
        :class="['status-btn', { active: store.storeState === 0 }]"
        @click="toggleState(0)"
      >준비 중</button>
    </div>

    <!-- 가게 정보 -->
    <div class="shop-info">
      <div class="store-select" @click="toggleDropdown">
        <h3>
          {{ store.myStore }}
          <span class="verified">✔</span>
          <span v-if="store.myStores.length > 1" class="dropdown-arrow">
            {{ showStoreDropdown ? '▲' : '▼' }}
          </span>
        </h3>
      </div>

      <div v-if="showStoreDropdown" class="store-dropdown">
        <div
          v-for="s in store.myStores"
          :key="s.storeId"
          class="store-option"
          :class="{ selected: s.storeId === store.myStoreId }"
          @click="selectStore(s)"
        >
          {{ s.storeName }}
          <span v-if="s.storeId === store.myStoreId" class="check-icon">✓</span>
        </div>
      </div>

      <p><strong>{{ userStore.state.name }}</strong> 사장님</p>
    </div>

    <!-- 메뉴 -->
    <nav class="menu-container">
      <button class="menu-item" :class="{ active: activeMenu === 'order' }"  @click="emit('menu-change', 'order')">주문 관리</button>
      <button class="menu-item" :class="{ active: activeMenu === 'sales' }"  @click="emit('menu-change', 'sales')">매출 관리</button>
      <button class="menu-item" :class="{ active: activeMenu === 'menu' }"   @click="emit('menu-change', 'menu')">메뉴 관리</button>
      <button class="menu-item" :class="{ active: activeMenu === 'store' }"  @click="emit('menu-change', 'store')">가게 관리</button>
      <button class="menu-item" :class="{ active: activeMenu === 'review' }" @click="emit('menu-change', 'review')">리뷰 관리</button>
      <button class="menu-item add-store" @click="goToAddStore">+ 가게 추가</button>
    </nav>

    <div class="footer">
      <p>고객센터 000-111-222</p>
      <p>All rights Reserved © Momulggo, 2026</p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: calc(100vh - 40px);
  margin: 20px;
  background: #fff;
  border-radius: 40px;
  box-shadow: 10px 0 30px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 25px;
  position: sticky;
  top: 20px;
  gap: 16px;
}

/* 로고 */
.logo-section { text-align: center; }
.logo { width: 200px; }

/* 영업 상태 토글 */
.status-toggle {
  display: flex;
  gap:0;
  width: 100%;
}

.status-btn {
  flex: 1;
  padding: 9px 0;
  border-radius: 0;
  border: 1.5px solid #ddd;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
}

.status-btn.active {
  background: #9b1b1b;
  border-color: #9b1b1b;
  color: #fff;
}

.status-btn:hover:not(.active) {
  border-color: #9b1b1b;
  color: #9b1b1b;
}

/* 가게 정보 */
.shop-info {
  text-align: center;
  position: relative;
  width: 100%;
}

.shop-info h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #333;
}

.verified { color: #3f51b5; font-size: 16px; }
.shop-info p { font-size: 14px; color: #666; margin: 0; }
.store-select { cursor: pointer; transition: opacity 0.2s; }
.store-select:hover { opacity: 0.7; }
.dropdown-arrow { font-size: 12px; color: #999; margin-left: 4px; }

.store-dropdown {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 100;
}

.store-option { padding: 12px 16px; font-size: 14px; color: #333; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s; }
.store-option:hover { background: #f5f5f5; }
.store-option.selected { background: #fff4f4; color:#9b1b1b; font-weight: 700; }
.check-icon { color: #9b1b1b; font-size: 16px; }

/* 메뉴 */
.menu-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-top: 40px;
}

.menu-item {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #555;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.menu-item:hover:not(.active):not(.add-store) {
  border-color:#9b1b1b;
  color:#9b1b1b;
}

.menu-item.active {
  background:#9b1b1b;
  color: #fff;
  border-color:#9b1b1b;
}

.add-store {
  border: 1px dashed #ccc;
  color: #999;
  background: #fafafa;
}

.add-store:hover {
  border-color:#9b1b1b;
  color:#9b1b1b;
  background: #fff4f4;
}

.footer {
  font-size: 11px;
  color: #bbb;
  text-align: center;
  line-height: 1.6;
}


</style>