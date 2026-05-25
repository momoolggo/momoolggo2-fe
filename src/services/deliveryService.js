import axios from '@/services/httpRequester'

/**
 * 라이더 배달 처리 — interfaces.md §6.2 9 endpoint.
 * R1-FE riderService 패턴 일관 (httpRequester + res.data.resultData 추출).
 *
 * 10 endpoint:
 * - GET  /waiting              대기 배달 목록 (ACTIVE 라이더)
 * - GET  /inprogress           본인 진행 중 배달
 * - PUT  /{deliveryNo}/claim   WAITING_ASSIGN → ASSIGNED + rider_no 박기 (라이더 풀 잡기, 2026-05-19 신설)
 * - PUT  /{deliveryNo}/accept  ASSIGNED → ARRIVED_AT_STORE (가게 도착 처리)
 * - PUT  /{deliveryNo}/reject  ASSIGNED → WAITING_ASSIGN (수락 전 거부)
 * - PUT  /{deliveryNo}/arrive  ARRIVED_AT_STORE → AWAITING_PICKUP
 * - PUT  /{deliveryNo}/pickup  AWAITING_PICKUP → PICKED_UP
 * - PUT  /{deliveryNo}/depart  PICKED_UP → DELIVERING
 * - PUT  /{deliveryNo}/complete DELIVERING → DELIVERED + 사진 + 전달방식
 * - PUT  /{deliveryNo}/cancel   진행 중 → WAITING_ASSIGN + 사유 (R6-cancel)
 */
class DeliveryService {
  #url = '/rider/order'

  async getWaiting() {
    const res = await axios.get(`${this.#url}/waiting`)
    return res.data.resultData
  }

  async getInProgress() {
    const res = await axios.get(`${this.#url}/inprogress`)
    return res.data.resultData
  }

  /** 라이더 풀에서 본인 잡기 (WAITING_ASSIGN → ASSIGNED + rider_no). code-reviewer 결함 1번 정정. */
  async claim(deliveryNo) {
    await axios.put(`${this.#url}/${deliveryNo}/claim`)
  }

  async accept(deliveryNo) {
    await axios.put(`${this.#url}/${deliveryNo}/accept`)
  }

  async reject(deliveryNo) {
    await axios.put(`${this.#url}/${deliveryNo}/reject`)
  }

  async arrive(deliveryNo) {
    await axios.put(`${this.#url}/${deliveryNo}/arrive`)
  }

  async pickup(deliveryNo) {
    await axios.put(`${this.#url}/${deliveryNo}/pickup`)
  }

  async depart(deliveryNo) {
    await axios.put(`${this.#url}/${deliveryNo}/depart`)
  }

  /**
   * 배달 완료.
   * @param {string} deliveryNo
   * @param {{ deliveredMethod: 'DIRECT'|'CUSTOMER_REQUEST'|'CUSTOMER_ABSENT', deliveredPhotoUrl: string|null }} payload
   */
  async complete(deliveryNo, payload) {
    await axios.put(`${this.#url}/${deliveryNo}/complete`, payload)
  }

  /**
   * 진행 중 배달 반려 (R6-cancel).
   * @param {string} deliveryNo
   * @param {{ reason: 'ACCIDENT'|'PERSONAL'|'OTHER' }} payload
   */
  async cancel(deliveryNo, payload) {
    await axios.put(`${this.#url}/${deliveryNo}/cancel`, payload)
  }

  /**
   * 배달 완료 사진 업로드 — 자잘 에러 트랙 #9 (2026-05-23).
   * 라이더 FE → Gateway → main /api/delivery-photo (RIDER role 가드). CLAUDE.md §5 main 단독 책임 일관.
   * 반환값 = 저장된 URL (예: "/uploads/delivery/abc.jpg") — complete 호출 시 deliveredPhotoUrl로 전달.
   */
  async uploadDeliveryPhoto(file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await axios.post('/delivery-photo/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.resultData
  }

  /**
   * SSE 배차 알림 구독 — 자잘 에러 트랙(2026-05-23). settlementService.subscribeStream 패턴 일관.
   * @param {(row: object) => void} onAssigned  새 배차 도착 콜백 (DeliveryWaitingRowRes 1건)
   * @param {(deliveryNo: string) => void} onClaimed  다른 라이더가 잡은 deliveryNo 콜백
   * @returns {EventSource} close() 호출용
   */
  subscribeStream(onAssigned, onClaimed) {
    const baseURL = axios.defaults.baseURL || ''
    const url = `${baseURL}${this.#url}/stream`
    const es = new EventSource(url, { withCredentials: true })
    es.addEventListener('order-assigned', (e) => {
      try {
        onAssigned(JSON.parse(e.data))
      } catch (err) {
        console.error('SSE order-assigned 파싱 실패', err)
      }
    })
    es.addEventListener('order-claimed', (e) => {
      try {
        // payload는 String deliveryNo (Jackson 따옴표 포함 직렬화) → JSON.parse 시 그대로 string
        onClaimed(JSON.parse(e.data))
      } catch (err) {
        console.error('SSE order-claimed 파싱 실패', err)
      }
    })
    es.onerror = (e) => {
      console.warn('SSE 연결 일시 오류 (자동 재연결)', e)
    }
    return es
  }
}

export default new DeliveryService()
