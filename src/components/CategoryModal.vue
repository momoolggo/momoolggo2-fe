<script setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  initialCategories: { type: Array, default: () => [] },
  initialSelected: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'save']);

const categories = ref([...props.initialCategories]);
const selectedCategories = ref([...props.initialSelected]);
const selectedId = ref(null); // 현재 선택된 카테고리 ID
const editingId = ref(null);
const tempName = ref('');
const newCategoryName = ref('');

const enableEdit = (cat) => { editingId.value = cat.id; tempName.value = cat.name; };
const saveEdit = (cat) => { cat.name = tempName.value; editingId.value = null; };

const addCategory = () => {
  if (newCategoryName.value.trim()) {
    categories.value.push({ id: Date.now(), name: newCategoryName.value });
    newCategoryName.value = '';
  }
};

const selectCategory = () => {
  const cat = categories.value.find(c => c.id === selectedId.value);
  if (cat && !selectedCategories.value.find(c => c.id === cat.id)) {
    selectedCategories.value.push({ ...cat });
  }
};

const removeSelected = (index) => { selectedCategories.value.splice(index, 1); };
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <img src="@/assets/뒤로가기.png" class="back-btn" @click="emit('close')" alt="뒤로가기" />
        <h2>카테고리 관리</h2>
      </div>

      <div class="main-wrapper">
        <div class="column">
          <h3>메뉴 카테고리</h3>
          <div class="list-box">
            <div v-for="cat in categories" :key="cat.id" 
                 class="item" 
                 :class="{ active: selectedId === cat.id }"
                 @click="selectedId = cat.id">
              <input v-if="editingId === cat.id" v-model="tempName" @blur="saveEdit(cat)" @keyup.enter="saveEdit(cat)" />
              <span v-else>{{ cat.name }}</span>
              <button class="edit-btn" @click.stop="enableEdit(cat)">수정</button>
            </div>
            <input v-model="newCategoryName" placeholder="+ 카테고리 추가" @keyup.enter="addCategory" class="add-input" />
          </div>
        </div>

        <div class="middle-action">
          <button class="btn-select" @click="selectCategory">선택 ▶</button>
        </div>

        <div class="column">
          <h3>선택한 메뉴</h3>
          <draggable v-model="selectedCategories" item-key="id" class="list-box">
            <template #item="{ element, index }">
              <div class="item selected-item">
                <span>{{ element.name }}</span>
                <button class="remove-btn" @click="removeSelected(index)">-</button>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <button class="btn-save" @click="emit('save', { all: categories, selected: selectedCategories })">저장</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:9999; }
.modal-content { background:#fff; width:750px; padding:40px; border-radius:20px; box-shadow:0 4px 20px rgba(0,0,0,0.1); }
.modal-header { display:flex; align-items:center; gap:15px; margin-bottom:30px; }
.back-btn { width:24px; height:24px; cursor:pointer; }

.main-wrapper { display:flex; gap:20px; align-items:center; }
.column { flex:1; }
.list-box { border:1px solid #ddd; border-radius:8px; min-height:400px; padding:10px; }

.item { display:flex; justify-content:space-between; padding:15px; background:#f4f4f4; border-radius:4px; margin-bottom:8px; cursor:pointer; }
.item.active { background:#e0e0e0; border:1px solid #ccc; }
.edit-btn { font-size:12px; color:#888; background:none; border:none; cursor:pointer; }

.middle-action { display:flex; align-items:center; }
.btn-select { padding:10px 15px; background:#e0e0e0; border:none; border-radius:5px; cursor:pointer; font-weight:bold; }

.selected-item { background:#fff; border:1px solid #ddd; }
.remove-btn { color:#888; font-weight:bold; cursor:pointer; border:none; background:none; }

.add-input { width:100%; padding:10px; border:1px dashed #ccc; border-radius:4px; margin-top:10px; box-sizing:border-box; }
.btn-save { width:100%; margin-top:30px; padding:15px; background:#4A90E2; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:16px; }
</style>