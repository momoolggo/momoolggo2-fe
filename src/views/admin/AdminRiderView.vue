<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import adminService from '@/services/adminService'
import { showAlert, showConfirm } from '@/composables/useAlert'

// 2026-05-28 트랙 — 라이더 가입 신원 승인 화면 (SSE 자동화 트랙 폐기 → 복원).
// 기본 PENDING(승인 대기) 필터 노출, 면허증 사진 클릭으로 원본 확대.
const activeTab = ref('PENDING')
const riders = ref([])
const loading = ref(false)
const previewUrl = ref(null)

const tabs = [
  { key: 'PENDING', label: '승인 대기' },
  { key: 'ACTIVE', label: '활동 중' },
  { key: 'SUSPENDED', label: '정지' },
  { key: null, label: '전체' },
]

const statusLabel = (s) => ({
  PENDING: '승인 대기', ACTIVE: '활동 중', EATING: '식사 중', SUSPENDED: '정지'
}[s] ?? s)

const statusBadgeClass = (s) => ({
  PENDING: 'badge_pending', ACTIVE: 'badge_active',
  EATING: 'badge_active', SUSPENDED: 'badge_suspended'
}[s] ?? '')

const vehicleLabel = (v) => ({
  MOTORBIKE: '오토바이', CAR: '자동차', BICYCLE: '자전거', WALK: '도보'
}[v] ?? v)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await adminService.getRiderList(activeTab.value)
    riders.value = res ?? []
  } catch (err) {
    console.error('라이더 목록 조회 실패', err)
    await showAlert(err.response?.data?.resultMessage ?? '라이더 목록 조회에 실패했습니다.',
      { title: '조회 실패', type: 'error' })
    riders.value = []
  } finally {
    loading.value = false
  }
}

const selectTab = (key) => {
  activeTab.value = key
  fetchList()
}

const approve = async (rider) => {
  const ok = await showConfirm(
    `${rider.licenseNo} 라이더를 승인하시겠습니까?\n승인 후 즉시 활동이 가능합니다.`,
    { title: '라이더 승인', type: 'warning' }
  )
  if (!ok) return
  try {
    await adminService.approveRider(rider.userNo)
    await showAlert('승인이 완료되었습니다.', { title: '승인 성공', type: 'success' })
    await fetchList()
  } catch (err) {
    await showAlert(err.response?.data?.resultMessage ?? '승인에 실패했습니다.',
      { title: '승인 실패', type: 'error' })
  }
}

const openPreview = (url) => { if (url) previewUrl.value = url }
const closePreview = () => { previewUrl.value = null }

const baseUrl = computed(() => import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ?? '')
const imageSrc = (url) => url ? `${baseUrl.value}${url}` : ''

onMounted(() => fetchList())
</script>

<template>
  <div class="admin_layout">
    <AdminSidebar />
    <div class="admin_main">
      <AdminHeader />
      <main class="content">
        <div class="page_header">
          <h2 class="page_title">라이더 승인</h2>
          <p class="page_desc">가입 신청한 라이더의 면허증을 확인하고 승인합니다.</p>
        </div>

        <nav class="tabs">
          <button
            v-for="t in tabs"
            :key="t.key ?? 'all'"
            class="tab"
            :class="{ active: activeTab === t.key }"
            @click="selectTab(t.key)"
          >{{ t.label }}</button>
        </nav>

        <section v-if="loading" class="state">불러오는 중...</section>
        <section v-else-if="riders.length === 0" class="state">표시할 라이더가 없습니다.</section>

        <ul v-else class="card_list">
          <li v-for="r in riders" :key="r.riderNo" class="card">
            <div class="card_left">
              <img
                v-if="r.licenseImageUrl"
                :src="imageSrc(r.licenseImageUrl)"
                alt="면허증 사진"
                class="license_thumb"
                @click="openPreview(imageSrc(r.licenseImageUrl))"
              />
              <div v-else class="license_thumb no_image">사진 없음</div>
            </div>
            <div class="card_body">
              <div class="card_row1">
                <span class="badge" :class="statusBadgeClass(r.status)">{{ statusLabel(r.status) }}</span>
                <span class="vehicle">{{ vehicleLabel(r.vehicleType) }}</span>
              </div>
              <div class="card_row">
                <span class="label">면허번호</span>
                <span>{{ r.licenseNo }} · {{ r.licenseType }}</span>
              </div>
              <div class="card_row">
                <span class="label">연락처</span>
                <span>{{ r.phone ?? '미등록' }}</span>
              </div>
              <div class="card_row" v-if="r.accountBank || r.accountNo">
                <span class="label">정산 계좌</span>
                <span>{{ r.accountBank ?? '' }} {{ r.accountNo ?? '' }} ({{ r.accountHolder ?? '' }})</span>
              </div>
            </div>
            <div class="card_actions">
              <button v-if="r.status === 'PENDING'" class="btn_approve" @click="approve(r)">승인</button>
              <span v-else class="approved_label">처리 완료</span>
            </div>
          </li>
        </ul>

        <!-- 면허증 사진 원본 확대 모달 -->
        <div v-if="previewUrl" class="preview_backdrop" @click.self="closePreview">
          <img :src="previewUrl" alt="면허증 원본" class="preview_full" />
          <button class="preview_close" @click="closePreview">✕</button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin_layout { display: flex; min-height: 100vh; background: #F9F9FB; }
.admin_main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; }
.content { padding: 24px 32px; flex: 1; }

.page_header { margin-bottom: 20px; }
.page_title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
.page_desc { font-size: 13px; color: #888; margin: 0; }

.tabs { display: flex; gap: 6px; margin-bottom: 20px; border-bottom: 1px solid #eee; }
.tab { padding: 10px 18px; border: 0; background: none; cursor: pointer; font-size: 14px; color: #888; border-bottom: 2px solid transparent; }
.tab.active { color: #9b1b1b; border-bottom-color: #9b1b1b; font-weight: 700; }

.state { padding: 60px 20px; text-align: center; color: #888; font-size: 14px; }

.card_list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.card { background: white; border: 1px solid #eee; border-radius: 12px; padding: 16px; display: flex; gap: 16px; align-items: center; }
.card_left { flex-shrink: 0; }
.license_thumb { width: 120px; height: 80px; border-radius: 8px; object-fit: cover; cursor: pointer; border: 1px solid #eee; }
.license_thumb.no_image { display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #aaa; font-size: 12px; cursor: default; }

.card_body { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.card_row1 { display: flex; gap: 10px; align-items: center; margin-bottom: 4px; }
.card_row { display: flex; gap: 10px; font-size: 13px; }
.label { color: #888; min-width: 70px; }
.vehicle { font-size: 12px; color: #555; background: #f0f0f0; padding: 2px 8px; border-radius: 10px; }

.badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; }
.badge_pending { background: #fff3cd; color: #856404; }
.badge_active { background: #d4edda; color: #155724; }
.badge_suspended { background: #f8d7da; color: #721c24; }

.card_actions { flex-shrink: 0; }
.btn_approve { padding: 10px 20px; background: #9b1b1b; color: white; border: 0; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
.btn_approve:hover { background: #7a1414; }
.approved_label { font-size: 12px; color: #888; }

.preview_backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.preview_full { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
.preview_close { position: absolute; top: 24px; right: 24px; background: rgba(255,255,255,0.2); color: white; border: 0; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 18px; }
</style>
