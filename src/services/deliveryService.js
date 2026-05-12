import axios from '@/services/httpRequester'

/**
 * 라이더 배달 처리 — interfaces.md §6.2 9 endpoint.
 * R1-FE riderService 패턴 일관 (httpRequester + res.data.resultData 추출).
 *
 * 9 endpoint:
 * - GET  /waiting              대기 배달 목록 (ACTIVE 라이더)
 * - GET  /inprogress           본인 진행 중 배달
 * - PUT  /{deliveryNo}/accept  ASSIGNED → ARRIVED_AT_STORE
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
}

export default new DeliveryService()
