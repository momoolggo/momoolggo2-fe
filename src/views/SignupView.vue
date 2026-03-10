<script setup>
import { reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const state = reactive({
  form: {
    name: '',
    userId: '',
    userPw: '',
    userPwConfirm: '',
    address: '',
    addressDetail: '',
    lat: null,
    lng: null,
    gender: null,
    birth: '',
    tel: '',
    role: 'CUSTOMER',
  },
  showPw: false,
  showPwConfirm: false,
  idMsg: '',
  idAvailable: false,
  addressQuery: '',
  addressResults: [],
  showMap: false,
  errorMsg: '',
})

const roles = [
  { label: '고객',   value: 'CUSTOMER' },
  { label: '업주',   value: 'OWNER'    },
  { label: '라이더', value: 'RIDER'    },
]

let naverMap = null
let marker   = null

// ── 네이버 지도 SDK 동적 로드
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
  naverMap = new window.naver.maps.Map('map_container', {
    center: new window.naver.maps.LatLng(35.8714, 128.6014),
    zoom: 14,
  })

  // 마커 생성 (드래그 가능)
  marker = new window.naver.maps.Marker({
  map: naverMap,
  draggable: false,
})

  // 마커 드래그 끝나면 Reverse Geocoding 호출
  window.naver.maps.Event.addListener(naverMap, 'click', async (e) => {
  const lat = e.coord.lat()
  const lng = e.coord.lng()
  marker.setPosition(e.coord)
  try {
    const res = await axios.get('/api/address/reverse', { params: { lat, lng } })
    const data = res.data.resultData
    state.form.address = data.roadAddress || data.jibunAddress
    state.form.lat = lat
    state.form.lng = lng
    state.addressResults = []
  } catch {
    alert('주소를 가져오는데 실패했습니다.')
  }
})
}

// ── 지도 이동 + 마커 이동
const moveMap = (lat, lng) => {
  const pos = new window.naver.maps.LatLng(lat, lng)
  naverMap.setCenter(pos)
  marker.setPosition(pos)
}

// ── 아이디 중복확인
const checkId = async () => {
  if (!state.form.userId) {
    state.idMsg = '아이디를 입력해 주세요.'
    state.idAvailable = false
    return
  }
  try {
    await axios.get('/api/user/check-id', { params: { userId: state.form.userId } })
    state.idAvailable = true
    state.idMsg = '사용 가능한 아이디입니다.'
  } catch {
    state.idAvailable = false
    state.idMsg = '이미 사용 중인 아이디입니다.'
  }
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
    // 지도 표시 + 첫 번째 결과로 이동
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
  state.form.address = item.roadAddress || item.jibunAddress
  state.form.lat = item.lat
  state.form.lng = item.lng
  state.addressResults = []
  state.addressQuery = ''
}

// ── 회원가입
const signup = async () => {
  if (!state.form.name)        { state.errorMsg = '이름을 입력해 주세요.';         return }
  if (!state.form.userId)      { state.errorMsg = '아이디를 입력해 주세요.';       return }
  if (!state.idAvailable)      { state.errorMsg = '아이디 중복확인을 해 주세요.';  return }
  if (!state.form.userPw)      { state.errorMsg = '비밀번호를 입력해 주세요.';     return }
  if (state.form.userPw !== state.form.userPwConfirm) {
    state.errorMsg = '비밀번호가 일치하지 않습니다.'; return
  }
  if (!state.form.address)     { state.errorMsg = '주소를 입력해 주세요.';         return }
  if (!state.form.tel)         { state.errorMsg = '연락처를 입력해 주세요.';       return }

  try {
    state.errorMsg = ''
    await axios.post('/api/user/join', {
      name:          state.form.name,
      userId:        state.form.userId,
      userPw:        state.form.userPw,
      gender:        state.form.gender,
      birth:         state.form.birth         || null,
      tel:           state.form.tel,
      address:       state.form.address,
      addressDetail: state.form.addressDetail || null,
      lat:           state.form.lat,
      lng:           state.form.lng,
      role:          state.form.role,
    })
    alert('회원가입이 완료되었습니다!')
    router.push('/signin')
  } catch (err) {
    state.errorMsg = err.response?.data?.resultMessage ?? '회원가입에 실패했습니다.'
  }
}

// ── 컴포넌트 마운트 시 SDK 로드
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
  <div class="signup_page">
    <div class="signup_card">

      <div class="logo_wrap">
        <img src="@/assets/뭐물꼬_로고.png" alt="뭐물꼬" class="logo_img signup_logo" />
      </div>
      <h2 class="signup_title">회원가입</h2>

      <!-- 역할 선택 -->
      <div class="field">
        <label class="label">가입 유형 <span class="required">*</span></label>
        <div class="role_radio_group">
          <label
            v-for="role in roles"
            :key="role.value"
            :class="['role_radio_item', { active: state.form.role === role.value }]"
          >
            <input v-model="state.form.role" type="radio" :value="role.value" class="role_radio_input" />
            {{ role.label }}
          </label>
        </div>
        <p v-if="state.form.role !== 'CUSTOMER'" class="role_notice">
          ℹ️ {{ state.form.role === 'OWNER' ? '업주' : '라이더' }} 가입 신청 후 관리자 승인이 필요합니다.
        </p>
      </div>

      <!-- 이름 -->
      <div class="field">
        <label class="label">이름 <span class="required">*</span></label>
        <input v-model="state.form.name" type="text" class="inp" placeholder="이름을 입력하세요" />
      </div>

      <!-- 아이디 -->
      <div class="field">
        <label class="label">아이디 <span class="required">*</span></label>
        <div class="inp_row">
          <input v-model="state.form.userId" type="text" class="inp" placeholder="아이디를 입력하세요" />
          <button class="btn_dark" @click="checkId">중복확인</button>
        </div>
        <p v-if="state.idMsg" :class="['field_msg', state.idAvailable ? 'ok' : 'err']">{{ state.idMsg }}</p>
      </div>

      <!-- 비밀번호 -->
      <div class="field">
        <label class="label">비밀번호 <span class="required">*</span></label>
        <div class="input_wrap">
          <input v-model="state.form.userPw" :type="state.showPw ? 'text' : 'password'" class="inp" placeholder="비밀번호를 입력하세요" />
          <button class="pw_toggle" @click="state.showPw = !state.showPw">{{ state.showPw ? '🙈' : '👁️' }}</button>
        </div>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="field">
        <label class="label">비밀번호 확인 <span class="required">*</span></label>
        <div class="input_wrap">
          <input v-model="state.form.userPwConfirm" :type="state.showPwConfirm ? 'text' : 'password'" class="inp" placeholder="비밀번호를 한번 더 입력하세요" />
          <button class="pw_toggle" @click="state.showPwConfirm = !state.showPwConfirm">{{ state.showPwConfirm ? '🙈' : '👁️' }}</button>
        </div>
      </div>

      <!-- 주소 (필수) -->
      <div class="field">
        <label class="label">주소 <span class="required">*</span></label>
        <div class="inp_row">
          <input
            v-model="state.addressQuery"
            type="text"
            class="inp"
            placeholder="장소명, 도로명, 지번 주소 입력"
            @keyup.enter="searchAddress"
          />
          <button class="btn_dark" @click="searchAddress">검색</button>
        </div>

        <!-- 검색 결과 목록 -->
        <ul v-if="state.addressResults.length" class="address_list">
          <li
            v-for="(item, idx) in state.addressResults"
            :key="idx"
            class="address_item"
            @click="focusAddress(item)"
          >
            <span class="addr_road">{{ item.roadAddress }}</span>
            <span class="addr_jibun">{{ item.jibunAddress }}</span>
            <button class="btn_select_addr" @click.stop="selectAddress(item)">이 위치로 선택</button>
          </li>
        </ul>

        <!-- 네이버 지도 -->
        <div v-if="state.showMap" class="map_wrap">
          <div id="map_container" class="map_box"></div>
          <p class="map_hint">📌 마커를 드래그하면 주소가 자동으로 바뀌어요</p>
        </div>

        <!-- 선택된 주소 -->
        <div v-if="state.form.address" class="selected_addr">📍 {{ state.form.address }}</div>
        <input
          v-if="state.form.address"
          v-model="state.form.addressDetail"
          type="text"
          class="inp"
          placeholder="상세주소 입력 (동/호수 등)"
        />
      </div>

      <!-- 연락처 (필수) -->
      <div class="field">
        <label class="label">연락처 <span class="required">*</span></label>
        <input v-model="state.form.tel" type="tel" class="inp" placeholder="010-0000-0000" />
      </div>

      <!-- 성별 (선택) -->
      <div class="field">
        <label class="label">성별 <span class="optional">(선택)</span></label>
        <div class="radio_group">
          <label class="radio_label"><input v-model="state.form.gender" type="radio" :value="1" /> 남</label>
          <label class="radio_label"><input v-model="state.form.gender" type="radio" :value="2" /> 여</label>
        </div>
      </div>

      <!-- 생년월일 (선택) -->
      <div class="field">
        <label class="label">생년월일 <span class="optional">(선택)</span></label>
        <input v-model="state.form.birth" type="date" class="inp" />
      </div>

      <p v-if="state.errorMsg" class="error_msg">{{ state.errorMsg }}</p>

      <button class="btn_primary" @click="signup">가입하기</button>

      <div class="auth_link">
        이미 계정이 있으신가요?
        <router-link to="/signin">로그인</router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
.signup_page {
  min-height: 100vh;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}
.signup_card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  width: 520px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.logo_wrap { text-align: center; }
.signup_logo { height: 56px; }
.signup_title { text-align: center; font-size: 20px; font-weight: 700; color: var(--black); }

/* 역할 라디오 */
.role_radio_group { display: flex; gap: 10px; }
.role_radio_item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: #F5F5F5;
  color: var(--gray);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.role_radio_item.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--white);
}
.role_radio_input { display: none; }
.role_notice {
  font-size: 12px;
  color: #F59E0B;
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  border-radius: var(--radius-sm);
  padding: 8px 12px;
}

/* 지도 */
.map_wrap { display: flex; flex-direction: column; gap: 4px; }
.map_box {
  width: 100%;
  height: 280px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  overflow: hidden;
}
.map_hint {
  font-size: 12px;
  color: var(--gray);
  text-align: center;
}

/* 이 위치로 선택 버튼 */
.btn_select_addr {
  margin-top: 4px;
  padding: 4px 10px;
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}
.btn_select_addr:hover { background: var(--primary-dark); }

.radio_group { display: flex; gap: 20px; }
.radio_label { font-size: 14px; color: var(--gray-dark); cursor: pointer; display: flex; align-items: center; gap: 4px; }
</style>