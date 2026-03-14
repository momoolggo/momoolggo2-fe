<script setup>
import { reactive, ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/stores/useStore';
import axios from 'axios';

const router = useRouter();
const store = useStore();

const fileInput = ref(null);
const previewImage = ref(null);

const state = reactive({ //가게정보 
  form: {
    storeName: '',
    location: '',
    addressDetail: '',
    lat: null,
    lng: null,
    storeTel: '',
    businessName: '',
    businessNumber: '',
    storeInfo: '',
    storePic: null
  },
  addressQuery: '',
  addressResults: [],
  showMap: false,
});

let naverMap = null
let marker   = null

// ── 네이버 지도 SDK 동적 로드 (SignupView와 동일)
const loadNaverMapSdk = (clientId) => {
  return new Promise((resolve) => {
    if (window.naver && window.naver.maps) { resolve(); return }
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.onload = resolve
    document.head.appendChild(script)
  })
}

// ── 지도 초기화
const initMap = () => {
  naverMap = new window.naver.maps.Map('store_map_container', {
    center: new window.naver.maps.LatLng(35.8714, 128.6014),
    zoom: 14,
  })

  marker = new window.naver.maps.Marker({
    map: naverMap,
    draggable: false,
  })

  // 지도 클릭 시 Reverse Geocoding
  window.naver.maps.Event.addListener(naverMap, 'click', async (e) => {
    const lat = e.coord.lat()
    const lng = e.coord.lng()
    marker.setPosition(e.coord)
    try {
      const res = await axios.get('/api/address/reverse', { params: { lat, lng } })
      const data = res.data.resultData
      state.form.location = data.roadAddress || data.jibunAddress
      state.form.lat = lat
      state.form.lng = lng
      state.addressResults = []
    } catch {
      alert('주소를 가져오는데 실패했습니다.')
    }
  })
}

// ── 지도 마커 이동
const moveMap = (lat, lng) => {
  const pos = new window.naver.maps.LatLng(lat, lng)
  naverMap.setCenter(pos)
  marker.setPosition(pos)
}

// ── 주소 검색
const searchAddress = async () => {
  if (!state.addressQuery) return
  try {
    const res = await axios.get('/api/address/search', { params: { query: state.addressQuery } })
    state.addressResults = res.data.resultData
    if (!state.addressResults.length) {
      alert('검색 결과가 없습니다. 더 자세한 주소를 입력해 주세요.')
      return
    }
    state.showMap = true
    await nextTick()
    if (!naverMap) initMap()
    await nextTick()
    moveMap(state.addressResults[0].lat, state.addressResults[0].lng)
  } catch {
    alert('주소 검색에 실패했습니다.')
  }
}

// ── 검색 결과 클릭 → 지도 마커 이동
const focusAddress = async (item) => {
  if (!state.showMap) {
    state.showMap = true
    await nextTick()
    if (!naverMap) initMap()
    await nextTick()
  }
  moveMap(item.lat, item.lng)
}

// ── "이 위치로 선택" 클릭
const selectAddress = (item) => {
  state.form.location = item.roadAddress || item.jibunAddress
  state.form.lat = item.lat
  state.form.lng = item.lng
  state.addressResults = []
  state.addressQuery = ''
}

const handleCancel = () => router.back();


const triggerFileUpload = () => fileInput.value.click();

const onFileChange = (e) => { //사진파일 선택하면 화면에 미리 보여줌
  const file = e.target.files[0]; //내가 선택한 사진파일하나 가져옴
  if (file) { //사진이 잘 선택되었다면,
    state.form.storePic = file; //그 사진을 state(보관함)에 잘 보관하고
    previewImage.value = URL.createObjectURL(file); //브라우저에만 쓸수있는 임시 주소를 만들어서 화면에 띄움(사진선택시 보이는 실선 화면)
  }
};


const submit = async () => { //추가 버튼 누르면 정보를 서버로 보냄. 사진글자 묶어서 formdata보냄
  if (!state.form.storeName) { //가게 이름 비었나 확인
    alert("가게 상호명을 입력해주세요."); 
    return; //이름없으면 멈춤.
  }
  try { //브라우저로 보낼 시도
    const formData = new FormData();
    formData.append('userId', 3); //뒷번호는 userId임. ⭐이건 나중에 진짜로그이한 번호가 자동으로 들어가게 고쳐야함.
    formData.append('storeName', state.form.storeName);
    formData.append('businessNumber', state.form.businessNumber);
    formData.append('businessName', state.form.businessName);
    formData.append('location', state.form.location + ' ' + state.form.addressDetail);
    formData.append('storeTel', state.form.storeTel);
    formData.append('storeInfo', state.form.storeInfo);
    
    if (state.form.storePic) { //만약에 사진도 골랐으면 보관함에 넣음
      formData.append('storePic', state.form.storePic);
    }

    await axios.post('/api/owner/store', formData, { //서버 주소로 보관함을 보냄.
      withCredentials: true 
    });

    store.setStore(state.form.storeName); // 등록 성공 가게이름을 앱에 기억시킴.

    alert("가게 등록이 완료되었습니다.");
    router.push('/owner/order'); //이제 주문 관리 화면으로 감.
  } catch (err) { // 보관함을 보내다가 오류가 나면
    console.error(err);
    alert("가게 등록에 실패했습니다."); //알림
  }
};

// ── 마운트 시 네이버 SDK 로드
onMounted(async () => {
  try {
    const res = await axios.get('/api/map/key')
    await loadNaverMapSdk(res.data.resultData)
  } catch {
    console.error('네이버 지도 SDK 로드 실패')
  }
})
</script>

<template>
  <div class="container">
    <main class="main-content">
      <div class="content-header">
        <h1>가게 등록 / 추가 하기</h1>
      </div>

      <div class="form-wrapper">
        <div class="left-form">
          <div class="form-group">
            <label>가게 상호명</label>
            <div class="input-wrapper">
              <input v-model="state.form.storeName" type="text" placeholder="가게 이름을 입력하세요" maxlength="24" />
              <span class="char-count">{{ state.form.storeName.length }}/24</span>
            </div>
          </div>

          <!-- ── 주소 검색 (네이버 지도 연동) -->
          <div class="form-group">
            <label>가게 주소</label>
            <div class="address-search-row">
              <input
                v-model="state.addressQuery"
                type="text"
                placeholder="장소명, 도로명, 지번 주소 입력"
                @keyup.enter="searchAddress"
              />
              <button class="search-btn" type="button" @click="searchAddress">검색</button>
            </div>

            <!-- 검색 결과 목록 -->
            <ul v-if="state.addressResults.length" class="address-list">
              <li
                v-for="(item, idx) in state.addressResults"
                :key="idx"
                class="address-item"
                @click="focusAddress(item)"
              >
                <span class="addr-road">{{ item.roadAddress }}</span>
                <span class="addr-jibun">{{ item.jibunAddress }}</span>
                <button class="btn-select-addr" @click.stop="selectAddress(item)">이 위치로 선택</button>
              </li>
            </ul>

            <!-- 네이버 지도 -->
            <div v-if="state.showMap" class="map-wrap">
              <div id="store_map_container" class="map-box"></div>
              <p class="map-hint">📌 지도를 클릭하면 주소가 자동으로 바뀌어요</p>
            </div>

            <!-- 선택된 주소 -->
            <div v-if="state.form.location" class="selected-addr">📍 {{ state.form.location }}</div>
            <input
              v-if="state.form.location"
              v-model="state.form.addressDetail"
              type="text"
              placeholder="상세주소 입력 (동/호수 등)"
              class="full-input"
            />
          </div>

          <div class="form-group">
            <label>가게 전화번호</label>
            <input v-model="state.form.storeTel" type="text" class="full-input" placeholder="010 - 0000 - 0000" />
          </div>

          <div class="form-group">
            <label>사업자 명</label>
            <input v-model="state.form.businessName" type="text" class="full-input" placeholder="이름을 입력하세요" />
          </div>

          <div class="form-group">
            <label>사업자 번호</label>
            <input v-model="state.form.businessNumber" type="text" class="full-input" placeholder="사업자 번호를 입력하세요" />
          </div>
        </div>

        <div class="right-form">
          <div class="form-group">
            <label>가게 대표 사진</label>
            <div class="image-upload-box" @click="triggerFileUpload" style="cursor: pointer; overflow: hidden;">
              <img v-if="previewImage" :src="previewImage" style="width: 100%; height: 100%; object-fit: cover;" />
              <div v-else class="upload-placeholder">
                <span class="plus-icon">+</span>
                <p>여기를 눌러 사진을 추가 하세요</p>
              </div>
            </div>
            <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" style="display: none;" />
          </div>

          <div class="form-group">
            <label>가게 소개글</label>
            <div class="textarea-wrapper">
              <textarea v-model="state.form.storeInfo" maxlength="100" placeholder="가게 소개를 입력하세요"></textarea>
              <span class="char-count">{{ state.form.storeInfo.length }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-cancel" type="button" @click="cancel">취소</button>
        <button class="btn-submit" type="button" @click="submit">추가</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container { display: flex; justify-content: center; align-items: center; background-color: #f9f9f9; min-height: 100vh; padding: 40px; }
.main-content { width: 100%; max-width: 1000px; background: #fff; padding: 50px; border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.content-header { border-bottom: 1px solid #eee; margin-bottom: 40px; padding-bottom: 15px; }
.content-header h1 { font-size: 24px; color: #333; text-align: center; }
.form-wrapper { display: flex; gap: 60px; }
.left-form, .right-form { flex: 1; display: flex; flex-direction: column; gap: 25px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 16px; font-weight: bold; color: #555; margin-bottom: 10px; }
.input-wrapper, .textarea-wrapper { position: relative; }
input, textarea { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12px; font-size: 15px; background-color: #fcfcfc; box-sizing: border-box; }
.char-count { position: absolute; right: 10px; bottom: -20px; font-size: 12px; color: #bbb; }

/* 주소 검색 */
.address-search-row { display: flex; gap: 10px; margin-bottom: 8px; }
.address-search-row input { flex: 1; }
.search-btn { white-space: nowrap; padding: 0 16px; border: 1px solid #ccc; border-radius: 20px; background: #fff; color: #555; font-size: 13px; cursor: pointer; font-weight: 600; }
.search-btn:hover { background: #f0f0f0; }

/* 검색 결과 */
.address-list { list-style: none; padding: 0; margin: 0 0 8px; border: 1.5px solid #eee; border-radius: 12px; overflow: hidden; }
.address-item { padding: 12px 14px; cursor: pointer; border-bottom: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 2px; }
.address-item:last-child { border-bottom: none; }
.address-item:hover { background: #f8f8f8; }
.addr-road { font-size: 14px; font-weight: 600; color: #333; }
.addr-jibun { font-size: 12px; color: #999; }
.btn-select-addr { margin-top: 6px; padding: 4px 12px; background: #4A5FF2; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; align-self: flex-start; }
.btn-select-addr:hover { background: #3a4fd8; }

/* 지도 */
.map-wrap { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.map-box { width: 100%; height: 240px; border-radius: 12px; border: 1.5px solid #ddd; overflow: hidden; }
.map-hint { font-size: 12px; color: #aaa; text-align: center; }

/* 선택된 주소 */
.selected-addr { font-size: 14px; color: #4A5FF2; font-weight: 600; padding: 8px 12px; background: #f0f2ff; border-radius: 8px; margin-bottom: 8px; }
.full-input { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12px; box-sizing: border-box; }

.image-upload-box { width: 100%; height: 200px; border: 2px dashed #ccc; border-radius: 15px; display: flex; align-items: center; justify-content: center; background-color: #fff; }
.upload-placeholder { text-align: center; color: #bbb; }
.plus-icon { font-size: 40px; display: block; margin-bottom: 10px; }
textarea { height: 120px; resize: none; }
.action-buttons { display: flex; justify-content: center; gap: 15px; margin-top: 50px; }
.btn-cancel { background: #e0e0e0; border: none; padding: 12px 40px; border-radius: 12px; cursor: pointer; font-weight: bold; }
.btn-submit { background: #4A5FF2; color: #fff; border: none; padding: 12px 60px; border-radius: 12px; cursor: pointer; font-weight: bold; }
</style>