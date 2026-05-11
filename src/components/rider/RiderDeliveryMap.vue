<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import { useDeliveryStore } from '@/stores/deliveryStore'

/**
 * R6-FE NaverMap (라이더 배달 지도, 표시 전용).
 *
 * Figma 박제: 170125 우 (대기 상세) / 170137 (픽업완료→배달중) / 170143 (배달중) / 170148 (전달완료).
 *
 * NaverMap.vue(사장 편집용) 정착 패턴 일관 — SDK 동적 로드 (axios.get('/map/key')) + script 주입.
 * 차이점: 표시 전용 (검색/클릭 reverse geocoding X), 다중 마커 (라이더 빨강/가게 파랑/배달지 녹색),
 *        Map container ID 동적 생성 (NaverMap.vue 하드코딩 'naver_map_container' 충돌 회피, 다중 인스턴스 가능).
 *
 * 라이더 위치: deliveryStore.state.myLocation watch (useLocationTracker가 5s tick으로 갱신).
 */

const props = defineProps({
  pickupLat:   { type: Number, default: null },
  pickupLng:   { type: Number, default: null },
  deliveryLat: { type: Number, default: null },
  deliveryLng: { type: Number, default: null },
  height:      { type: String, default: '240px' },
})

const deliveryStore = useDeliveryStore()
const containerId = `rider_map_${Math.random().toString(36).slice(2, 10)}`
const ready = ref(false)
const errorMsg = ref('')

let naverMap = null
let riderMarker = null
let pickupMarker = null
let deliveryMarker = null

const loadNaverMapSdk = (clientId) => {
  return new Promise((resolve) => {
    if (window.naver && window.naver.maps) { resolve(); return }
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.onload = resolve
    document.head.appendChild(script)
  })
}

/** 지도 중심: 첫 가용한 좌표 (가게 → 배달지 → 라이더 → 대구 디폴트) */
const pickCenter = () => {
  if (props.pickupLat && props.pickupLng) return [props.pickupLat, props.pickupLng]
  if (props.deliveryLat && props.deliveryLng) return [props.deliveryLat, props.deliveryLng]
  const my = deliveryStore.state.myLocation
  if (my) return [my.lat, my.lng]
  return [35.8714, 128.6014] // 대구 디폴트
}

/** 색상 marker icon (네이버 기본 marker + 색상 구분 — content HTML 사용) */
const colorMarker = (color, label) => ({
  content: `<div style="width:20px;height:20px;border-radius:50%;background:${color};
            border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);
            display:flex;align-items:center;justify-content:center;
            font-size:10px;color:#fff;font-weight:700;">${label}</div>`,
  anchor: new window.naver.maps.Point(13, 13),
})

const initMap = () => {
  const [lat, lng] = pickCenter()
  naverMap = new window.naver.maps.Map(containerId, {
    center: new window.naver.maps.LatLng(lat, lng),
    zoom: 15,
    draggable: true,
    scrollWheel: true,
  })

  // 가게 마커 (파랑 'S')
  if (props.pickupLat && props.pickupLng) {
    pickupMarker = new window.naver.maps.Marker({
      map: naverMap,
      position: new window.naver.maps.LatLng(props.pickupLat, props.pickupLng),
      icon: colorMarker('#2563EB', 'S'),
    })
  }

  // 배달지 마커 (녹색 'D')
  if (props.deliveryLat && props.deliveryLng) {
    deliveryMarker = new window.naver.maps.Marker({
      map: naverMap,
      position: new window.naver.maps.LatLng(props.deliveryLat, props.deliveryLng),
      icon: colorMarker('#16A34A', 'D'),
    })
  }

  // 라이더 마커 (빨강 'R') — myLocation 있을 때만
  const my = deliveryStore.state.myLocation
  if (my) {
    riderMarker = new window.naver.maps.Marker({
      map: naverMap,
      position: new window.naver.maps.LatLng(my.lat, my.lng),
      icon: colorMarker('#A40C0B', 'R'),
    })
  }

  ready.value = true
}

// 라이더 위치 watch — 5s tick마다 store 갱신 시 marker 이동
const stopWatch = watch(
  () => deliveryStore.state.myLocation,
  (loc) => {
    if (!naverMap || !loc || !window.naver) return
    const pos = new window.naver.maps.LatLng(loc.lat, loc.lng)
    if (riderMarker) {
      riderMarker.setPosition(pos)
    } else {
      riderMarker = new window.naver.maps.Marker({
        map: naverMap,
        position: pos,
        icon: colorMarker('#A40C0B', 'R'),
      })
    }
  },
  { deep: true },
)

onMounted(async () => {
  try {
    const res = await axios.get('/map/key')
    await loadNaverMapSdk(res.data.resultData)
    await nextTick()
    initMap()
  } catch (err) {
    errorMsg.value = '지도 로드에 실패했습니다.'
    console.error('[RiderDeliveryMap]', err)
  }
})

onUnmounted(() => {
  stopWatch()
  if (riderMarker) riderMarker.setMap(null)
  if (pickupMarker) pickupMarker.setMap(null)
  if (deliveryMarker) deliveryMarker.setMap(null)
  naverMap = null
})
</script>

<template>
  <div class="rider_map_wrap">
    <div :id="containerId" class="map_inner" :style="{ height }"></div>
    <p v-if="errorMsg" class="error_msg">{{ errorMsg }}</p>
    <div v-else class="legend">
      <span class="legend_item"><span class="dot" style="background:#A40C0B"></span>라이더</span>
      <span v-if="pickupLat" class="legend_item"><span class="dot" style="background:#2563EB"></span>가게</span>
      <span v-if="deliveryLat" class="legend_item"><span class="dot" style="background:#16A34A"></span>배달지</span>
    </div>
  </div>
</template>

<style scoped>
.rider_map_wrap { display: flex; flex-direction: column; gap: 6px; }
.map_inner {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  overflow: hidden;
}
.legend { display: flex; gap: 14px; padding: 0 4px; font-size: 11px; color: var(--gray-dark); }
.legend_item { display: inline-flex; align-items: center; gap: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.error_msg { font-size: 12px; color: #ef4444; text-align: center; padding: 8px; }
</style>
