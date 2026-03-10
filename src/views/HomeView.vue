<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="wrapper">
  <div class="item">한식</div>
  <div class="item">중식</div>
  <div class="item">일식</div>
  <div class="item">양식</div>
  <div class="item">디저트</div>
  <div class="item">분식</div>
  <div class="item">패스트푸드</div>
  <div class="item">야식</div>
  </div>


</template>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  justify-content: center;
}

.item{
  background-color: #FEFAEE;
  text-align: center;
  font-size: 20px;
  color: #A40C0B;
  border: #FEFAEE;
  border-radius: 42px;
  border-width: 247px;

}

</style>