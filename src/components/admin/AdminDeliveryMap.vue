<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'

/**
 * Group 10 (2026-05-17): Admin 배달 관제 다중 라이더 마커 지도.
 *
 * RiderDeliveryMap.vue 패턴 일관 — SDK 동적 로드 (axios.get('/map/key')) + script 주입 + 표시 전용.
 * 차이점: 라이더 본인용 myLocation watch X / props.riderLocations 다중 array.
 * 5초 폴링은 AdminDeliveryView가 담당, 본 컴포넌트는 watch 받아 marker 재배치.
 */

let _sdkPromise = null
const loadNaverMapSdk = (clientId) => {
  if (!_sdkPromise) {
    _sdkPromise = new Promise((resolve) => {
      if (window.naver?.maps) { resolve(); return }
      const script = document.createElement('script')
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
      script.onload = resolve
      document.head.appendChild(script)
    })
  }
  return _sdkPromise
}

const props = defineProps({
  riderLocations: { type: Array, default: () => [] },
  height: { type: String, default: '320px' },
})

const containerId = `admin_map_${Math.random().toString(36).slice(2, 10)}`
const errorMsg = ref('')

let naverMap = null
const markers = new Map()

const colorMarker = (color, label) => ({
  content: `<div style="width:22px;height:22px;border-radius:50%;background:${color};
            border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);
            display:flex;align-items:center;justify-content:center;
            font-size:11px;color:#fff;font-weight:700;">${label}</div>`,
  anchor: new window.naver.maps.Point(11, 11),
})

const pickCenter = () => {
  if (props.riderLocations.length > 0) {
    const first = props.riderLocations[0]
    return [first.lat, first.lng]
  }
  return [35.8714, 128.6014]
}

const initMap = () => {
  const [lat, lng] = pickCenter()
  naverMap = new window.naver.maps.Map(containerId, {
    center: new window.naver.maps.LatLng(lat, lng),
    zoom: 13,
    draggable: true,
    scrollWheel: true,
  })
  syncMarkers()
}

const syncMarkers = () => {
  if (!naverMap || !window.naver) return
  const seen = new Set()
  for (const loc of props.riderLocations) {
    seen.add(loc.riderNo)
    const pos = new window.naver.maps.LatLng(loc.lat, loc.lng)
    if (markers.has(loc.riderNo)) {
      markers.get(loc.riderNo).setPosition(pos)
    } else {
      const marker = new window.naver.maps.Marker({
        map: naverMap,
        position: pos,
        icon: colorMarker('#A40C0B', String(loc.riderNo)),
      })
      markers.set(loc.riderNo, marker)
    }
  }
  for (const [riderNo, marker] of markers) {
    if (!seen.has(riderNo)) {
      marker.setMap(null)
      markers.delete(riderNo)
    }
  }
}

const stopWatch = watch(() => props.riderLocations, syncMarkers, { deep: true })

onMounted(async () => {
  try {
    const res = await axios.get('/api/map/key')
    await loadNaverMapSdk(res.data.resultData)
    await nextTick()
    initMap()
  } catch (err) {
    errorMsg.value = '지도 로드에 실패했습니다.'
    console.error('[AdminDeliveryMap]', err)
  }
})

onUnmounted(() => {
  stopWatch()
  for (const marker of markers.values()) marker.setMap(null)
  markers.clear()
  naverMap = null
})
</script>

<template>
  <div class="admin_map_wrap">
    <div :id="containerId" class="map_inner" :style="{ height }"></div>
    <p v-if="errorMsg" class="error_msg">{{ errorMsg }}</p>
    <div v-else class="legend">
      <span class="legend_item">
        <span class="dot" style="background:#A40C0B"></span>
        라이더 ({{ riderLocations.length }}명, TTL 30s)
      </span>
    </div>
  </div>
</template>

<style scoped>
.admin_map_wrap { display: flex; flex-direction: column; gap: 6px; }
.map_inner {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  overflow: hidden;
}
.legend { display: flex; gap: 14px; padding: 0 4px; font-size: 12px; color: #666; }
.legend_item { display: inline-flex; align-items: center; gap: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.error_msg { font-size: 12px; color: #ef4444; text-align: center; padding: 8px; }
</style>
