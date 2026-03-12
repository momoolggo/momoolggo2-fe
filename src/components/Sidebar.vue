<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from '@/stores/useStore'; 

const router = useRouter();
const route = useRoute(); 
const store = useStore();
const isTooltipVisible = ref(false);

const goToRegisterStore = () => {
  router.push('/owner/addstore'); 
};
</script>

<template>
  <aside class="sidebar">
    <div class="logo-section">
      <img src="@/assets/logo.png" alt="뭐물꼬" class="logo" />
      
      <div 
        class="shop-info" 
        @mouseenter="isTooltipVisible = true" 
        @mouseleave="isTooltipVisible = false"
      >
        <div class="store-name-wrapper">
          <h3>코이보타루 <span class="verified">✔</span></h3>
          
          <transition name="fade">
            <div v-if="isTooltipVisible" class="store-tooltip">
              <p v-for="(name, index) in store.myStores" :key="index" class="tooltip-text">
                {{ name }} ✔
              </p>
              
              <button @click.stop="goToRegisterStore" class="add-store-btn"> 
                + 가게 추가하기
              </button>
            </div>
          </transition>
        </div>
        <p><strong>김수빈</strong> 사장님</p>
      </div>
    </div>

    <nav class="menu-container">
      <button class="menu-item" :class="{ active: route.path === '/owner/order' }">주문 관리</button>
      <button class="menu-item" :class="{ active: route.path === '/owner/sales' }">매출 관리</button>
      <button class="menu-item" :class="{ active: route.path === '/owner/menu' }">메뉴 관리</button>
      <button class="menu-item" :class="{ active: route.path === '/owner/store' }">가게 관리</button>
      <button class="menu-item" :class="{ active: route.path === '/owner/setting' }">설정</button>
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
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 50px 25px;
  position: sticky;
  top: 20px;
}

.logo-section { text-align: center; margin-bottom: 80px; }
.logo { width: 220px; margin-bottom: 20px; }
.shop-info { position: relative; cursor: pointer; }
.store-name-wrapper { position: relative; }
.shop-info h3 { font-size: 22px; margin-bottom: 5px; color: #333; }
.verified { color: #3f51b5; font-size: 18px; }
.shop-info p { font-size: 15px; color: #666; }

.store-tooltip {
  position: absolute;
  top: calc(100% + 35px);
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  background: #fff;
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  text-align: left;
}
.tooltip-text { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 20px; }
.add-store-btn {
  background-color: #4A5FF2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
}

.menu-container { flex: 1; display: flex; flex-direction: column; gap: 25px; margin-top: 60px; }
.menu-item {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #c6c0d0;
  background: #fff;
  color: #5d5868;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}
.menu-item.active { background: linear-gradient(90deg, #6200ea, #3f51b5); color: #fff; border: none; }
.footer { font-size: 11px; color: #bbb; text-align: center; line-height: 1.5; margin-top: 20px; }
</style>