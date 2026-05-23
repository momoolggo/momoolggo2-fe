<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import chatbotService from '@/services/chatbotService'

const router = useRouter()

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
    const session = await chatbotService.startSession('CS', 'SERIOUS')
    state.sessionId = session.sessionId
    state.status = session.status
    state.messages = [
      {
        messageId: 'sys-welcome',
        role: 'ASSISTANT',
        content: '안녕하세요! 뭐물꼬 고객센터입니다. 무엇을 도와드릴까요?',
        createdAt: new Date().toISOString(),
      },
    ]
  } catch (e) {
    alert('세션 시작에 실패했습니다: ' + (e.response?.data?.resultMessage || e.message))
  } finally {
    starting.value = false
  }
}

const send = async () => {
  const content = input.value.trim()
  if (!content || sending.value || !state.sessionId) return
  if (state.status === 'CLOSED') {
    alert('종료된 세션입니다.')
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
    state.messages.push(res.userMessage, res.assistantMessage)
    state.status = res.sessionStatus
    await scrollToBottom()
  } catch (e) {
    alert('전송 실패: ' + (e.response?.data?.resultMessage || e.message))
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
    alert('상담원 연결 실패: ' + (e.response?.data?.resultMessage || e.message))
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

const onKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

onMounted(startCsSession)
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
      <h1 class="title">고객센터</h1>
      <span class="status-badge" :class="`status-${state.status.toLowerCase()}`">
        {{ state.status === 'ESCALATED' ? '상담원 연결 중' : state.status === 'CLOSED' ? '종료됨' : '챗봇' }}
      </span>
    </header>

    <div class="messages" ref="messageListRef">
      <p v-if="starting" class="hint">세션을 시작하는 중...</p>
      <template v-else>
        <div
          v-for="m in state.messages"
          :key="m.messageId"
          class="message-row"
          :class="m.role === 'USER' ? 'user' : 'assistant'"
        >
          <div class="bubble">{{ m.content }}</div>
        </div>
      </template>
    </div>

    <div class="actions">
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
.cs-chat {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #f7f7f8;
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
