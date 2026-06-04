<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import cartService from '@/services/cartService'
import storeService from '@/services/storeService'
import { showAlert, showConfirm } from '@/composables/useAlert'

const props = defineProps({
  menu: Object,
  isOpen: Boolean,
  minPrice: { type: Number, default: 0 },
  mode: { type: String, default: 'add' },
  cartItemId: { type: [Number, String], default: null },
  initialOptionSignature: { type: String, default: '' },
  initialQuantity: { type: Number, default: 1 },
})

const emit = defineEmits(['close', 'add-to-cart', 'option-updated'])
const userStore = useUserStore()
const quantity = ref(1)
const optionCategories = ref([])
const optionLoading = ref(false)
const selectedOptionIdsByCategory = reactive({})

const getImageUrl = (path) => {
  if (!path) return '/images/default-menu.png'
  if (path.startsWith('data:')) return path
  if (path.startsWith('http') || path.startsWith('blob')) return path
  return `${path}`
}

const formatPrice = (value) => `${Number(value || 0).toLocaleString()}원`

const resetOptions = () => {
  Object.keys(selectedOptionIdsByCategory).forEach((key) => {
    delete selectedOptionIdsByCategory[key]
  })
}

const loadMenuOptions = async () => {
  resetOptions()
  optionCategories.value = []
  if (!props.isOpen || !props.menu?.menuId) return

  optionLoading.value = true
  try {
    if (props.menu.optionCategories?.length) {
      optionCategories.value = props.menu.optionCategories
      return
    }

    const res = await storeService.getMenuOptions(props.menu.menuId)
    optionCategories.value = res.resultData || []
  } catch (error) {
    console.error('옵션 로드 실패:', error)
    optionCategories.value = []
    await showAlert('메뉴 옵션을 불러오지 못했습니다.', { title: '오류', type: 'error' })
  } finally {
    applyInitialOptions()
    optionLoading.value = false
  }
}

watch(
  () => [props.isOpen, props.menu?.menuId, props.initialOptionSignature, props.initialQuantity],
  () => {
    quantity.value = props.mode === 'edit' ? Number(props.initialQuantity || 1) : 1
    loadMenuOptions()
  },
  { immediate: true },
)

const applyInitialOptions = () => {
  if (props.mode !== 'edit') return

  const optionIds = String(props.initialOptionSignature || '')
    .split(',')
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0)

  if (!optionIds.length) return

  const optionIdSet = new Set(optionIds)
  optionCategories.value.forEach((category) => {
    const selectedIds = (category.options || [])
      .filter((option) => optionIdSet.has(Number(option.optionId)))
      .map((option) => Number(option.optionId))

    if (selectedIds.length) {
      selectedOptionIdsByCategory[String(category.optionCategoryNo)] = selectedIds
    }
  })
}

const selectedOptionIds = computed(() =>
  Object.values(selectedOptionIdsByCategory)
    .flat()
    .map((optionId) => Number(optionId)),
)

const selectedOptions = computed(() => {
  const selectedIds = new Set(selectedOptionIds.value)
  return optionCategories.value
    .flatMap((category) => category.options || [])
    .filter((option) => selectedIds.has(Number(option.optionId)))
})

const optionPrice = computed(() =>
  selectedOptions.value.reduce((sum, option) => sum + Number(option.price || 0), 0),
)

const unitPrice = computed(() => Number(props.menu?.price || 0) + optionPrice.value)
const totalPrice = computed(() => unitPrice.value * quantity.value)

const updateQuantity = (val) => {
  if (quantity.value + val < 1) return
  quantity.value += val
}

const getSelectedIds = (category) => {
  const key = String(category.optionCategoryNo)
  return selectedOptionIdsByCategory[key] || []
}

const isSelected = (category, option) => {
  return getSelectedIds(category).includes(Number(option.optionId))
}

const toggleOption = async (category, option) => {
  if (option.soldOut === 'Y') return

  const key = String(category.optionCategoryNo)
  const maxSelect = Number(category.maxSelect || 1)
  const current = getSelectedIds(category)
  const optionId = Number(option.optionId)

  if (maxSelect === 1) {
    selectedOptionIdsByCategory[key] = current.includes(optionId) ? [] : [optionId]
    return
  }

  if (current.includes(optionId)) {
    selectedOptionIdsByCategory[key] = current.filter((id) => id !== optionId)
    return
  }

  if (current.length >= maxSelect) {
    await showAlert(`${category.optionCategoryName} 옵션은 최대 ${maxSelect}개까지 선택할 수 있습니다.`, {
      title: '옵션 선택',
      type: 'warning',
    })
    return
  }

  selectedOptionIdsByCategory[key] = [...current, optionId]
}

const validateOptions = async () => {
  for (const category of optionCategories.value) {
    const selectedCount = getSelectedIds(category).length

    if (category.isRequired && selectedCount === 0) {
      await showAlert(`${category.optionCategoryName} 옵션을 선택해 주세요.`, {
        title: '필수 옵션',
        type: 'warning',
      })
      return false
    }

    const maxSelect = Number(category.maxSelect || 1)
    if (selectedCount > maxSelect) {
      await showAlert(`${category.optionCategoryName} 옵션은 최대 ${maxSelect}개까지 선택할 수 있습니다.`, {
        title: '옵션 선택',
        type: 'warning',
      })
      return false
    }
  }

  return true
}

const buildSelectedOptionsPayload = () =>
  optionCategories.value.flatMap((category) =>
    getSelectedIds(category).map((optionId) => ({
      optionCategoryNo: Number(category.optionCategoryNo),
      optionId,
    })),
  )

const handleAddCart = async () => {
  const valid = await validateOptions()
  if (!valid) return

  const cartData = {
    userNo: userStore.state.userNo,
    menuId: props.menu.menuId,
    quantity: quantity.value,
    selectedOptions: buildSelectedOptionsPayload(),
  }

  if (props.mode === 'edit') {
    try {
      await cartService.updateCartItemOptions(props.cartItemId, cartData)
      emit('option-updated')
      await showAlert('옵션이 변경되었습니다.', { title: '옵션변경', type: 'success' })
      emit('close')
    } catch (error) {
      const message =
        error.response?.data?.resultMessage ||
        error.response?.data?.message ||
        '옵션 변경에 실패했습니다.'
      await showAlert(message, { title: '오류', type: 'error' })
    }
    return
  }

  try {
    await cartService.addToCart(cartData)
    emit('add-to-cart')
    await showAlert('장바구니에 담겼습니다!', { title: '장바구니', type: 'success' })
    quantity.value = 1
    emit('close')
  } catch (error) {
    if (error.response?.status === 409) {
      const confirmed = await showConfirm('다른 매장의 메뉴가 장바구니에 있습니다.\n기존 장바구니를 비우고 담을까요?', { title: '장바구니 초기화', type: 'warning' })
      if (confirmed) {
        await cartService.clearAndAdd(cartData)
        emit('add-to-cart')
        await showAlert('장바구니에 담겼습니다!', { title: '장바구니', type: 'success' })
        quantity.value = 1
        emit('close')
      }
    } else {
      const message =
        error.response?.data?.resultMessage ||
        error.response?.data?.message ||
        '장바구니 담기에 실패했습니다.'
      await showAlert(message, { title: '오류', type: 'error' })
    }
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <button class="back-btn" @click="$emit('close')">←</button>
        <button class="cart-btn">🛒</button>
      </div>

      <div class="image-area">
        <img :src="getImageUrl(menu.menuPic)" alt="메뉴 이미지" />
      </div>

      <div class="info-area">
        <h2 class="menu-name">{{ menu.menuName }}</h2>
        <p class="menu-desc">{{ menu.menuInfo }}</p>
        <div class="price-row">
          <span class="price">{{ formatPrice(menu.price) }}</span>
        </div>
      </div>

      <div v-if="optionLoading" class="option-loading">옵션을 불러오는 중...</div>

      <div v-else-if="optionCategories.length" class="option-area">
        <section
          v-for="category in optionCategories"
          :key="category.optionCategoryNo"
          class="option-category"
        >
          <div class="option-category-head">
            <div>
              <span class="option-category-name">{{ category.optionCategoryName }}</span>
              <span v-if="category.isRequired" class="required-badge">필수</span>
              <span v-else class="optional-badge">선택</span>
            </div>
            <span class="max-select">최대 {{ category.maxSelect || 1 }}개</span>
          </div>

          <button
            v-for="option in category.options || []"
            :key="option.optionId"
            type="button"
            class="option-row"
            :class="{ selected: isSelected(category, option), disabled: option.soldOut === 'Y' }"
            :disabled="option.soldOut === 'Y'"
            @click="toggleOption(category, option)"
          >
            <span class="option-check">{{ isSelected(category, option) ? '✓' : '' }}</span>
            <span class="option-name">
              {{ option.name }}
              <span v-if="option.soldOut === 'Y'" class="soldout-text">품절</span>
            </span>
            <span class="option-price">
              {{ Number(option.price || 0) > 0 ? `+${formatPrice(option.price)}` : '0원' }}
            </span>
          </button>
        </section>
      </div>

      <div class="footer-area">
        <div class="quantity-control">
          <span class="label">수량</span>
          <div class="counter">
            <button @click="updateQuantity(-1)">-</button>
            <span>{{ quantity }}개</span>
            <button @click="updateQuantity(1)">+</button>
          </div>
        </div>

        <div v-if="optionPrice > 0" class="selected-price-row">
          <span>옵션 추가금액</span>
          <span>+{{ formatPrice(optionPrice) }}</span>
        </div>

        <div class="selected-price-row total">
          <span>총 금액</span>
          <span>{{ formatPrice(totalPrice) }}</span>
        </div>

        <p class="min-price-info">배달 최소주문금액 {{ formatPrice(minPrice || 0) }}</p>
        <button class="add-cart-btn" @click="handleAddCart">
          {{ props.mode === 'edit' ? '옵션변경 저장' : `${formatPrice(totalPrice)} 장바구니 담기` }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 10000; }
.modal-content { width: 90%; max-width: 450px; max-height: 92vh; background: white; border-radius: 20px; overflow-y: auto; position: relative; }
.modal-header { position: absolute; top: 0; width: 100%; display: flex; justify-content: space-between; padding: 15px; z-index: 10; box-sizing: border-box; }
.modal-header button { background: white; border-radius: 50%; width: 35px; height: 35px; border: none; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); cursor: pointer; }
.image-area img { width: 100%; height: 250px; object-fit: cover; }
.info-area { padding: 20px; border-bottom: 1px solid #eee; }
.menu-name { font-size: 1.4rem; margin-bottom: 10px; }
.menu-desc { font-size: 0.9rem; color: #777; line-height: 1.5; margin-bottom: 20px; }
.price-row { display: flex; justify-content: space-between; font-weight: bold; }
.option-loading { padding: 18px 20px; color: #888; font-size: 0.9rem; border-bottom: 1px solid #eee; }
.option-area { padding: 18px 20px 4px; border-bottom: 1px solid #eee; }
.option-category { margin-bottom: 18px; }
.option-category-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
.option-category-name { font-size: 0.95rem; font-weight: 800; color: #222; }
.required-badge,
.optional-badge { margin-left: 6px; padding: 2px 6px; border-radius: 999px; font-size: 0.68rem; font-weight: 800; }
.required-badge { background: #fff0f0; color: #a40c0b; }
.optional-badge { background: #f3f3f3; color: #777; }
.max-select { color: #999; font-size: 0.78rem; white-space: nowrap; }
.option-row { width: 100%; min-height: 44px; display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 10px 0; border: none; border-bottom: 1px solid #f3f3f3; background: #fff; color: #333; text-align: left; cursor: pointer; font-family: inherit; }
.option-row:last-child { border-bottom: none; }
.option-row.selected .option-check { background: #2e55e0; border-color: #2e55e0; color: #fff; }
.option-row.disabled { color: #bbb; cursor: not-allowed; }
.option-check { width: 20px; height: 20px; border: 1.5px solid #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; box-sizing: border-box; }
.option-name { font-size: 0.9rem; min-width: 0; }
.option-price { font-size: 0.86rem; color: #666; white-space: nowrap; }
.soldout-text { margin-left: 4px; color: #d33; font-size: 0.75rem; }
.footer-area { padding: 20px; }
.quantity-control { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.counter { border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; }
.counter button { padding: 5px 15px; border: none; background: none; font-size: 1.2rem; cursor: pointer; }
.counter span { padding: 0 10px; }
.selected-price-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; color: #666; font-size: 0.9rem; }
.selected-price-row.total { padding-top: 10px; border-top: 1px solid #f2f2f2; color: #222; font-weight: 800; font-size: 1rem; }
.min-price-info { text-align: center; font-size: 0.8rem; color: #999; margin-bottom: 10px; }
.add-cart-btn { width: 100%; padding: 15px; background: #2e55e0; color: white; border: none; border-radius: 8px; font-size: 1.05rem; font-weight: bold; cursor: pointer; }
</style>
