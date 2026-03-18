<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ownerService from '@/services/ownerService'
import { useStore } from '@/stores/useStore'

const storeInfo = useStore()

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `http://localhost:8080${path}`
}

// ── 상태
const menuList = ref([])
const categories = ref([])
const loading = ref(false)

// 모달 상태
const showMenuModal = ref(false)
const showCategoryModal = ref(false)
const editMode = ref(false)

const menuForm = reactive({
  menuId: null,
  categoryId: null,
  name: '',
  menuInfo: '',
  price: '',
  menuPic: '',      // 서버 경로만 저장
  previewUrl: '',   // 화면 미리보기용 (blob URL)
})

const categoryForm = reactive({
  categoryId: null,
  category: '',
  editMode: false,
})

// ── 카테고리별 메뉴 그룹
const groupedMenus = computed(() => {
  const groups = []
  for (const cat of categories.value) {
    const catId = cat.categoryId
    const menus = menuList.value.filter(m => Number(m.categoryId) === Number(catId))
    groups.push({ ...cat, menus })
  }
  return groups
})

// ── 데이터 로드
const loadAll = async () => {
  if (!storeInfo.myStoreId) return
  loading.value = true
  try {
    const [menuRes, catRes] = await Promise.all([
      ownerService.getMenus(storeInfo.myStoreId),
      ownerService.getCategories(storeInfo.myStoreId),
    ])
    menuList.value = menuRes.resultData || []
    categories.value = catRes.resultData || []
  } catch (e) {
    console.error('로드 실패:', e)
    menuList.value = []
    categories.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

// ══════════════════════════════════════
//  메뉴 추가/수정 모달
// ══════════════════════════════════════
const openAddMenu = () => {
  menuForm.menuId = null
  menuForm.categoryId = categories.value.length ? categories.value[0].categoryId : null
  menuForm.name = ''
  menuForm.menuInfo = ''
  menuForm.price = ''
  menuForm.menuPic = ''
  menuForm.previewUrl = ''
  editMode.value = false
  showMenuModal.value = true
}

const openEditMenu = (item) => {
  menuForm.menuId = item.menuId
  menuForm.categoryId = item.categoryId
  menuForm.name = item.name
  menuForm.menuInfo = item.menuInfo || ''
  menuForm.price = item.price
  menuForm.menuPic = item.menuPic || ''
  menuForm.previewUrl = item.menuPic ? getImageUrl(item.menuPic) : ''
  editMode.value = true
  showMenuModal.value = true
}

// 파일 업로드 핸들러
const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 미리보기용 blob URL (화면에만 사용)
  menuForm.previewUrl = URL.createObjectURL(file)

  // 서버에 업로드 → 실제 경로 받아서 저장
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await ownerService.uploadMenuImage(formData)
    menuForm.menuPic = res.resultData  // /uploads/menu/파일명.jpg
  } catch {
    alert('이미지 업로드 실패')
    menuForm.previewUrl = ''
  }
}

const saveMenu = async () => {
  if (!menuForm.name) { alert('메뉴명을 입력해 주세요.'); return }
  if (!menuForm.price) { alert('가격을 입력해 주세요.'); return }
  if (!menuForm.categoryId) { alert('카테고리를 선택해 주세요.'); return }

  try {
    if (editMode.value) {
      await ownerService.updateMenu({
        menuId: menuForm.menuId,
        name: menuForm.name,
        categoryId: Number(menuForm.categoryId),
        menuInfo: menuForm.menuInfo,
        price: Number(menuForm.price),
        menuPic: menuForm.menuPic,
      })
    } else {
      await ownerService.registerMenu({
        storeId: storeInfo.myStoreId,
        categoryId: Number(menuForm.categoryId),
        name: menuForm.name,
        menuInfo: menuForm.menuInfo,
        price: Number(menuForm.price),
        menuPic: menuForm.menuPic,
      })
    }
    showMenuModal.value = false
    await loadAll()
  } catch {
    alert('저장 실패')
  }
}

const deleteMenu = async (menuId) => {
  if (!confirm('이 메뉴를 삭제하시겠습니까?')) return
  try {
    await ownerService.deleteMenu(menuId)
    await loadAll()
  } catch {
    alert('삭제 실패')
  }
}

// ══════════════════════════════════════
//  카테고리 관리 모달
// ══════════════════════════════════════
const openCategoryModal = () => {
  categoryForm.categoryId = null
  categoryForm.category = ''
  categoryForm.editMode = false
  showCategoryModal.value = true
}

const startEditCategory = (cat) => {
  categoryForm.categoryId = cat.categoryId
  categoryForm.category = cat.categoryName
  categoryForm.editMode = true
}

const cancelEditCategory = () => {
  categoryForm.categoryId = null
  categoryForm.category = ''
  categoryForm.editMode = false
}

const saveCategory = async () => {
  if (!categoryForm.category.trim()) { alert('카테고리명을 입력해 주세요.'); return }
  try {
    if (categoryForm.editMode) {
      await ownerService.updateCategory(categoryForm.categoryId, categoryForm.category.trim())
    } else {
      await ownerService.addCategory(storeInfo.myStoreId, categoryForm.category.trim())
    }
    categoryForm.categoryId = null
    categoryForm.category = ''
    categoryForm.editMode = false
    await loadAll()
  } catch {
    alert('저장 실패')
  }
}

const deleteCategory = async (categoryId) => {
  if (!confirm('이 카테고리와 포함된 메뉴가 모두 삭제됩니다. 계속하시겠습니까?')) return
  try {
    await ownerService.deleteCategory(categoryId)
    await loadAll()
  } catch {
    alert('삭제 실패')
  }
}

const formatPrice = (price) => Number(price).toLocaleString() + '원'
</script>

<template>
  <div class="menu-manage">

    <!-- 상단 탭 / 버튼 -->
    <div class="menu-topbar">
      <div class="tab-group">
        <span class="tab active">메뉴 관리</span>
        <button class="tab tab-btn" @click="openCategoryModal">카테고리 관리</button>
      </div>
      <button class="btn-add-menu" @click="openAddMenu">+ 메뉴 추가하기</button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="state-msg">불러오는 중...</div>

    <!-- 메뉴 목록 (카테고리별) -->
    <template v-else-if="groupedMenus.length">
      <div v-for="group in groupedMenus" :key="group.categoryId" class="category-group">
        <h3 class="category-title">{{ group.categoryName }}</h3>

        <div v-if="!group.menus.length" class="empty-cat">등록된 메뉴가 없습니다.</div>

        <div v-for="item in group.menus" :key="item.menuId" class="menu-row">
          <div class="menu-text">
            <div class="menu-name">{{ item.name }}</div>
            <div v-if="item.menuInfo" class="menu-desc">{{ item.menuInfo }}</div>
            <div class="menu-price">{{ formatPrice(item.price) }}</div>
          </div>
          <div class="menu-right">
            <!-- 수정된 부분: getImageUrl 적용 -->
            <img v-if="item.menuPic" :src="getImageUrl(item.menuPic)" class="menu-thumb" />
            <div v-else class="menu-thumb-empty">🍽️</div>
            <div class="menu-btns">
              <button class="btn-sm btn-edit" @click="openEditMenu(item)">수정</button>
              <button class="btn-sm btn-del" @click="deleteMenu(item.menuId)">삭제</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 완전 빈 상태 -->
    <div v-else class="state-msg">
      <p>등록된 메뉴가 없습니다.</p>
      <p class="sub">메뉴를 추가해 보세요!</p>
    </div>

    <!-- 메뉴 추가 / 수정 모달 -->
    <div v-if="showMenuModal" class="overlay" @click.self="showMenuModal = false">
      <div class="modal">
        <div class="modal-head">
          <h3>{{ editMode ? '메뉴 수정' : '메뉴 추가' }}</h3>
          <button class="modal-x" @click="showMenuModal = false">✕</button>
        </div>

        <div class="field">
          <label>메뉴명</label>
          <input v-model="menuForm.name" type="text" placeholder="메뉴명을 입력하세요" maxlength="24" />
          <span class="cnt">{{ menuForm.name.length }}/24</span>
        </div>

        <div class="field">
          <label>메뉴 설명</label>
          <textarea v-model="menuForm.menuInfo" placeholder="메뉴에 대한 설명을 입력하세요" maxlength="100"></textarea>
          <span class="cnt">{{ menuForm.menuInfo.length }}/100</span>
        </div>

        <div class="field">
          <label>가격</label>
          <div class="price-row">
            <input v-model="menuForm.price" type="number" placeholder="0" />
            <span class="unit">원</span>
          </div>
        </div>

        <div class="field">
          <label>카테고리</label>
          <select v-model="menuForm.categoryId">
            <option :value="null" disabled>카테고리를 선택하세요</option>
            <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
              {{ cat.categoryName }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>메뉴 사진</label>
          <input type="file" accept="image/*" @change="handleImageUpload" />
          <img v-if="menuForm.previewUrl" :src="menuForm.previewUrl"
               style="width:100px; height:100px; object-fit:cover; margin-top:8px; border-radius:8px;" />
        </div>

        <div class="modal-foot">
          <button class="btn-cancel" @click="showMenuModal = false">취소</button>
          <button class="btn-save" @click="saveMenu">저장</button>
        </div>
      </div>
    </div>

    <!-- 카테고리 관리 모달 -->
    <div v-if="showCategoryModal" class="overlay" @click.self="showCategoryModal = false">
      <div class="modal modal-cat">
        <div class="modal-head">
          <h3>카테고리 관리</h3>
          <button class="modal-x" @click="showCategoryModal = false">✕</button>
        </div>

        <div class="cat-list">
          <div v-for="cat in categories" :key="cat.categoryId" class="cat-item">
            <span class="cat-name">{{ cat.categoryName }}</span>
            <div class="cat-actions">
              <button class="btn-xs" @click="startEditCategory(cat)">수정</button>
              <button class="btn-xs btn-xs-del" @click="deleteCategory(cat.categoryId)">삭제</button>
            </div>
          </div>
          <div v-if="!categories.length" class="empty-cat">등록된 카테고리가 없습니다.</div>
        </div>

        <div class="cat-form">
          <input
            v-model="categoryForm.category"
            type="text"
            :placeholder="categoryForm.editMode ? '카테고리명 수정' : '새 카테고리명 입력'"
            maxlength="20"
            @keyup.enter="saveCategory"
          />
          <button class="btn-cat-save" @click="saveCategory">
            {{ categoryForm.editMode ? '수정' : '추가' }}
          </button>
          <button v-if="categoryForm.editMode" class="btn-cat-cancel" @click="cancelEditCategory">취소</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.menu-manage {
  max-width: 900px;
  margin: 0 auto;
}
.menu-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  border-bottom: 2px solid #eee;
  padding-bottom: 14px;
}
.tab-group {
  display: flex;
  gap: 8px;
}
.tab {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;
  border: 1.5px solid transparent;
  background: none;
  color: #888;
  cursor: default;
}
.tab.active {
  color: #A40C0B;
  border-color: #A40C0B;
  background: #fff4f4;
}
.tab-btn {
  cursor: pointer;
  border: 1.5px solid #e5e3dc;
  transition: all 0.15s;
}
.tab-btn:hover {
  border-color: #A40C0B;
  color: #A40C0B;
}
.btn-add-menu {
  padding: 10px 22px;
  background: #A40C0B;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-add-menu:hover { background: #8a0a09; }
.category-group { margin-bottom: 32px; }
.category-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  padding: 10px 0;
  border-bottom: 1.5px solid #eee;
  margin-bottom: 12px;
}
.menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 12px;
  margin-bottom: 10px;
  transition: box-shadow 0.15s;
}
.menu-row:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.menu-text { flex: 1; min-width: 0; }
.menu-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.menu-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.menu-price { font-size: 15px; font-weight: 700; color: #A40C0B; }
.menu-right {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: 20px;
  flex-shrink: 0;
}
.menu-thumb { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; }
.menu-thumb-empty {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.menu-btns { display: flex; flex-direction: column; gap: 6px; }
.btn-sm {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-edit { background: #fff; border: 1.5px solid #ddd; color: #555; }
.btn-edit:hover { border-color: #A40C0B; color: #A40C0B; }
.btn-del { background: #fff; border: 1.5px solid #A40C0B; color: #A40C0B; }
.btn-del:hover { background: #A40C0B; color: #fff; }
.state-msg { text-align: center; padding: 60px 0; color: #888; font-size: 15px; }
.state-msg .sub { font-size: 13px; color: #bbb; margin-top: 8px; }
.empty-cat { text-align: center; color: #bbb; padding: 20px 0; font-size: 13px; }
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: #fff;
  border-radius: 18px;
  padding: 30px 28px;
  width: 460px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-head { display: flex; align-items: center; justify-content: space-between; }
.modal-head h3 { font-size: 18px; font-weight: 700; }
.modal-x { background: none; border: none; font-size: 20px; cursor: pointer; color: #888; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #444; }
.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e5e3dc;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fafafa;
  box-sizing: border-box;
  transition: border-color 0.15s;
  font-family: inherit;
}
.field input:focus,
.field textarea:focus,
.field select:focus { border-color: #A40C0B; background: #fff; }
.field textarea { height: 90px; resize: none; }
.cnt { align-self: flex-end; font-size: 11px; color: #bbb; }
.price-row { display: flex; align-items: center; gap: 8px; }
.price-row input { flex: 1; }
.unit { font-size: 14px; font-weight: 600; color: #444; }
.modal-foot { display: flex; gap: 10px; margin-top: 6px; }
.btn-cancel {
  flex: 1;
  padding: 13px;
  background: #f4f4f4;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel:hover { background: #e8e8e8; }
.btn-save {
  flex: 1;
  padding: 13px;
  background: #A40C0B;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-save:hover { background: #8a0a09; }
.modal-cat { width: 420px; }
.cat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  border: 1.5px solid #eee;
  border-radius: 10px;
  padding: 12px;
}
.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 8px;
}
.cat-name { font-size: 14px; font-weight: 600; color: #333; }
.cat-actions { display: flex; gap: 6px; }
.btn-xs {
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  border: 1.5px solid #ddd;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-xs:hover { border-color: #A40C0B; color: #A40C0B; }
.btn-xs-del { border-color: #A40C0B; color: #A40C0B; }
.btn-xs-del:hover { background: #A40C0B; color: #fff; }
.cat-form { display: flex; gap: 8px; align-items: center; }
.cat-form input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e5e3dc;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fafafa;
  transition: border-color 0.15s;
}
.cat-form input:focus { border-color: #A40C0B; background: #fff; }
.btn-cat-save {
  padding: 10px 18px;
  background: #A40C0B;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.btn-cat-save:hover { background: #8a0a09; }
.btn-cat-cancel {
  padding: 10px 14px;
  background: #f4f4f4;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.btn-cat-cancel:hover { background: #e8e8e8; }
</style>