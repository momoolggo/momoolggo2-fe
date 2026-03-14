<template>
  <div class="game-page">
    <!-- CONFETTI -->
    <div class="confetti-wrap" v-if="showConfetti">
      <div
        v-for="c in confetti"
        :key="c.id"
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
      <div class="logo">🏆 푸드 컵챌린지</div>
      <div class="stage-badge">
        <div
          v-for="i in 5"
          :key="i"
          class="stage-dot"
          :class="{
            active: i === currentStage && gameState !== 'intro',
            done: i < currentStage || (i === currentStage && gameState === 'reward'),
          }"
        />
      </div>
    </header>

    <!-- MAIN -->
    <div class="game-wrap">

      <!-- ── INTRO ── -->
      <div class="intro-screen" v-if="gameState === 'intro'">
        <div class="intro-title">컵 야바위<br>푸드 챌린지</div>
        <div class="food-preview">
          <span>🍔</span><span>🍗</span><span>🍕</span>
        </div>
        <div class="intro-sub">
          컵 밑에 숨겨진 음식을 기억하세요!<br>
          섞이는 컵을 눈으로 따라가며 정확한 컵을 선택하세요.<br>
          1단계부터 5단계까지 점점 빨라집니다!
        </div>
        <button class="btn btn-start" @click="startGame">🎮 게임 시작</button>
      </div>

      <!-- ── GAME ACTIVE ── -->
      <template v-if="['watch','countdown','shuffle','pick','result'].includes(gameState)">

        <!-- Stage Info -->
        <div class="stage-info">
          <div class="stage-label">STAGE</div>
          <div class="stage-title">{{ currentStage }}단계 — {{ stageData.name }}</div>
          <div class="stage-desc">{{ stageData.desc }}</div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-chip target">
            🎯 찾아야 할 음식: {{ targetFood.emoji }} {{ targetFood.name }}
          </div>
          <div class="status-chip speed">⚡ 속도: {{ stageData.speedLabel }}</div>
          <div class="status-chip moves">🔀 이동 횟수: {{ stageData.moves }}회</div>
        </div>

        <!-- Instruction -->
        <div
          class="instruction"
          :class="`phase-${gameState === 'countdown' ? 'watch' : gameState}`"
        >
          <span v-if="gameState === 'watch'">👀 음식 위치를 기억하세요!</span>
          <span v-else-if="gameState === 'countdown'">
            <span class="countdown">{{ countdownNum }}</span>
          </span>
          <span v-else-if="gameState === 'shuffle'">🔀 눈으로 따라가세요!</span>
          <span v-else-if="gameState === 'pick'">
            👆 {{ targetFood.emoji }} {{ targetFood.name }}이(가) 든 컵을 선택하세요!
          </span>
          <span v-else-if="gameState === 'result' && lastCorrect">✅ 정답입니다!</span>
          <span v-else-if="gameState === 'result' && !lastCorrect">❌ 틀렸습니다!</span>
        </div>

        <!-- CUP ARENA -->
        <div class="arena">
          <div
            v-for="(cup, idx) in cups"
            :key="cup.id"
            class="cup-slot"
            :class="{
              lifted: cup.lifted,
              clickable: gameState === 'pick',
              'wrong-shake': cup.wrongShake,
              'correct-bounce': cup.correctBounce,
              'glow-hint': gameState === 'pick',
            }"
            :style="{ left: cup.x + 'px', transition: cup.transition }"
            @click="pickCup(idx)"
          >
            <div class="food-reveal" :class="cup.showFood ? 'visible' : 'hidden'">
              {{ cup.food.emoji }}
            </div>
            <div class="cup-body">
              <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" class="cup-svg">
                <defs>
                  <linearGradient :id="'cupGrad' + idx" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   :stop-color="cup.colorDark" />
                    <stop offset="50%"  :stop-color="cup.colorLight" />
                    <stop offset="100%" :stop-color="cup.colorDark" />
                  </linearGradient>
                  <linearGradient :id="'shineGrad' + idx" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stop-color="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <polygon points="15,20 105,20 95,130 25,130" :fill="`url(#cupGrad${idx})`" />
                <polygon points="20,22 55,22 48,80 22,80" :fill="`url(#shineGrad${idx})`" opacity="0.5" />
                <rect x="8" y="12" width="104" height="16" rx="8" :fill="cup.colorLight" />
                <text x="60" y="90" text-anchor="middle" font-size="28"
                  font-family="sans-serif" fill="rgba(255,255,255,0.35)">
                  {{ idx + 1 }}
                </text>
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
            다음 단계로 도전하거나 지금 보상을 받으세요.
          </div>
          <div class="result-sub" v-else-if="lastCorrect && currentStage === 5">
            🏆 <strong>모든 단계 클리어!</strong><br>최고의 실력을 보여주셨습니다!
          </div>
          <div class="result-sub" v-else>
            {{ targetFood.emoji }} {{ targetFood.name }}은(는)
            <strong>{{ correctCupNum }}번 컵</strong> 아래 있었어요!<br>
            처음부터 다시 도전해보세요.
          </div>
          <div class="btn-row">
            <template v-if="lastCorrect && currentStage < 5">
              <button class="btn btn-primary" @click="nextStage">⚡ {{ currentStage + 1 }}단계 도전!</button>
              <button class="btn btn-danger"  @click="claimReward">🎁 보상 받기</button>
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
          <span
            v-for="i in rewardStars"
            :key="i"
            :style="{ animationDelay: i * 0.1 + 's' }"
          >⭐</span>
        </div>
        <p class="reward-cleared">{{ currentStage }}단계까지 클리어하셨습니다!</p>
        <div class="reward-coupon">
          <div class="coupon-label">🎁 획득 보상</div>
          <div class="coupon-value">{{ reward.value }}</div>
          <div class="coupon-desc">{{ reward.desc }}</div>
        </div>
        <div class="coupon-code">
          쿠폰 코드: <strong>{{ reward.code }}</strong>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary"   @click="restartGame">🔄 다시 도전</button>
          <button class="btn btn-secondary" @click="goIntro">홈으로</button>
        </div>
      </div>

    </div><!-- /game-wrap -->
  </div><!-- /game-page -->
</template>

<script setup>
import { ref, computed } from 'vue'

// ── HELPERS ─────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── FOODS ────────────────────────────────────────────────
const FOODS = [
  { id: 0, emoji: '🍔', name: '햄버거' },
  { id: 1, emoji: '🍗', name: '치킨' },
  { id: 2, emoji: '🍕', name: '피자' },
]

// ── CUP COLORS ───────────────────────────────────────────
const CUP_COLORS = [
  { colorLight: '#ff6b6b', colorDark: '#c0392b' },
  { colorLight: '#4ecdc4', colorDark: '#1a9c8e' },
  { colorLight: '#ffd700', colorDark: '#e67e22' },
]

// ── CUP X POSITIONS ──────────────────────────────────────
const CUP_POSITIONS = [60, 260, 460]

// ── STAGE CONFIG ─────────────────────────────────────────
const STAGES = [
  { name: '워밍업',  desc: '느리고 단순하게 — 기본기를 익혀봐요',      moves: 4,  duration: 700, pause: 250, speedLabel: '느림',    reward: { value: '5% 할인',    desc: '전 메뉴 적용',          code: 'FOOD5OFF',   stars: 1 } },
  { name: '초급',    desc: '조금 빨라졌어요. 집중하세요!',              moves: 6,  duration: 520, pause: 180, speedLabel: '보통',    reward: { value: '10% 할인',   desc: '전 메뉴 적용',          code: 'FOOD10',     stars: 2 } },
  { name: '중급',    desc: '패턴이 복잡해지기 시작합니다',              moves: 9,  duration: 380, pause: 120, speedLabel: '빠름',    reward: { value: '15% 할인',   desc: '세트 메뉴 적용',        code: 'SET15',      stars: 3 } },
  { name: '고급',    desc: '눈도 손도 따라가기 힘들어요!',              moves: 12, duration: 260, pause: 80,  speedLabel: '매우 빠름', reward: { value: '무료 음료',  desc: '음료 1잔 무료',         code: 'FREEDRINK',  stars: 4 } },
  { name: '전설',    desc: '신의 눈을 가진 자만 통과할 수 있다',        moves: 16, duration: 160, pause: 40,  speedLabel: '초고속',  reward: { value: '무료 세트',   desc: '인기 세트 1개 무료!',   code: 'FREESET',    stars: 5 } },
]

// ── STATE ────────────────────────────────────────────────
const gameState     = ref('intro')   // intro | watch | countdown | shuffle | pick | result | reward
const currentStage  = ref(1)
const lastCorrect   = ref(false)
const correctCupNum = ref(0)
const countdownNum  = ref(3)
const showConfetti  = ref(false)
const confetti      = ref([])
const targetFood    = ref(FOODS[1])
const cups          = ref([])

// ── COMPUTED ─────────────────────────────────────────────
const stageData   = computed(() => STAGES[currentStage.value - 1])
const reward      = computed(() => stageData.value.reward)
const rewardStars = computed(() => reward.value.stars)

// ── INIT CUPS ────────────────────────────────────────────
function initCups() {
  targetFood.value = FOODS[Math.floor(Math.random() * FOODS.length)]
  const shuffled = [...FOODS].sort(() => Math.random() - 0.5)
  cups.value = [0, 1, 2].map((i) => ({
    id:           i,
    x:            CUP_POSITIONS[i],
    food:         shuffled[i],
    lifted:       false,
    showFood:     false,
    wrongShake:   false,
    correctBounce: false,
    transition:   'left 0.4s ease',
    ...CUP_COLORS[i],
  }))
}

// ── PHASES ───────────────────────────────────────────────
async function phaseWatch() {
  gameState.value = 'watch'
  await sleep(300)
  cups.value.forEach((c) => { c.lifted = true; c.showFood = true })
  await sleep(2200)
  cups.value.forEach((c) => { c.lifted = false })
  await sleep(600)
  cups.value.forEach((c) => { c.showFood = false })
  await sleep(200)
  await phaseCountdown()
}

async function phaseCountdown() {
  gameState.value = 'countdown'
  for (let n = 3; n >= 1; n--) {
    countdownNum.value = n
    await sleep(900)
  }
  phaseShuffle()
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

// ── SWAP ─────────────────────────────────────────────────
async function swapCups(a, b, duration) {
  const xa = cups.value[a].x
  const xb = cups.value[b].x
  const t  = `left ${duration}ms cubic-bezier(0.4,0,0.2,1)`
  cups.value[a].transition = t
  cups.value[b].transition = t
  cups.value[a].x = xb
  cups.value[b].x = xa
  await sleep(duration)
}

// ── GENERATE SWAPS ───────────────────────────────────────
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

// ── PICK CUP ─────────────────────────────────────────────
function pickCup(idx) {
  if (gameState.value !== 'pick') return
  const cup     = cups.value[idx]
  const correct = cup.food.id === targetFood.value.id
  lastCorrect.value   = correct
  correctCupNum.value = cups.value.findIndex((c) => c.food.id === targetFood.value.id) + 1

  if (correct) {
    cup.correctBounce = true
    triggerConfetti()
    setTimeout(() => { cup.correctBounce = false }, 700)
  } else {
    cup.wrongShake = true
    setTimeout(() => { cup.wrongShake = false }, 600)
  }

  cups.value.forEach((c) => { c.lifted = true; c.showFood = true })
  setTimeout(() => { gameState.value = 'result' }, 800)
}

// ── NAVIGATION ───────────────────────────────────────────
function startGame() {
  currentStage.value = 1
  beginStage()
}

function beginStage() {
  initCups()
  phaseWatch()
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
  gameState.value  = 'intro'
  showConfetti.value = false
}

// ── CONFETTI ─────────────────────────────────────────────
function triggerConfetti() {
  const colors = ['#ffd700','#ff6b6b','#4ecdc4','#00ff88','#ff8c00','#e056fd','#ffffff']
  confetti.value = Array.from({ length: 80 }, (_, i) => ({
    id:    i,
    x:     Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size:  6 + Math.random() * 10,
    dur:   2 + Math.random() * 2,
    delay: Math.random() * 1.5,
    round: Math.random() > 0.5,
  }))
  showConfetti.value = true
  setTimeout(() => { showConfetti.value = false }, 5000)
}
</script>

<style scoped>
/* ── RESET & ROOT ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.game-page {
  --bg:      #0d0d0d;
  --surface: #1a1a2e;
  --card:    #16213e;
  --accent:  #e94560;
  --gold:    #ffd700;
  --neon:    #00f5ff;
  --green:   #00ff88;
  --orange:  #ff8c00;
  --text:    #f0f0f0;
  --muted:   #888;

  min-height: 100vh;
  background: var(--bg);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(233,69,96,.07) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(0,245,255,.05) 0%, transparent 60%);
  color: var(--text);
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── CONFETTI ── */
.confetti-wrap {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  overflow: hidden;
}
.confetti-piece {
  position: absolute;
  top: -10px;
  animation: confettiFall linear forwards;
}

/* ── HEADER ── */
.header {
  width: 100%;
  padding: 18px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.06);
  background: rgba(13,13,13,.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 20px;
  color: var(--gold);
  text-shadow: 0 0 20px rgba(255,215,0,.4);
}
.stage-badge { display: flex; gap: 8px; align-items: center; }
.stage-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #333;
  transition: all .4s;
}
.stage-dot.active { background: var(--gold); box-shadow: 0 0 8px var(--gold); }
.stage-dot.done   { background: var(--green); box-shadow: 0 0 6px var(--green); }

/* ── MAIN WRAP ── */
.game-wrap {
  width: 100%;
  max-width: 680px;
  padding: 40px 20px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* ── INTRO ── */
.intro-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  animation: fadeUp .7s ease;
}
.intro-title {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(38px, 8vw, 68px);
  line-height: 1.1;
  color: var(--gold);
  text-shadow: 0 0 40px rgba(255,215,0,.5), 0 4px 0 rgba(0,0,0,.5);
}
.intro-sub {
  font-size: 16px;
  color: var(--muted);
  max-width: 400px;
  line-height: 1.8;
}
.food-preview { display: flex; gap: 24px; font-size: 52px; }
.food-preview span { animation: float 3s ease-in-out infinite; display: inline-block; }
.food-preview span:nth-child(2) { animation-delay: .4s; }
.food-preview span:nth-child(3) { animation-delay: .8s; }

/* ── STAGE INFO ── */
.stage-info { text-align: center; animation: fadeUp .5s ease; }
.stage-label {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.stage-title {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(24px, 5vw, 38px);
  color: var(--gold);
  text-shadow: 0 0 20px rgba(255,215,0,.4);
}
.stage-desc { font-size: 13px; color: var(--muted); margin-top: 4px; }

/* ── STATUS BAR ── */
.status-bar { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.status-chip {
  padding: 7px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.04);
}
.status-chip.target { border-color: rgba(0,245,255,.4); color: var(--neon); }
.status-chip.speed  { border-color: rgba(233,69,96,.4);  color: var(--accent); }
.status-chip.moves  { border-color: rgba(255,140,0,.4);  color: var(--orange); }

/* ── INSTRUCTION ── */
.instruction {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(18px, 4vw, 28px);
  text-align: center;
  min-height: 44px;
  transition: all .3s;
}
.phase-watch   { color: var(--neon);   text-shadow: 0 0 20px rgba(0,245,255,.5); }
.phase-shuffle { color: var(--orange); text-shadow: 0 0 20px rgba(255,140,0,.4); }
.phase-pick    { color: var(--green);  text-shadow: 0 0 20px rgba(0,255,136,.4); }
.phase-result  { color: var(--gold); }

.countdown {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 80px;
  color: var(--accent);
  text-shadow: 0 0 40px rgba(233,69,96,.6);
  animation: countPop .4s ease;
  display: inline-block;
}

/* ── ARENA ── */
.arena {
  width: 100%;
  max-width: 640px;
  position: relative;
  height: 260px;
  display: flex;
  align-items: flex-end;
}

.cup-slot {
  position: absolute;
  bottom: 0;
  width: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}
.cup-slot.clickable { cursor: pointer; }
.cup-slot.clickable:hover .cup-body { filter: brightness(1.18); transform: scale(1.04); }
.cup-slot.glow-hint .cup-body {
  box-shadow: 0 0 0 2px rgba(0,245,255,.4);
  border-radius: 8px;
}
.cup-slot.wrong-shake   { animation: wrongShake .5s ease; }
.cup-slot.correct-bounce { animation: correctBounce .6s ease; }

.food-reveal {
  font-size: 40px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .3s;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,.5));
}
.food-reveal.hidden  { opacity: 0; transform: scale(.6); }
.food-reveal.visible { opacity: 1; transform: scale(1); }

.cup-body {
  width: 110px;
  height: 130px;
  transition: filter .2s, transform .2s;
}
.cup-svg { width: 100%; height: 100%; }

/* Lift animation */
.cup-slot.lifted .cup-body {
  transform: translateY(-86px) !important;
  transition: transform .45s cubic-bezier(.4,0,.2,1) !important;
}

/* ── RESULT PANEL ── */
.result-panel {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, rgba(22,33,62,.92), rgba(26,26,46,.92));
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  backdrop-filter: blur(20px);
  animation: fadeUp .5s ease;
  position: relative;
  overflow: hidden;
}
.result-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--gold), var(--green));
}
.result-emoji { font-size: 58px; margin-bottom: 10px; }
.result-title {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 30px;
  margin-bottom: 8px;
}
.result-title.success { color: var(--gold); text-shadow: 0 0 20px rgba(255,215,0,.5); }
.result-title.fail    { color: var(--accent); }
.result-sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.7; }
.result-sub strong { color: var(--text); }

/* ── BUTTONS ── */
.btn-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn {
  padding: 13px 26px;
  border-radius: 12px;
  font-family: 'Black Han Sans', sans-serif;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition: all .2s;
  letter-spacing: .4px;
}
.btn:active { transform: scale(.96); }
.btn-primary {
  background: linear-gradient(135deg, var(--gold), #ff9500);
  color: #000;
  box-shadow: 0 4px 20px rgba(255,215,0,.35);
}
.btn-primary:hover { box-shadow: 0 6px 28px rgba(255,215,0,.5); transform: translateY(-2px); }
.btn-secondary {
  background: rgba(255,255,255,.08);
  color: var(--text);
  border: 1px solid rgba(255,255,255,.15);
}
.btn-secondary:hover { background: rgba(255,255,255,.14); }
.btn-danger {
  background: linear-gradient(135deg, var(--accent), #c0392b);
  color: #fff;
  box-shadow: 0 4px 20px rgba(233,69,96,.35);
}
.btn-danger:hover { box-shadow: 0 6px 28px rgba(233,69,96,.5); transform: translateY(-2px); }
.btn-start {
  background: linear-gradient(135deg, var(--accent), #c0392b);
  color: #fff;
  font-size: 18px;
  padding: 16px 44px;
  box-shadow: 0 8px 32px rgba(233,69,96,.4);
}
.btn-start:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(233,69,96,.5); }

/* ── REWARD ── */
.reward-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  animation: fadeUp .6s ease;
}
.reward-title {
  font-family: 'Black Han Sans', sans-serif;
  font-size: clamp(30px, 7vw, 56px);
  color: var(--gold);
  text-shadow: 0 0 40px rgba(255,215,0,.6);
}
.reward-stars { display: flex; gap: 8px; font-size: 44px; }
.reward-stars span { animation: starPop .4s ease backwards; }
.reward-cleared { font-size: 15px; color: var(--muted); }
.reward-coupon {
  background: linear-gradient(135deg, #1e1e2e, #2a1a3e);
  border: 2px dashed var(--gold);
  border-radius: 20px;
  padding: 26px 40px;
  position: relative;
  overflow: hidden;
}
.reward-coupon::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: conic-gradient(transparent, rgba(255,215,0,.05), transparent 30%);
  animation: rotateSlow 8s linear infinite;
}
.coupon-label { font-size: 11px; letter-spacing: 3px; color: var(--muted); margin-bottom: 6px; }
.coupon-value {
  font-family: 'Black Han Sans', sans-serif;
  font-size: 40px;
  color: var(--gold);
}
.coupon-desc { font-size: 13px; color: var(--muted); margin-top: 4px; }
.coupon-code { font-size: 13px; color: var(--muted); }
.coupon-code strong { color: var(--gold); letter-spacing: 2px; }

/* ── KEYFRAMES ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
@keyframes countPop {
  0%   { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}
@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-10px); }
  40%       { transform: translateX(10px); }
  60%       { transform: translateX(-7px); }
  80%       { transform: translateX(7px); }
}
@keyframes correctBounce {
  0%   { transform: translateY(0) scale(1); }
  30%  { transform: translateY(-20px) scale(1.06); }
  60%  { transform: translateY(0) scale(.97); }
  80%  { transform: translateY(-8px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes confettiFall {
  0%   { top: -10px; opacity: 1; transform: rotate(0deg) translateX(0); }
  100% { top: 110vh; opacity: 0; transform: rotate(720deg) translateX(60px); }
}
@keyframes starPop {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
  70%  { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes rotateSlow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
