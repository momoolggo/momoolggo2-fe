<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// ── 부모에게 선택된 주소 정보 전달
const emit = defineEmits(['select'])

// ── props: 초기 좌표 (수정 시 기존 위치로 마커 세팅)
const props = defineProps({
    initLat: { type: Number, default: null },
    initLng: { type: Number, default: null },
    initAddress: { type: String, default: '' },
})

const addressQuery = ref('')
const addressResults = ref([])
const selectedAddress = ref(props.initAddress || '')
const showMap = ref(false)
const errorMsg = ref('')

let naverMap = null
let marker = null

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
const initMap = (lat = 35.8714, lng = 128.6014) => {
    naverMap = new window.naver.maps.Map('naver_map_container', {
        center: new window.naver.maps.LatLng(lat, lng),
        zoom: 14,
    })

    marker = new window.naver.maps.Marker({
        map: naverMap,
        position: new window.naver.maps.LatLng(lat, lng),
        draggable: false,
    })

    // 지도 클릭 → reverse geocoding
    window.naver.maps.Event.addListener(naverMap, 'click', async (e) => {
        const clickLat = e.coord.lat()
        const clickLng = e.coord.lng()
        marker.setPosition(e.coord)
        try {
            const res = await axios.get('/address/reverse', { params: { lat: clickLat, lng: clickLng } })
            const data = res.data.resultData
            const address = data.roadAddress || data.jibunAddress
            selectedAddress.value = address
            emitSelect(address, clickLat, clickLng)
        } catch {
            errorMsg.value = '주소를 가져오는데 실패했습니다.'
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
    if (!addressQuery.value.trim()) return
    errorMsg.value = ''
    try {
        const res = await axios.get('/address/search', { params: { query: addressQuery.value } })
        addressResults.value = res.data.resultData
        if (!addressResults.value.length) {
            errorMsg.value = '검색 결과가 없습니다. 더 자세한 주소를 입력해 주세요.'
            return
        }
        // 지도 표시 + 첫 번째 결과로 이동
        if (!showMap.value) {
            showMap.value = true
            await nextTick()
            if (!naverMap) initMap(addressResults.value[0].lat, addressResults.value[0].lng)
        }
        moveMap(addressResults.value[0].lat, addressResults.value[0].lng)
    } catch {
        errorMsg.value = '주소 검색에 실패했습니다.'
    }
}

// ── 검색 결과 클릭 → 지도 마커 이동
const focusAddress = (item) => {
    moveMap(item.lat, item.lng)
}

// ── "이 위치로 선택" 클릭
const selectAddress = (item) => {
    const address = item.roadAddress || item.jibunAddress
    selectedAddress.value = address
    addressResults.value = []
    addressQuery.value = ''
    moveMap(item.lat, item.lng)
    emitSelect(address, item.lat, item.lng)
}

// ── 부모에게 emit
const emitSelect = (address, lat, lng) => {
    emit('select', { address, lat, lng })
}

// ── nextTick import
import { nextTick } from 'vue'

onMounted(async () => {
    try {
        const res = await axios.get('/map/key')
        console.log(res.data.resultData);
        await loadNaverMapSdk(res.data.resultData)

        // 초기 좌표가 있으면 지도 바로 표시
        if (props.initLat && props.initLng) {
            showMap.value = true
            await nextTick()
            initMap(props.initLat, props.initLng)
        }
    } catch {
        console.error('네이버 지도 SDK 로드 실패')
    }
})
</script>

<template>
    <div class="naver_map_wrap">

        <!-- 주소 검색창 -->
        <div class="search_row">
            <input
                v-model="addressQuery"
                type="text"
                class="inp"
                placeholder="장소명, 도로명, 지번 주소 입력"
                @keyup.enter="searchAddress"
            />
            <button class="btn_dark" @click="searchAddress">검색</button>
        </div>

        <!-- 에러 메시지 -->
        <p v-if="errorMsg" class="error_msg">{{ errorMsg }}</p>

        <!-- 검색 결과 목록 -->
        <ul v-if="addressResults.length" class="address_list">
            <li
                v-for="(item, idx) in addressResults"
                :key="idx"
                class="address_item"
                @click="focusAddress(item)"
            >
                <div class="addr_texts">
                    <span class="addr_road">{{ item.roadAddress }}</span>
                    <span class="addr_jibun">{{ item.jibunAddress }}</span>
                </div>
                <button class="btn_select_addr" @click.stop="selectAddress(item)">
                    이 위치로 선택
                </button>
            </li>
        </ul>

        <!-- 네이버 지도 -->
        <div v-if="showMap" class="map_box">
            <div id="naver_map_container" class="map_inner"></div>
            <p class="map_hint">📌 지도를 클릭하면 해당 위치의 주소로 자동 변경돼요</p>
        </div>

        <!-- 선택된 주소 표시 -->
        <div v-if="selectedAddress" class="selected_addr">
            📍 {{ selectedAddress }}
        </div>

    </div>
</template>

<style scoped>
.naver_map_wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.search_row {
    display: flex;
    gap: 8px;
}

.search_row .inp {
    flex: 1;
}

.address_list {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.address_item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--border);
    transition: background 0.1s;
}

.address_item:last-child { border-bottom: none; }
.address_item:hover { background: #f9f9f9; }

.addr_texts {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
}

.addr_road {
    font-size: 13px;
    font-weight: 600;
    color: var(--black);
}

.addr_jibun {
    font-size: 12px;
    color: var(--gray);
}

.btn_select_addr {
    padding: 5px 12px;
    background: var(--primary);
    color: var(--white);
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
}
.btn_select_addr:hover { background: var(--primary-dark); }

.map_box {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.map_inner {
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

.selected_addr {
    font-size: 13px;
    font-weight: 600;
    color: var(--black);
    background: #f5f5f5;
    border-radius: var(--radius-sm);
    padding: 8px 12px;
}

.error_msg {
    font-size: 12px;
    color: #ef4444;
}
</style>