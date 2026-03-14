<template>
  <div class="game">

    <h2>Round {{ round }}</h2>
    <h3>🍗 치킨이 들어있는 컵을 맞추세요</h3>

    <div class="cups">
      <div
        v-for="(cup,index) in cups"
        :key="index"
        class="cup"
        @click="selectCup(index)"
      >
        🥤
      </div>
    </div>

    <div v-if="revealed" class="foods">
      <div v-for="(cup,index) in cups" :key="index">
        {{ cup }}
      </div>
    </div>

    <button v-if="!shuffling" @click="startShuffle">
      시작
    </button>

    <div v-if="success">
      <h3>정답!</h3>
      <button @click="nextRound">다음 단계</button>
      <button @click="claimReward">보상 받기</button>
    </div>

    <div v-if="fail">
      <h3>실패!</h3>
      <button @click="resetGame">다시하기</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue"

const cups = ref(["🍔","🍗","🍕"])

const round = ref(1)
const shuffling = ref(false)
const revealed = ref(false)

const success = ref(false)
const fail = ref(false)

let shuffleInterval = null

function startShuffle(){

  revealed.value = false
  success.value = false
  fail.value = false

  shuffling.value = true

  let shuffleCount = 10 + round.value * 5
  let speed = 300 - round.value * 40

  shuffleInterval = setInterval(()=>{

    const i = Math.floor(Math.random()*3)
    const j = Math.floor(Math.random()*3)

    const temp = cups.value[i]
    cups.value[i] = cups.value[j]
    cups.value[j] = temp

    shuffleCount--

    if(shuffleCount <=0){
      clearInterval(shuffleInterval)
      shuffling.value = false
    }

  },speed)
}

function selectCup(index){

  if(shuffling.value) return

  revealed.value = true

  if(cups.value[index] === "🍗"){
    success.value = true
  }else{
    fail.value = true
  }

}

function nextRound(){

  if(round.value < 5){
    round.value++
    startShuffle()
  }else{
    alert("최종 성공! 보상 획득")
    resetGame()
  }

}

function claimReward(){
  alert("현재 단계 보상 지급!")
  resetGame()
}

function resetGame(){

  round.value = 1
  cups.value = ["🍔","🍗","🍕"]

  success.value = false
  fail.value = false
  revealed.value = false

}
</script>

<style scoped>

.game{
  text-align:center;
  margin-top:40px;
}

.cups{
  display:flex;
  justify-content:center;
  gap:40px;
  margin:30px;
}

.cup{
  font-size:60px;
  cursor:pointer;
}

.foods{
  display:flex;
  justify-content:center;
  gap:70px;
  font-size:40px;
}

button{
  margin:10px;
  padding:10px 20px;
}

</style>
