<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores/useStore'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const store = useStore()
const userStore = useUserStore()
const router = useRouter()

const showStoreDropdown = ref(false)

defineProps({
  activeMenu: String
})
const emit = defineEmits(['menu-change'])

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
    <div class="logo-section">
      <img src="@/assets/logo.png" alt="뭐물꼬" class="logo" />

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
    </div>

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
.sidebar { width: 280px; height: calc(100vh - 40px); margin: 20px; background: #fff; border-radius: 40px; box-shadow: 10px 0 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; padding: 50px 25px; position: sticky; top: 20px; }
.logo-section { text-align: center; margin-bottom: 80px; }
.logo { width: 220px; margin-bottom: 20px; }
.shop-info { position: relative; }
.shop-info h3 { font-size: 22px; margin-bottom: 5px; color: #333; }
.verified { color: #3f51b5; font-size: 18px; }
.shop-info p { font-size: 15px; color: #666; }
.store-select { cursor: pointer; transition: opacity 0.2s; }
.store-select:hover { opacity: 0.7; }
.dropdown-arrow { font-size: 12px; color: #999; margin-left: 4px; }
.store-dropdown { position: absolute; top: 36px; left: 50%; transform: translateX(-50%); width: 220px; max-height: 300px; overflow-y: auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 100; }
.store-option { padding: 12px 16px; font-size: 14px; color: #333; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s; }
.store-option:hover { background: #f5f5f5; }
.store-option.selected { background: #f0f4ff; color: #3f51b5; font-weight: 700; }
.check-icon { color: #3f51b5; font-size: 16px; }
.menu-container { flex: 1; display: flex; flex-direction: column; gap: 25px; margin-top: 20px; }
.menu-item { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #c6c0d0; background: #fff; color: #5d5868; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
.menu-item.active { background: linear-gradient(90deg, #6200ea, #3f51b5); color: #fff; border: none; }
.add-store { border: 1px dashed #aaa; color: #888; background: #fafafa; }
.add-store:hover { border-color: #3f51b5; color: #3f51b5; background: #f0f4ff; }
.footer { font-size: 11px; color: #bbb; text-align: center; line-height: 1.5; margin-top: 20px; }
</style>