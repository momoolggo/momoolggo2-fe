import { ref, onUnmounted } from 'vue'
import locationService from '@/services/locationService'
import { useDeliveryStore } from '@/stores/deliveryStore'

/**
 * 라이더 위치 자동 송신 — ADR-005 D6-b 5s 고정 (decision-#38 (가) 학원 발표용).
 *
 * navigator.geolocation.watchPosition으로 최신 위치 실시간 추적 + setInterval 5s tick으로 BE PUT.
 * 라이더가 RiderHomeView 진입 시 start(), 떠날 때 stop().
 *
 * D1 throw 패턴 일관 — BE Redis 다운 시 5xx 그대로 (silent fail로 흐림 회피).
 * 다만 FE 측은 console.warn만 + 재시도 (다음 tick에서 자연 재시도).
 */
export function useLocationTracker() {
  const lastPosition = ref(null)   // { lat, lng, accuracy, ts }
  const lastError = ref(null)
  const tracking = ref(false)
  const TICK_MS = 5000             // 학원 발표 5s 고정
  const deliveryStore = useDeliveryStore()

  let watchId = null
  let intervalId = null

  const start = () => {
    if (tracking.value) return
    if (!('geolocation' in navigator)) {
      lastError.value = 'geolocation 미지원 브라우저'
      return
    }

    // 1) watchPosition: 위치 변경 시 lastPosition + deliveryStore 갱신 (RiderDeliveryMap watch source)
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ts: Date.now(),
        }
        lastPosition.value = loc
        deliveryStore.setMyLocation({ lat: loc.lat, lng: loc.lng, ts: loc.ts })
        lastError.value = null
      },
      (err) => {
        lastError.value = err.message
        console.warn('[locationTracker] watchPosition error:', err.message)
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 },
    )

    // 2) 5s tick: 가장 최근 lastPosition을 BE에 PUT
    intervalId = setInterval(async () => {
      if (!lastPosition.value) return
      try {
        await locationService.update({
          lat: lastPosition.value.lat,
          lng: lastPosition.value.lng,
        })
      } catch (err) {
        // BE 5xx (Redis 다운) 등 — 다음 tick 자연 재시도
        console.warn('[locationTracker] PUT 실패:', err?.response?.status ?? err.message)
      }
    }, TICK_MS)

    tracking.value = true
  }

  const stop = () => {
    if (!tracking.value) return
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    if (intervalId !== null) clearInterval(intervalId)
    watchId = null
    intervalId = null
    tracking.value = false
  }

  onUnmounted(stop)

  return { start, stop, lastPosition, lastError, tracking }
}
