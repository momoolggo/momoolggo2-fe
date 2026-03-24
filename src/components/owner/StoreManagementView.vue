<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import ownerService from '@/services/ownerService'
import { useStore } from '@/stores/useStore'
import NaverMap from '@/components/common/NaverMap.vue'
import { showAlert, showConfirm } from '@/composables/useAlert'

const storeInfo = useStore()

const activeTab = ref('기본정보')
const tabs = ['기본정보', '운영상태']

const basicForm = reactive({
  storeId: '',
  storeName: '',
  location: '',
  addressDetail: '',
  lat: null,
  lng: null,
  storeTel: '',
  businessNumber: '',
  storePic: '',
  storeInfo: '',
})

const statusForm = reactive({
  storeId: '',
  state: 1,
  holiday: '',
  notice: '',
  minPrice: 0,
  businessHours: '',
})

const holidays = ['월', '화', '수', '목', '금', '토', '일']
const selectedHolidays = ref([])
const loading = ref(false)
const previewImage = ref(null)
const fileInput = ref(null)
const uploading = ref(false)

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `${path}`
}

const loadStore = async () => {
  if (!storeInfo.myStoreId) return
  loading.value = true
  try {
    // 가게 목록에서 현재 선택된 가게 정보 가져오기
    const found = storeInfo.myStores.find(s => s.storeId === storeInfo.myStoreId)
    if (!found) return

    basicForm.storeId = found.storeId
    basicForm.storeName = found.storeName || ''
    basicForm.location = found.location || ''
    basicForm.storeTel = found.storeTel || ''
    basicForm.businessNumber = found.businessNumber || ''
    basicForm.storePic = found.storePic || ''
    basicForm.storeInfo = found.storeInfo || ''
    previewImage.value = found.storePic ? getImageUrl(found.storePic) : null

    statusForm.storeId = found.storeId
    statusForm.state = found.state ?? 1
    statusForm.notice = found.notice || ''
    statusForm.holiday = found.holiday || ''
    statusForm.minPrice = found.minPrice || 0
    statusForm.businessHours = found.businessHours || ''
    selectedHolidays.value = found.holiday ? found.holiday.split(',') : []
  } catch (e) {
    console.error('가게 정보 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadStore)

// 가게 전환 시 데이터 다시 로드
watch(() => storeInfo.myStoreId, loadStore)

const onAddressSelect = ({ address, lat, lng }) => {
  basicForm.location = address
  basicForm.lat = lat
  basicForm.lng = lng
}

const triggerFileUpload = () => fileInput.value.click()
const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  previewImage.value = URL.createObjectURL(file)

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await ownerService.uploadStoreImage(formData)
    basicForm.storePic = res.resultData
  } catch {
    await showAlert('이미지 업로드에 실패했습니다.', { title: '오류', type: 'error' })
    previewImage.value = null
  } finally {
    uploading.value = false
  }
}

const saveBasicInfo = async () => {
  try {
    await ownerService.updateStore({ ...basicForm })
    await showAlert('기본정보가 수정되었습니다.', { title: '수정 완료', type: 'success' })
    // 가게 목록도 갱신
    const res = await ownerService.getMyStores()
    storeInfo.setStores(res.resultData || [])
  } catch {
    await showAlert('수정에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

const saveStatus = async () => {
  statusForm.holiday = selectedHolidays.value.join(',')
  statusForm.minPrice = Number(statusForm.minPrice)
  try {
    await ownerService.updateStoreStatus({ ...statusForm })
    await showAlert('운영정보가 수정되었습니다.', { title: '수정 완료', type: 'success' })
    // 가게 목록도 갱신
    const res = await ownerService.getMyStores()
    storeInfo.setStores(res.resultData || [])
  } catch {
    await showAlert('수정에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

const deleteStore = async () => {
  const ok = await showConfirm('정말 가게를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.', { title: '가게 삭제', type: 'warning' })
  if (!ok) return
  try {
    await ownerService.deleteStore(basicForm.storeId)
    await showAlert('가게가 삭제되었습니다.', { title: '삭제 완료', type: 'success' })
    // 가게 목록 갱신
    const res = await ownerService.getMyStores()
    const stores = res.resultData || []
    storeInfo.setStores(stores)
    if (stores.length > 0) {
      storeInfo.setStore(stores[0].storeName, stores[0].storeId)
    } else {
      storeInfo.clearStore()
    }
  } catch {
    await showAlert('삭제에 실패했습니다.', { title: '오류', type: 'error' })
  }
}
</script>

<template>
  <div class="store-wrap">

    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['tab-btn', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >{{ tab === '기본정보' ? '가게 기본 정보 수정' : '가게 운영 상태 수정' }}</button>
    </div>

    <div v-if="loading" class="loading">불러오는 중...</div>

    <!-- 기본정보 -->
    <div v-else-if="activeTab === '기본정보'" class="form-box">
      <h2>가게 관리</h2>

      <div class="form-grid">
        <div class="left-col">

          <div class="field">
            <label>가게 상호명</label>
            <input v-model="basicForm.storeName" type="text" maxlength="24" placeholder="가게 상호명" />
            <span class="cnt">{{ basicForm.storeName.length }}/24</span>
          </div>

          <div class="field">
            <label>가게 주소</label>
            <NaverMap @select="onAddressSelect" />
            <input
              v-if="basicForm.location"
              v-model="basicForm.addressDetail"
              type="text"
              placeholder="상세주소 입력 (동/호수 등)"
              class="detail-input"
            />
            <div v-if="basicForm.location" class="selected-address-box">
              📍 {{ basicForm.location }}
              <span v-if="basicForm.addressDetail"> {{ basicForm.addressDetail }}</span>
            </div>
          </div>

          <div class="field">
            <label>가게 전화번호</label>
            <input v-model="basicForm.storeTel" type="text" placeholder="000-0000-0000" />
          </div>

          <div class="field">
            <label>사업자 번호</label>
            <input v-model="basicForm.businessNumber" type="text" placeholder="000-00-00000" />
          </div>

        </div>

        <div class="right-col">

          <div class="field">
            <label>가게 대표 사진</label>
            <div class="img-upload-box" @click="triggerFileUpload">
              <template v-if="uploading">
                <p class="upload-text">업로드 중...</p>
              </template>
              <template v-else-if="previewImage">
                <img :src="previewImage" class="store-thumb" />
                <div class="img-change-overlay">클릭하여 변경</div>
              </template>
              <template v-else>
                <div class="img-placeholder">
                  <span class="plus">+</span>
                  <p>여기를 눌러 사진을 추가하세요</p>
                </div>
              </template>
            </div>
            <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" style="display:none" />
          </div>

          <div class="field">
            <label>가게 소개글</label>
            <textarea v-model="basicForm.storeInfo" maxlength="100" placeholder="가게 소개를 입력하세요"></textarea>
            <span class="cnt">{{ (basicForm.storeInfo || '').length }}/100</span>
          </div>

        </div>
      </div>

      <div class="btn-row">
        <button class="btn-delete" @click="deleteStore">가게 삭제</button>
        <button class="btn-cancel" @click="loadStore">취소</button>
        <button class="btn-save" @click="saveBasicInfo">저장</button>
      </div>
    </div>

    <!-- 운영상태 -->
    <div v-else class="form-box">
      <h2>가게 관리</h2>

      <div class="status-grid">

        <div class="field">
          <label>영업 상태</label>
          <div class="toggle-row">
            <span class="toggle-label">{{ statusForm.state === 1 ? '영업중' : '준비중' }}</span>
            <label class="toggle">
              <input type="checkbox" :checked="statusForm.state === 1"
                @change="statusForm.state = $event.target.checked ? 1 : 0" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="two-col">
          <div class="field">
            <label>가게 영업 시간</label>
            <input v-model="statusForm.businessHours" type="text" placeholder="예) 09:00 - 22:00" />
          </div>
          <div class="field">
            <label>가게 공지</label>
            <textarea v-model="statusForm.notice" maxlength="100" placeholder="공지사항을 입력하세요"></textarea>
            <span class="cnt">{{ (statusForm.notice || '').length }}/100</span>
          </div>
        </div>

        <div class="field">
          <label>휴무일</label>
          <div class="holiday-row">
            <label v-for="day in holidays" :key="day" class="day-check">
              <input type="checkbox" :value="day" v-model="selectedHolidays" />
              <span :class="['day-badge', { selected: selectedHolidays.includes(day) }]">{{ day }}</span>
            </label>
          </div>
        </div>

        <div class="field">
          <label>배달 최소 주문 금액</label>
          <div class="price-row">
            <input v-model="statusForm.minPrice" type="number" placeholder="0" />
            <span class="unit">원</span>
          </div>
        </div>

      </div>

      <div class="btn-row">
        <button class="btn-cancel" @click="loadStore">초기화</button>
        <button class="btn-cancel" @click="loadStore">취소</button>
        <button class="btn-save" @click="saveStatus">저장</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.store-wrap { flex: 1; padding: 40px; background: #f9f9f9; min-height: 100vh; }
.tab-bar { display: flex; gap: 10px; margin-bottom: 24px; }
.tab-btn { padding: 10px 22px; border-radius: 10px; border: 1.5px solid #ddd; background: #fff; font-size: 14px; font-weight: 600; color: #888; cursor: pointer; transition: all 0.15s; }
.tab-btn.active { background: #A40C0B; color: #fff; border-color: #A40C0B; }
.tab-btn:hover:not(.active) { border-color: #A40C0B; color: #A40C0B; }
.form-box { background: #fff; border-radius: 20px; padding: 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.form-box h2 { font-size: 20px; font-weight: 800; margin-bottom: 30px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
.status-grid { display: flex; flex-direction: column; gap: 24px; margin-bottom: 30px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; font-weight: 600; color: #444; }
.field input, .field textarea { padding: 11px 14px; border: 1.5px solid #e5e3dc; border-radius: 10px; font-size: 14px; outline: none; background: #fafafa; transition: border-color 0.15s; font-family: inherit; box-sizing: border-box; width: 100%; }
.field input:focus, .field textarea:focus { border-color: #A40C0B; background: #fff; }
.field textarea { height: 90px; resize: none; }
.cnt { align-self: flex-end; font-size: 11px; color: #bbb; }
.detail-input { margin-top: 8px; }
.selected-address-box { margin-top: 8px; padding: 12px 16px; background: #fff4f4; border: 1.5px solid #A40C0B; border-radius: 10px; font-size: 15px; font-weight: 600; color: #333; line-height: 1.5; }
.img-upload-box { border: 2px dashed #ddd; border-radius: 12px; height: 200px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; position: relative; transition: border-color 0.15s; }
.img-upload-box:hover { border-color: #A40C0B; }
.store-thumb { width: 100%; height: 100%; object-fit: cover; }
.img-change-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); color: #fff; text-align: center; padding: 8px; font-size: 13px; }
.img-placeholder { text-align: center; color: #bbb; }
.plus { font-size: 28px; }
.upload-text { color: #888; font-size: 14px; }
.toggle-row { display: flex; align-items: center; gap: 12px; }
.toggle-label { font-size: 14px; font-weight: 600; color: #333; min-width: 40px; }
.toggle { position: relative; display: inline-block; width: 48px; height: 26px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #ccc; border-radius: 26px; transition: 0.3s; }
.slider:before { content: ''; position: absolute; width: 20px; height: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .slider { background: #A40C0B; }
.toggle input:checked + .slider:before { transform: translateX(22px); }
.holiday-row { display: flex; gap: 10px; flex-wrap: wrap; }
.day-check { cursor: pointer; }
.day-check input { display: none; }
.day-badge { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #ddd; font-size: 14px; font-weight: 600; color: #888; transition: all 0.15s; }
.day-badge.selected { background: #A40C0B; border-color: #A40C0B; color: #fff; }
.price-row { display: flex; align-items: center; gap: 8px; }
.price-row input { flex: 1; }
.unit { font-size: 14px; font-weight: 600; color: #444; }
.btn-row { display: flex; justify-content: flex-end; gap: 10px; }
.btn-delete { padding: 12px 22px; background: #fff; border: 1.5px solid #A40C0B; color: #A40C0B; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; margin-right: auto; }
.btn-delete:hover { background: #A40C0B; color: #fff; }
.btn-cancel { padding: 12px 22px; background: #f4f4f4; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-cancel:hover { background: #e8e8e8; }
.btn-save { padding: 12px 22px; background: #A40C0B; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
.btn-save:hover { background: #8a0a09; }
.loading { text-align: center; padding: 60px; color: #888; }
</style>