<script setup>
import { ref } from 'vue';

const props = defineProps({
  categories: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'save']);
const fileInput = ref(null);

const menuData = ref({
  name: '',
  description: '',
  price: '',
  categoryId: null,
  image: null
});

const triggerUpload = () => fileInput.value.click();
const onFileSelected = (e) => { menuData.value.image = e.target.files[0]; };

const handleSave = () => {
  emit('save', menuData.value);
};
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2>메뉴 추가</h2>
      <div class="form-group">
        <label>메뉴명</label>
        <input type="text" v-model="menuData.name" maxlength="24" placeholder="메뉴명을 입력하세요" />
        <span class="count">{{ menuData.name.length }}/24</span>
      </div>
      <div class="form-group">
        <label>메뉴설명</label>
        <textarea v-model="menuData.description" maxlength="100" placeholder="메뉴에 대한 설명을 입력하세요"></textarea>
        <span class="count">{{ menuData.description.length }}/100</span>
      </div>
      <div class="form-group">
        <label>가격</label>
        <div class="price-input">
          <input type="number" v-model="menuData.price" placeholder="0" />
          <span>원</span>
        </div>
      </div>
      <div class="form-group">
        <label>카테고리</label>
        <select v-model="menuData.categoryId">
          <option :value="null" disabled>카테고리를 선택하세요</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>메뉴사진</label>
        <input type="file" ref="fileInput" @change="onFileSelected" style="display: none" />
        <div class="image-upload-box" @click="triggerUpload">
          <div class="plus-icon">+</div>
          <p>{{ menuData.image ? menuData.image.name : '여기를 눌러 사진을 추가하세요' }}</p>
        </div>
      </div>
      <div class="button-group">
        <button class="btn-cancel" @click="emit('close')">취소</button>
        <button class="btn-save" @click="handleSave">저장</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:9999; }
.modal-content { background:#fff; width:500px; padding:40px; border-radius:20px; box-shadow:0 4px 20px rgba(0,0,0,0.1); }
h2 { margin-bottom: 30px; font-size: 20px; }
.form-group { margin-bottom: 20px; display: flex; flex-direction: column; }
label { margin-bottom: 8px; font-weight: bold; color: #555; }
input, textarea, select { padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; }
textarea { height: 100px; resize: none; }
.count { align-self: flex-end; font-size: 12px; color: #aaa; margin-top: 5px; }
.price-input { display: flex; align-items: center; gap: 10px; }
.price-input input { flex: 1; }
.image-upload-box { border: 2px dashed #ddd; border-radius: 8px; height: 150px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #aaa; cursor: pointer; }
.plus-icon { font-size: 24px; margin-bottom: 10px; }
.button-group { display: flex; gap: 10px; margin-top: 30px; }
.btn-cancel { flex: 1; padding: 15px; background: #f4f4f4; border: none; border-radius: 10px; cursor: pointer; }
.btn-save { flex: 1; padding: 15px; background: #4A90E2; color: #fff; border: none; border-radius: 10px; cursor: pointer; }
</style>