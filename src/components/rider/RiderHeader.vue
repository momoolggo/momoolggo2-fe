<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useMessageModalStore } from '@/stores/messageModalStore'
import workSessionService from '@/services/workSessionService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const messageModalStore = useMessageModalStore()

const drawerOpen = ref(false)
const endConfirmOpen = ref(false)

const pageTitle = computed(() => {
  if (route.path === '/riderservice') return '뭐물꼬 라이더'
  if (route.path === '/rider/work-session') return '근무관리'
  return '뭐물꼬 라이더'
})

const openDrawer = () => { drawerOpen.value = true }
const closeDrawer = () => { drawerOpen.value = false }

const goTo = (path) => {
  closeDrawer()
  router.push(path)
}

const openEndConfirm = () => {
  closeDrawer()
  endConfirmOpen.value = true
}
const closeEndConfirm = () => { endConfirmOpen.value = false }

const confirmEnd = async () => {
  try {
    await workSessionService.end()
    messageModalStore.setMessage('업무를 종료했습니다. 다시 시작하려면 배달중 토글을 변경하세요.')
  } catch {
    // 인터셉터가 에러 모달 표시
  } finally {
    endConfirmOpen.value = false
  }
}

const signout = async () => {
  closeDrawer()
  await userStore.signOut()
  router.push('/riderlanding')
}
</script>

<template>
  <header class="rider-header">
    <button class="back-btn" @click="router.back()" aria-label="뒤로">←</button>
    <h1 class="title">{{ pageTitle }}</h1>
    <button class="menu-btn" @click="openDrawer" aria-label="메뉴">☰</button>
  </header>

  <transition name="fade">
    <div v-if="drawerOpen" class="drawer-backdrop" @click="closeDrawer" />
  </transition>

  <transition name="slide">
    <aside v-if="drawerOpen" class="drawer" role="dialog" aria-label="라이더 메뉴">
      <div class="drawer-head">
        <div class="user-name">{{ userStore.state.name }} 라이더</div>
        <button class="close-btn" @click="closeDrawer" aria-label="닫기">✕</button>
      </div>
      <nav class="menu">
        <button class="menu-item" @click="goTo('/rider/notice')">공지사항</button>
        <button class="menu-item" @click="goTo('/rider/history')">배달내역</button>
        <button class="menu-item" @click="goTo('/rider/work-session')">근무관리</button>
        <button class="menu-item danger" @click="openEndConfirm">업무 종료</button>
      </nav>
      <div class="drawer-foot">
        <button class="signout-btn" @click="signout">로그아웃</button>
      </div>
    </aside>
  </transition>

  <transition name="fade">
    <div v-if="endConfirmOpen" class="modal-backdrop" @click.self="closeEndConfirm">
      <div class="confirm-box" role="alertdialog" aria-modal="true">
        <h2>업무를 종료하시겠습니까?</h2>
        <p>진행 중인 배달이 있으면 종료가 거부됩니다. 로그인 세션은 유지됩니다.</p>
        <div class="confirm-actions">
          <button class="btn-secondary" @click="closeEndConfirm">취소</button>
          <button class="btn-primary" @click="confirmEnd">종료</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.rider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 12px;
  background: #A40C0B;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}
.back-btn, .menu-btn {
  background: transparent;
  border: 0;
  color: white;
  font-size: 22px;
  width: 40px;
  height: 40px;
  cursor: pointer;
}
.title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
}
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: 100vh;
  background: white;
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0,0,0,0.15);
}
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #A40C0B;
  color: white;
}
.user-name {
  font-weight: 600;
}
.close-btn {
  background: transparent;
  border: 0;
  color: white;
  font-size: 18px;
  cursor: pointer;
}
.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border: 0;
  background: white;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}
.menu-item:hover:not(.disabled) {
  background: #faf3f3;
}
.menu-item.disabled {
  color: #aaa;
  cursor: not-allowed;
}
.menu-item.danger {
  color: #A40C0B;
  font-weight: 600;
}
.badge {
  font-size: 11px;
  background: #eee;
  color: #888;
  padding: 2px 6px;
  border-radius: 8px;
}
.drawer-foot {
  padding: 16px;
  border-top: 1px solid #eee;
}
.signout-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.confirm-box {
  background: white;
  width: 320px;
  max-width: 86vw;
  padding: 24px;
  border-radius: 12px;
}
.confirm-box h2 {
  font-size: 18px;
  margin: 0 0 8px;
}
.confirm-box p {
  font-size: 14px;
  color: #555;
  margin: 0 0 20px;
}
.confirm-actions {
  display: flex;
  gap: 8px;
}
.btn-secondary, .btn-primary {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 0;
  font-size: 15px;
}
.btn-secondary {
  background: #f0f0f0;
  color: #333;
}
.btn-primary {
  background: #A40C0B;
  color: white;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
