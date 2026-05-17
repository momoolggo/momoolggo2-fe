<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import ownerService from '@/services/ownerService'
import { useStore } from '@/stores/useStore'
import { showAlert, showConfirm } from '@/composables/useAlert'

const storeInfo = useStore()

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${path}`
}

const menuList = ref([])
const categories = ref([])
const loading = ref(false)

const showMenuModal = ref(false)
const showCategoryModal = ref(false)
const showOptionModal = ref(false)
const showOptionForm = ref(false)


const editMode = ref(false)
const selectedMenu = ref(null)
const optionCategories = ref([])
const editingOptionCategory = ref(null)

const menuForm = reactive({
  menuId: null,
  categoryId: null,
  name: '',
  menuInfo: '',
  price: '',
  menuPic: '',
  previewUrl: '',
})

const categoryForm = reactive({
  categoryId: null,
  category: '',
  editMode: false,
})

const optionCategoryForm = reactive({
  optionCategoryNo: null,
  optionCategoryName: '',
  isRequired: true,
  maxSelect: 1,
})

const optionForms = ref([{ name: '', price: 0, soldOut: 'N' }])

const groupedMenus = computed(() => {
  const groups = []

  for (const cat of categories.value) {
    const menus = menuList.value.filter(
      (menu) => Number(menu.categoryId) === Number(cat.categoryId),
    )

    groups.push({ ...cat, menus })
  }

  return groups
})

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
  } catch (error) {
    console.error('로드 실패:', error)
    menuList.value = []
    categories.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
watch(() => storeInfo.myStoreId, loadAll)

// 메뉴 추가 / 수정
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

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  menuForm.previewUrl = URL.createObjectURL(file)

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await ownerService.uploadMenuImage(formData)
    menuForm.menuPic = res.resultData
  } catch {
    await showAlert('이미지 업로드에 실패했습니다.', {
      title: '업로드 오류',
      type: 'error',
    })
    menuForm.previewUrl = ''
  }
}

const saveMenu = async () => {
  if (!menuForm.name) {
    await showAlert('메뉴명을 입력해 주세요.', { title: '입력 필요', type: 'warning' })
    return
  }

  if (!menuForm.price) {
    await showAlert('가격을 입력해 주세요.', { title: '입력 필요', type: 'warning' })
    return
  }

  if (!menuForm.categoryId) {
    await showAlert('카테고리를 선택해 주세요.', { title: '입력 필요', type: 'warning' })
    return
  }

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
    await showAlert('저장에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

const deleteMenu = async (menuId) => {
  const ok = await showConfirm('이 메뉴를 삭제하시겠습니까?', {
    title: '메뉴 삭제',
    type: 'warning',
  })

  if (!ok) return

  try {
    await ownerService.deleteMenu(menuId)
    await loadAll()
  } catch {
    await showAlert('삭제에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

// 옵션 관리
const resetOptionForm = () => {
  editingOptionCategory.value = null
  optionCategoryForm.optionCategoryNo = null
  optionCategoryForm.optionCategoryName = ''
  optionCategoryForm.isRequired = true
  optionCategoryForm.maxSelect = 1
  optionForms.value = [{ name: '', price: 0, soldOut: 'N' }]
}


const openOptionModal = (menu) => {
  selectedMenu.value = menu
  optionCategories.value = menu.optionCategories || []
  resetOptionForm()
  showOptionForm.value = false
  showOptionModal.value = true
}

const closeOptionModal = () => {
  showOptionModal.value = false
  selectedMenu.value = null
  optionCategories.value = []
  resetOptionForm()
}

const startAddOptionCategory = () => {
  resetOptionForm()
  showOptionForm.value = true
}


const startEditOptionCategory = (category) => {
  editingOptionCategory.value = category
  optionCategoryForm.optionCategoryNo = category.optionCategoryNo
  optionCategoryForm.optionCategoryName = category.optionCategoryName
  optionCategoryForm.isRequired = category.isRequired
  optionCategoryForm.maxSelect = category.maxSelect

  optionForms.value = category.options?.length
    ? category.options.map((option) => ({
        optionId: option.optionId,
        name: option.name,
        price: option.price || 0,
        soldOut: option.soldOut || 'N',
      }))
    : [{ name: '', price: 0, soldOut: 'N' }]

  showOptionForm.value = true
}


const addOptionRow = () => {
  optionForms.value.push({ name: '', price: 0, soldOut: 'N' })
}

const removeOptionRow = async (index) => {
  if (optionForms.value.length === 1) return

  const option = optionForms.value[index]

  if (option.optionId) {
    const ok = await showConfirm('이 옵션을 삭제하시겠습니까?', {
      title: '옵션 삭제',
      type: 'warning',
    })

    if (!ok) return

    try {
      await ownerService.deleteOption(option.optionId)
    } catch (error) {
      console.error('옵션 삭제 실패:', error.response?.status, error.response?.data || error)
      await showAlert('옵션 삭제에 실패했습니다.', { title: '오류', type: 'error' })
      return
    }
  }

  optionForms.value.splice(index, 1)
}

const saveOptions = async () => {
  if (!selectedMenu.value) return

  if (!optionCategoryForm.optionCategoryName.trim()) {
    await showAlert('옵션 그룹명을 입력해 주세요.', {
      title: '입력 필요',
      type: 'warning',
    })
    return
  }

  const validOptions = optionForms.value.filter((option) => option.name.trim())

  if (!validOptions.length) {
    await showAlert('옵션을 1개 이상 입력해 주세요.', {
      title: '입력 필요',
      type: 'warning',
    })
    return
  }

  try {
    if (optionCategoryForm.optionCategoryNo) {
      await ownerService.updateOptionCategory(optionCategoryForm.optionCategoryNo, {
        optionCategoryName: optionCategoryForm.optionCategoryName.trim(),
        isRequired: optionCategoryForm.isRequired,
        maxSelect: Number(optionCategoryForm.maxSelect),
      })

      await Promise.all(
        validOptions.map((option) => {
          const optionData = {
            name: option.name.trim(),
            price: Number(option.price) || 0,
            soldOut: option.soldOut || 'N',
          }

          if (option.optionId) {
            return ownerService.updateOption(option.optionId, optionData)
          }

          return ownerService.registerOption({
            optionCategoryNo: optionCategoryForm.optionCategoryNo,
            ...optionData,
          })
        }),
      )
    } else {
      await ownerService.registerOptionCategory(selectedMenu.value.menuId, {
        optionCategoryName: optionCategoryForm.optionCategoryName.trim(),
        isRequired: optionCategoryForm.isRequired,
        maxSelect: Number(optionCategoryForm.maxSelect),
        options: validOptions.map((option) => ({
          name: option.name.trim(),
          price: Number(option.price) || 0,
          soldOut: 'N',
        })),
      })
    }

    showOptionModal.value = false
    await loadAll()
  } catch (error) {
    console.error('옵션 저장 실패:', error.response?.status, error.response?.data || error)

    const message =
      error.response?.data?.resultMessage ||
      error.response?.data?.message ||
      '옵션 저장에 실패했습니다.'

    await showAlert(message, { title: '오류', type: 'error' })
  }
}

const deleteOptionCategory = async (category) => {
  const ok = await showConfirm('이 옵션 카테고리를 삭제하시겠습니까?', {
    title: '옵션 카테고리 삭제',
    type: 'warning',
  })

  if (!ok) return

  try {
    await ownerService.deleteOptionCategory(category.optionCategoryNo)
    optionCategories.value = optionCategories.value.filter(
      (item) => item.optionCategoryNo !== category.optionCategoryNo,
    )

    if (optionCategoryForm.optionCategoryNo === category.optionCategoryNo) {
      resetOptionForm()
    }

    await loadAll()
  } catch (error) {
    console.error('옵션 카테고리 삭제 실패:', error.response?.status, error.response?.data || error)
    await showAlert('옵션 카테고리 삭제에 실패했습니다.', {
      title: '오류',
      type: 'error',
    })
  }
}

// 카테고리 관리
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
  if (!categoryForm.category.trim()) {
    await showAlert('카테고리명을 입력해 주세요.', {
      title: '입력 필요',
      type: 'warning',
    })
    return
  }

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
    await showAlert('저장에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

const deleteCategory = async (categoryId) => {
  const ok = await showConfirm('이 카테고리와 포함된 메뉴가 모두 삭제됩니다. 계속하시겠습니까?', {
    title: '카테고리 삭제',
    type: 'warning',
  })

  if (!ok) return

  try {
    await ownerService.deleteCategory(categoryId)
    await loadAll()
  } catch {
    await showAlert('삭제에 실패했습니다.', { title: '오류', type: 'error' })
  }
}

const formatPrice = (price) => Number(price).toLocaleString() + '원'
</script>

<template>
  <div class="menu-manage">
    <div class="menu-topbar">
      <div class="tab-group">
        <span class="tab active">메뉴 관리</span>
        <button class="tab tab-btn" @click="openCategoryModal">카테고리 관리</button>
      </div>
      <button class="btn-add-menu" @click="openAddMenu">+ 메뉴 추가하기</button>
    </div>

    <div v-if="loading" class="state-msg">불러오는 중...</div>

    <template v-else-if="groupedMenus.length">
      <div v-for="group in groupedMenus" :key="group.categoryId" class="category-group">
        <h3 class="category-title">{{ group.categoryName }}</h3>

        <div v-if="!group.menus.length" class="empty-cat">등록된 메뉴가 없습니다.</div>

        <div v-for="item in group.menus" :key="item.menuId" class="menu-row">
          <div class="menu-text">
            <div class="menu-name">{{ item.name }}</div>
            <div v-if="item.menuInfo" class="menu-desc">{{ item.menuInfo }}</div>
            <div class="menu-price">{{ formatPrice(item.price) }}</div>

            <div v-if="item.optionCategories?.length" class="menu-options">
              <div
                v-for="category in item.optionCategories"
                :key="category.optionCategoryNo"
                class="option-category"
              >
                <div class="option-category-title">
                  {{ category.optionCategoryName }}
                  <span v-if="category.isRequired" class="required-badge">필수</span>
                  <span v-else class="optional-badge">선택</span>
                </div>

                <div class="option-chip-list">
                  <span
                    v-for="option in category.options || []"
                    :key="option.optionId"
                    class="menu-option-chip"
                    :class="{ soldout: option.soldOut === 'Y' }"
                  >
                    {{ option.name }}
                    <template v-if="option.price">
                      +{{ Number(option.price).toLocaleString() }}원
                    </template>
                    <template v-if="option.soldOut === 'Y'">품절</template>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="menu-right">
            <img v-if="item.menuPic" :src="getImageUrl(item.menuPic)" class="menu-thumb" />
            <div v-else class="menu-thumb-empty">🍽️</div>

            <div class="menu-btns">
              <button class="btn-sm btn-option" @click="openOptionModal(item)">옵션 관리</button>
              <button class="btn-sm btn-edit" @click="openEditMenu(item)">수정</button>
              <button class="btn-sm btn-del" @click="deleteMenu(item.menuId)">삭제</button>
            </div>
          </div>
        </div>
      </div>
    </template>

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
          <textarea
            v-model="menuForm.menuInfo"
            placeholder="메뉴에 대한 설명을 입력하세요"
            maxlength="100"
          ></textarea>
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
          <img v-if="menuForm.previewUrl" :src="menuForm.previewUrl" class="menu-preview" />
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
          <button v-if="categoryForm.editMode" class="btn-cat-cancel" @click="cancelEditCategory">
            취소
          </button>
        </div>
      </div>
    </div>

    <!-- 옵션 관리 모달 -->
  <!-- 옵션 관리 모달 -->
<div v-if="showOptionModal" class="overlay" @click.self="closeOptionModal">
  <div class="modal option-modal" @keydown.stop>
    <div class="modal-head">
      <h3>옵션 관리</h3>
      <button class="modal-x" @click="closeOptionModal">✕</button>
    </div>

    <!-- 등록된 옵션 카테고리 목록 -->
    <div class="option-category-manage-list">
      <div v-if="!optionCategories.length" class="option-empty">
        등록된 옵션 카테고리가 없습니다.
      </div>

      <div
        v-for="category in optionCategories"
        :key="category.optionCategoryNo"
        class="option-manage-card"
        :class="{ active: optionCategoryForm.optionCategoryNo === category.optionCategoryNo }"
      >
        <div class="option-manage-main">
          <div class="option-manage-title">
            {{ category.optionCategoryName }}
            <span v-if="category.isRequired" class="required-badge">필수</span>
            <span v-else class="optional-badge">선택</span>
          </div>

          <div class="option-chip-list">
            <span
              v-for="option in category.options || []"
              :key="option.optionId"
              class="menu-option-chip"
            >
              {{ option.name }}
              <template v-if="option.price">
                +{{ Number(option.price).toLocaleString() }}원
              </template>
            </span>
          </div>
        </div>

        <div class="option-manage-actions">
          <button class="btn-xs" @click="startEditOptionCategory(category)">수정</button>
          <button class="btn-xs btn-xs-del" @click="deleteOptionCategory(category)">삭제</button>
        </div>
      </div>
    </div>

    <!-- 새 옵션 카테고리 추가 버튼 -->
    <button class="btn-add-option-category" @click="startAddOptionCategory">
      + 새 옵션 카테고리 추가
    </button>

    <!-- 추가/수정 폼: 버튼을 눌렀을 때만 보임 -->
    <template v-if="showOptionForm">
      <div class="option-form-divider"></div>

      <div class="field">
        <label>옵션 그룹명</label>
        <input
          v-model="optionCategoryForm.optionCategoryName"
          type="text"
          placeholder="예: 사이즈, 맵기, 토핑"
          maxlength="30"
        />
      </div>

      <div class="field">
        <label>필수 선택 여부</label>
        <select v-model="optionCategoryForm.isRequired">
          <option :value="true">필수</option>
          <option :value="false">선택</option>
        </select>
      </div>

      <div class="field">
        <label>최대 선택 개수</label>
        <input v-model="optionCategoryForm.maxSelect" type="number" min="1" />
      </div>

      <div class="option-form-list">
        <div
          v-for="(option, index) in optionForms"
          :key="option.optionId || index"
          class="option-form-row"
        >
          <input v-model="option.name" type="text" placeholder="옵션명" maxlength="30" />
          <input v-model="option.price" type="number" placeholder="추가 금액" />
          <button type="button" class="btn-remove-option" @click="removeOptionRow(index)">
            ✕
          </button>
        </div>
      </div>

      <button type="button" class="btn-add-option-row" @click="addOptionRow">
        + 옵션 항목 추가
      </button>

      <div class="modal-foot">
        <button class="btn-cancel" @click="showOptionForm = false">닫기</button>
        <button class="btn-save" @click="saveOptions">
          {{ optionCategoryForm.optionCategoryNo ? '수정 저장' : '추가 저장' }}
        </button>
      </div>
    </template>
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
  color: #a40c0b;
  border-color: #a40c0b;
  background: #fff4f4;
}

.tab-btn {
  cursor: pointer;
  border: 1.5px solid #e5e3dc;
  transition: all 0.15s;
}

.tab-btn:hover {
  border-color: #a40c0b;
  color: #a40c0b;
}

.btn-add-menu {
  padding: 10px 22px;
  background: #a40c0b;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.category-group {
  margin-bottom: 32px;
}

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
}

.menu-text {
  flex: 1;
  min-width: 0;
}

.menu-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.menu-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
}

.menu-price {
  font-size: 15px;
  font-weight: 700;
  color: #a40c0b;
}

.menu-options {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-category {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.option-category-title {
  font-size: 12px;
  font-weight: 700;
  color: #555;
}

.required-badge,
.optional-badge {
  margin-left: 4px;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.required-badge {
  background: #fff4f4;
  color: #a40c0b;
}

.optional-badge {
  background: #f2f2f2;
  color: #777;
}

.option-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.menu-option-chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: #f7f7f7;
  border: 1px solid #e5e3dc;
  color: #666;
  font-size: 12px;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: 20px;
  flex-shrink: 0;
}

.menu-thumb,
.menu-thumb-empty {
  width: 72px;
  height: 72px;
  border-radius: 10px;
}

.menu-thumb {
  object-fit: cover;
}

.menu-thumb-empty {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.menu-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-sm {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-option {
  background: #fff;
  border: 1.5px solid #4a80da;
  color: #4a80da;
}

.btn-edit {
  background: #fff;
  border: 1.5px solid #ddd;
  color: #555;
}

.btn-del {
  background: #fff;
  border: 1.5px solid #a40c0b;
  color: #a40c0b;
}

.state-msg {
  text-align: center;
  padding: 60px 0;
  color: #888;
  font-size: 15px;
}

.state-msg .sub {
  font-size: 13px;
  color: #bbb;
  margin-top: 8px;
}

.empty-cat {
  text-align: center;
  color: #bbb;
  padding: 20px 0;
  font-size: 13px;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
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

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-head h3 {
  font-size: 18px;
  font-weight: 700;
}

.modal-x {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}

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
  font-family: inherit;
}

.field textarea {
  height: 90px;
  resize: none;
}

.cnt {
  align-self: flex-end;
  font-size: 11px;
  color: #bbb;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-row input {
  flex: 1;
}

.unit {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.modal-foot {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 13px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  background: #f4f4f4;
  color: #333;
}

.btn-save {
  background: #a40c0b;
  color: #fff;
}

.menu-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-top: 8px;
  border-radius: 8px;
}

.modal-cat {
  width: 420px;
}

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

.cat-name {
  font-size: 14px;
  font-weight: 600;
}

.cat-actions {
  display: flex;
  gap: 6px;
}

.btn-xs {
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  border: 1.5px solid #ddd;
  background: #fff;
  color: #555;
  cursor: pointer;
}

.btn-xs-del {
  border-color: #a40c0b;
  color: #a40c0b;
}

.cat-form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cat-form input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e5e3dc;
  border-radius: 10px;
  font-size: 14px;
}

.btn-cat-save,
.btn-cat-cancel {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cat-save {
  background: #a40c0b;
  color: #fff;
}

.btn-cat-cancel {
  background: #f4f4f4;
}

.option-modal {
  width: 560px;
}

.option-category-manage-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-empty {
  padding: 14px;
  border: 1px dashed #ddd;
  border-radius: 10px;
  color: #999;
  text-align: center;
  font-size: 13px;
}

.option-manage-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border: 1.5px solid #eee;
  border-radius: 12px;
  box-sizing: border-box;
}

.option-manage-card.active {
  border-color: #a40c0b;
  background: #fff8f8;
}

.option-manage-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-manage-title {
  font-size: 14px;
  font-weight: 700;
}

.option-manage-actions {
  width: 92px;
  display: grid;
  grid-template-columns: 43px 43px;
  gap: 6px;
  align-items: start;
  justify-content: end;
}

.option-manage-actions .btn-xs {
  width: 43px;
  min-width: 43px;
  padding: 5px 0;
  box-sizing: border-box;
  text-align: center;
}

.btn-add-option-category {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px dashed #4a80da;
  border-radius: 10px;
  background: #f7faff;
  color: #4a80da;
  font-weight: 700;
  cursor: pointer;
}

.option-form-divider {
  height: 1px;
  background: #eee;
}

.option-form-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-form-row {
  display: grid;
  grid-template-columns: 1fr 120px 36px;
  gap: 8px;
  align-items: center;
}

.option-form-row input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e3dc;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-remove-option {
  height: 38px;
  border: none;
  border-radius: 8px;
  background: #f4f4f4;
  color: #777;
  cursor: pointer;
}

.btn-add-option-row {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px dashed #a40c0b;
  border-radius: 10px;
  background: #fff8f8;
  color: #a40c0b;
  font-weight: 700;
  cursor: pointer;
}

</style>
