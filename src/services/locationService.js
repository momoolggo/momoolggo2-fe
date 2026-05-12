import axios from '@/services/httpRequester'

/**
 * 라이더 위치 송신 — R5 PUT /api/rider/location.
 * ADR-005 D6-b 5s/10s 빈도, TTL 30s.
 */
class LocationService {
  #url = '/rider/location'

  /**
   * @param {{ lat: number, lng: number }} payload
   */
  async update(payload) {
    await http.put(this.#url, payload)
  }
}

export default new LocationService()
