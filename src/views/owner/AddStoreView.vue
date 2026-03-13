<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/stores/useStore';
import axios from 'axios';

const router = useRouter();
const store = useStore();

const fileInput = ref(null);
const previewImage = ref(null);

const state = reactive({ //가게정보 
  form: {
    storeName: '',      
    location: '',       
    addressDetail: '',  
    storeTel: '',       
    businessName: '',   
    businessNumber: '', 
    storeInfo: '',
    storePic: null      
  }
});

const cancel = () => router.back(); //'취소' 누르면 이전페이지로 가게함

const triggerFileUpload = () => {
  fileInput.value.click();
};

const onFileChange = (e) => { //사진파일 선택하면 화면에 미리 보여줌
  const file = e.target.files[0]; //내가 선택한 사진파일하나 가져옴
  if (file) { //사진이 잘 선택되었다면,
    state.form.storePic = file; //그 사진을 state(보관함)에 잘 보관하고
    previewImage.value = URL.createObjectURL(file); //브라우저에만 쓸수있는 임시 주소를 만들어서 화면에 띄움(사진선택시 보이는 실선 화면)
  }
};

const submit = async () => { //추가 버튼 누르면 정보를 서버로 보냄. 사진글자 묶어서 formdata보냄
  if (!state.form.storeName) { //가게 이름 비었나 확인
    alert("가게 상호명을 입력해주세요."); 
    return; //이름없으면 멈춤.
  }
  try { //브라우저로 보낼 시도
    const formData = new FormData();
    formData.append('userId', 3); //뒷번호는 userId임. ⭐이건 나중에 진짜로그이한 번호가 자동으로 들어가게 고쳐야함.
    formData.append('storeName', state.form.storeName);
    formData.append('businessNumber', state.form.businessNumber);
    formData.append('businessName', state.form.businessName);
    formData.append('location', state.form.location + ' ' + state.form.addressDetail);
    formData.append('storeTel', state.form.storeTel);
    formData.append('storeInfo', state.form.storeInfo);
    
    if (state.form.storePic) { //만약에 사진도 골랐으면 보관함에 넣음
      formData.append('storePic', state.form.storePic);
    }

    await axios.post('/api/owner/store', formData, { //서버 주소로 보관함을 보냄.
      withCredentials: true 
    });

    store.setStore(state.form.storeName); // 등록 성공 가게이름을 앱에 기억시킴.
    alert("가게 등록이 완료되었습니다.");
    router.push('/owner/order'); //이제 주문 관리 화면으로 감.
  } catch (err) { // 보관함을 보내다가 오류가 나면
    console.error(err);
    alert("가게 등록에 실패했습니다."); //알림
  }
};
</script>

<template>
  <div class="container">
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
              <input type="text" class="full-input" placeholder="기본 주소" readonly v-model="state.form.location" />
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
            <div class="image-upload-box" @click="triggerFileUpload" style="cursor: pointer; overflow: hidden;">
              <img v-if="previewImage" :src="previewImage" style="width: 100%; height: 100%; object-fit: cover;" />
              <div v-else class="upload-placeholder">
                <span class="plus-icon">+</span>
                <p>여기를 눌러 사진을 추가 하세요</p>
              </div>
            </div>
            <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" style="display: none;" />
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
        <button class="btn-cancel" type="button" @click="cancel">취소</button>
        <button class="btn-submit" type="button" @click="submit">추가</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 정중앙 정렬을 위한 스타일 수정 */
.container { 
  display: flex; 
  justify-content: center; /* 가로 중앙 */
  align-items: center;     /* 세로 중앙 */
  background-color: #f9f9f9; 
  min-height: 100vh; 
  padding: 40px;
}

.main-content { 
  width: 100%;
  max-width: 1000px; /* 폼의 최대 너비 제한 */
  background: #fff;
  padding: 50px;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.content-header { border-bottom: 1px solid #eee; margin-bottom: 40px; padding-bottom: 15px; }
.content-header h1 { font-size: 24px; color: #333; text-align: center; } /* 타이틀도 중앙 */

.form-wrapper { display: flex; gap: 60px; }
.left-form, .right-form { flex: 1; display: flex; flex-direction: column; gap: 25px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 16px; font-weight: bold; color: #555; margin-bottom: 10px; }
.input-wrapper, .textarea-wrapper { position: relative; }
input, textarea { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12px; font-size: 15px; background-color: #fcfcfc; }
.char-count { position: absolute; right: 10px; bottom: -20px; font-size: 12px; color: #bbb; }
.zipcode-row { display: flex; gap: 10px; margin-bottom: 8px; }
.search-btn { white-space: nowrap; padding: 0 15px; border: 1px solid #ccc; border-radius: 20px; background: #fff; color: #888; font-size: 12px; cursor: pointer; }
.image-upload-box { width: 100%; height: 200px; border: 2px dashed #ccc; border-radius: 15px; display: flex; align-items: center; justify-content: center; background-color: #fff; }
.upload-placeholder { text-align: center; color: #bbb; }
.plus-icon { font-size: 40px; display: block; margin-bottom: 10px; }
textarea { height: 120px; resize: none; }
.action-buttons { display: flex; justify-content: center; gap: 15px; margin-top: 50px; } /* 버튼도 중앙 */
.btn-cancel { background: #e0e0e0; border: none; padding: 12px 40px; border-radius: 12px; cursor: pointer; font-weight: bold; }
.btn-submit { background: #4A5FF2; color: #fff; border: none; padding: 12px 60px; border-radius: 12px; cursor: pointer; font-weight: bold; }
.address-input { display: flex; flex-direction: column; gap: 12px; }
.full-input { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12px; }
</style>