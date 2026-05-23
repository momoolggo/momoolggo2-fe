import axios from '@/services/httpRequester'

/**
 * 챗봇 — 자잘 에러 트랙(2026-05-23) 사장/라이더 CS 챗봇 통합용 FE 서비스.
 *
 * 6 endpoint:
 * - POST /chatbot/sessions                       세션 시작 (entryPoint=MYPET|CS, toneMode)
 * - GET  /chatbot/sessions                       내 세션 목록
 * - POST /chatbot/sessions/{sessionId}/messages  메시지 전송 (Gemini 호출)
 * - GET  /chatbot/sessions/{sessionId}/messages  메시지 이력
 * - POST /chatbot/sessions/{sessionId}/escalate  상담원 연결 (CS 한정)
 * - POST /chatbot/sessions/{sessionId}/close     세션 종료
 *
 * 펫 챗봇(MYPET)은 BE 가드로 CUSTOMER 전용. 사장/라이더는 CS만 사용.
 */
class ChatbotService {
  #url = '/chatbot'

  async startSession(entryPoint, toneMode) {
    const res = await axios.post(`${this.#url}/sessions`, { entryPoint, toneMode })
    return res.data.resultData
  }

  async listMySessions() {
    const res = await axios.get(`${this.#url}/sessions`)
    return res.data.resultData
  }

  async sendMessage(sessionId, content) {
    const res = await axios.post(`${this.#url}/sessions/${sessionId}/messages`, { content })
    return res.data.resultData
  }

  async listMessages(sessionId) {
    const res = await axios.get(`${this.#url}/sessions/${sessionId}/messages`)
    return res.data.resultData
  }

  async escalate(sessionId) {
    const res = await axios.post(`${this.#url}/sessions/${sessionId}/escalate`)
    return res.data.resultData
  }

  async close(sessionId) {
    const res = await axios.post(`${this.#url}/sessions/${sessionId}/close`)
    return res.data.resultData
  }
}

export default new ChatbotService()
