<template>
  <div class="game-page">

    <!-- CONFETTI -->
    <div class="confetti-wrap" v-if="showConfetti">
      <div
        v-for="c in confetti" :key="c.id"
        class="confetti-piece"
        :style="{
          left: c.x + '%',
          background: c.color,
          width: c.size + 'px',
          height: c.size + 'px',
          animationDuration: c.dur + 's',
          animationDelay: c.delay + 's',
          borderRadius: c.round ? '50%' : '2px',
        }"
      />
    </div>

    <!-- HEADER -->
    <header class="header">
      <div class="logo">
        <span class="logo-icon">🏆</span>
        <span class="logo-text">푸드 컵챌린지</span>
      </div>
      <div class="stage-badge">
        <div
          v-for="i in 5" :key="i"
          class="stage-dot"
          :class="{
            active: i === currentStage && gameState !== 'intro',
            done: i < currentStage || (i === currentStage && gameState === 'reward'),
          }"
        />
      </div>
    </header>

    <div class="game-wrap">

      <!-- ── INTRO ── -->
      <div class="intro-screen" v-if="gameState === 'intro'">
        <div class="intro-badge">🎮 미니게임</div>
        <div class="intro-title">컵 야바위<br>푸드 챌린지</div>
        <div class="food-preview">
          <div class="food-bubble"><span>🍔</span></div>
          <div class="food-bubble"><span>🍗</span></div>
          <div class="food-bubble"><span>🍕</span></div>
        </div>
        <div class="intro-card">
          <p>🔍 음식 위치를 <strong>기억</strong>한 뒤 컵이 섞입니다!</p>
          <p>👁️ 눈으로 따라가며 <strong>정확한 컵</strong>을 선택하세요</p>
          <p>⚡ 1단계부터 5단계까지 <strong>점점 빨라집니다</strong></p>
        </div>
        <button class="btn btn-start" @click="startGame">🎮 게임 시작</button>
      </div>

      <!-- ── GAME ACTIVE ── -->
      <template v-if="['reveal','covering','shuffle','pick','result'].includes(gameState)">

        <!-- Stage Info -->
        <div class="stage-info">
          <div class="stage-pill">STAGE {{ currentStage }}/5</div>
          <div class="stage-title">{{ stageData.name }}</div>
          <div class="stage-desc">{{ stageData.desc }}</div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-chip target">
            🎯 {{ targetFood.emoji }} {{ targetFood.name }}
          </div>
          <div class="status-chip speed">⚡ {{ stageData.speedLabel }}</div>
          <div class="status-chip moves">🔀 {{ stageData.moves }}회</div>
        </div>

        <!-- Instruction: reveal일 때는 타겟 배너, 나머지는 일반 안내 -->
        <div v-if="gameState === 'reveal'" class="target-banner">
          <div class="target-banner-label">👀 이 음식의 위치를 기억하세요!</div>
          <div class="target-banner-food">
            <span class="target-banner-emoji">{{ targetFood.emoji }}</span>
            <span class="target-banner-name">{{ targetFood.name }}</span>
          </div>
          <div class="target-banner-hint">컵이 덮이기 전에 위치를 눈에 담아두세요</div>
        </div>

        <div v-else class="instruction" :class="`phase-${gameState}`">
          <span v-if="gameState === 'covering'">🫙 컵이 덮이고 있어요...</span>
          <span v-else-if="gameState === 'shuffle'">🔀 눈으로 따라가세요!</span>
          <span v-else-if="gameState === 'pick'">👆 {{ targetFood.emoji }} {{ targetFood.name }}을(를) 찾아라!</span>
          <span v-else-if="gameState === 'result' && lastCorrect">✅ 정답입니다!</span>
          <span v-else-if="gameState === 'result' && !lastCorrect">❌ 틀렸습니다!</span>
        </div>

        <!-- ── CUP ARENA ── -->
        <div class="arena">
          <div
            v-for="(cup, idx) in cups"
            :key="cup.id"
            class="cup-slot"
            :class="{
              clickable: gameState === 'pick',
              'wrong-shake': cup.wrongShake,
              'correct-bounce': cup.correctBounce,
              'glow-hint': gameState === 'pick',
            }"
            :style="{ left: cup.x + 'px', transition: cup.slotTransition }"
            @click="pickCup(idx)"
          >
            <!-- 음식: 항상 바닥에 고정 -->
            <div class="food-icon" :class="{ visible: cup.foodVisible }">
              {{ cup.food.emoji }}
            </div>

            <!-- 컵 바디 -->
            <div
              class="cup-body"
              :style="{ transform: `translateY(${cup.cupY}px) scaleY(-1)`, transition: cup.cupTransition }"
            >
              <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" class="cup-svg">
                <defs>
                  <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stop-color="#c0392b" />
                    <stop offset="50%"  stop-color="#e74c3c" />
                    <stop offset="100%" stop-color="#c0392b" />
                  </linearGradient>
                  <linearGradient id="shineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stop-color="rgba(255,255,255,0.35)" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <polygon points="15,20 105,20 95,130 25,130" fill="url(#cupGrad)" />
                <polygon points="20,22 55,22 48,80 22,80" fill="url(#shineGrad)" opacity="0.6" />
                <rect x="8" y="12" width="104" height="16" rx="8" fill="#a93226" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Result Panel -->
        <div class="result-panel" v-if="gameState === 'result'">
          <div class="result-emoji">{{ lastCorrect ? '🎉' : '😭' }}</div>
          <div class="result-title" :class="lastCorrect ? 'success' : 'fail'">
            {{ lastCorrect ? '정답!' : '아쉽군요!' }}
          </div>
          <div class="result-sub" v-if="lastCorrect && currentStage < 5">
            <strong>{{ currentStage }}단계</strong> 클리어!<br>
            다음 단계 도전 또는 지금 보상 받기
          </div>
          <div class="result-sub" v-else-if="lastCorrect && currentStage === 5">
            🏆 <strong>모든 단계 클리어!</strong><br>최고의 실력을 보여주셨습니다!
          </div>
          <div class="result-sub" v-else>
            {{ targetFood.emoji }} {{ targetFood.name }}은(는)
            <strong>{{ correctCupNum }}번째 컵</strong>에 있었어요!
          </div>
          <div class="btn-col">
            <template v-if="lastCorrect && currentStage < 5">
              <button class="btn btn-primary" @click="nextStage">⚡ {{ currentStage + 1 }}단계 도전!</button>
              <button class="btn btn-reward"  @click="claimReward">🎁 보상 받기</button>
            </template>
            <template v-else-if="lastCorrect && currentStage === 5">
              <button class="btn btn-primary" @click="claimReward">🏆 최고 보상 받기!</button>
            </template>
            <template v-else>
              <button class="btn btn-primary"   @click="restartGame">🔄 처음부터 재도전</button>
              <button class="btn btn-secondary" @click="goIntro">홈으로</button>
            </template>
          </div>
        </div>

      </template>

      <!-- ── REWARD ── -->
      <div class="reward-screen" v-if="gameState === 'reward'">
        <div class="reward-title">🎊 축하합니다!</div>
        <div class="reward-stars">
          <span v-for="i in rewardStars" :key="i" :style="{ animationDelay: i * 0.1 + 's' }">⭐</span>
        </div>
        <p class="reward-cleared">{{ currentStage }}단계까지 클리어하셨습니다!</p>
        <div class="reward-coupon">
          <div class="coupon-label">🎁 획득 보상</div>
          <div class="coupon-value">{{ reward.value }}</div>
          <div class="coupon-desc">{{ reward.desc }}</div>
          <div class="coupon-divider">
            <span></span><span class="coupon-code-label">쿠폰 코드</span><span></span>
          </div>
          <div class="coupon-code">{{ reward.code }}</div>
        </div>
        <div class="btn-col">
          <button class="btn btn-primary"   @click="restartGame">🔄 다시 도전</button>
          <button class="btn btn-secondary" @click="goIntro">홈으로</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const FOODS = [
  { id: 0, emoji: '🍔', name: '햄버거' },
  { id: 1, emoji: '🍗', name: '치킨' },
  { id: 2, emoji: '🍕', name: '피자' },
]

const CUP_Y_UP   = -90
const CUP_Y_DOWN = 0

// 모바일 최적화 X 포지션 (3개 컵, 좁은 화면 기준)
const CUP_POSITIONS = [20, 130, 240]

const STAGES = [
  { name: '워밍업',  desc: '느리고 단순하게 — 기본기를 익혀봐요',   moves: 6,  duration: 580, pause: 200, speedLabel: '느림',      reward: { value: '5% 할인',  desc: '전 메뉴 적용',        code: 'FOOD5OFF',  stars: 1 } },
  { name: '초급',    desc: '조금 빨라졌어요. 집중하세요!',           moves: 8,  duration: 440, pause: 150, speedLabel: '보통',      reward: { value: '10% 할인', desc: '전 메뉴 적용',        code: 'FOOD10',    stars: 2 } },
  { name: '중급',    desc: '패턴이 복잡해지기 시작합니다',           moves: 9,  duration: 380, pause: 120, speedLabel: '빠름',      reward: { value: '15% 할인', desc: '세트 메뉴 적용',      code: 'SET15',     stars: 3 } },
  { name: '고급',    desc: '눈도 손도 따라가기 힘들어요!',           moves: 12, duration: 260, pause: 80,  speedLabel: '매우 빠름', reward: { value: '무료 음료', desc: '음료 1잔 무료',       code: 'FREEDRINK', stars: 4 } },
  { name: '전설',    desc: '신의 눈을 가진 자만 통과할 수 있다',     moves: 16, duration: 160, pause: 40,  speedLabel: '초고속',    reward: { value: '무료 세트', desc: '인기 세트 1개 무료!', code: 'FREESET',   stars: 5 } },
]

const gameState     = ref('intro')
const currentStage  = ref(1)
const lastCorrect   = ref(false)
const correctCupNum = ref(0)
const showConfetti  = ref(false)
const confetti      = ref([])
const targetFood    = ref(FOODS[1])
const cups          = ref([])

const stageData   = computed(() => STAGES[currentStage.value - 1])
const reward      = computed(() => stageData.value.reward)
const rewardStars = computed(() => reward.value.stars)

function initCups() {
  targetFood.value = FOODS[Math.floor(Math.random() * FOODS.length)]
  const shuffled = [...FOODS].sort(() => Math.random() - 0.5)
  cups.value = [0, 1, 2].map((i) => ({
    id:            i,
    x:             CUP_POSITIONS[i],
    food:          shuffled[i],
    foodVisible:   true,
    cupY:          CUP_Y_UP,
    slotTransition:'left 0.4s ease',
    cupTransition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
    wrongShake:    false,
    correctBounce: false,
  }))
}

async function phaseReveal() {
  gameState.value = 'reveal'
  await sleep(4000)
  await phaseCovering()
}

async function phaseCovering() {
  gameState.value = 'covering'
  for (let i = 0; i < cups.value.length; i++) {
    cups.value[i].cupTransition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)'
    cups.value[i].cupY = CUP_Y_DOWN
    await sleep(300)
  }
  await sleep(600)
  cups.value.forEach((c) => { c.foodVisible = false })
  await sleep(300)
  await phaseShuffle()
}

async function phaseShuffle() {
  gameState.value = 'shuffle'
  const { moves, duration, pause } = stageData.value
  const swaps = generateSwaps(moves)
  for (const [a, b] of swaps) {
    await swapCups(a, b, duration)
    await sleep(pause)
  }
  await sleep(200)
  gameState.value = 'pick'
}

async function swapCups(a, b, duration) {
  const xa = cups.value[a].x
  const xb = cups.value[b].x
  const t  = `left ${duration}ms cubic-bezier(0.4,0,0.2,1)`
  cups.value[a].slotTransition = t
  cups.value[b].slotTransition = t
  cups.value[a].x = xb
  cups.value[b].x = xa
  await sleep(duration)
}

function generateSwaps(count) {
  const swaps = []
  let last = [-1, -1]
  for (let i = 0; i < count; i++) {
    let a, b
    do {
      a = Math.floor(Math.random() * 3)
      b = Math.floor(Math.random() * 3)
    } while (a === b || (a === last[0] && b === last[1]) || (a === last[1] && b === last[0]))
    swaps.push([a, b])
    last = [a, b]
  }
  return swaps
}

function pickCup(idx) {
  if (gameState.value !== 'pick') return
  const cup     = cups.value[idx]
  const correct = cup.food.id === targetFood.value.id
  lastCorrect.value   = correct
  correctCupNum.value = cups.value.findIndex((c) => c.food.id === targetFood.value.id) + 1

  cups.value.forEach((c) => {
    c.foodVisible  = true
    c.cupTransition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)'
    c.cupY = CUP_Y_UP
  })

  if (correct) {
    setTimeout(() => { cup.correctBounce = true }, 500)
    setTimeout(() => { cup.correctBounce = false }, 1100)
    triggerConfetti()
  } else {
    setTimeout(() => { cup.wrongShake = true }, 100)
    setTimeout(() => { cup.wrongShake = false }, 700)
  }

  setTimeout(() => { gameState.value = 'result' }, 900)
}

function startGame() {
  currentStage.value = 1
  beginStage()
}

function beginStage() {
  initCups()
  phaseReveal()
}

function nextStage() {
  currentStage.value++
  beginStage()
}

function claimReward() {
  gameState.value = 'reward'
  triggerConfetti()
}

function restartGame() {
  currentStage.value = 1
  showConfetti.value = false
  beginStage()
}

function goIntro() {
  gameState.value    = 'intro'
  showConfetti.value = false
}

function triggerConfetti() {
  const colors = ['#e74c3c','#f39c12','#27ae60','#3498db','#9b59b6','#e67e22','#ffffff']
  confetti.value = Array.from({ length: 80 }, (_, i) => ({
    id:    i,
    x:     Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size:  5 + Math.random() * 8,
    dur:   2 + Math.random() * 2,
    delay: Math.random() * 1.5,
    round: Math.random() > 0.5,
  }))
  showConfetti.value = true
  setTimeout(() => { showConfetti.value = false }, 5000)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.game-page {
  --red:    #e31e24;
  --red-dk: #c0392b;
  --red-lt: #fdecea;
  --cream:  #fdf8f3;
  --sand:   #f5ede0;
  --text:   #1a1a1a;
  --muted:  #888;
  --border: #ececec;
  --gold:   #f39c12;
  --green:  #27ae60;
  --white:  #ffffff;

  min-height: 100vh;
  /* 앱 배경: 크림/베이지 계열 */
  background: var(--cream);
  background-image:
    radial-gradient(ellipse at 50% 0%, rgba(227,30,36,.06) 0%, transparent 55%);
  color: var(--text);
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 모바일 최대 너비 */
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 200px;
}

/* ── CONFETTI ── */
.confetti-wrap { position: fixed; inset: 0; pointer-events: none; z-index: 999; overflow: hidden; max-width: 430px; margin: 0 auto; }
.confetti-piece { position: absolute; top: -10px; animation: confettiFall linear forwards; }

/* ── HEADER ── */
.header {
  width: 100%;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--white);
  border-bottom: 1.5px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
}
.logo-icon { font-size: 20px; }
.logo-text {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 17px;
  color: var(--red);
  letter-spacing: -0.3px;
}

.stage-badge { display: flex; gap: 6px; align-items: center; }
.stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  transition: all .4s;
}
.stage-dot.active { background: var(--red); box-shadow: 0 0 6px rgba(227,30,36,.5); }
.stage-dot.done   { background: var(--green); }

/* ── WRAP ── */
.game-wrap {
  width: 100%;
  padding: 24px 16px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* ── INTRO ── */
.intro-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  animation: fadeUp .6s ease;
  width: 100%;
}

.intro-badge {
  background: var(--red-lt);
  color: var(--red);
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 100px;
  letter-spacing: 0.5px;
}

.intro-title {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(34px, 9vw, 52px);
  line-height: 1.15;
  color: var(--text);
  letter-spacing: -1px;
}

.food-preview {
  display: flex;
  gap: 14px;
  justify-content: center;
}
.food-bubble {
  width: 68px;
  height: 68px;
  background: var(--white);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
  border: 1.5px solid var(--border);
  animation: float 3s ease-in-out infinite;
}
.food-bubble:nth-child(2) { animation-delay: .35s; }
.food-bubble:nth-child(3) { animation-delay: .7s; }

.intro-card {
  background: var(--white);
  border-radius: 16px;
  padding: 18px 20px;
  width: 100%;
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 12px rgba(0,0,0,.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}
.intro-card p {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
}
.intro-card strong { color: var(--red); }

/* ── STAGE INFO ── */
.stage-info {
  text-align: center;
  animation: fadeUp .4s ease;
  width: 100%;
}
.stage-pill {
  display: inline-block;
  background: var(--red);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 100px;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}
.stage-title {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(22px, 6vw, 30px);
  color: var(--text);
  letter-spacing: -0.5px;
}
.stage-desc {
  font-size: 13px;
  color: var(--muted);
  margin-top: 4px;
}

/* ── STATUS BAR ── */
.status-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}
.status-chip {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}
.status-chip.target { background: var(--red-lt); color: var(--red); }
.status-chip.speed  { background: #fff3cd; color: #856404; }
.status-chip.moves  { background: #e8f5e9; color: #2e7d32; }

/* ── INSTRUCTION ── */
.instruction {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(15px, 4vw, 20px);
  text-align: center;
  min-height: 36px;
  transition: all .3s;
  padding: 10px 20px;
  border-radius: 12px;
  width: 100%;
}
.phase-reveal   { background: #e3f2fd; color: #1565c0; }
.phase-covering { background: #fff3e0; color: #e65100; }
.phase-shuffle  { background: #fff3e0; color: #e65100; }
.phase-pick     { background: #e8f5e9; color: #1b5e20; }
.phase-result   { background: var(--red-lt); color: var(--red); }

/* ── ARENA ── */
.arena {
  width: 100%;
  max-width: 360px;
  position: relative;
  height: 195px;
  /* 슬롯 3개가 20, 130, 240px + 컵폭 100px = 340px */
}

/* ── CUP SLOT ── */
.cup-slot {
  position: absolute;
  bottom: 0;
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 180px;
  justify-content: flex-end;
  user-select: none;
}
.cup-slot.clickable { cursor: pointer; }
.cup-slot.clickable:hover .cup-body { filter: brightness(1.12); }
.cup-slot.glow-hint .cup-body {
  filter: drop-shadow(0 0 8px rgba(227,30,36,.6));
}
.cup-slot.wrong-shake   { animation: wrongShake .5s ease; }
.cup-slot.correct-bounce .cup-body { animation: correctBounce .6s ease; }

/* ── 음식 아이콘 ── */
.food-icon {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  z-index: 0;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity .35s ease, transform .35s ease;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,.2));
}
.food-icon.visible { opacity: 1; transform: scale(1); }

/* ── 컵 바디 ── */
.cup-body {
  position: relative;
  z-index: 1;
  width: 90px;
  height: 108px;
}
.cup-svg { width: 100%; height: 100%; }

/* ── RESULT PANEL ── */
.result-panel {
  width: 100%;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,.08);
  animation: fadeUp .4s ease;
  position: relative;
  overflow: hidden;
}
.result-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--red), var(--gold), var(--green));
}
.result-emoji { font-size: 48px; margin-bottom: 8px; }
.result-title { font-family: 'Black Han Sans', sans-serif; font-size: 26px; margin-bottom: 8px; }
.result-title.success { color: var(--red); }
.result-title.fail    { color: #555; }
.result-sub { font-size: 14px; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }
.result-sub strong { color: var(--text); }

/* ── BUTTONS ── */
.btn-col { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.btn-row { display: flex; gap: 10px; width: 100%; }

.btn {
  width: 100%;
  padding: 15px 20px;
  border-radius: 12px;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all .18s;
  letter-spacing: -0.3px;
}
.btn:active { transform: scale(.97); }

.btn-primary {
  background: var(--red);
  color: #fff;
  box-shadow: 0 4px 16px rgba(227,30,36,.3);
}
.btn-primary:hover { background: var(--red-dk); box-shadow: 0 6px 22px rgba(227,30,36,.4); }

.btn-secondary {
  background: var(--white);
  color: var(--text);
  border: 1.5px solid var(--border);
}
.btn-secondary:hover { background: #f5f5f5; }

.btn-reward {
  background: var(--white);
  color: var(--red);
  border: 1.5px solid var(--red);
}
.btn-reward:hover { background: var(--red-lt); }

.btn-start {
  background: var(--red);
  color: #fff;
  font-size: 18px;
  padding: 17px 40px;
  box-shadow: 0 6px 24px rgba(227,30,36,.35);
  width: 100%;
  max-width: 320px;
}
.btn-start:hover { background: var(--red-dk); transform: translateY(-2px); }

/* ── REWARD ── */
.reward-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  animation: fadeUp .5s ease;
  width: 100%;
}
.reward-title {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(28px, 7vw, 44px);
  color: var(--red);
  letter-spacing: -1px;
}
.reward-stars { display: flex; gap: 6px; font-size: 36px; }
.reward-stars span { animation: starPop .4s ease backwards; }
.reward-cleared { font-size: 14px; color: var(--muted); }

.reward-coupon {
  background: var(--white);
  border: 2px dashed var(--red);
  border-radius: 18px;
  padding: 22px 28px;
  width: 100%;
  position: relative;
  overflow: hidden;
}
.reward-coupon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(227,30,36,.04) 0%, transparent 70%);
}
.coupon-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--muted);
  margin-bottom: 6px;
  font-weight: 700;
}
.coupon-value {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 36px;
  color: var(--red);
  letter-spacing: -1px;
}
.coupon-desc {
  font-size: 13px;
  color: var(--muted);
  margin-top: 4px;
}
.coupon-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 10px;
}
.coupon-divider span:first-child,
.coupon-divider span:last-child {
  flex: 1;
  height: 1px;
  background: var(--border);
  display: block;
}
.coupon-code-label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 1px;
  white-space: nowrap;
}
.coupon-code {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 22px;
  color: var(--text);
  letter-spacing: 3px;
  background: var(--cream);
  padding: 10px 20px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
}

/* ── TARGET BANNER (reveal 전용) ── */
.target-banner {
  width: 100%;
  background: linear-gradient(135deg, #fff5f5, #fff);
  border: 2px solid var(--red);
  border-radius: 18px;
  padding: 18px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(227,30,36,.12);
  animation: bannerPop .4s cubic-bezier(0.34,1.56,0.64,1);
}
.target-banner-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--red);
  margin-bottom: 10px;
  letter-spacing: -0.2px;
}
.target-banner-food {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}
.target-banner-emoji {
  font-size: 52px;
  animation: float 1.8s ease-in-out infinite;
  display: inline-block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.15));
}
.target-banner-name {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 38px;
  color: var(--text);
  letter-spacing: -1px;
}
.target-banner-hint {
  font-size: 12px;
  color: var(--muted);
}

/* ── KEYFRAMES ── */
@keyframes bannerPop {
  0%   { opacity: 0; transform: scale(0.92) translateY(-8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
@keyframes correctBounce {
  0%   { transform: translateY(0) scale(1); }
  30%  { transform: translateY(-16px) scale(1.05); }
  60%  { transform: translateY(0) scale(.97); }
  80%  { transform: translateY(-6px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes confettiFall {
  0%   { top: -10px; opacity: 1; transform: rotate(0deg) translateX(0); }
  100% { top: 110vh; opacity: 0; transform: rotate(720deg) translateX(50px); }
}
@keyframes starPop {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
  70%  { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
</style>
