<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'

// ── STATE ──────────────────────────────────────────────────────────────
const intimacy     = ref(720)
const maxIntimacy  = ref(1000)
const level        = ref(5)
const meals        = ref(28)
const points       = ref(4280)
const streak       = ref(12)
const monthCount   = ref(12)
const checkedInToday = ref(true) // demo: already checked in

const selectedPetEmoji = ref('🐱')
const selectedPetName  = ref('모찌')
const tempEmoji        = ref('🐱')
const tempName         = ref('모찌')

// equip state
const equippedAcc     = ref('🎩')
const equippedBgFrom  = ref('#FFF0E8')
const equippedBgTo    = ref('#FFE0C8')
const equippedGround  = ref('#FFE0C8')
const activeEffect    = ref(null) // 'rainbow'|'stars'|'fire'|'hearts'|null

// shop owned sets
const ownedAcc    = reactive(new Set(['hat1']))
const ownedBg     = reactive(new Set(['bg1']))
const ownedGround = reactive(new Set(['gr1']))
const ownedEffect = reactive(new Set())

const equippedAccId    = ref('hat1')
const equippedBgId     = ref('bg1')
const equippedGroundId = ref('gr1')
const equippedEffectId = ref(null)

// pat cooldown
const patCooldownUntil = ref(0)
const patRemainLabel   = ref('')
let patInterval = null

// calendar
const today    = new Date(2025, 5, 12)
const calYear  = ref(today.getFullYear())
const calMonth = ref(today.getMonth())
const attendedDays = reactive(new Set([1,2,3,4,5,6,7,8,9,10,11,12]))

// modals
const showAttendance  = ref(false)
const showPetSelect   = ref(false)
const activeView      = ref('pet')
const activeShopTab   = ref('acc')
const activeRankTab   = ref('전국')

// toast
const toastMsg     = ref('')
const toastVisible = ref(false)
let toastTimer = null

// points popup
const ptsPopupVisible = ref(false)
const ptsPopupAmount  = ref(0)
const ptsPopupReason  = ref('')
let ptsPopupTimer = null

// effect particles (for equipped effects)
const effectParticles = ref([])
let effectInterval = null

// points history
const pointsHistory = reactive([
  { icon: '⬆️', name: 'Lv.5 달성 보상',   date: '2025.06.10', value: '+500P' },
  { icon: '📅', name: '7일 연속출석',       date: '2025.06.08', value: '+200P' },
  { icon: '☕', name: 'Lv.1 달성 보상',    date: '2025.06.01', value: '+100P' },
])

// ── SHOP DATA ──────────────────────────────────────────────────────────
const accessories = [
  { id:'hat1', emoji:'🎩', name:'마법사 모자', desc:'신비로운 마법사의 아이템', price:0,   rarity:'common'   },
  { id:'hat2', emoji:'👑', name:'황금 왕관',   desc:'전설의 왕관, 최고의 펫에게', price:300, rarity:'rare'     },
  { id:'hat3', emoji:'🎀', name:'핑크 리본',   desc:'사랑스러운 큐티 리본',      price:200, rarity:'common',  isNew:true },
  { id:'hat4', emoji:'😎', name:'쿨 선글라스', desc:'힙스터 바이브',             price:250, rarity:'common'   },
  { id:'hat5', emoji:'🌸', name:'벚꽃 머리띠', desc:'봄바람처럼 상큼하게',       price:180, rarity:'common'   },
  { id:'hat6', emoji:'🎓', name:'졸업 모자',   desc:'공부 잘하는 내 펫',         price:320, rarity:'uncommon' },
  { id:'hat7', emoji:'🦋', name:'나비 핀',     desc:'날아갈 것 같은 가벼움',     price:220, rarity:'uncommon', isNew:true },
  { id:'hat8', emoji:'🌈', name:'무지개 머리', desc:'레인보우 헤어 전설',        price:500, rarity:'legendary' },
]

const backgrounds = [
  { id:'bg1', emoji:'🌅', name:'포근한 오후',  desc:'따스한 햇살이 비치는 오후',      price:0,   fromColor:'#FFF0E8', toColor:'#FFE0C8', sceneBg:'linear-gradient(180deg,#FFF5EE,#FFE8D8)' },
  { id:'bg2', emoji:'🌊', name:'에메랄드 해변', desc:'파도 소리가 들리는 맑은 바다',   price:400, fromColor:'#B8E8FF', toColor:'#70C8FF', sceneBg:'linear-gradient(180deg,#B8E8FF,#70C8F0)' },
  { id:'bg3', emoji:'🌃', name:'별빛 야경',    desc:'반짝이는 도시의 밤하늘',         price:500, fromColor:'#0A0A2E', toColor:'#1E0A4E', sceneBg:'linear-gradient(180deg,#0A0A2E,#1E0A4E)' },
  { id:'bg4', emoji:'🌸', name:'벚꽃 공원',   desc:'흩날리는 분홍빛 꽃잎 속으로',    price:450, fromColor:'#FFD6E8', toColor:'#FFB0D0', sceneBg:'linear-gradient(180deg,#FFD6E8,#FFB8D8)' },
  { id:'bg5', emoji:'🌿', name:'마법의 숲',   desc:'신비한 초록빛 요정의 숲',         price:350, fromColor:'#C8F0C8', toColor:'#90D890', sceneBg:'linear-gradient(180deg,#C8F0C0,#90D880)' },
  { id:'bg6', emoji:'🏜️', name:'황금 사막',   desc:'모험이 시작되는 모래언덕',        price:420, fromColor:'#FFE8A0', toColor:'#FFD060', sceneBg:'linear-gradient(180deg,#FFE8A0,#FFD060)' },
]

const grounds = [
  { id:'gr1', color:'#E8C89A', name:'흙길 산책로',  desc:'포근한 황토 흙길',       price:0   },
  { id:'gr2', color:'#60C060', name:'촉촉한 잔디',  desc:'생기 넘치는 초록 잔디',  price:200 },
  { id:'gr3', color:'#F0D89A', name:'모래사장',      desc:'발가락 사이 고운 모래',  price:250 },
  { id:'gr4', color:'#B8DCFF', name:'눈밭',          desc:'뽀드득 밟히는 순백 눈',  price:300 },
  { id:'gr5', color:'#8060D0', name:'우주 플랫폼',   desc:'은하계를 밟고 서있어',   price:480, isNew:true },
  { id:'gr6', color:'#FF9090', name:'딸기 케이크',   desc:'달콤한 케이크 위에서',   price:400, isNew:true },
]

const effects = [
  {
    id:'eff1', emoji:'🌈', name:'오로라 오라',
    desc:'몸 주위를 감싸는 무지개빛 오라',
    price:600, rarity:'rare',
    previewStyle:'background:conic-gradient(#FF6B35,#FF4E8A,#7B5EA7,#06D6A0,#FFD166,#FF6B35);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:brightness(1.2)',
  },
  {
    id:'eff2', emoji:'⭐', name:'별똥별 폭죽',
    desc:'레벨업 시 별들이 쏟아져요',
    price:550, rarity:'uncommon', isNew:true,
    previewStyle:'color:#FFD166;filter:drop-shadow(0 0 8px #FFD166)',
  },
  {
    id:'eff3', emoji:'🔥', name:'불꽃 오라',
    desc:'강렬한 에너지의 불꽃 오라',
    price:700, rarity:'rare',
    previewStyle:'color:#FF4500;filter:drop-shadow(0 0 10px #FF6600)',
  },
  {
    id:'eff4', emoji:'💝', name:'하트 샤워',
    desc:'쓰다듬을 때마다 하트가 내려요',
    price:480, rarity:'common',
    previewStyle:'color:#FF4E8A;filter:drop-shadow(0 0 6px #FF4E8A)',
  },
  {
    id:'eff5', emoji:'❄️', name:'눈결정 오라',
    desc:'겨울 왕국의 얼음 오라',
    price:620, rarity:'uncommon',
    previewStyle:'color:#B0E0FF;filter:drop-shadow(0 0 8px #B0E0FF)',
  },
  {
    id:'eff6', emoji:'✨', name:'황금 스파클',
    desc:'황금빛이 반짝반짝 빛나요',
    price:800, rarity:'legendary', isNew:true,
    previewStyle:'color:#FFD700;filter:drop-shadow(0 0 12px #FFD700)',
  },
]

const rarityConfig = {
  common:    { label:'일반',   color:'#9B9B9B', bg:'#F5F5F5' },
  uncommon:  { label:'희귀',   color:'#06D6A0', bg:'#E8FFF8' },
  rare:      { label:'레어',   color:'#7B5EA7', bg:'#F0E8FF' },
  legendary: { label:'전설',   color:'#FF9F43', bg:'#FFF5E0' },
}

// ── COMPUTED ────────────────────────────────────────────────────────────
const intimacyPct = computed(() =>
  Math.min(100, Math.round(intimacy.value / maxIntimacy.value * 100))
)
const petFontSize = computed(() =>
  Math.min(88 + (level.value - 5) * 4, 120) + 'px'
)
const calDays = computed(() => {
  const firstDay    = new Date(calYear.value, calMonth.value, 1).getDay()
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push({ key: 'e' + i, empty: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday    = calYear.value === today.getFullYear() && calMonth.value === today.getMonth() && d === today.getDate()
    const isFuture   = new Date(calYear.value, calMonth.value, d) > today
    const isAttended = calYear.value === today.getFullYear() && calMonth.value === today.getMonth() && attendedDays.has(d)
    days.push({ key: d, d, isToday, isFuture, isAttended })
  }
  return days
})
const calMonthLabel = computed(() => {
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  return calYear.value + '년 ' + months[calMonth.value]
})
const patOnCooldown = computed(() => patCooldownUntil.value > Date.now())
const currentBg = computed(() => {
  const bg = backgrounds.find(b => b.id === equippedBgId.value)
  return bg ? bg.sceneBg : 'linear-gradient(180deg,#FFF5EE,#FFE8D8)'
})

// ── POINTS ───────────────────────────────────────────────────────────────
const fmtPts = computed(() => points.value.toLocaleString())

function addPoints(amount, reason) {
  points.value += amount
  ptsPopupAmount.value = amount
  ptsPopupReason.value = reason
  ptsPopupVisible.value = true
  pointsHistory.unshift({ icon:'6️⃣', name: reason, date: todayDateStr(), value: '+' + amount + 'P' })
  clearTimeout(ptsPopupTimer)
  ptsPopupTimer = setTimeout(() => { ptsPopupVisible.value = false }, 2200)
}
function spendPoints(amount) {
  if (points.value < amount) { showToast('포인트가 부족해요 '); return false }
  points.value -= amount
  pointsHistory.unshift({ icon:'🛍️', name:'아이템 구매', date: todayDateStr(), value: '-' + amount + 'P' })
  return true
}
function todayDateStr() {
  const n = new Date()
  return n.getFullYear() + '.' + String(n.getMonth()+1).padStart(2,'0') + '.' + String(n.getDate()).padStart(2,'0')
}

// ── PAT ───────────────────────────────────────────────────────────────────
const petPopAnim = ref(false)

function petPat() {
  if (patOnCooldown.value) {
    const remain = patCooldownUntil.value - Date.now()
    const m = Math.floor(remain / 60000), s = Math.floor((remain % 60000) / 1000)
    showToast('⏱️ 쓰다듬기 쿨타임: ' + m + '분 ' + s + '초 남음')
    return
  }
  patCooldownUntil.value = Date.now() + 30 * 60 * 1000
  startPatTimer()
  intimacy.value = Math.min(maxIntimacy.value, intimacy.value + 5)
  showToast(selectedPetName.value + '가 기뻐해요! +5 친밀도 💕')
  triggerPetPop()
  spawnEffectParticle()
  if (intimacy.value >= maxIntimacy.value) setTimeout(levelUp, 600)
}

function triggerPetPop() {
  petPopAnim.value = false
  setTimeout(() => { petPopAnim.value = true }, 10)
  setTimeout(() => { petPopAnim.value = false }, 500)
}

function startPatTimer() {
  clearInterval(patInterval)
  patInterval = setInterval(() => {
    const remain = patCooldownUntil.value - Date.now()
    if (remain <= 0) {
      clearInterval(patInterval)
      patRemainLabel.value = ''
      return
    }
    const m = Math.floor(remain / 60000), s = Math.floor((remain % 60000) / 1000)
    patRemainLabel.value = m + ':' + String(s).padStart(2,'0')
  }, 1000)
}

// ── EFFECT PARTICLES ──────────────────────────────────────────────────────
function spawnEffectParticle() {
  if (!activeEffect.value) return
  const cfg = {
    rainbow: { emojis:['🌈','✨','💫'], color:'hsl(' + Math.random()*360 + ',100%,60%)' },
    stars:   { emojis:['⭐','🌟','💛'], color:'#FFD700' },
    fire:    { emojis:['🔥','✨','🔶'], color:'#FF4500' },
    hearts:  { emojis:['💝','💖','💕'], color:'#FF4E8A' },
    snow:    { emojis:['❄️','🌨️','💙'], color:'#B0E0FF' },
    gold:    { emojis:['✨','💛','⭐'], color:'#FFD700' },
  }[activeEffect.value]
  if (!cfg) return
  for (let i = 0; i < 6; i++) {
    effectParticles.value.push({
      id: Date.now() + i,
      emoji: cfg.emojis[Math.floor(Math.random() * cfg.emojis.length)],
      x: 30 + Math.random() * 40,
      dur: 0.8 + Math.random() * 0.6,
      delay: i * 0.08,
    })
  }
  setTimeout(() => { effectParticles.value = [] }, 2000)
}

// ── INTIMACY / LEVELUP ────────────────────────────────────────────────────
function giveSnack() {
  intimacy.value = Math.min(maxIntimacy.value, intimacy.value + 20)
  meals.value++
  showToast('🍔 간식을 줬어요! +20 친밀도')
  if (intimacy.value >= maxIntimacy.value) setTimeout(levelUp, 600)
}
function levelUp() {
  level.value++
  intimacy.value = 0
  maxIntimacy.value = Math.round(maxIntimacy.value * 1.3)
  showToast('🎉 레벨업! Lv.' + level.value + ' 달성!')
  setTimeout(() => addPoints(level.value * 100, 'Lv.' + level.value + ' 달성 보상'), 600)
}

// ── ATTENDANCE ────────────────────────────────────────────────────────────
const attRewardSchedule = [
  { day:1,  pts:30,  emoji:'🤍', special:false },
  { day:2,  pts:30,  emoji:'🤍', special:false },
  { day:3,  pts:50,  emoji:'🧡', special:true  },
  { day:4,  pts:30,  emoji:'🤍', special:false },
  { day:5,  pts:30,  emoji:'🤍', special:false },
  { day:6,  pts:50,  emoji:'🧡', special:true  },
  { day:7,  pts:200, emoji:'🎁', special:true  },
  { day:8,  pts:30,  emoji:'🤍', special:false },
  { day:9,  pts:30,  emoji:'🤍', special:false },
  { day:10, pts:100, emoji:'✨', special:true  },
  { day:11, pts:30,  emoji:'🤍', special:false },
  { day:12, pts:30,  emoji:'🤍', special:false },
  { day:13, pts:30,  emoji:'🤍', special:false },
  { day:14, pts:50,  emoji:'🧡', special:true  },
  { day:15, pts:100, emoji:'✨', special:true  },
  { day:30, pts:500, emoji:'🎖️', special:true  },
]

function doCheckIn() {
  if (checkedInToday.value) return
  checkedInToday.value = true
  streak.value++
  monthCount.value++
  attendedDays.add(today.getDate())
  let pts = 30, reason = '일일 출석 체크'
  if (streak.value % 7 === 0) { pts = 200; reason = streak.value + '일 연속 출석 보너스!' }
  else if (streak.value % 10 === 0) { pts = 100; reason = streak.value + '일 누적 출석!' }
  addPoints(pts, reason)
  showToast('출석 완료! +' + pts + 'P 획득 🎉')
}

function changeCalMonth(d) {
  calMonth.value += d
  if (calMonth.value < 0) { calMonth.value = 11; calYear.value-- }
  if (calMonth.value > 11) { calMonth.value = 0; calYear.value++ }
}

// ── SHOP ─────────────────────────────────────────────────────────────────
function buyAcc(item) {
  if (ownedAcc.has(item.id)) { equipAcc(item); return }
  if (!spendPoints(item.price)) return
  ownedAcc.add(item.id)
  equipAcc(item)
  showToast('✅ ' + item.name + ' 구매 완료!')
}
function equipAcc(item) {
  equippedAccId.value = item.id
  equippedAcc.value = item.emoji
  showToast('✨ ' + item.name + ' 장착 완료!')
}

function buyBg(item) {
  if (ownedBg.has(item.id)) { equipBg(item); return }
  if (!spendPoints(item.price)) return
  ownedBg.add(item.id)
  equipBg(item)
  showToast('✅ ' + item.name + ' 구매 완료!')
}
function equipBg(item) {
  equippedBgId.value = item.id
  showToast('🌄 ' + item.name + ' 장착 완료!')
}

function buyGround(item) {
  if (ownedGround.has(item.id)) { equipGround(item); return }
  if (!spendPoints(item.price)) return
  ownedGround.add(item.id)
  equipGround(item)
  showToast('✅ ' + item.name + ' 구매 완료!')
}
function equipGround(item) {
  equippedGroundId.value = item.id
  equippedGround.value = item.color
  showToast('🌿 ' + item.name + ' 장착 완료!')
}

const effectMap = { eff1:'rainbow', eff2:'stars', eff3:'fire', eff4:'hearts', eff5:'snow', eff6:'gold' }

function buyEffect(item) {
  if (ownedEffect.has(item.id)) { equipEffect(item); return }
  if (!spendPoints(item.price)) return
  ownedEffect.add(item.id)
  equipEffect(item)
  showToast('✅ ' + item.name + ' 구매 완료!')
}
function equipEffect(item) {
  if (equippedEffectId.value === item.id) {
    equippedEffectId.value = null
    activeEffect.value = null
    showToast('효과를 해제했어요')
    return
  }
  equippedEffectId.value = item.id
  activeEffect.value = effectMap[item.id]
  showToast('✨ ' + item.name + ' 장착 완료!')
  spawnEffectParticle()
}

// ── PET SELECT ────────────────────────────────────────────────────────────
function selectPet(emoji, name) { tempEmoji.value = emoji; tempName.value = name }
function confirmPetSelect() {
  selectedPetEmoji.value = tempEmoji.value
  selectedPetName.value  = tempName.value
  showPetSelect.value = false
  showToast(selectedPetEmoji.value + ' ' + selectedPetName.value + '(이)가 내 펫이 됐어요!')
}

// ── REWARD ────────────────────────────────────────────────────────────────
const claimedRewards = reactive(new Set())
function claimReward(id) {
  claimedRewards.add(id)
  showToast('🎁 보상 수령 완료!')
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  toastMsg.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2400)
}

// ── LIFECYCLE ────────────────────────────────────────────────────────────
onUnmounted(() => {
  clearInterval(patInterval)
  clearTimeout(toastTimer)
  clearTimeout(ptsPopupTimer)
})
</script>

<template>
<div class="pet-app">

  <!-- TOP NAV -->
  <div class="top-nav">
    <div class="app-logo">🍱 뭐물꼬딜리버리</div>
    <div class="top-points" @click="activeView='reward'">
      <span>💰</span>
      <span class="top-pts-val">{{ fmtPts }}</span>
      <span class="top-pts-p">P</span>
    </div>
  </div>

  <!-- SCROLL AREA -->
  <div class="scroll-area">

    <!-- ───── MY PET ───── -->
    <div v-show="activeView==='pet'" class="view">

      <!-- Pet Header / Scene -->
      <div class="pet-header">
        <div class="pet-name-row">
          <span class="pet-name">{{ selectedPetName }}</span>
          <span class="level-badge">Lv.{{ level }}</span>
        </div>
        <div class="owner-name">김민준님의 펫 친구 🍀</div>

        <div class="pet-scene" :style="{ background: currentBg }">
          <!-- effect particles -->
          <div
            v-for="p in effectParticles" :key="p.id"
            class="effect-particle"
            :style="{ left: p.x + '%', animationDuration: p.dur + 's', animationDelay: p.delay + 's' }"
          >{{ p.emoji }}</div>

          <div class="pet-sparkle">✨</div>
          <div class="pet-sparkle2">⭐</div>

          <!-- accessory -->
          <div v-if="equippedAcc" class="pet-accessory">{{ equippedAcc }}</div>

          <!-- pet emoji -->
          <div
            class="pet-emoji"
            :class="{ pop: petPopAnim, 'has-rainbow': activeEffect==='rainbow', 'has-fire': activeEffect==='fire', 'has-snow': activeEffect==='snow', 'has-gold': activeEffect==='gold' }"
            :style="{ fontSize: petFontSize }"
            @click="petPat"
          >{{ selectedPetEmoji }}</div>

          <div class="pet-ground" :style="{ background: equippedGround }"></div>
        </div>
      </div>

      <!-- Pat cooldown bar -->
      <div class="cooldown-row">
        <div class="cooldown-label">
          <span>👋 쓰다듬기 쿨타임</span>
          <span class="cooldown-time" :class="{ ready: !patOnCooldown }">
            {{ patOnCooldown ? patRemainLabel + ' 후 가능' : '준비완료!' }}
          </span>
        </div>
        <div class="cooldown-track">
          <div class="cooldown-fill" :style="{ width: patOnCooldown ? '40%' : '100%', background: patOnCooldown ? '#FFB347' : '#06D6A0' }"></div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-pill">
          <div class="stat-icon">🤝</div>
          <div class="stat-value">{{ intimacy }}</div>
          <div class="stat-label">친밀도</div>
        </div>
        <div class="stat-pill">
          <div class="stat-icon">🍖</div>
          <div class="stat-value">{{ meals }}</div>
          <div class="stat-label">준 간식</div>
        </div>
        <div class="stat-pill clickable" @click="showAttendance=true">
          <div class="stat-icon">📅</div>
          <div class="stat-value">{{ streak }}</div>
          <div class="stat-label">연속출석</div>
        </div>
        <div class="stat-pill">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">4위</div>
          <div class="stat-label">전국순위</div>
        </div>
      </div>

      <!-- Intimacy bar -->
      <div class="intimacy-section">
        <div class="intimacy-header">
          <span class="intimacy-title">💕 친밀도 게이지</span>
          <span class="intimacy-count">{{ intimacy }} / {{ maxIntimacy }}</span>
        </div>
        <div class="bar-track"><div class="bar-fill" :style="{ width: intimacyPct + '%' }"></div></div>
        <div class="levelup-hint">레벨업까지 <span>{{ maxIntimacy - intimacy }}</span>점 남음 🔥</div>
      </div>

      <!-- Action buttons -->
      <div class="action-section">
        <div class="action-title">오늘 할 일</div>
        <div class="action-grid">
          <button class="action-btn btn-pet" :class="{ cooling: patOnCooldown }" @click="petPat">
            <span class="btn-icon">👋</span>
            쓰다듬기
            <span v-if="patOnCooldown" class="btn-sub cooldown-txt">{{ patRemainLabel }}</span>
            <span v-else class="btn-sub" style="color:#FF8C60">+5 친밀도</span>
          </button>
          <button class="action-btn btn-food" @click="giveSnack">
            <span class="btn-badge">NEW</span>
            <span class="btn-icon">🍔</span>
            간식 주기
            <span class="btn-sub" style="color:#B8860B">주문 연동</span>
          </button>
          <button class="action-btn btn-dress" @click="showPetSelect=true">
            <span class="btn-icon">👗</span>
            펫 변경
            <span class="btn-sub" style="color:#7B5EA7">8종 선택</span>
          </button>
          <button class="action-btn btn-reward" @click="activeView='reward'">
            <span class="btn-icon">🎁</span>
            보상함
            <span class="btn-sub" style="color:#00956C">2개 수령가능</span>
          </button>
        </div>
      </div>

      <!-- Snack log -->
      <div class="snack-section">
        <div class="snack-title">🍱 최근 먹인 간식</div>
        <div class="snack-list">
          <div class="snack-item"><span class="snack-emoji">🍕</span><div class="snack-info"><div class="snack-name">피자 마르게리따</div><div class="snack-time">오늘 12:34 · 도미노피자</div></div><span class="snack-xp">+30 XP</span></div>
          <div class="snack-item"><span class="snack-emoji">🍜</span><div class="snack-info"><div class="snack-name">짬뽕 곱배기</div><div class="snack-time">어제 18:10 · 중화반점</div></div><span class="snack-xp">+25 XP</span></div>
          <div class="snack-item"><span class="snack-emoji">🍗</span><div class="snack-info"><div class="snack-name">후라이드 치킨</div><div class="snack-time">어제 20:55 · BBQ치킨</div></div><span class="snack-xp">+20 XP</span></div>
        </div>
      </div>
      <div class="spacer"></div>
    </div><!-- /pet view -->

    <!-- ───── RANKING ───── -->
    <div v-show="activeView==='rank'" class="view">
      <div class="ranking-header">
        <div class="ranking-title">🏆 펫 랭킹</div>
        <div class="ranking-subtitle">매주 월요일 00:00 초기화</div>
        <div class="ranking-tabs">
          <button v-for="tab in ['전국','친구','대구/경북']" :key="tab"
            class="rtab" :class="{ active: activeRankTab === tab }"
            @click="activeRankTab=tab; showToast(tab + ' 랭킹 불러오는 중...')">
            {{ tab }}
          </button>
        </div>
      </div>
      <div class="top3">
        <div class="top3-item rank2"><div class="podium-avatar">🐶</div><div class="podium-name">행복한하루</div><div class="podium-level">Lv.8</div><div class="podium-box">2</div></div>
        <div class="top3-item rank1"><div class="podium-crown">👑</div><div class="podium-avatar">🦊</div><div class="podium-name">먹부림왕</div><div class="podium-level">Lv.12</div><div class="podium-box">1</div></div>
        <div class="top3-item rank3"><div class="podium-avatar">🐰</div><div class="podium-name">달달한삶</div><div class="podium-level">Lv.7</div><div class="podium-box">3</div></div>
      </div>
      <div class="ranking-body">
        <div class="rank-list">
          <div class="rank-item"><div class="rank-num" style="color:#C0A000">4</div><div class="rank-avatar">🐱</div><div class="rank-info"><div class="rank-name">김민준 <span class="muted-sm">· 모찌</span></div><div class="rank-detail">연속주문 12일 · 간식 28개</div></div><div class="rank-score"><div class="rank-level">Lv.5</div><div class="rank-pts">720 pts</div><div class="rank-change up">▲2</div></div></div>
          <div class="rank-item mine"><div class="rank-num" style="color:#FF6B35;font-size:16px">★</div><div class="rank-avatar" style="background:#FFE0D4">🐱</div><div class="rank-info"><div class="rank-name" style="color:#FF6B35">나 ({{ selectedPetName }})</div><div class="rank-detail">현재 4위 · 전주 대비 +2</div></div><div class="rank-score"><div class="rank-level" style="font-size:19px">{{ level }}</div><div class="rank-pts">{{ intimacy }} pts</div></div></div>
          <div class="rank-item"><div class="rank-num">5</div><div class="rank-avatar" style="background:#E8F5E9">🐹</div><div class="rank-info"><div class="rank-name">야식러버 <span class="muted-sm">· 콩이</span></div><div class="rank-detail">연속주문 9일 · 간식 24개</div></div><div class="rank-score"><div class="rank-level">Lv.5</div><div class="rank-pts">680 pts</div><div class="rank-change same">–</div></div></div>
          <div class="rank-item"><div class="rank-num">6</div><div class="rank-avatar" style="background:#EDE3F5">🐻</div><div class="rank-info"><div class="rank-name">배달왕 <span class="muted-sm">· 포동이</span></div><div class="rank-detail">연속주문 7일 · 간식 20개</div></div><div class="rank-score"><div class="rank-level">Lv.4</div><div class="rank-pts">590 pts</div><div class="rank-change down">▼1</div></div></div>
        </div>
      </div>
      <div class="spacer"></div>
    </div>

    <!-- ───── REWARDS ───── -->
    <div v-show="activeView==='reward'" class="view">
      <div class="rewards-header">
        <div class="rewards-title">🎁 레벨업 보상</div>
        <div class="my-points-pill">
          <span class="my-pts-num">{{ fmtPts }}</span>
          <span class="my-pts-label">보유 포인트</span>
        </div>
      </div>
      <div class="reward-section-title">레벨별 보상</div>
      <div class="reward-grid">
        <div class="reward-card"><div class="reward-lv-badge achieved">Lv.1 ✓</div><span class="reward-emoji">☕</span><div class="reward-name">아메리카노 쿠폰</div><div class="reward-desc">스타벅스 Tall</div><button class="claim-btn done">수령완료</button></div>
        <div class="reward-card"><div class="reward-lv-badge achieved">Lv.2 ✓</div><span class="reward-emoji">🏷️</span><div class="reward-name">500원 할인쿠폰</div><div class="reward-desc">최소 5천원</div><button class="claim-btn done">수령완료</button></div>
        <div class="reward-card claimable" :class="{ done: claimedRewards.has('r3') }">
          <div class="reward-lv-badge achieved">Lv.5 달성!</div>
          <span class="reward-emoji">🍕</span><div class="reward-name">피자 1+1 쿠폰</div><div class="reward-desc">참여매장 전용</div>
          <button v-if="!claimedRewards.has('r3')" class="claim-btn ready" @click="claimReward('r3')">수령하기</button>
          <button v-else class="claim-btn done">수령완료</button>
        </div>
        <div class="reward-card claimable" :class="{ done: claimedRewards.has('r4') }">
          <div class="reward-lv-badge achieved">Lv.5 달성!</div>
          <span class="reward-emoji">💎</span><div class="reward-name">VIP 배지</div><div class="reward-desc">프로필 전용</div>
          <button v-if="!claimedRewards.has('r4')" class="claim-btn ready" @click="claimReward('r4')">수령하기</button>
          <button v-else class="claim-btn done">수령완료</button>
        </div>
        <div class="reward-card locked"><div class="reward-lv-badge">Lv.8 필요</div><span class="reward-emoji">🚀</span><div class="reward-name">무료배달 3회권</div><div class="reward-desc">전 매장 적용</div><button class="claim-btn locked-btn">잠금</button></div>
        <div class="reward-card locked"><div class="reward-lv-badge">Lv.10 필요</div><span class="reward-emoji">👑</span><div class="reward-name">5,000원 쿠폰</div><div class="reward-desc">전 메뉴 적용</div><button class="claim-btn locked-btn">잠금</button></div>
      </div>
      <div class="history-section">
        <div class="history-title">포인트 내역</div>
        <div v-for="(h, i) in pointsHistory" :key="i" class="history-item">
          <div class="history-icon">{{ h.icon }}</div>
          <div class="history-info"><div class="history-name">{{ h.name }}</div><div class="history-date">{{ h.date }}</div></div>
          <div class="history-value" :style="{ color: h.value.startsWith('-') ? '#FF4E8A' : '#FF6B35' }">{{ h.value }}</div>
        </div>
      </div>
      <div class="spacer"></div>
    </div>

    <!-- ───── SHOP ───── -->
    <div v-show="activeView==='shop'" class="view">
      <div class="shop-header">
        <div class="shop-title">🛍️ 펫 상점</div>
        <div class="shop-subtitle">포인트로 특별한 아이템을 꾸며보세요</div>
        <div class="shop-pts-pill">
          <span>💰</span>
          <span class="shop-pts-num">{{ fmtPts }}</span>
          <span class="shop-pts-label">P</span>
        </div>
      </div>

      <div class="shop-tabs">
        <button v-for="tab in [{id:'acc',label:'🎀 액세서리'},{id:'bg',label:'🌄 배경'},{id:'ground',label:'🌿 바닥'},{id:'effect',label:'✨ 효과'}]"
          :key="tab.id" class="shop-tab" :class="{ active: activeShopTab === tab.id }"
          @click="activeShopTab = tab.id">{{ tab.label }}
        </button>
      </div>

      <!-- ACCESSORIES -->
      <div v-if="activeShopTab==='acc'" class="shop-grid">
        <div v-for="item in accessories" :key="item.id"
          class="shop-card"
          :class="{ owned: ownedAcc.has(item.id), equipped: equippedAccId === item.id }"
        >
          <div v-if="item.isNew" class="new-badge" style="background:#06D6A0">NEW</div>
          <div v-if="equippedAccId === item.id" class="equipped-badge">장착중</div>
          <div class="rarity-bar" :style="{ background: rarityConfig[item.rarity].color }"></div>

          <div class="item-preview-box acc-preview">
            <span class="item-big-emoji">{{ item.emoji }}</span>
          </div>

          <div class="item-name">{{ item.name }}</div>
          <div class="item-desc">{{ item.desc }}</div>
          <div class="rarity-label" :style="{ color: rarityConfig[item.rarity].color, background: rarityConfig[item.rarity].bg }">
            {{ rarityConfig[item.rarity].label }}
          </div>

          <div v-if="!ownedAcc.has(item.id)" class="shop-price">
            <span>💸</span><span class="price-val">{{ item.price.toLocaleString() }}P</span>
          </div>
          <button
            class="shop-btn"
            :class="equippedAccId===item.id ? 'equipped-btn' : ownedAcc.has(item.id) ? 'equip' : points >= item.price ? 'buy' : 'no-money'"
            @click="buyAcc(item)"
          >
            {{ equippedAccId === item.id ? '장착됨 ✓' : ownedAcc.has(item.id) ? '장착하기' : '구매하기' }}
          </button>
        </div>
      </div>

      <!-- BACKGROUNDS -->
      <div v-if="activeShopTab==='bg'" class="shop-grid">
        <div v-for="item in backgrounds" :key="item.id"
          class="shop-card"
          :class="{ owned: ownedBg.has(item.id), equipped: equippedBgId === item.id }"
        >
          <div v-if="equippedBgId === item.id" class="equipped-badge">장착중</div>

          <!-- Beautiful background preview -->
          <div class="bg-preview-box" :style="{ background: item.sceneBg }">
            <div class="bg-preview-ground" :style="{ background: item.toColor }"></div>
            <span class="bg-preview-pet">🐱</span>
            <span class="bg-preview-label">{{ item.emoji }}</span>
          </div>

          <div class="item-name">{{ item.name }}</div>
          <div class="item-desc">{{ item.desc }}</div>

          <div v-if="!ownedBg.has(item.id)" class="shop-price">
            <span>💸</span><span class="price-val">{{ item.price.toLocaleString() }}P</span>
          </div>
          <button
            class="shop-btn"
            :class="equippedBgId===item.id ? 'equipped-btn' : ownedBg.has(item.id) ? 'equip' : points >= item.price ? 'buy' : 'no-money'"
            @click="buyBg(item)"
          >
            {{ equippedBgId === item.id ? '장착됨 ✓' : ownedBg.has(item.id) ? '장착하기' : '구매하기' }}
          </button>
        </div>
      </div>

      <!-- GROUNDS -->
      <div v-if="activeShopTab==='ground'" class="shop-grid">
        <div v-for="item in grounds" :key="item.id"
          class="shop-card"
          :class="{ owned: ownedGround.has(item.id), equipped: equippedGroundId === item.id }"
        >
          <div v-if="item.isNew" class="new-badge" style="background:#06D6A0">NEW</div>
          <div v-if="equippedGroundId === item.id" class="equipped-badge">장착중</div>

          <!-- Ground swatch preview -->
          <div class="ground-preview-box">
            <div class="ground-swatch" :style="{ background: item.color }">
              <span class="ground-pet">🐱</span>
            </div>
          </div>

          <div class="item-name">{{ item.name }}</div>
          <div class="item-desc">{{ item.desc }}</div>

          <div v-if="!ownedGround.has(item.id)" class="shop-price">
            <span>💸</span><span class="price-val">{{ item.price.toLocaleString() }}P</span>
          </div>
          <button
            class="shop-btn"
            :class="equippedGroundId===item.id ? 'equipped-btn' : ownedGround.has(item.id) ? 'equip' : points >= item.price ? 'buy' : 'no-money'"
            @click="buyGround(item)"
          >
            {{ equippedGroundId === item.id ? '장착됨 ✓' : ownedGround.has(item.id) ? '장착하기' : '구매하기' }}
          </button>
        </div>
      </div>

      <!-- EFFECTS -->
      <div v-if="activeShopTab==='effect'">
        <div class="effect-intro">
          <div class="effect-intro-title">✨ 특수 효과 아이템</div>
          <div class="effect-intro-desc">쓰다듬기·레벨업 시 화면에 특수 효과가 펼쳐져요!</div>
        </div>
        <div class="shop-grid">
          <div v-for="item in effects" :key="item.id"
            class="shop-card effect-card"
            :class="{ owned: ownedEffect.has(item.id), equipped: equippedEffectId === item.id }"
          >
            <div v-if="item.isNew" class="new-badge" style="background:#06D6A0">NEW</div>
            <div v-if="equippedEffectId === item.id" class="equipped-badge">장착중</div>
            <div class="rarity-bar" :style="{ background: rarityConfig[item.rarity].color }"></div>

            <!-- Effect preview box with animated glow -->
            <div class="effect-preview-box" :class="'eff-' + effectMap[item.id]">
              <span class="effect-big-emoji" :style="item.previewStyle">{{ item.emoji }}</span>
              <div class="effect-ring"></div>
            </div>

            <div class="item-name">{{ item.name }}</div>
            <div class="item-desc">{{ item.desc }}</div>
            <div class="rarity-label" :style="{ color: rarityConfig[item.rarity].color, background: rarityConfig[item.rarity].bg }">
              {{ rarityConfig[item.rarity].label }}
            </div>

            <div v-if="!ownedEffect.has(item.id)" class="shop-price">
              <span>💸</span><span class="price-val">{{ item.price.toLocaleString() }}P</span>
            </div>
            <button
              class="shop-btn"
              :class="equippedEffectId===item.id ? 'equipped-btn' : ownedEffect.has(item.id) ? 'equip' : points >= item.price ? 'buy' : 'no-money'"
              @click="buyEffect(item)"
            >
              {{ equippedEffectId === item.id ? '해제하기 ✓' : ownedEffect.has(item.id) ? '장착하기' : '구매하기' }}
            </button>
          </div>
        </div>
      </div>

      <div class="spacer"></div>
    </div><!-- /shop view -->

  </div><!-- /scroll-area -->

  <!-- BOTTOM NAV -->
  <div class="bottom-nav">
    <button v-for="nav in [
        { id:'pet',    icon:'🐾', label:'내 펫'  },
        { id:'order',  icon:'🍱', label:'주문'   },
        { id:'rank',   icon:'🏆', label:'랭킹'   },
        { id:'shop',   icon:'🛍️', label:'상점'  },
        { id:'reward', icon:'🎁', label:'보상'   },
      ]"
      :key="nav.id"
      class="bnav-item"
      :class="{ active: activeView === nav.id }"
      @click="nav.id==='order' ? showToast('주문 화면으로 이동!') : activeView = nav.id"
    >
      <span class="bnav-icon">{{ nav.icon }}</span>
      <span class="bnav-label">{{ nav.label }}</span>
      <div class="bnav-dot"></div>
    </button>
  </div>

  <!-- TOAST -->
  <Transition name="toast">
    <div v-if="toastVisible" class="toast">{{ toastMsg }}</div>
  </Transition>

  <!-- POINTS POPUP -->
  <Transition name="popup">
    <div v-if="ptsPopupVisible" class="pts-popup">
      <div class="pts-popup-emoji">{{ ptsPopupAmount >= 500 ? '🎉' : ptsPopupAmount >= 200 ? '🌟' : '💰' }}</div>
      <div class="pts-popup-title">{{ ptsPopupAmount >= 200 ? '보너스 포인트!' : '포인트 획득!' }}</div>
      <div class="pts-popup-pts">+{{ ptsPopupAmount.toLocaleString() }}P</div>
      <div class="pts-popup-sub">{{ ptsPopupReason }}</div>
    </div>
  </Transition>

  <!-- ATTENDANCE MODAL -->
  <Transition name="overlay">
    <div v-if="showAttendance" class="modal-overlay" @click.self="showAttendance=false">
      <div class="modal-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">📅 출석 달력</div>
        <div class="sheet-sub">출석할수록 더 많은 포인트를 받아요!</div>

        <div class="att-streak-box">
          <div>
            <div class="att-streak-label">🔥 연속 출석</div>
            <div class="att-streak-row"><span class="att-streak-num">{{ streak }}</span><span class="att-streak-unit">일째</span></div>
          </div>
          <div class="att-streak-right">
            <div class="att-month-txt">이번 달 출석: <b>{{ monthCount }}</b>일</div>
            <div class="att-bonus-txt">연속 7일 달성 시 200P 보너스!</div>
          </div>
        </div>

        <div class="att-rewards-label">🎁 누적 출석 보상</div>
        <div class="att-rewards-scroll">
          <div v-for="r in attRewardSchedule" :key="r.day" class="att-reward-item">
            <div class="att-day-num">{{ r.day }}일</div>
            <div class="att-day-box"
              :class="{
                done: streak >= r.day && checkedInToday,
                special: r.special,
                'today-box': streak + 1 === r.day && !checkedInToday
              }">
              <span class="att-reward-emoji">{{ r.emoji }}</span>
              <span class="att-reward-pts">+{{ r.pts }}P</span>
            </div>
          </div>
        </div>

        <div class="cal-month-nav">
          <button class="cal-nav-btn" @click="changeCalMonth(-1)">‹</button>
          <div class="cal-month-label">{{ calMonthLabel }}</div>
          <button class="cal-nav-btn" @click="changeCalMonth(1)">›</button>
        </div>

        <div class="cal-grid">
          <div v-for="d in ['일','월','화','수','목','금','토']" :key="d" class="cal-dow">{{ d }}</div>
          <div v-for="day in calDays" :key="day.key"
            class="cal-day"
            :class="{
              empty: day.empty,
              attended: day.isAttended,
              today: day.isToday && !day.isAttended,
              future: day.isFuture
            }"
          >{{ day.empty ? '' : day.d }}</div>
        </div>

        <button
          class="att-checkin-btn"
          :disabled="checkedInToday"
          @click="doCheckIn"
        >
          {{ checkedInToday ? '오늘 출석 완료 ✅' : '오늘 출석 체크하기 ✅' }}
        </button>
      </div>
    </div>
  </Transition>

  <!-- PET SELECT MODAL -->
  <Transition name="overlay">
    <div v-if="showPetSelect" class="modal-overlay" @click.self="showPetSelect=false">
      <div class="pet-select-sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title" style="font-size:15px;margin-bottom:12px">✨ 나의 펫 선택</div>
        <div class="pet-options">
          <div v-for="p in [
              {emoji:'🐱',name:'고양이'},{emoji:'🐶',name:'강아지'},
              {emoji:'🐰',name:'토끼'  },{emoji:'🦊',name:'여우'  },
              {emoji:'🐹',name:'햄스터'},{emoji:'🐻',name:'곰'    },
              {emoji:'🐸',name:'개구리'},{emoji:'🐼',name:'판다'  },
            ]"
            :key="p.emoji"
            class="pet-option"
            :class="{ selected: tempEmoji === p.emoji }"
            @click="selectPet(p.emoji, p.name)"
          >
            <span class="pet-option-emoji">{{ p.emoji }}</span>
            <div class="pet-option-name">{{ p.name }}</div>
          </div>
        </div>
        <button class="select-confirm-btn" @click="confirmPetSelect">이 친구로 결정! 🎉</button>
      </div>
    </div>
  </Transition>

</div><!-- .pet-app -->
</template>


<style scoped>
.pet-app {
  --orange: #FF6B35; --orange-light: #FFE0D4;
  --pink: #FF4E8A;   --pink-light: #FFD6E8;
  --yellow: #FFD166; --yellow-light: #FFF7D6;
  --teal: #06D6A0;   --teal-light: #D4F5EC;
  --purple: #7B5EA7; --purple-light: #EDE3F5;
  --bg: #FFF9F5;     --card: #FFFFFF;
  --text: #2D2D2D;   --muted: #9B9B9B; --border: #F0E8E0;

  font-family: 'Nunito', sans-serif;
  background: var(--bg);
  width: 480px;
  margin: 0 auto ;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.scroll-area { flex: 1; overflow-y: auto; overflow-x: hidden; }
.view { display: block; }
.spacer { height: 20px; }

/* ── TOP NAV ── */
.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px 10px; background: var(--card);
  border-bottom: 1.5px solid var(--border); flex-shrink: 0;
}
.app-logo {
  font-family: 'Jua', sans-serif; font-size: 21px;
  background: linear-gradient(90deg, var(--orange), var(--pink));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.top-points {
  display: flex; align-items: center; gap: 4px; cursor: pointer;
  background: var(--yellow-light); border: 1.5px solid var(--yellow);
  border-radius: 20px; padding: 4px 10px;
}
.top-pts-val { font-size: 13px; font-weight: 900; color: #C07000; }
.top-pts-p   { font-size: 10px; color: #999; }

/* ── PET HEADER ── */
.pet-header {
  background: linear-gradient(135deg, #FFF0E8, #FFE8F3);
  padding: 16px 20px 0; text-align: center; position: relative; overflow: hidden;
}
.pet-header::before {
  content:''; position:absolute; top:-30px; right:-30px;
  width:120px; height:120px; border-radius:50%;
  background: rgba(255,107,53,0.07);
}
.pet-name-row { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:3px; }
.pet-name     { font-size:20px; font-weight:800; }
.level-badge  { background:linear-gradient(90deg,var(--orange),var(--pink)); color:white; font-size:11px; font-weight:800; padding:3px 9px; border-radius:20px; }
.owner-name   { font-size:12px; color:var(--muted); margin-bottom:10px; }

.pet-scene {
  position:relative; height:175px;
  display:flex; align-items:flex-end; justify-content:center;
  border-radius:12px; overflow:hidden; transition:background 0.6s;
}
.pet-ground {
  position:absolute; bottom:0; left:0; right:0; height:38px;
  border-radius:50% 50% 0 0; transition:background 0.5s;
}
.pet-accessory {
  position:absolute; z-index:3; top:10px; font-size:32px;
  pointer-events:none; animation:petBounce 2.5s ease-in-out infinite;
}
.pet-emoji {
  font-size:88px; position:relative; z-index:2;
  animation:petBounce 2.5s ease-in-out infinite;
  cursor:pointer; user-select:none;
  filter:drop-shadow(0 6px 10px rgba(255,107,53,0.2));
  transition:font-size 0.4s;
}
.pet-emoji:active  { transform: scale(0.88) !important; }
.pet-sparkle  { position:absolute; top:10px; right:58px; font-size:18px; opacity:0; animation:sparkle 2.5s ease-in-out infinite 0.8s; }
.pet-sparkle2 { position:absolute; top:24px; left:52px;  font-size:14px; opacity:0; animation:sparkle 2.5s ease-in-out infinite 1.4s; }

/* Effect variants on pet emoji */
.has-rainbow { filter: drop-shadow(0 0 12px rgba(255,100,100,0.6)) drop-shadow(0 0 20px rgba(100,100,255,0.4)) !important; animation: petBounce 2.5s ease-in-out infinite, rainbowGlow 2s linear infinite !important; }
.has-fire    { filter: drop-shadow(0 0 14px #FF4500) drop-shadow(0 0 25px #FF6600) !important; }
.has-snow    { filter: drop-shadow(0 0 10px #B0E0FF) drop-shadow(0 0 20px #80C8FF) !important; }
.has-gold    { filter: drop-shadow(0 0 14px #FFD700) drop-shadow(0 0 28px #FFA500) !important; animation: petBounce 2.5s ease-in-out infinite, goldGlow 1.5s ease-in-out infinite !important; }

@keyframes petBounce { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
@keyframes sparkle   { 0%,100%{opacity:0;transform:scale(.5) rotate(0deg)} 30%,70%{opacity:1;transform:scale(1.2) rotate(20deg)} }
@keyframes pop       { 0%{transform:scale(1)} 40%{transform:scale(1.32) rotate(-7deg)} 100%{transform:scale(1)} }
@keyframes rainbowGlow { 0%{filter:drop-shadow(0 0 12px #FF6B35) drop-shadow(0 0 20px rgba(100,100,255,.4))} 33%{filter:drop-shadow(0 0 12px #7B5EA7) drop-shadow(0 0 20px rgba(255,78,138,.4))} 66%{filter:drop-shadow(0 0 12px #06D6A0) drop-shadow(0 0 20px rgba(255,209,102,.4))} 100%{filter:drop-shadow(0 0 12px #FF6B35) drop-shadow(0 0 20px rgba(100,100,255,.4))} }
@keyframes goldGlow  { 0%,100%{filter:drop-shadow(0 0 14px #FFD700) drop-shadow(0 0 28px #FFA500)} 50%{filter:drop-shadow(0 0 22px #FFD700) drop-shadow(0 0 40px #FFA500)} }
.pop { animation: pop 0.45s ease !important; }

/* Effect particles */
.effect-particle {
  position:absolute; top:60px; font-size:18px; z-index:10;
  animation:floatUp 1s ease-out forwards; pointer-events:none;
}
@keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-80px) scale(0.3);opacity:0} }

/* ── COOLDOWN ── */
.cooldown-row { padding: 10px 16px 2px; }
.cooldown-label { display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px; }
.cooldown-time { font-weight:800; }
.cooldown-time.ready { color:var(--teal); }
.cooldown-track { height:5px; background:var(--border); border-radius:10px; overflow:hidden; }
.cooldown-fill  { height:100%; border-radius:10px; transition:width 1s linear, background 0.3s; }

/* ── STATS ── */
.stats-row { display:flex; gap:7px; padding:10px 16px; }
.stat-pill { flex:1; background:var(--card); border:1.5px solid var(--border); border-radius:14px; padding:9px 6px; text-align:center; }
.stat-pill.clickable { cursor:pointer; transition:transform 0.15s; }
.stat-pill.clickable:active { transform:scale(0.95); }
.stat-icon  { font-size:16px; }
.stat-value { font-size:13px; font-weight:800; }
.stat-label { font-size:9px; color:var(--muted); font-weight:600; margin-top:1px; }

/* ── INTIMACY ── */
.intimacy-section { padding:0 16px 14px; }
.intimacy-header  { display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; }
.intimacy-title   { font-size:12px; font-weight:700; }
.intimacy-count   { font-size:12px; font-weight:700; color:var(--orange); }
.bar-track { height:11px; background:var(--border); border-radius:20px; overflow:hidden; }
.bar-fill  { height:100%; border-radius:20px; background:linear-gradient(90deg,var(--orange),var(--pink)); transition:width 0.6s cubic-bezier(.34,1.56,.64,1); }
.levelup-hint { font-size:10px; color:var(--muted); margin-top:4px; text-align:right; }
.levelup-hint span { color:var(--pink); font-weight:700; }

/* ── ACTIONS ── */
.action-section { padding:0 16px 14px; }
.action-title   { font-size:12px; font-weight:700; margin-bottom:9px; }
.action-grid    { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
.action-btn {
  border:none; border-radius:16px; padding:13px 8px;
  cursor:pointer; font-family:'Nunito',sans-serif; font-weight:800; font-size:12px;
  display:flex; flex-direction:column; align-items:center; gap:5px;
  transition:transform 0.15s; position:relative; overflow:hidden;
}
.action-btn:active { transform:scale(0.95); }
.btn-icon   { font-size:24px; }
.btn-sub    { font-size:9px; }
.btn-badge  { position:absolute; top:7px; right:7px; background:var(--pink); color:white; font-size:8px; font-weight:800; padding:2px 5px; border-radius:8px; }
.btn-pet    { background:linear-gradient(135deg,#FFE0D4,#FFDDE8); color:var(--orange); box-shadow:0 4px 10px rgba(255,107,53,.13); }
.btn-food   { background:linear-gradient(135deg,#FFF7D6,#FFF0C0); color:#C97A00; box-shadow:0 4px 10px rgba(255,209,102,.18); }
.btn-dress  { background:linear-gradient(135deg,var(--purple-light),#EDE3F5); color:var(--purple); box-shadow:0 4px 10px rgba(123,94,167,.1); }
.btn-reward { background:linear-gradient(135deg,var(--teal-light),#C0F0E5); color:#00956C; box-shadow:0 4px 10px rgba(6,214,160,.1); }
.btn-pet.cooling { opacity:0.6; cursor:not-allowed; }
.cooldown-txt { color:#c05020; }

/* ── SNACK ── */
.snack-section { margin:0 16px 16px; background:var(--card); border:1.5px solid var(--border); border-radius:18px; padding:13px 14px; }
.snack-title   { font-size:12px; font-weight:700; margin-bottom:9px; }
.snack-list    { display:flex; flex-direction:column; gap:7px; }
.snack-item    { display:flex; align-items:center; gap:9px; padding:7px 9px; background:var(--bg); border-radius:11px; }
.snack-emoji   { font-size:20px; }
.snack-info    { flex:1; }
.snack-name    { font-size:11px; font-weight:700; }
.snack-time    { font-size:9px; color:var(--muted); margin-top:1px; }
.snack-xp      { font-size:10px; font-weight:800; color:var(--orange); background:var(--orange-light); padding:2px 7px; border-radius:9px; }

/* ── RANKING ── */
.ranking-header   { padding:18px 18px 8px; background:linear-gradient(135deg,#1a1a2e,#16213e); text-align:center; }
.ranking-title    { font-size:21px; font-weight:900; color:white; }
.ranking-subtitle { font-size:11px; color:rgba(255,255,255,0.45); margin-top:2px; }
.ranking-tabs     { display:flex; margin:12px 0 0; background:rgba(255,255,255,0.08); border-radius:11px; padding:3px; }
.rtab { flex:1; padding:6px; border:none; border-radius:8px; font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; cursor:pointer; color:rgba(255,255,255,0.45); background:none; transition:all 0.2s; }
.rtab.active { background:var(--orange); color:white; }
.ranking-body { padding:10px 14px; }
.top3 { display:flex; align-items:flex-end; justify-content:center; gap:6px; padding:18px 0 8px; background:linear-gradient(180deg,#1a1a2e,var(--bg)); }
.top3-item { display:flex; flex-direction:column; align-items:center; gap:3px; position:relative; }
.top3-item.rank1{order:2} .top3-item.rank2{order:1} .top3-item.rank3{order:3}
.podium-crown  { font-size:15px; position:absolute; top:-17px; }
.podium-avatar { border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,.18); }
.rank1 .podium-avatar{width:68px;height:68px;font-size:34px;background:linear-gradient(135deg,#FFD166,#FF9F43)}
.rank2 .podium-avatar,.rank3 .podium-avatar{width:52px;height:52px;font-size:26px}
.rank2 .podium-avatar{background:linear-gradient(135deg,#DDD,#AAA)}
.rank3 .podium-avatar{background:linear-gradient(135deg,#CD8B55,#A0622A)}
.podium-name{font-size:10px;font-weight:700;color:white} .rank1 .podium-name{font-size:11px}
.podium-level{font-size:9px;color:rgba(255,255,255,0.55)}
.podium-box{border-radius:9px 9px 0 0;width:76px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;color:white}
.rank1 .podium-box{height:52px;background:linear-gradient(180deg,#FFD166,#FF9F43)}
.rank2 .podium-box{height:38px;background:linear-gradient(180deg,#C0C0C0,#888)}
.rank3 .podium-box{height:26px;background:linear-gradient(180deg,#CD8B55,#8B6040)}
.rank-list   { display:flex; flex-direction:column; gap:7px; }
.rank-item   { display:flex; align-items:center; gap:9px; background:var(--card); border:1.5px solid var(--border); border-radius:14px; padding:9px 12px; position:relative; overflow:hidden; }
.rank-item.mine { border-color:var(--orange); background:linear-gradient(135deg,#FFF5F0,#FFF0F5); }
.rank-item.mine::before { content:'나'; position:absolute; right:10px; top:7px; font-size:9px; font-weight:800; color:var(--orange); background:var(--orange-light); padding:2px 5px; border-radius:7px; }
.rank-num    { width:22px; text-align:center; font-size:13px; font-weight:800; color:var(--muted); }
.rank-avatar { width:40px; height:40px; border-radius:50%; background:var(--orange-light); font-size:20px; display:flex; align-items:center; justify-content:center; }
.rank-info   { flex:1; }
.rank-name   { font-size:12px; font-weight:700; }
.rank-detail { font-size:10px; color:var(--muted); margin-top:1px; }
.rank-score  { text-align:right; }
.rank-level  { font-size:15px; font-weight:900; color:var(--orange); }
.rank-pts    { font-size:9px; color:var(--muted); }
.rank-change { font-size:9px; font-weight:700; padding:1px 4px; border-radius:5px; }
.muted-sm    { font-size:9px; color:var(--muted); }
.up   { color:var(--teal); background:var(--teal-light); }
.same { color:var(--muted); background:var(--border); }
.down { color:var(--pink); background:var(--pink-light); }

/* ── REWARDS ── */
.rewards-header     { padding:18px 18px 12px; background:linear-gradient(135deg,#FFF7D6,#FFE8D6); }
.rewards-title      { font-size:19px; font-weight:900; }
.my-points-pill     { display:flex; align-items:center; gap:5px; background:white; border-radius:13px; padding:7px 13px; margin-top:9px; width:fit-content; border:1.5px solid var(--yellow); }
.my-pts-num         { font-size:21px; font-weight:900; color:var(--orange); }
.my-pts-label       { font-size:10px; color:var(--muted); font-weight:600; }
.reward-section-title { font-size:13px; font-weight:800; padding:12px 18px 7px; }
.reward-grid        { display:grid; grid-template-columns:1fr 1fr; gap:9px; padding:0 18px; }
.reward-card        { background:var(--card); border:1.5px solid var(--border); border-radius:16px; padding:13px 10px; text-align:center; position:relative; transition:transform 0.15s; }
.reward-card:active { transform:scale(0.97); }
.reward-card.locked    { opacity:0.55; }
.reward-card.claimable { border-color:var(--orange); box-shadow:0 0 0 2px rgba(255,107,53,.09); }
.reward-lv-badge    { position:absolute; top:-1px; left:50%; transform:translateX(-50%); background:var(--orange); color:white; font-size:8px; font-weight:800; padding:2px 7px; border-radius:0 0 7px 7px; }
.reward-lv-badge.achieved { background:var(--teal); }
.reward-emoji       { font-size:30px; margin:10px 0 5px; display:block; }
.reward-name        { font-size:11px; font-weight:700; }
.reward-desc        { font-size:9px; color:var(--muted); margin-top:2px; }
.claim-btn          { margin-top:7px; width:100%; border:none; border-radius:9px; padding:5px; font-family:'Nunito',sans-serif; font-size:10px; font-weight:800; cursor:pointer; }
.claim-btn.ready    { background:var(--orange); color:white; }
.claim-btn.locked-btn { background:var(--border); color:var(--muted); }
.claim-btn.done     { background:var(--teal-light); color:#00956C; }
.history-section    { padding:13px 18px 18px; }
.history-title      { font-size:13px; font-weight:800; margin-bottom:9px; }
.history-item       { display:flex; align-items:center; gap:9px; padding:9px; background:var(--card); border:1.5px solid var(--border); border-radius:13px; margin-bottom:7px; }
.history-icon       { font-size:18px; width:34px; height:34px; background:var(--yellow-light); border-radius:9px; display:flex; align-items:center; justify-content:center; }
.history-info       { flex:1; }
.history-name       { font-size:11px; font-weight:700; }
.history-date       { font-size:9px; color:var(--muted); margin-top:1px; }
.history-value      { font-size:12px; font-weight:900; }

/* ── SHOP ── */
.shop-header    { padding:18px 18px 14px; background:linear-gradient(135deg,#1a1a2e,#2d1b4e); text-align:center; }
.shop-title     { font-size:22px; font-weight:900; color:white; font-family:'Jua',sans-serif; }
.shop-subtitle  { font-size:11px; color:rgba(255,255,255,.5); margin-top:2px; }
.shop-pts-pill  { display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,.12); border-radius:20px; padding:5px 14px; margin-top:10px; }
.shop-pts-num   { font-size:15px; font-weight:900; color:var(--yellow); }
.shop-pts-label { font-size:10px; color:rgba(255,255,255,.6); }

.shop-tabs { display:flex; gap:0; padding:10px 14px 4px; overflow-x:auto; border-bottom:1.5px solid var(--border); }
.shop-tabs::-webkit-scrollbar { display:none; }
.shop-tab { flex-shrink:0; padding:6px 13px; border:none; border-radius:20px; font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; cursor:pointer; background:var(--border); color:var(--muted); transition:all 0.2s; margin-right:6px; }
.shop-tab.active { background:linear-gradient(90deg,var(--purple),var(--pink)); color:white; }

.shop-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:10px 14px 14px; }

/* ── SHOP CARD (shared) ── */
.shop-card {
  background:var(--card); border:1.5px solid var(--border);
  border-radius:20px; padding:0 0 12px;
  text-align:center; position:relative;
  transition:transform 0.15s, box-shadow 0.15s;
  overflow:hidden;
}
.shop-card:active { transform:scale(0.97); }
.shop-card.owned    { border-color:var(--teal); }
.shop-card.equipped { border-color:var(--orange); box-shadow:0 0 0 2.5px rgba(255,107,53,.18); }

.rarity-bar { height:3px; width:100%; margin-bottom:0; }
.new-badge      { position:absolute; top:8px; left:8px; color:white; font-size:8px; font-weight:800; padding:2px 6px; border-radius:8px; z-index:2; }
.equipped-badge { position:absolute; top:8px; right:8px; background:var(--orange); color:white; font-size:8px; font-weight:800; padding:2px 6px; border-radius:8px; z-index:2; }

.item-name  { font-size:12px; font-weight:800; color:var(--text); padding:0 8px; }
.item-desc  { font-size:9px; color:var(--muted); margin-top:2px; padding:0 6px; }
.rarity-label { display:inline-block; font-size:8px; font-weight:800; padding:2px 8px; border-radius:20px; margin:5px auto 0; }

.shop-price  { display:flex; align-items:center; justify-content:center; gap:3px; margin:6px 0 0; }
.price-val   { font-size:13px; font-weight:900; color:#C07000; }
.shop-btn    { display:block; margin:7px 10px 0; width:calc(100% - 20px); border:none; border-radius:10px; padding:7px; font-family:'Nunito',sans-serif; font-size:11px; font-weight:800; cursor:pointer; transition:all 0.2s; }
.shop-btn.buy         { background:linear-gradient(90deg,var(--purple),var(--pink)); color:white; }
.shop-btn.equip       { background:var(--orange); color:white; }
.shop-btn.equipped-btn { background:var(--teal-light); color:#00956C; }
.shop-btn.no-money    { background:var(--border); color:var(--muted); cursor:not-allowed; }

/* ── ACC PREVIEW ── */
.acc-preview {
  width:100%; height:90px; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#FFF5EE,#FFF0F5);
  margin-bottom:8px;
}
.item-big-emoji { font-size:48px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.12)); }

/* ── BG PREVIEW ── */
.bg-preview-box {
  width:100%; height:90px; position:relative; overflow:hidden;
  display:flex; align-items:flex-end; justify-content:center;
  margin-bottom:8px;
}
.bg-preview-ground { position:absolute; bottom:0; left:0; right:0; height:20px; border-radius:50% 50% 0 0; }
.bg-preview-pet    { font-size:32px; position:relative; z-index:2; animation:petBounce 2.5s ease-in-out infinite; }
.bg-preview-label  { position:absolute; top:6px; right:8px; font-size:20px; }

/* ── GROUND PREVIEW ── */
.ground-preview-box { width:100%; height:90px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#F0F8FF,#E8F0F8); margin-bottom:8px; }
.ground-swatch {
  width:80%; height:36px; border-radius:50% 50% 0 0;
  position:relative; display:flex; align-items:flex-start; justify-content:center;
  box-shadow:0 -4px 12px rgba(0,0,0,0.08);
}
.ground-pet { font-size:36px; position:absolute; top:-30px; }

/* ── EFFECT PREVIEW ── */
.effect-intro { padding:10px 16px 0; }
.effect-intro-title { font-size:13px; font-weight:800; color:var(--text); margin-bottom:3px; }
.effect-intro-desc  { font-size:10px; color:var(--muted); margin-bottom:0; }

.effect-card { }
.effect-preview-box {
  width:100%; height:90px; display:flex; align-items:center; justify-content:center;
  position:relative; overflow:hidden; margin-bottom:8px;
  border-radius:0;
}
.eff-rainbow { background:conic-gradient(from 0deg, #FF6B3520, #FF4E8A20, #7B5EA720, #06D6A020, #FFD16620, #FF6B3520); animation:spinBg 4s linear infinite; }
.eff-stars   { background:radial-gradient(ellipse at 50% 50%, #1a1a3e, #0a0a1e); }
.eff-fire    { background:linear-gradient(180deg, #FF4500, #FF6600, #FFD700); }
.eff-hearts  { background:linear-gradient(135deg, #FFE8F0, #FFD6E8); }
.eff-snow    { background:linear-gradient(180deg, #E8F4FF, #B0D8FF); }
.eff-gold    { background:radial-gradient(ellipse, #FFF8E0, #FFE080, #FFD700); }

@keyframes spinBg { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(360deg)} }

.effect-big-emoji {
  font-size:46px; z-index:2; position:relative;
  animation:effectFloat 2s ease-in-out infinite;
}
@keyframes effectFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-8px) scale(1.1)} }
.effect-ring {
  position:absolute; width:70px; height:70px; border-radius:50%;
  border:2px solid rgba(255,255,255,0.3);
  animation:ringPulse 2s ease-in-out infinite;
}
@keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.3);opacity:0.1} }

/* ── BOTTOM NAV ── */
.bottom-nav {
  display:flex; background:var(--card); border-top:1.5px solid var(--border);
  padding:7px 0 14px; flex-shrink:0;
}
.bnav-item {
  flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;
  cursor:pointer; padding:3px 0; border:none; background:none;
  font-family:'Nunito',sans-serif; transition:transform 0.15s;
}
.bnav-item:active { transform:scale(0.88); }
.bnav-icon  { font-size:20px; }
.bnav-label { font-size:9px; font-weight:700; color:var(--muted); }
.bnav-item.active .bnav-label { color:var(--orange); }
.bnav-dot   { width:4px; height:4px; border-radius:50%; background:var(--orange); margin-top:-1px; opacity:0; }
.bnav-item.active .bnav-dot { opacity:1; }

/* ── TOAST ── */
.toast {
  position:absolute; bottom:80px; left:50%; transform:translateX(-50%);
  background:#1a1a1a; color:white; font-size:12px; font-weight:700;
  padding:9px 18px; border-radius:28px; z-index:999; white-space:nowrap; pointer-events:none;
}
.toast-enter-active,.toast-leave-active { transition:all 0.4s cubic-bezier(.34,1.56,.64,1); }
.toast-enter-from  { transform:translateX(-50%) translateY(30px); opacity:0; }
.toast-leave-to    { transform:translateX(-50%) translateY(30px); opacity:0; }

/* ── POINTS POPUP ── */
.pts-popup {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  background:white; border-radius:24px; padding:24px 32px; text-align:center;
  z-index:400; box-shadow:0 12px 40px rgba(0,0,0,0.18); min-width:200px;
}
.pts-popup-emoji { font-size:44px; margin-bottom:8px; }
.pts-popup-title { font-size:18px; font-weight:900; color:var(--text); margin-bottom:4px; }
.pts-popup-pts   { font-size:28px; font-weight:900; color:var(--orange); margin-bottom:4px; }
.pts-popup-sub   { font-size:11px; color:var(--muted); }
.popup-enter-active,.popup-leave-active { transition:all 0.4s cubic-bezier(.34,1.56,.64,1); }
.popup-enter-from,.popup-leave-to       { transform:translate(-50%,-50%) scale(0); opacity:0; }

/* ── MODALS ── */
.modal-overlay {
  display:flex; position:absolute; inset:0;
  background:rgba(0,0,0,0.55); z-index:300; align-items:flex-end; justify-content:center;
}
.overlay-enter-active,.overlay-leave-active { transition:background 0.3s; }
.overlay-enter-from,.overlay-leave-to       { background:rgba(0,0,0,0); }
.overlay-enter-active .modal-sheet,
.overlay-enter-active .pet-select-sheet     { animation:slideUp 0.3s ease; }
.overlay-leave-active .modal-sheet,
.overlay-leave-active .pet-select-sheet     { animation:slideDown 0.25s ease forwards; }
@keyframes slideUp   { from{transform:translateY(100%)} to{transform:translateY(0)} }
@keyframes slideDown { from{transform:translateY(0)} to{transform:translateY(100%)} }

.modal-sheet {
  background:white; width:100%; max-width:390px;
  border-radius:24px 24px 0 0; padding:20px; max-height:90vh; overflow-y:auto;
}
.sheet-handle { width:38px; height:4px; background:var(--border); border-radius:2px; margin:0 auto 14px; }
.sheet-title  { font-size:16px; font-weight:800; margin-bottom:4px; }
.sheet-sub    { font-size:11px; color:var(--muted); margin-bottom:14px; }

/* Attendance */
.att-streak-box { display:flex; align-items:center; gap:10px; background:linear-gradient(135deg,var(--yellow-light),var(--orange-light)); border-radius:14px; padding:12px 14px; margin-bottom:14px; }
.att-streak-label { font-size:11px; color:var(--muted); font-weight:700; margin-bottom:2px; }
.att-streak-row   { display:flex; align-items:baseline; gap:4px; }
.att-streak-num   { font-size:28px; font-weight:900; color:var(--orange); }
.att-streak-unit  { font-size:14px; font-weight:800; color:var(--orange); }
.att-streak-right { flex:1; text-align:right; }
.att-month-txt    { font-size:12px; font-weight:700; }
.att-bonus-txt    { font-size:10px; color:var(--muted); margin-top:1px; }
.att-rewards-label  { font-size:11px; font-weight:700; margin-bottom:7px; }
.att-rewards-scroll { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:14px; }
.att-rewards-scroll::-webkit-scrollbar { display:none; }
.att-reward-item    { flex-shrink:0; text-align:center; width:50px; }
.att-day-num        { font-size:9px; font-weight:700; color:var(--muted); margin-bottom:3px; }
.att-day-box        { width:50px; height:50px; border-radius:12px; border:1.5px solid var(--border); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; background:var(--bg); transition:all 0.2s; }
.att-day-box.done     { background:linear-gradient(135deg,var(--orange-light),var(--pink-light)); border-color:var(--orange); }
.att-day-box.today-box { border:2px solid var(--orange); background:var(--yellow-light); }
.att-day-box.special  { background:linear-gradient(135deg,var(--yellow-light),#FFE0A0); border-color:var(--yellow); }
.att-reward-emoji { font-size:18px; }
.att-reward-pts   { font-size:8px; font-weight:800; color:var(--orange); }

.cal-month-nav  { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.cal-month-label { font-size:14px; font-weight:800; }
.cal-nav-btn    { border:none; background:var(--border); border-radius:8px; width:28px; height:28px; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; }
.cal-grid       { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:14px; }
.cal-dow        { font-size:9px; font-weight:700; color:var(--muted); text-align:center; padding:3px 0; }
.cal-day        { aspect-ratio:1; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; }
.cal-day.attended { background:linear-gradient(135deg,var(--orange),var(--pink)); color:white; }
.cal-day.today    { border:2px solid var(--orange); color:var(--orange); }
.cal-day.future   { color:var(--border); }
.cal-day.empty    { opacity:0; pointer-events:none; }

.att-checkin-btn { width:100%; padding:14px; border:none; border-radius:16px; background:linear-gradient(90deg,var(--orange),var(--pink)); color:white; font-family:'Nunito',sans-serif; font-size:15px; font-weight:800; cursor:pointer; transition:opacity 0.2s; }
.att-checkin-btn:disabled { background:var(--border); color:var(--muted); cursor:not-allowed; }

/* Pet select */
.pet-select-sheet { background:white; width:100%; max-width:390px; border-radius:24px 24px 0 0; padding:20px; }
.pet-options { display:grid; grid-template-columns:repeat(4,1fr); gap:9px; margin-bottom:14px; }
.pet-option  { border:2px solid var(--border); border-radius:14px; padding:9px 5px; text-align:center; cursor:pointer; transition:all 0.2s; }
.pet-option.selected { border-color:var(--orange); background:var(--orange-light); }
.pet-option-emoji { font-size:26px; display:block; margin-bottom:3px; }
.pet-option-name  { font-size:9px; font-weight:700; }
.select-confirm-btn { width:100%; padding:13px; border:none; border-radius:14px; background:linear-gradient(90deg,var(--orange),var(--pink)); color:white; font-family:'Nunito',sans-serif; font-size:14px; font-weight:800; cursor:pointer; }
</style>
