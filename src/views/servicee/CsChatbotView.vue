<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import chatbotService from '@/services/chatbotService'
import petService from '@/services/petService'
import { showAlert } from '@/composables/useAlert'

const router = useRouter()
const route = useRoute()
// 2026-05-25 9건 트랙 #8 — entryPoint/toneMode query 지원 (펫 챗봇 호환).
// CS (기본): 사장/라이더/고객 모두 진입 가능, 톤 SERIOUS.
// MYPET: 고객 전용, 펫 캐릭터 + 4 tone (PLAYFUL/GOURMET/EMPATHY/SERIOUS).
const entryPoint = computed(() => (route.query.entry || 'CS').toUpperCase())
const toneMode = computed(() => (route.query.tone || 'SERIOUS').toUpperCase())
const isPetChat = computed(() => entryPoint.value === 'MYPET')

// 펫 캐릭터 박스 — MYPET 진입 시 BE에서 펫 정보 GET
const petInfo = ref(null)
const speciesEmojiMap = {
  DOG: '🐶', CAT: '🐱', RABBIT: '🐰', HAMSTER: '🐹',
  BEAR: '🐻', FOX: '🦊', PANDA: '🐼', KOALA: '🐨',
}
const petEmoji = computed(() => {
  if (!petInfo.value?.species) return '🐣'
  return speciesEmojiMap[petInfo.value.species] || '🐣'
})

const state = reactive({
  sessionId: null,
  status: 'ACTIVE', // ACTIVE | ESCALATED | CLOSED
  messages: [],     // { messageId, role: 'USER'|'ASSISTANT', content, createdAt }
})

const input = ref('')
const sending = ref(false)
const starting = ref(true)
const messageListRef = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const startCsSession = async () => {
  starting.value = true
  try {
    const session = await chatbotService.startSession(entryPoint.value, toneMode.value)
    state.sessionId = session.sessionId
    state.status = session.status
    const welcome = isPetChat.value
      ? '안녕! 나는 너의 펫이야. 오늘은 어떤 메뉴가 끌려?'
      : '안녕하세요! 뭐물꼬 고객센터입니다. 무엇을 도와드릴까요?'
    state.messages = [
      {
        messageId: 'sys-welcome',
        role: 'ASSISTANT',
        content: welcome,
        createdAt: new Date().toISOString(),
      },
    ]
  } catch (e) {
    await showAlert('세션 시작에 실패했습니다: ' + (e.response?.data?.resultMessage || e.message), { title: '오류', type: 'error' })
  } finally {
    starting.value = false
  }
}

const send = async () => {
  const content = input.value.trim()
  if (!content || sending.value || !state.sessionId) return
  if (state.status === 'CLOSED') {
    await showAlert('종료된 세션입니다.', { title: '알림', type: 'info' })
    return
  }
  sending.value = true
  input.value = ''
  state.messages.push({
    messageId: `tmp-${Date.now()}`,
    role: 'USER',
    content,
    createdAt: new Date().toISOString(),
  })
  await scrollToBottom()

  try {
    const res = await chatbotService.sendMessage(state.sessionId, content)
    // server-side echo + assistant 응답으로 마지막 tmp 교체
    state.messages.pop()
    state.messages.push(res.userMessage, {
      ...res.assistantMessage,
      // 2026-06-06 멘토 피드백 #1+#2 — Gemini 추천 키워드로 BE가 가게 카드 검색 후 첨부
      menuCards: res.menuCards || [],
    })
    state.status = res.sessionStatus
    await scrollToBottom()
  } catch (e) {
    await showAlert('전송 실패: ' + (e.response?.data?.resultMessage || e.message), { title: '전송 실패', type: 'error' })
  } finally {
    sending.value = false
  }
}

const escalate = async () => {
  if (!state.sessionId || state.status !== 'ACTIVE') return
  try {
    const session = await chatbotService.escalate(state.sessionId)
    state.status = session.status
    state.messages.push({
      messageId: `sys-${Date.now()}`,
      role: 'ASSISTANT',
      content: '상담원 연결을 요청했습니다. 잠시만 기다려주세요.',
      createdAt: new Date().toISOString(),
    })
    await scrollToBottom()
  } catch (e) {
    await showAlert('상담원 연결 실패: ' + (e.response?.data?.resultMessage || e.message), { title: '오류', type: 'error' })
  }
}

const closeSession = async () => {
  if (!state.sessionId || state.status === 'CLOSED') {
    router.back()
    return
  }
  try {
    await chatbotService.close(state.sessionId)
    state.status = 'CLOSED'  // reviewer W-1 정정 — onBeforeUnmount 이중 close HTTP 호출 차단
  } finally {
    router.back()
  }
}

// 2026-06-06 멘토 피드백 #1+#2 — 카드 클릭 시 가게 상세로 이동
const goStore = (storeId) => {
  if (!storeId) return
  router.push(`/store/${storeId}`)
}

const onKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

onMounted(async () => {
  // 펫 챗봇 진입 시 펫 정보 먼저 로딩 (헤더 박스 표시용)
  if (isPetChat.value) {
    try {
      petInfo.value = await petService.getMyPet()
    } catch (e) {
      console.warn('펫 정보 로딩 실패:', e)
    }
  }
  await startCsSession()
})
onBeforeUnmount(() => {
  // 사용자가 라우터 이동으로 떠나면 세션 close 시도 (best-effort, 응답 대기 안 함)
  if (state.sessionId && state.status !== 'CLOSED') {
    chatbotService.close(state.sessionId).catch(() => {})
  }
})
</script>

<template>
  <div class="cs-chat">
    <header class="cs-head">
      <button class="back-btn" @click="closeSession">←</button>
      <h1 class="title">{{ isPetChat ? '나의 펫' : '고객센터' }}</h1>
      <span class="status-badge" :class="`status-${state.status.toLowerCase()}`">
        {{ state.status === 'ESCALATED' ? '상담원 연결 중' : state.status === 'CLOSED' ? '종료됨' : (isPetChat ? '펫 챗봇' : '챗봇') }}
      </span>
    </header>

    <!-- 2026-05-25 9건 트랙 #8 — 펫 캐릭터 박스 (MYPET 진입 시만) -->
    <div v-if="isPetChat && petInfo" class="pet-character-box">
      <div class="pet-character-emoji">{{ petEmoji }}</div>
      <div class="pet-character-info">
        <div class="pet-character-name">{{ petInfo.name }}</div>
        <div class="pet-character-meta">Lv.{{ petInfo.level }} · 친밀도 {{ petInfo.intimacy }}</div>
      </div>
    </div>

    <div class="messages" ref="messageListRef">
      <p v-if="starting" class="hint">세션을 시작하는 중...</p>
      <template v-else>
        <template v-for="m in state.messages" :key="m.messageId">
          <div
            class="message-row"
            :class="m.role === 'USER' ? 'user' : 'assistant'"
          >
            <div v-if="isPetChat && m.role !== 'USER'" class="bubble-pet-emoji">{{ petEmoji }}</div>
            <div class="bubble">{{ m.content }}</div>
          </div>
          <!-- 2026-06-06 멘토 피드백 #1+#2 — 메뉴 추천 카드 (ASSISTANT 응답 + menuCards 첨부 시) -->
          <div v-if="m.menuCards && m.menuCards.length" class="menu-cards">
            <button
              v-for="card in m.menuCards"
              :key="card.storeId"
              class="menu-card"
              @click="goStore(card.storeId)"
              type="button"
            >
              <img
                v-if="card.storePic"
                :src="card.storePic.startsWith('http') ? card.storePic : `/api${card.storePic}`"
                :alt="card.storeName"
                class="menu-card-img"
                @error="(e) => e.target.style.display='none'"
              />
              <div class="menu-card-body">
                <div class="menu-card-name">{{ card.storeName }}</div>
                <div class="menu-card-meta">
                  <span v-if="card.ratingAvg">★ {{ (card.ratingAvg / 10).toFixed(1) }}</span>
                  <span v-if="card.ratingCount"> · 리뷰 {{ card.ratingCount }}</span>
                  <span v-if="card.minPrice"> · 최소 {{ card.minPrice.toLocaleString() }}원</span>
                </div>
                <div class="menu-card-tag">#{{ card.matchedKeyword }}</div>
              </div>
            </button>
          </div>
        </template>
      </template>
    </div>

    <div class="actions">
      <!-- 2026-06-06 멘토 피드백 정정: 펫 챗봇에서도 상담원 연결 허용
           (이전: !isPetChat 조건으로 펫 챗봇 버튼 숨김 → 텍스트로 요청하면 펫이 "저한테 말씀하세요" 응답하는 문제) -->
      <button
        v-if="state.status === 'ACTIVE'"
        class="action-btn escalate-btn"
        @click="escalate"
        :disabled="sending"
      >
        상담원 연결
      </button>
    </div>

    <div class="input-row">
      <textarea
        v-model="input"
        class="input-box"
        rows="2"
        placeholder="무엇이 궁금하세요?"
        :disabled="sending || state.status === 'CLOSED' || starting"
        @keydown="onKeydown"
      />
      <button class="send-btn" :disabled="sending || !input.trim() || state.status === 'CLOSED' || starting" @click="send">
        {{ sending ? '...' : '전송' }}
      </button>
    </div>

  </div>
</template>

<style scoped>
/* 2026-05-25 9건 트랙 #8 — 모바일 480px 컨테이너 안에 고정 (펫과 대화 화면 일관) */
.cs-chat {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  background: #f7f7f8;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.cs-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #A40C0B;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn {
  background: transparent;
  border: 0;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  width: 32px;
  height: 32px;
}
.title { font-size: 17px; font-weight: 700; margin: 0; flex: 1; }
.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.22);
  font-weight: 600;
}
.status-escalated { background: #ffb000; color: #333; }
.status-closed { background: #888; color: #fff; }

/* 2026-05-25 9건 트랙 #8 — 펫 캐릭터 박스 */
.pet-character-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #FFF5EE, #FFE8D8);
  border-bottom: 1px solid #f0c8a8;
}
.pet-character-emoji {
  font-size: 48px;
  line-height: 1;
  display: inline-block;        /* transform 적용 위해 필수 */
  transform-origin: center bottom;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
  animation: petBob 1.6s ease-in-out infinite;
}
@keyframes petBob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
.pet-character-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pet-character-name {
  font-size: 17px;
  font-weight: 800;
  color: #333;
}
.pet-character-meta {
  font-size: 12px;
  color: #888;
}
.bubble-pet-emoji {
  font-size: 28px;
  margin-right: 6px;
  align-self: flex-end;
}
.message-row.assistant { align-items: flex-end; gap: 0; }

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hint { text-align: center; color: #999; padding: 40px 0; }

.message-row { display: flex; }
.message-row.user { justify-content: flex-end; }
.message-row.assistant { justify-content: flex-start; }
.bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.message-row.user .bubble { background: #A40C0B; color: #fff; border-bottom-right-radius: 4px; }
.message-row.assistant .bubble { background: #fff; color: #222; border: 1px solid #eee; border-bottom-left-radius: 4px; }

/* 2026-06-06 멘토 피드백 #1+#2 — 메뉴 추천 카드 */
.menu-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 4px 0 4px 28px;
}
.menu-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #fff;
  border: 1px solid #f0d0d0;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.menu-card:hover {
  border-color: #A40C0B;
  background: #fff8f8;
  transform: translateY(-1px);
}
.menu-card-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.menu-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.menu-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.menu-card-meta {
  font-size: 11px;
  color: #888;
}
.menu-card-tag {
  font-size: 11px;
  color: #A40C0B;
  font-weight: 600;
  margin-top: 2px;
}

.actions {
  padding: 0 16px 8px;
  display: flex;
  gap: 8px;
}
.action-btn {
  background: #fff;
  border: 1px solid #ddd;
  padding: 8px 14px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #555;
}
.action-btn:hover:not(:disabled) { border-color: #A40C0B; color: #A40C0B; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.escalate-btn { background: #fff4f4; border-color: #f0c8c8; color: #A40C0B; }

.input-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #eee;
}
.input-box {
  flex: 1;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.input-box:focus { border-color: #A40C0B; }
.send-btn {
  background: #A40C0B;
  color: #fff;
  border: 0;
  border-radius: 12px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.send-btn:disabled { background: #ccc; cursor: not-allowed; }
</style>
