<script setup>
  import axios from 'axios';
  
  // 부모로부터 전달받은 order 데이터
  const props = defineProps(['order']);
  const emit = defineEmits(['close']);
  
  // 상태 업데이트 함수 (주문 수락/취소)
  const handleStatusUpdate = async (status) => {
    try {
      await axios.post('http://localhost:8080/api/owner/order', {
        orderId: props.order.id,
        status: status
      });
      alert("상태가 변경되었습니다.");
      emit('close'); // 모달 닫기
    } catch (error) {
      console.error("상태 변경 실패:", error);
    }
  };
  </script>
  
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>주문상세 {{ order.no }}</h2>
          <button class="close-btn" @click="$emit('close')">X</button>
        </div>
  
        <div class="modal-body">
          <section class="info-section">
            <h3>주문자 정보</h3>
            <p><strong>이름:</strong> {{ order.customerName }}</p>
            <p><strong>전화:</strong> {{ order.tel }}</p>
            <p><strong>주소:</strong> {{ order.address }}</p>
            <p><strong>요청사항:</strong> {{ order.request }}</p>
          </section>
  
          <section class="info-section">
            <h3>메뉴 정보</h3>
            <ul>
              <li v-for="(item, idx) in order.menuList" :key="idx">
                {{ item.name }} x {{ item.count }} ({{ item.price.toLocaleString() }}원)
              </li>
            </ul>
            <hr />
            <p class="total-price"><strong>총 주문 금액:</strong> {{ order.totalPrice.toLocaleString() }}원</p>
          </section>
        </div>
  
        <div class="modal-footer">
          <button class="btn cancel" @click="handleStatusUpdate('CANCEL')">주문 취소</button>
          <button class="btn accept" @click="handleStatusUpdate('PROGRESS')">주문 수락</button>
        </div>
      </div>
    </div>
  </template>
  

  <style scoped>
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal-content { background: white; padding: 20px; border-radius: 12px; width: 450px; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; }
  .info-section { margin: 15px 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; }
  .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
  .cancel { background: #ff4d4f; color: white; }
  .accept { background: #52c41a; color: white; }
  </style>