<script setup>
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, Users, Store, Star, Wallet, Bike, LifeBuoy } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { name: '대시 보드', path: '/admin', icon: LayoutDashboard },
  { name: '회원 관리', path: '/admin/user', icon: Users },
  { name: '가게 관리', path: '/admin/store', icon: Store },
  { name: '리뷰 관리', path: '/admin/blind', icon: Star },
  { name: '정산 관리', path: '/admin/settlement', icon: Wallet },
  { name: '배달 관리', path: '/admin/delivery', icon: Bike },
  { name: '고객 지원', path: '/admin/cs', icon: LifeBuoy },
]

const isActive = (path) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const goTo = (path) => {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="logo_section">
      <img src="@/assets/logo.png" alt="logo" class="logo" />
    </div>

    <nav class="menu_list">
      <button
        v-for="item in menuItems"
        :key="item.path"
        class="menu_item"
        :class="{ active: isActive(item.path) }"
        @click="goTo(item.path)"
      >
        <component :is="item.icon" class="menu_icon" :size="18" />
        {{ item.name }}
      </button>
    </nav>
  </aside>
</template>

<style scoped>

.sidebar {
  width: 240px;
  height: 100vh;
  background: #F9F9FB;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
}

.logo_section {
  text-align: center;
  margin-bottom: 50px;
  margin-top: 20px;
}

.logo {
  width: 220px;
  max-width: 100%;
}

.menu_list {
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  gap: 20px;
}

.menu_item {
  padding: 11px 16px;
  border: none;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #888;
  text-align: left;
  transition: color 0.15s, background 0.15s;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu_icon {
  flex-shrink: 0;
}

.menu_item:hover {
  color: #9b1b1b;
  background: rgba(155, 27, 27, 0.07);
}

.menu_item.active {
  color: #9b1b1b;
  font-weight: 700;
  background: rgba(155, 27, 27, 0.1);
}
</style>