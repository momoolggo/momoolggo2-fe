<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import addressService from '@/services/addressService'
import storeService from '@/services/storeService'
import StoreCard from '@/components/store/StoreCard.vue'

const router = useRouter()
const storeList = ref([])
const loading = ref(false)
const defaultAddress = ref(null)
const errorMsg = ref('')

const loadNearbyStores = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    // 기본 주소 가져오기
    const addresses = await addressService.findAll()
    const def = addresses?.find(a => a.defaultAd === 1) || addresses?.[0]

    if (!def || !def.lat || !def.lng) {
      errorMsg.value = '기본 주소가 설정되어 있지 않습니다.'
      return
    }

    defaultAddress.value = def

    // 주변 가게 조회
    const res = await storeService.getNearbyStores(def.lat, def.lng)
    storeList.value = res.resultData || []

    if (storeList.value.length === 0) {
      errorMsg.value = '주변 3km 이내에 가게가 없습니다.'
    }
  } catch (e) {
    console.error('주변 가게 조회 실패:', e)
    errorMsg.value = '가게 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(loadNearbyStores)

const goToDetail = (id) => {
  router.push(`/store/${id}`)
}
</script>

<template>
  <div class="nearby-wrap">

    <!-- 헤더 -->
    <div class="nearby-header">
      <h2>📍 주변 가게</h2>
      <p v-if="defaultAddress" class="address-text">
        {{ defaultAddress.address }}
        <span v-if="defaultAddress.addressDetail"> {{ defaultAddress.addressDetail }}</span>
        기준 3km 이내
      </p>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="state-msg">불러오는 중...</div>

    <!-- 에러 -->
    <div v-else-if="errorMsg" class="state-msg">
      <p>{{ errorMsg }}</p>
      <button class="btn-go-address" @click="router.push('/mypage/address')">
        주소 설정하러 가기
      </button>
    </div>

    <!-- 가게 목록 -->
    <template v-else>
      <div class="result-count">총 {{ storeList.length }}개의 가게</div>
      <div class="store-list">
        <div v-for="store in storeList" :key="store.id" class="store-item">
          <StoreCard :store="store" @click="goToDetail(store.id)" />
          <div class="distance-badge">🚶 {{ Math.ceil(store.distance) }}km</div>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
.nearby-wrap {
  max-width: 480px;
  margin: 0 auto;
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 80px;
}

.nearby-header {
  background: #fff;
  padding: 20px 16px;
  border-bottom: 1px solid #eee;
}
.nearby-header h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #111;
}
.address-text {
  font-size: 13px;
  color: #888;
}

.state-msg {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  font-size: 15px;
  background: #fff;
}
.btn-go-address {
  margin-top: 16px;
  padding: 12px 24px;
  background: #A40C0B;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.result-count {
  padding: 12px 16px;
  font-size: 13px;
  color: #888;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.store-list {
  display: flex;
  flex-direction: column;
}

.store-item {
  position: relative;
}

.distance-badge {
  position: absolute;
  bottom: 105px;
  right: 50px;
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
</style>