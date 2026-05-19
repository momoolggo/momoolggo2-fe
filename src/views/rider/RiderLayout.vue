<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import riderService from '@/services/riderService'

const props = defineProps({
  requireActive: { type: Boolean, default: false }
})

const router = useRouter()
const userStore = useUserStore()

const state = ref('ok')
const blockReason = ref(null)

const HOTLINE = '0507-1414-1018'

onMounted(async () => {
  if (!props.requireActive) return
  state.value = 'loading'
  try {
    const me = await riderService.getMe()
    const status = me?.status
    if (status === 'PENDING' || status === 'SUSPENDED') {
      blockReason.value = status
      state.value = 'blocked'
    } else {
      state.value = 'ok'
    }
  } catch (err) {
    console.error('[RiderLayout] getMe failed:', err?.response?.status, err?.response?.data, err)
    blockReason.value = err?.response?.status === 404 ? 'NOT_REGISTERED' : 'ERROR'
    state.value = 'blocked'
  }
})

const signout = async () => {
  await userStore.signOut()
  router.push('/')
}

const goHome = () => router.push('/')
const goSignup = () => router.push('/rider/signup')
</script>

<template>
  <div class="rider-outer">
    <div class="rider-frame">
      <div v-if="state === 'loading'" class="block-screen">
        <p class="block-loading">확인 중...</p>
      </div>

      <div v-else-if="state === 'blocked'" class="block-screen">
        <div class="block-icon">⚠️</div>
        <h2 class="block-title">
          {{ blockReason === 'PENDING' ? '아직 승인되지 않았습니다'
            : blockReason === 'SUSPENDED' ? '이용이 제한되었습니다'
            : blockReason === 'NOT_REGISTERED' ? '라이더 가입이 완료되지 않았습니다'
            : '라이더 정보를 불러올 수 없습니다' }}
        </h2>
        <p class="block-desc">
          {{ blockReason === 'PENDING' ? '라이더 가입이 관리자 승인 대기 중입니다. 승인이 완료되면 서비스를 이용할 수 있습니다.'
            : blockReason === 'SUSPENDED' ? '관리자에 의해 이용이 제한되었습니다. 자세한 사유는 고객센터로 문의해주세요.'
            : blockReason === 'NOT_REGISTERED' ? '라이더 프로필 등록이 필요합니다. 회원가입을 다시 진행해주세요.'
            : '잠시 후 다시 시도해주세요. 문제가 계속되면 고객센터로 문의해주세요.' }}
        </p>
        <a class="block-hotline" :href="`tel:${HOTLINE}`">📞 고객센터 {{ HOTLINE }}</a>
        <div class="block-actions">
          <button v-if="blockReason === 'NOT_REGISTERED'" class="block-btn primary" @click="goSignup">회원가입</button>
          <button class="block-btn secondary" @click="goHome">홈으로</button>
          <button class="block-btn secondary" @click="signout">로그아웃</button>
        </div>
      </div>

      <slot v-else />
    </div>
  </div>
</template>

<style scoped>
.rider-outer {
  width: 100%;
  min-height: 100dvh;
  background: var(--primary-light);
  display: flex;
  justify-content: center;
}

.rider-frame {
  width: 100%;
  max-width: 420px;
  min-height: 100dvh;
  position: relative;
  background: var(--bg);
  overflow-x: hidden;
}

.block-screen {
  padding: 56px 24px 32px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  background: var(--white);
}
.block-loading { color: var(--gray); font-size: 14px; padding-top: 32px; }
.block-icon { font-size: 56px; }
.block-title { font-size: 20px; font-weight: 700; color: var(--black); margin: 4px 0; }
.block-desc { font-size: 14px; color: var(--gray-dark); line-height: 1.6; padding: 0 8px; }
.block-hotline {
  display: inline-block;
  padding: 12px 20px;
  border: 1.5px solid var(--primary);
  border-radius: 8px;
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
  margin: 12px 0;
  text-decoration: none;
}
.block-actions {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: auto;
  padding-top: 16px;
}
.block-btn {
  flex: 1;
  padding: 13px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 0;
}
.block-btn.secondary { background: #f0f0f0; color: var(--gray-dark); }
.block-btn.primary { background: var(--primary); color: white; }
</style>
