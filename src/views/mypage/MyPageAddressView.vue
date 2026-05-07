<script setup>
import { reactive, onMounted } from 'vue'
import addressService from '@/services/addressService'
import NaverMap from '@/components/common/NaverMap.vue'
import { showAlert, showConfirm } from '@/composables/useAlert'

const state = reactive({
  list: [],
  showModal: false,
  editMode: false,
  modalForm: {
    addressId: null,
    address: '',
    addressDetail: '',
    lat: null,
    lng: null,
    defaultAd: 0,
  },
})

// ── 주소 목록 불러오기
const loadList = async () => {
  try {
    const res = await addressService.findAll()
    state.list = res.resultData || res
  } catch {
    state.list = []
  }
}

onMounted(loadList)

// ── NaverMap에서 주소 선택 시
const onAddressSelect = ({ address, lat, lng }) => {
  state.modalForm.address = address
  state.modalForm.lat = lat
  state.modalForm.lng = lng
}

// ── 추가 모달 열기
const openAdd = () => {
  state.modalForm = { addressId: null, address: '', addressDetail: '', lat: null, lng: null, defaultAd: 0 }
  state.editMode = false
  state.showModal = true
}

// ── 수정 모달 열기
const openEdit = (item) => {
  state.modalForm = { ...item }
  state.editMode = true
  state.showModal = true
}

const closeModal = () => {
  state.showModal = false
}

// ── 저장 (추가 or 수정)
const saveAddress = async () => {
  if (!state.modalForm.address) { await showAlert('주소를 입력해 주세요.', { title: '입력 필요', type: 'warning' }); return }
  try {
    if (state.editMode) {
      await addressService.update(state.modalForm)
    } else {
      await addressService.save(state.modalForm)
    }
    closeModal()
    await loadList()
  } catch {
    await showAlert('저장에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

// ── 삭제
const deleteAddress = async (addressId) => {
  const ok = await showConfirm('삭제하시겠습니까?', { title: '주소 삭제', type: 'warning' })
  if (!ok) return
  try {
    await addressService.delete(addressId)
    await loadList()
  } catch {
    await showAlert('삭제에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

// ── 기본 배송지 변경
const setDefault = async (addressId) => {
  try {
    await addressService.setDefault(addressId)
    await loadList()
  } catch {
    await showAlert('변경에 실패했습니다.', { title: '오류', type: 'error' })
  }
}
</script>

<template>
  <div class="address_wrap">
    <div class="page_header">
      <h2 class="page_title">주소 관리</h2>
      <button class="btn_primary btn_sm" @click="openAdd">+ 추가</button>
    </div>

    <!-- 주소 목록 -->
    <div class="my_address_list">
      <div v-for="item in state.list" :key="item.addressId" class="address_item">
        <div class="addr_left">
          <span v-if="item.defaultAd === 1" class="default_badge">기본</span>
          <div class="addr_text">
            <p class="addr_main">{{ item.address }}</p>
            <p v-if="item.addressDetail" class="addr_detail">{{ item.addressDetail }}</p>
          </div>
        </div>
        <div class="addr_actions">
          <button v-if="item.defaultAd !== 1" class="btn_outline btn_xs" @click="setDefault(item.addressId)">기본으로</button>
          <button class="btn_outline btn_xs" @click="openEdit(item)">수정</button>
          <button class="btn_danger btn_xs" @click="deleteAddress(item.addressId)">삭제</button>
        </div>
      </div>
      <p v-if="!state.list.length" class="empty_msg">등록된 주소가 없습니다.</p>
    </div>

    <!-- 모달 -->
    <div v-if="state.showModal" class="modal_overlay" @click.self="closeModal">
      <div class="modal_box">
        <div class="modal_header">
          <h3>{{ state.editMode ? '주소 수정' : '주소 추가' }}</h3>
          <button class="modal_close" @click="closeModal">✕</button>
        </div>

        <div class="field">
          <label class="label">주소</label>
          <NaverMap
            :init-lat="state.modalForm.lat"
            :init-lng="state.modalForm.lng"
            :init-address="state.modalForm.address"
            @select="onAddressSelect"
          />
        </div>

        <div class="field">
          <label class="label">상세주소</label>
          <input v-model="state.modalForm.addressDetail" type="text" class="inp" placeholder="동/호수 등" />
        </div>

        <label class="default_check">
          <input v-model="state.modalForm.defaultAd" type="checkbox" :true-value="1" :false-value="0" />
          기본 주소로 설정
        </label>

        <div class="modal_footer">
          <button class="btn_outline" @click="closeModal">취소</button>
          <button class="btn_primary" @click="saveAddress">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.address_wrap {
  max-width: 480px;
  margin: 40px auto;
  padding: 0 16px;
}
.page_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page_title { font-size: 20px; font-weight: 700; }
.btn_sm {
  padding: 8px 18px;
  font-size: 14px;
  width: auto;
  white-space: nowrap;
}

.my_address_list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.my_address_item {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 72px;
}
.addr_left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.addr_text { min-width: 0; flex: 1; }
.default_badge {
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}
.addr_main {
  font-size: 15px;
  font-weight: 600;
  color: var(--black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.addr_detail { font-size: 14px; color: var(--gray); margin-top: 4px; }
.addr_actions { display: flex; gap: 6px; flex-shrink: 0; }
.btn_xs {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  background: #fff;
  border: 1.5px solid var(--border);
  color: var(--gray-dark);
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn_xs:hover { border-color: var(--primary); color: var(--primary); }
.btn_danger { border-color: var(--primary) !important; color: var(--primary) !important; }
.btn_danger:hover { background: var(--primary) !important; color: #fff !important; }
.empty_msg { text-align: center; color: var(--gray); padding: 40px 0; }

/* 모달 */
.modal_overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal_box {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal_header { display: flex; align-items: center; justify-content: space-between; }
.modal_header h3 { font-size: 17px; font-weight: 700; }
.modal_close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--gray); }
.modal_footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
}
.modal_footer .btn_outline {
  padding: 12px 20px;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-dark);
  white-space: nowrap;
  width: auto;
  cursor: pointer;
}
.modal_footer .btn_outline:hover { border-color: var(--gray); }
.modal_footer .btn_primary { width: auto; padding: 12px 28px; }

.default_check { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
</style>