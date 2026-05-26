<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const logout = async () => {
  await userStore.signOut()
  router.push('/admin/signin')
}
</script>

<template>
    <header class="top_header">
      <div class="header_left">
        <img src="@/assets/로고수정.png" alt="logo" class="header_logo_img" />
        <span class="header_title">관리자 서비스</span>
      </div>
      <div class="header_right">
        <span class="admin_greeting">관리자 님 안녕하세요</span>
        <button class="logout_btn" @click="logout">로그아웃</button>
      </div>
    </header>
  </template>

  <style scoped>
  .top_header {
    background: #9b1b1b;
    padding: 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
    
  }
  
  .header_left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .header_logo_img {
    width: 80px;
    height: auto;
  }
  
  .header_title {
    font-size: 22px;
    margin-left: 18px;
    font-weight: 700;
    color: #fff;
  }
  
  .header_right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .admin_greeting {
    font-size: 13px;
    color: #fff;
  }

  .logout_btn {
    font-size: 13px;
    color: #fff;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 6px;
    padding: 5px 14px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .logout_btn:hover {
    background: rgba(255,255,255,0.28);
  }
  </style>