<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/common/Footer.vue'

const router = useRouter()

// 카테고리
const categories = [
  { label: '한식',       img: '비빔밥'  },
  { label: '중식',       img: '짜장면'  },
  { label: '일식',       img: '스시'    },
  { label: '양식',       img: '파스타'  },
  { label: '디저트',     img: '케잌'    },
  { label: '분식',       img: '떡볶이'  },
  { label: '패스트푸드', img: '햄버거'  },
  { label: '찜·탕',     img: '찜탕'    },
  { label: '치킨',       img: '치킨'    },
  { label: '야식',       img: '닭발'    },
  { label: '족발',       img: '족발'    },
  { label: '피자',       img: '피자'    },
]

// 배너
const banners = [
  { img: '/src/assets/배너1.png', route: '/event'    },
  { img: '/src/assets/배너2.png', route: '/whatKind' },
  { img: '/src/assets/배너3.png', route: '/whatKind'},
]

// 현재 배너(인디케이터용)
const currentBanner = ref(0)

// 스와이프 스크롤 → 인디케이터 업데이트
function onScroll(e) {
  const el = e.target
  const index = Math.round(el.scrollLeft / el.offsetWidth)
  currentBanner.value = index
}

// 배너 클릭하면 라우트 이동
function onBannerClick(route) {
  router.push(route)
}

// 카테고리 클릭
function goCategory(label) {
  router.push({ path: '/storelist', query: { category: label } })
}
</script>

<template>
  <div class="home-page">

    <!-- 배너 슬라이더 (스와이프) -->
    <div class="banner-wrap" @scroll="onScroll">
      <div
        v-for="(banner, i) in banners"
        :key="i"
        class="banner-item"
        @click="onBannerClick(banner.route)"
      >
        <img :src="banner.img" :alt="`배너 ${i + 1}`" />
      </div>
    </div>

    <!-- 인디케이터 -->
    <div class="dots">
      <span
        v-for="(_, i) in banners"
        :key="i"
        class="dot"
        :class="{ active: i === currentBanner }"
      />
    </div>

    <!-- 카테고리 섹션 -->
    <section class="category-section">
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.label"
          class="category-item"
          @click="goCategory(cat.label)"
        >
          <img :src="`/src/assets/${cat.img}.png`" :alt="cat.label" />
          <span>{{ cat.label }}</span>
        </div>
      </div>

      <button class="view-all-btn" @click="router.push('/storelist')">
        메뉴 전체 보기 >>
      </button>
    </section>

  </div>
  <Footer />
</template>

<style scoped>

.home-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  /* 배경을 이미지와 유사한 선명한 오렌지/레드 계열로 변경 */
  background: #C44101; 
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 80px;
  overflow-x: hidden;
 
}

/* 배너 슬라이더 */
.banner-wrap {
  width: 100%;
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.banner-wrap::-webkit-scrollbar { display: none; }

.banner-item {
  flex-shrink: 0;
  width: 100%;
  scroll-snap-align: start;
}
.banner-item img {
  width: 100%;
  height: 160px; 
  object-fit: cover;
}

/* ── 인디케이터 ── */
.dots {
  display: flex;
  gap: 6px;
  margin: 12px 0;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}
.dot.active {
  width: 16px;
  border-radius: 4px;
  background: #fff;
}

/* ── 카테고리 섹션 ── */
.category-section {
  width: 92%; 
  margin-top: 15px;
 
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px; /* 카드 사이 간격 */
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fffcea; 
  border-radius: 24px; 
  padding: 15px 10px 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
  transition: transform 0.1s;
}
.category-item:active {
  transform: scale(0.95);
}

/* 카테고리 텍스트 스타일 */
.category-item span {
  font-size: 15px;
  font-weight: 800;
  color: #B21F1F; /* 진한 붉은색 글자 */
  margin-bottom: 8px; /* 텍스트를 위로, 이미지를 아래로 */
  order: -1; /* 텍스트가 이미지보다 위에 오도록 설정 */
}

.category-item img {
  width: 100%; /* 카드의 너비에 맞춤 */
  max-width: 85px;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  /* 이미지 하단을 둥글게 깎고 싶다면 추가 */
  border-radius: 0 0 15px 15px;
}

/* ── 전체 보기 버튼 ── */
.view-all-btn {
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  background: #fff;
  border: none;
  border-radius: 30px; 
  color: #666; 
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.view-all-btn:active {
  background: #f0f0f0;
}

.banner-wrap {
  display: flex;
  overflow-x: auto; /* 혹은 scroll */
  scroll-snap-type: x mandatory; /* 필수 */
  -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */
}

.banner-item {
  flex: 0 0 100%; /* 너비를 꽉 채우도록 보장 */
  scroll-snap-align: start; /* 필수 */
}

</style>