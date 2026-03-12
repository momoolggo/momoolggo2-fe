<script setup>
import { reactive } from 'vue'; // reactive 임포트
import { useRouter } from 'vue-router';

import Sidebar from '@/components/Sidebar.vue'; 
import { useStore } from '@/stores/useStore';
import axios from 'axios';

const router = useRouter();
const store = useStore();

const state = reactive({
  form: {
    storeName: '',      // name -> storeName으로 변경
    location: '',       // 그대로 사용 (기본 주소)
    addressDetail: '',  // (XML에 없지만 나중에 합쳐서 보내야 함)
    storeTel: '',       // 그대로 사용
    businessName: '',   // 그대로 사용
    businessNumber: '', // 그대로 사용
    storeInfo: ''       // 그대로 사용
  }
});

const handleCancel = () => router.back();

const handleSubmit = async () => {
  if (!storeData.value.name) {
    alert("가게 상호명을 입력해주세요.");
    return;
  }

  try {
    await axios.post('/api/owner/store', {
      userId: 3,  // 로그인된 사용자 ID
      storeName: storeData.value.name,
      businessNumber: storeData.value.businessNumber,
      businessName: storeData.value.businessOwner,
      location: storeData.value.address + ' ' + storeData.value.addressDetail,
      storeTel: storeData.value.phone,
      storeInfo: storeData.value.description,
      storePic: ''
    }, { withCredentials: true });

    store.addStore(storeData.value.name);
    alert("가게 등록이 완료되었습니다.");
    router.push('/owner/order');
  } catch (err) {
    console.error(err);
    alert("가게 등록에 실패했습니다.");
  }
};
</script>

<template>
  <div class="container">
    <Sidebar />

    <main class="main-content">
      <div class="content-header">
        <h1>가게 등록 / 추가 하기</h1>
      </div>
      
      <div class="form-wrapper">
        <div class="left-form">
          <div class="form-group">
            <label>가게 상호명</label>
            <div class="input-wrapper">
              <input v-model="state.form.storeName" type="text" placeholder="가게 이름을 입력하세요" maxlength="24" />
              <span class="char-count">{{ state.form.storeName.length }}/24</span>
            </div>
          </div>

          <div class="form-group">
            <label>가게 주소</label>
            <div class="address-input">
              <div class="zipcode-row">
                <input v-model="state.form.location" type="text" placeholder="우편번호" readonly />
                <button class="search-btn" type="button">우편번호 검색</button>
              </div>
              <input type="text" class="full-input" placeholder="기본 주소" readonly />
              <input v-model="state.form.addressDetail" type="text" placeholder="상세주소를 입력하세요" class="full-input" />
            </div>
          </div>

          <div class="form-group">
            <label>가게 전화번호</label>
            <input v-model="state.form.storeTel" type="text" class="full-input" placeholder="010 - 0000 - 0000" />
          </div>

          <div class="form-group">
            <label>사업자 명</label>
            <input v-model="state.form.businessName" type="text" class="full-input" placeholder="이름을 입력하세요" />
          </div>

          <div class="form-group">
            <label>사업자 번호</label>
            <input v-model="state.form.businessNumber" type="text" class="full-input" placeholder="사업자 번호를 입력하세요" />
          </div>
        </div>

        <div class="right-form">
          <div class="form-group">
            <label>가게 대표 사진</label>
            <div class="image-upload-box">
              <div class="upload-placeholder">
                <span class="plus-icon">+</span>
                <p>여기를 눌러 사진을 추가 하세요</p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>가게 소개글</label>
            <div class="textarea-wrapper">
              <textarea v-model="state.form.storeInfo" maxlength="100" placeholder="가게 소개를 입력하세요"></textarea>
              <span class="char-count">{{ state.form.storeInfo.length }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-cancel" type="button" @click="handleCancel">취소</button>
        <button class="btn-submit" type="button" @click="handleSubmit">추가</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 기존 스타일을 그대로 유지합니다 */
.container { display: flex; background-color: #f9f9f9; min-height: 100vh; }
.main-content { flex: 1; padding: 60px 80px; }
.content-header { border-bottom: 1px solid #eee; margin-bottom: 40px; padding-bottom: 15px; }
.content-header h1 { font-size: 24px; color: #333; }
.form-wrapper { display: flex; gap: 60px; }
.left-form, .right-form { flex: 1; display: flex; flex-direction: column; gap: 25px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 16px; font-weight: bold; color: #555; margin-bottom: 10px; }
.input-wrapper, .textarea-wrapper { position: relative; }
input, textarea { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12px; font-size: 15px; }
.char-count { position: absolute; right: 10px; bottom: -20px; font-size: 12px; color: #bbb; }
.zipcode-row { display: flex; gap: 10px; margin-bottom: 8px; }
.search-btn { white-space: nowrap; padding: 0 15px; border: 1px solid #ccc; border-radius: 20px; background: #fff; color: #888; font-size: 12px; cursor: pointer; }
.image-upload-box { width: 100%; height: 200px; border: 2px dashed #ccc; border-radius: 15px; display: flex; align-items: center; justify-content: center; background-color: #fff; }
.upload-placeholder { text-align: center; color: #bbb; }
.plus-icon { font-size: 40px; display: block; margin-bottom: 10px; }
textarea { height: 120px; resize: none; }
.action-buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 50px; }
.btn-cancel { background: #e0e0e0; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
.btn-submit { background: #4A5FF2; color: #fff; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
.address-input { display: flex; flex-direction: column; gap: 12px; }
.full-input { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12}
  </style>