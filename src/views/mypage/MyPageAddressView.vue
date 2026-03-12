<script setup>
import { reactive, onMounted, nextTick } from 'vue'
import axios from 'axios'

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
  addressQuery: '',
  addressResults: [],
  showMap: false,
})

let naverMap = null
let marker   = null

// ── 주소 목록 불러오기
const loadList = async () => {
  try {
    const res = await axios.get('/api/user/address')
    state.list = res.data.resultData ?? []
  } catch {
    state.list = []
  }
}

onMounted(async () => {
  await loadList()
  try {
    const res = await axios.get('/api/map/key')
    await loadNaverMapSdk(res.data.resultData)
  } catch { console.error('지도 SDK 로드 실패') }
})

const loadNaverMapSdk = (clientId) => {
  return new Promise((resolve) => {
    if (window.naver && window.naver.maps) { resolve(); return }
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.onload = resolve
    document.head.appendChild(script)
  })
}

const initMap = () => {
  naverMap = new window.naver.maps.Map('modal_map', {
    center: new window.naver.maps.LatLng(35.8714, 128.6014),
    zoom: 14,
  })
  marker = new window.naver.maps.Marker({ map: naverMap, draggable: false })
  window.naver.maps.Event.addListener(naverMap, 'click', async (e) => {
    const lat = e.coord.lat()
    const lng = e.coord.lng()
    marker.setPosition(e.coord)
    try {
      const res = await axios.get('/api/address/reverse', { params: { lat, lng } })
      const d = res.data.resultData
      state.modalForm.address = d.roadAddress || d.jibunAddress
      state.modalForm.lat = lat
      state.modalForm.lng = lng
      state.addressResults = []
    } catch { alert('주소를 가져오는데 실패했습니다.') }
  })
}

const searchAddress = async () => {
  if (!state.addressQuery) return
  try {
    const res = await axios.get('/api/address/search', { params: { query: state.addressQuery } })
    state.addressResults = res.data.resultData
    if (!state.addressResults.length) { alert('검색 결과가 없습니다.'); return }
    state.showMap = true
    await nextTick()
    if (!naverMap) initMap()
    await nextTick()
    moveMap(state.addressResults[0].lat, state.addressResults[0].lng)
  } catch { alert('검색 실패') }
}

const moveMap = (lat, lng) => {
  const pos = new window.naver.maps.LatLng(lat, lng)
  naverMap.setCenter(pos)
  marker.setPosition(pos)
}

const focusAddress = async (item) => {
  if (!state.showMap) {
    state.showMap = true
    await nextTick()
    if (!naverMap) initMap()
    await nextTick()
  }
  moveMap(item.lat, item.lng)
}

const selectAddress = (item) => {
  state.modalForm.address = item.roadAddress || item.jibunAddress
  state.modalForm.lat = item.lat
  state.modalForm.lng = item.lng
  state.addressResults = []
  state.addressQuery = ''
}

// ── 추가 모달 열기
const openAdd = () => {
  state.modalForm = { addressId: null, address: '', addressDetail: '', lat: null, lng: null, defaultAd: 0 }
  state.addressQuery = ''
  state.addressResults = []
  state.showMap = false
  naverMap = null
  marker = null
  state.showModal = true
  state.editMode = false
}

// ── 수정 모달 열기
const openEdit = (item) => {
  state.modalForm = { ...item }
  state.addressQuery = ''
  state.addressResults = []
  state.showMap = false
  naverMap = null
  marker = null
  state.showModal = true
  state.editMode = true
}

const closeModal = () => {
  state.showModal = false
  state.showMap = false
  naverMap = null
  marker = null
}

// ── 저장 (추가 or 수정)
const saveAddress = async () => {
  if (!state.modalForm.address) { alert('주소를 입력해 주세요.'); return }
  try {
    if (state.editMode) {
      await axios.put(`/api/user/address/${state.modalForm.addressId}`, state.modalForm)
    } else {
      await axios.post('/api/user/address', state.modalForm)
    }
    closeModal()
    await loadList()
  } catch { alert('저장 실패') }
}

// ── 삭제
const deleteAddress = async (addressId) => {
  if (!confirm('삭제하시겠습니까?')) return
  try {
    await axios.delete(`/api/user/address/${addressId}`)
    await loadList()
  } catch { alert('삭제 실패') }
}

// ── 기본 배송지 변경
const setDefault = async (addressId) => {
  try {
    await axios.put(`/api/user/address/${addressId}/default`)
    await loadList()
  } catch { alert('변경 실패') }
}
</script>

<template>
  <div class="address_wrap">
    <div class="page_header">
      <h2 class="page_title">배송지 관리</h2>
      <button class="btn_primary btn_sm" @click="openAdd">+ 추가</button>
    </div>

    <!-- 주소 목록 -->
    <div class="address_list">
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
      <p v-if="!state.list.length" class="empty_msg">등록된 배송지가 없습니다.</p>
    </div>

    <!-- 모달 -->
    <div v-if="state.showModal" class="modal_overlay" @click.self="closeModal">
      <div class="modal_box">
        <div class="modal_header">
          <h3>{{ state.editMode ? '배송지 수정' : '배송지 추가' }}</h3>
          <button class="modal_close" @click="closeModal">✕</button>
        </div>

        <!-- 주소 검색 -->
        <div class="field">
          <label class="label">주소 검색</label>
          <div class="inp_row">
            <input
              v-model="state.addressQuery"
              type="text"
              class="inp"
              placeholder="장소명, 도로명 주소 입력"
              @keyup.enter="searchAddress"
            />
            <button class="btn_dark" @click="searchAddress">검색</button>
          </div>

          <!-- 검색 결과 -->
          <ul v-if="state.addressResults.length" class="address_results">
            <li
              v-for="(item, idx) in state.addressResults"
              :key="idx"
              class="result_item"
              @click="focusAddress(item)"
            >
              <span class="addr_road">{{ item.roadAddress }}</span>
              <span class="addr_jibun">{{ item.jibunAddress }}</span>
              <button class="btn_select_addr" @click.stop="selectAddress(item)">선택</button>
            </li>
          </ul>

          <!-- 지도 -->
          <div v-if="state.showMap" class="map_wrap">
            <div id="modal_map" class="map_box"></div>
            <p class="map_hint">📌 지도를 클릭하면 위치를 변경할 수 있어요</p>
          </div>

          <!-- 선택된 주소 -->
          <div v-if="state.modalForm.address" class="selected_addr">📍 {{ state.modalForm.address }}</div>
        </div>

        <!-- 상세주소 -->
        <div class="field">
          <label class="label">상세주소</label>
          <input v-model="state.modalForm.addressDetail" type="text" class="inp" placeholder="동/호수 등" />
        </div>

        <!-- 기본 배송지 체크 -->
        <label class="default_check">
          <input v-model="state.modalForm.defaultAd" type="checkbox" :true-value="1" :false-value="0" />
          기본 배송지로 설정
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
.address_wrap { max-width: 860px; margin: 40px auto; padding: 0 16px; }
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

.address_list { 
  display: flex; 
  flex-direction: column; 
  gap: 14px;
  max-height: none;
  overflow: visible;
}

.address_item {
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
.addr_left { display: flex; align-items: center; gap: 12px; }
.default_badge {
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
}
.addr_main { font-size: 15px; font-weight: 600; color: var(--black); }
.addr_detail { font-size: 14px; color: var(--gray); margin-top: 4px; }
.addr_actions { display: flex; gap: 6px; }
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
.modal_footer .btn_outline:hover {
  border-color: var(--gray);
}
.modal_footer .btn_primary {
  width: auto;
  padding: 12px 28px;
}

.map_wrap { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.map_box { width: 100%; height: 220px; border-radius: var(--radius-md); border: 1.5px solid var(--border); overflow: hidden; }
.map_hint { font-size: 12px; color: var(--gray); text-align: center; }
.selected_addr { font-size: 13px; color: var(--primary); font-weight: 600; padding: 8px 0; }

.address_results { list-style: none; padding: 0; margin: 4px 0 0; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
.result_item { padding: 10px 12px; cursor: pointer; display: flex; flex-direction: column; gap: 2px; border-bottom: 1px solid var(--border); }
.result_item:last-child { border-bottom: none; }
.result_item:hover { background: #f9f9f9; }
.addr_road { font-size: 13px; font-weight: 600; }
.addr_jibun { font-size: 12px; color: var(--gray); }
.btn_select_addr { margin-top: 4px; padding: 4px 10px; background: var(--primary); color: #fff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; align-self: flex-start; }

.default_check { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
</style>