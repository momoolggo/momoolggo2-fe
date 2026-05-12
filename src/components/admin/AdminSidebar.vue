<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { name: '대시 보드', path: '/admin' },
  { name: '회원 관리', path: '/admin/user' },
  { name: '가게 관리', path: '/admin/store' },
  { name: '리뷰 관리', path: '/admin/blind' },
  { name: '정산 관리', path: '/admin/settlement' },
  { name: '배달 관리', path: '/admin/delivery' },
  { name: '고객 지원', path: '/admin/cs' },
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
        {{ item.name }}
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #F9F9FB;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.logo_section {
 
  text-align: center;
  margin-bottom: 60px;
  margin-top: 20px;
}

.logo {
  width: 230px;
}

.menu_list {
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 25px;
}

.menu_item {
  padding: 13px 16px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.15s;
  width: 100%;
}

.menu_item:hover {
  background: #f5f5f5;
  color: #222;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.menu_item.active {
  background: #9b1b1b;
  border-color:#9b1b1b;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(185, 28, 28, 0.3);
}
</style>