import axios from '@/services/httpRequester'

/**
 * 2026-05-25 9건 트랙 #8 — 펫 도메인 FE 서비스.
 * BE PetController endpoint 2개 + chatbot/pet 진입은 chatbotService 사용.
 */
class PetService {
  #url = '/pet'

  /** 내 펫 정보 조회 — 회원가입 시 자동 생성, 미존재 시 BE 측에서 생성 */
  async getMyPet() {
    const res = await axios.get(`${this.#url}/me`)
    return res.data.resultData
  }

  /** 펫 이름/종족 변경 */
  async updatePet(payload) {
    const res = await axios.put(`${this.#url}/me`, payload)
    return res.data.resultData
  }

  /** 2026-05-25 9건 트랙 #8 부채 — 간식주기 (펫 직접 상호작용, intimacy +20 + exp +10) */
  async giveSnack() {
    const res = await axios.post(`${this.#url}/me/snack`)
    return res.data.resultData
  }
}

export default new PetService()
