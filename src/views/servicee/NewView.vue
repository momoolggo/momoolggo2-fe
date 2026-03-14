<template>
<div class="game">

<h2>Round {{ round }}</h2>
<p>🍗 치킨이 있는 컵을 맞추세요</p>

<div class="table">

<div
v-for="cup in cups"
:key="cup.id"
class="cup"
:style="{ left: cup.x + 'px' }"
@click="selectCup(cup)"
>
🥤
<div v-if="revealed" class="food">{{ cup.food }}</div>
</div>

</div>

<button v-if="!shuffling && !revealed" @click="startShuffle">
시작
</button>

<div v-if="success" class="result">
<h3>정답!</h3>
<button @click="nextRound">다음 단계</button>
<button @click="claimReward">보상 받기</button>
</div>

<div v-if="fail" class="result">
<h3>실패!</h3>
<button @click="resetGame">다시하기</button>
</div>

</div>
</template>

<script setup>
import {ref} from "vue"

const round = ref(1)
const shuffling = ref(false)
const revealed = ref(false)
const success = ref(false)
const fail = ref(false)

const cups = ref([
{id:1,food:"🍔",x:0},
{id:2,food:"🍗",x:120},
{id:3,food:"🍕",x:240}
])

let interval = null

function shuffleCups(a,b){

const tempX = cups.value[a].x
cups.value[a].x = cups.value[b].x
cups.value[b].x = tempX

const tempFood = cups.value[a].food
cups.value[a].food = cups.value[b].food
cups.value[b].food = tempFood

}

function startShuffle(){

revealed.value=false
success.value=false
fail.value=false
shuffling.value=true

let count = 10 + round.value * 5
let speed = 400 - round.value * 60

interval = setInterval(()=>{

const a = Math.floor(Math.random()*3)
let b = Math.floor(Math.random()*3)

if(a===b){
b=(b+1)%3
}

shuffleCups(a,b)

count--

if(count<=0){
clearInterval(interval)
shuffling.value=false
}

},speed)

}

function selectCup(cup){

if(shuffling.value) return

revealed.value=true

if(cup.food==="🍗"){
success.value=true
}else{
fail.value=true
}

}

function nextRound(){

if(round.value<5){
round.value++
startShuffle()
}else{
alert("최종 성공! 보상 획득")
resetGame()
}

}

function claimReward(){
alert("현재 단계 보상 지급")
resetGame()
}

function resetGame(){

round.value=1
revealed.value=false
success.value=false
fail.value=false

cups.value=[
{id:1,food:"🍔",x:0},
{id:2,food:"🍗",x:120},
{id:3,food:"🍕",x:240}
]

}
</script>

<style scoped>

.game{
text-align:center;
margin-top:40px;
}

.table{
position:relative;
width:360px;
height:120px;
margin:40px auto;
}

.cup{
position:absolute;
font-size:70px;
cursor:pointer;
transition:left 0.35s ease;
}

.food{
font-size:35px;
}

.result{
margin-top:20px;
}

button{
margin:10px;
padding:10px 20px;
}

</style>
