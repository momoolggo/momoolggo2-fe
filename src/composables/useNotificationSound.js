/**
 * SSE 알림 사운드 — 2026-06-06 트랙.
 *
 * 사용처:
 *   - 사장 OrderList.vue: new-order (고객 → 사장 주문 접수)
 *   - 라이더 WaitingTab.vue: order-assigned (사장 → 라이더 배차 신청)
 *
 * 자동재생 정책 회피:
 *   - 페이지 mount 시 무음(volume=0)으로 한 번 priming → 브라우저가 audio context "사용자 허용"으로 인식
 *   - 이후 SSE 이벤트 도착 시 즉시 play() 가능 (volume 복원)
 *
 * 패턴:
 *   const { play } = useNotificationSound()
 *   // 마운트 시 자동 priming. 이후 SSE 콜백 안에서 play() 호출.
 *
 * 단점: 일부 모바일 브라우저는 사용자 클릭/터치 없이 priming도 막을 수 있음 (Safari iOS).
 *       이 경우 첫 SSE는 무음, 사용자가 페이지에서 한 번 인터랙션하면 그 이후 재생됨.
 */
import { onMounted, onBeforeUnmount } from 'vue'

const SOUND_URL = '/sounds/notification.wav'
const DEFAULT_VOLUME = 0.7

export function useNotificationSound(options = {}) {
  const volume = options.volume ?? DEFAULT_VOLUME
  let audio = null
  let primed = false

  const ensureAudio = () => {
    if (audio) return audio
    audio = new Audio(SOUND_URL)
    audio.preload = 'auto'
    return audio
  }

  /** 페이지 진입 시 무음 priming (자동재생 정책 우회). */
  const prime = async () => {
    if (primed) return
    const a = ensureAudio()
    const prevVolume = a.volume
    a.volume = 0
    try {
      await a.play()
      a.pause()
      a.currentTime = 0
      primed = true
    } catch (err) {
      // 일부 브라우저(특히 iOS Safari)는 사용자 인터랙션 없이 priming 실패.
      // 그 경우 사용자가 페이지에서 클릭하면 자동으로 play() 가능해짐.
      console.debug('[useNotificationSound] priming 실패 (자동재생 차단). 첫 인터랙션 후 재시도됨.', err?.message)
    } finally {
      a.volume = prevVolume
    }
  }

  /** SSE 이벤트 도착 시 호출. 실패해도 silent. */
  const play = () => {
    const a = ensureAudio()
    try {
      a.volume = volume
      a.currentTime = 0
      const result = a.play()
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          console.debug('[useNotificationSound] play 실패', err?.message)
        })
      }
    } catch (err) {
      console.debug('[useNotificationSound] play 동기 실패', err?.message)
    }
  }

  onMounted(() => {
    prime()
  })

  onBeforeUnmount(() => {
    if (audio) {
      try { audio.pause() } catch {}
      audio = null
    }
  })

  return { play, prime }
}
