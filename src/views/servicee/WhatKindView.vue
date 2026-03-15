<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
  { id: 1,  name: '한식',       icon: '🥘', color: '#FF6B6B' },
  { id: 2,  name: '중식',       icon: '🥟', color: '#FF9F43' },
  { id: 3,  name: '일식',       icon: '🍣', color: '#EE5A24' },
  { id: 4,  name: '양식',       icon: '🍝', color: '#F79F1F' },
  { id: 5,  name: '디저트',     icon: '🍰', color: '#FDA7DF' },
  { id: 6,  name: '분식',       icon: '🍢', color: '#9980FA' },
  { id: 7,  name: '패스트푸드', icon: '🍔', color: '#D980FA' },
  { id: 8,  name: '찜·탕',     icon: '🍲', color: '#00C7AE' },
  { id: 9,  name: '치킨',       icon: '🍗', color: '#1289A7' },
  { id: 10, name: '야식',       icon: '🌛', color: '#12CBC4' },
  { id: 11, name: '족발',       icon: '🐷', color: '#ED4C67' },
  { id: 12, name: '피자',       icon: '🍕', color: '#F53B57' },
]

const isAnimating  = ref(false)
const isRevealed   = ref(false)
const resultIndex  = ref(null)
const targetDeg    = ref(0)
const baseDeg      = ref(0)    // 누적 회전각 기준점
const hasSpunOnce  = ref(false) // 첫 스핀 전엔 물음표로 가림

const resultCategory = computed(() =>
  resultIndex.value !== null ? categories[resultIndex.value] : null
)

const TOTAL   = categories.length       // 12
const SLICE   = 360 / TOTAL             // 30도
const CX = 200, CY = 200, R = 186

// 위쪽(12시)=0도 기준 극좌표
function polar(deg, r = R) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

// i번 슬라이스 path
function slicePath(i) {
  const s = polar(i * SLICE)
  const e = polar(i * SLICE + SLICE)
  const large = SLICE > 180 ? 1 : 0
  return `M${CX},${CY} L${s.x},${s.y} A${R},${R} 0 ${large} 1 ${e.x},${e.y} Z`
}

// 슬라이스 중앙각
function mid(i) { return i * SLICE + SLICE / 2 }

// 레이블 위치 (휠 중심에서 r=125 거리)
function labelPos(i) { return polar(mid(i), 125) }

function spin() {
  if (isAnimating.value) return

  isAnimating.value = true
  isRevealed.value  = false
  resultIndex.value = null
  hasSpunOnce.value = true

  const winIdx = Math.floor(Math.random() * TOTAL)

  // 포인터(12시/0도)에 winIdx 슬라이스 중앙이 오려면
  // 휠을 (360 - mid(winIdx)) % 360 만큼 "나머지" 회전 후 정지
  const stopAngle = (360 - mid(winIdx)) % 360
  const spins     = (6 + Math.floor(Math.random() * 4)) * 360
  const prev      = baseDeg.value

  // 현재 각도를 기준으로 stopAngle 위치까지 추가 회전
  const currentMod = prev % 360
  const diff = (stopAngle - currentMod + 360) % 360
  targetDeg.value = prev + spins + diff
  baseDeg.value   = targetDeg.value

  setTimeout(() => {
    resultIndex.value = winIdx
    isAnimating.value = false
    isRevealed.value  = true
  }, 4600)
}

function goToCategory() {
  if (!resultCategory.value) return
  router.push({ path: '/storelist', query: { category: resultCategory.value.name } })
}

function spinAgain() {
  isRevealed.value  = false
  resultIndex.value = null
  spin()
}
</script>

<template>
  <div class="roulette-page">

    <!-- 헤더 -->
    <header class="page-header">
      <h1 class="page-title">🍽️ 오늘 뭐먹지?</h1>
      <p class="page-sub">룰렛을 돌려서 오늘의 메뉴를 추천받아 보세요!</p>
    </header>

    <div class="roulette-area">
      <!-- 포인터 -->
      <div class="pointer">▼</div>

      <!-- 휠 — 항상 색깔 표시, 이름만 돌리는 중 숨김 -->
      <div
        class="wheel-wrapper"
        :style="{
          transform: `rotate(${targetDeg}deg)`,
          transition: isAnimating
            ? 'transform 4.5s cubic-bezier(0.17,0.67,0.12,1.0)'
            : 'none',
        }"
      >
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="wheel-svg">

          <!-- 슬라이스 색상 채우기: 첫 스핀 전엔 회색 -->
          <path
            v-for="(cat, i) in categories"
            :key="'slice-' + i"
            :d="slicePath(i)"
            :fill="hasSpunOnce ? cat.color : '#d4d4d4'"
            stroke="#fff"
            stroke-width="2.5"
          />

          <!-- 레이블 -->
          <g
            v-for="(cat, i) in categories"
            :key="'label-' + i"
            :transform="`translate(${labelPos(i).x}, ${labelPos(i).y})`"
          >
            <!-- 첫 스핀 전: 물음표 / 이후: 이모지 -->
            <text
              :transform="`rotate(${mid(i) + 90})`"
              text-anchor="middle"
              dominant-baseline="middle"
              :font-size="hasSpunOnce ? 20 : 22"
              y="-8"
            >{{ hasSpunOnce ? cat.icon : '❓' }}</text>

            <!-- 이름: 첫 스핀 전 숨김 + 돌리는 중 숨김 -->
            <text
              v-show="hasSpunOnce && !isAnimating"
              :transform="`rotate(${mid(i) + 90})`"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="11"
              font-weight="bold"
              fill="#fff"
              y="10"
            >{{ cat.name }}</text>
          </g>

          <!-- 중앙 원 -->
          <circle cx="200" cy="200" r="38" fill="#fff" stroke="#00C7AE" stroke-width="4"/>
          <text x="200" y="205" text-anchor="middle" dominant-baseline="middle" font-size="26">🎯</text>

        </svg>
      </div>
    </div>

    <!-- 스핀 버튼 -->
    <button class="spin-btn" :disabled="isAnimating" @click="spin">
      {{ isAnimating ? '돌아가는 중...' : '🎲 룰렛 돌리기' }}
    </button>

    <!-- 결과 카드 -->
    <transition name="pop">
      <div class="result-card" v-if="isRevealed && resultCategory">
        <div class="result-label">오늘의 추천 메뉴 🎉</div>
        <div class="result-icon">{{ resultCategory.icon }}</div>
        <div class="result-name" :style="{ color: resultCategory.color }">
          {{ resultCategory.name }}
        </div>
        <p class="result-desc">맛있는 {{ resultCategory.name }} 가게를 찾아볼까요?</p>
        <div class="result-btns">
          <button class="btn-go" @click="goToCategory">
            🏪 {{ resultCategory.name }} 가게 보러가기
          </button>
          <button class="btn-retry" @click="spinAgain">
            🔄 다시 돌리기
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.roulette-page {
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 60px;
}

/* ── 헤더 ── */
.page-header {
  width: 100%;
  background: #fff;
  padding: 28px 20px 18px;
  text-align: center;
  border-bottom: 1px solid #eee;
}
.page-title {
  font-size: 26px;
  font-weight: 900;
  color: #222;
  margin-bottom: 6px;
}
.page-sub { font-size: 14px; color: #888; }

/* ── 룰렛 영역 ── */
.roulette-area {
  position: relative;
  width: 320px;
  height: 350px;
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.pointer {
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  color: #00C7AE;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  line-height: 1;
}

.wheel-wrapper {
  position: absolute;
  top: 34px;
  width: 290px;
  height: 290px;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  will-change: transform;
}

.wheel-svg {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  overflow: visible;
}

/* ── 스핀 버튼 ── */
.spin-btn {
  margin-top: 36px;
  padding: 16px 52px;
  background: #00C7AE;
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0,199,174,0.35);
  transition: all 0.2s;
  letter-spacing: 0.5px;
}
.spin-btn:hover:not(:disabled) {
  background: #00b09c;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,199,174,0.45);
}
.spin-btn:disabled {
  background: #bbb;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── 결과 카드 ── */
.result-card {
  width: calc(100% - 40px);
  max-width: 480px;
  margin-top: 28px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.09);
  border-top: 4px solid #00C7AE;
}
.result-label {
  font-size: 12px;
  font-weight: 700;
  color: #00C7AE;
  letter-spacing: 2px;
  margin-bottom: 12px;
}
.result-icon { font-size: 54px; margin-bottom: 8px; }
.result-name { font-size: 34px; font-weight: 900; margin-bottom: 8px; }
.result-desc { font-size: 14px; color: #888; margin-bottom: 22px; }
.result-btns { display: flex; flex-direction: column; gap: 10px; }

.btn-go {
  padding: 14px;
  background: #00C7AE;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-go:hover { background: #00b09c; }

.btn-retry {
  padding: 12px;
  background: #f4f4f4;
  color: #555;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-retry:hover { background: #e8e8e8; }

/* ── 트랜지션 ── */
.pop-enter-active { transition: all 0.5s cubic-bezier(0.34,1.56,0.64,1); }
.pop-enter-from   { opacity: 0; transform: translateY(24px) scale(0.95); }
</style>
