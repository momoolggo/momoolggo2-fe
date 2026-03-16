<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/stores/useStore';
import { useUserStore } from '@/stores/userStore';
import ownerService from '@/services/ownerService';
import NaverMap from '@/components/common/NaverMap.vue';

const router = useRouter();
const store = useStore();
const userStore = useUserStore();

const fileInput = ref(null);
const previewImage = ref(null);

const state = reactive({
  form: {
    storeName: '',
    location: '',
    addressDetail: '',
    lat: null,
    lng: null,
    storeTel: '',
    businessName: '',
    businessNumber: '',
    storeInfo: '',
    storePic: '',
    categoryId: ''
  },
});

const onAddressSelect = ({ address, lat, lng }) => {
  state.form.location = address;
  state.form.lat = lat;
  state.form.lng = lng;
}

const handleCancel = () => router.back();

const triggerFileUpload = () => fileInput.value.click();

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file);
    previewImage.value = imageUrl;
    state.form.storePic = imageUrl;  // 문자열 경로로 저장
  }
};

const submit = async () => {
  if (!state.form.storeName) {
    alert("가게 상호명을 입력해주세요.");
    return;
  }
  try {
    // JSON 객체로 전송 (FormData 아님)
    const data = {
      userId: userStore.state.userNo,
      storeName: state.form.storeName,
      businessNumber: state.form.businessNumber,
      businessName: state.form.businessName,
      location: state.form.location + ' ' + state.form.addressDetail,
      storeTel: state.form.storeTel,
      storeInfo: state.form.storeInfo,
      storePic: state.form.storePic || '',
      categoryId: state.form.categoryId,
      lat: state.form.lat,
      lng: state.form.lng
    };

    await ownerService.registerStore(data);

    store.setStore(state.form.storeName);
    alert("가게 등록이 완료되었습니다.");
    router.push('/ownerservice');
  } catch (err) {
    console.error(err);
    alert("가게 등록에 실패했습니다.");
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

          <!-- 가게 상호명 -->
          <div class="form-group">
            <label>가게 상호명</label>
            <div class="input-wrapper">
              <input v-model="state.form.storeName" type="text" placeholder="가게 이름을 입력하세요" maxlength="24" />
              <span class="char-count">{{ state.form.storeName.length }}/24</span>
            </div>
          </div>

          <!-- 가게 주소 - NaverMap 컴포넌트 -->
          <div class="form-group">
            <label>가게 주소</label>
            <NaverMap @select="onAddressSelect" />
            <input
              v-if="state.form.location"
              v-model="state.form.addressDetail"
              type="text"
              placeholder="상세주소 입력 (동/호수 등)"
              class="full-input"
              style="margin-top: 8px;"
            />
          </div>

          <!-- 가게 전화번호 -->
          <div class="form-group">
            <label>가게 전화번호</label>
            <input v-model="state.form.storeTel" type="text" class="full-input" placeholder="010 - 0000 - 0000" />
          </div>

          <!-- 사업자 명 -->
          <div class="form-group">
            <label>사업자 명</label>
            <input v-model="state.form.businessName" type="text" class="full-input" placeholder="이름을 입력하세요" />
          </div>

          <!-- 사업자 번호 -->
          <div class="form-group">
            <label>사업자 번호</label>
            <input v-model="state.form.businessNumber" type="text" class="full-input" placeholder="사업자 번호를 입력하세요" />
          </div>

        </div>

        <div class="right-form">

          <!-- 가게 대표 사진 -->
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
            <label>카테고리</label>
             <select v-model="state.form.categoryId" class="full-input">
              <option value="" disabled>카테고리를 선택하세요</option>
              <option :value="1">한식</option>
              <option :value="2">중식</option>
              <option :value="3">일식</option>
              <option :value="4">양식</option>
              <option :value="5">디저트</option>
              <option :value="6">분식</option>
              <option :value="7">패스트푸드</option>
              <option :value="8">찜,탕</option>
              <option :value="9">치킨</option>
              <option :value="10">야식</option>
              <option :value="11">족발</option>
              <option :value="12">피자</option>
  </select>
</div>

          <!-- 가게 소개글 -->
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
        <button class="btn-submit" type="button" @click="submit">추가</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container { display: flex; justify-content: center; align-items: center; background-color: #f9f9f9; min-height: 100vh; padding: 40px; }
.main-content { width: 100%; max-width: 1000px; background: #fff; padding: 50px; border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.content-header { border-bottom: 1px solid #eee; margin-bottom: 40px; padding-bottom: 15px; }
.content-header h1 { font-size: 24px; color: #333; text-align: center; }
.form-wrapper { display: flex; gap: 60px; }
.left-form, .right-form { flex: 1; display: flex; flex-direction: column; gap: 25px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-size: 16px; font-weight: bold; color: #555; margin-bottom: 10px; }
.input-wrapper, .textarea-wrapper { position: relative; }
input, textarea { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12px; font-size: 15px; background-color: #fcfcfc; box-sizing: border-box; }
.char-count { position: absolute; right: 10px; bottom: -20px; font-size: 12px; color: #bbb; }
.full-input { width: 100%; padding: 12px 15px; border: 1.5px solid #ddd; border-radius: 12px; box-sizing: border-box; }
.image-upload-box { width: 100%; height: 200px; border: 2px dashed #ccc; border-radius: 15px; display: flex; align-items: center; justify-content: center; background-color: #fff; }
.upload-placeholder { text-align: center; color: #bbb; }
.plus-icon { font-size: 40px; display: block; margin-bottom: 10px; }
textarea { height: 120px; resize: none; }
.action-buttons { display: flex; justify-content: center; gap: 15px; margin-top: 50px; }
.btn-cancel { background: #e0e0e0; border: none; padding: 12px 40px; border-radius: 12px; cursor: pointer; font-weight: bold; }
.btn-submit { background: #4A5FF2; color: #fff; border: none; padding: 12px 60px; border-radius: 12px; cursor: pointer; font-weight: bold; }
</style>