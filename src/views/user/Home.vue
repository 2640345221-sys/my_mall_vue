<template>
  <div class="home-container">
    
    <header class="home-header" :class="{ 'active': state.headerScroll }">
      <div class="header-left" @click="goToCategory">
        <el-icon><Menu /></el-icon>
      </div>
      <div class="header-search" @click="goToSearch">
        <span class="app-name">我的商城</span>
        <div class="search-box">
          <el-icon><Search /></el-icon>
          <span class="search-text">搜索商品</span>
        </div>
      </div>
      <div class="header-right">
        <router-link v-if="!userStore.token" to="/login">登录</router-link>
        <router-link v-else to="/user">
          <el-icon><User /></el-icon>
        </router-link>
      </div>
    </header>

    
    <div class="seckill-banner" @click="$router.push('/seckill')">
      <div class="seckill-banner-left">
        <span class="seckill-icon">⚡</span>
        <span class="seckill-title">限时秒杀</span>
      </div>
      <span class="seckill-arrow">抢购 &gt;</span>
    </div>

    
    <div class="goods-section">
      <h3 class="section-title">新品上线</h3>
      <el-skeleton :rows="3" animated v-if="state.loading" />
      <div class="goods-list" v-else>
        <div
          class="goods-item"
          v-for="item in state.newGoodsList"
          :key="item.id"
          @click="goToDetail(item.id)"
        >
          <img :src="item.coverImg" :alt="item.name" />
          <div class="goods-info">
            <div class="goods-name">{{ item.name }}</div>
            <div class="goods-intro">{{ item.intro }}</div>
            <div class="goods-price">¥{{ formatPrice(item.sellingPrice) }}</div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="goods-section">
      <h3 class="section-title">热门商品</h3>
      <el-skeleton :rows="3" animated v-if="state.loading" />
      <div class="goods-list" v-else>
        <div
          class="goods-item"
          v-for="item in state.popularGoodsList"
          :key="item.id"
          @click="goToDetail(item.id)"
        >
          <img :src="item.coverImg" :alt="item.name" />
          <div class="goods-info">
            <div class="goods-name">{{ item.name }}</div>
            <div class="goods-intro">{{ item.intro }}</div>
            <div class="goods-price">¥{{ formatPrice(item.sellingPrice) }}</div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="goods-section" style="padding-bottom: 80px;">
      <h3 class="section-title">为你推荐</h3>
      <el-skeleton :rows="3" animated v-if="state.loading" />
      <div class="goods-list" v-else>
        <div
          class="goods-item"
          v-for="item in state.recommendGoodsList"
          :key="item.id"
          @click="goToDetail(item.id)"
        >
          <img :src="item.coverImg" :alt="item.name" />
          <div class="goods-info">
            <div class="goods-name">{{ item.name }}</div>
            <div class="goods-intro">{{ item.intro }}</div>
            <div class="goods-price">¥{{ formatPrice(item.sellingPrice) }}</div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Menu, Search, User } from '@element-plus/icons-vue'
import { formatPrice } from '@/utils/format'
import { useUserStore } from '@/stores/user/user'
import { getNewGoods, getPopularGoods, getRecommendGoods } from '@/api/user/index'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const userStore = useUserStore()

const state = reactive({
  headerScroll: false,
  loading: true,
  newGoodsList: [] as Array<any>,
  popularGoodsList: [] as Array<any>,
  recommendGoodsList: [] as Array<any>
})

const loadHomeData = async () => {
  state.loading = true
  try {
    const [newRes, popularRes, recommendRes] = await Promise.all([
      getNewGoods(),
      getPopularGoods(),
      getRecommendGoods()
    ])

    state.newGoodsList = newRes || []
    state.popularGoodsList = popularRes || []
    state.recommendGoodsList = recommendRes || []
  } catch (error) {
    ElMessage.error('加载首页数据失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

const goToSearch = () => {
  router.push('/goods-search')
}

const goToCategory = () => {
  router.push('/category')
}

const goToDetail = (goodsId?: number) => {
  if (goodsId) {
    router.push(`/goods/${goodsId}`)
  }
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  state.headerScroll = scrollTop > 100
}

nextTick(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

onMounted(() => {
  loadHomeData()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: var(--bg-warm);
  padding-top: 50px;
  padding-bottom: 70px;
}

.home-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  z-index: 1000;
  transition: background 0.3s, box-shadow 0.3s;
}

.home-header.active {
  background: var(--ink);
  box-shadow: 0 2px 20px rgba(26, 26, 46, 0.15);
}

.header-left {
  color: var(--ink);
  font-size: 22px;
  transition: color 0.3s;
}

.home-header.active .header-left,
.home-header.active .header-right {
  color: #fff;
}

.home-header.active .header-right a {
  color: #fff;
}

.header-search {
  flex: 1;
  display: flex;
  align-items: center;
  margin: 0 12px;
  padding: 10px 16px;
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.2s;
  cursor: pointer;
}
.header-search:active { transform: scale(0.98); }

.app-name {
  color: var(--ink);
  font-size: 16px;
  font-weight: 700;
  margin-right: 10px;
  padding-right: 10px;
  border-right: 1px solid var(--border);
  font-family: var(--font-display);
  letter-spacing: 0.5px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
}

.header-right {
  color: var(--ink);
  font-size: 14px;
  transition: color 0.3s;
}
.header-right a { color: var(--ink); text-decoration: none; font-weight: 500; }

.seckill-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  margin: 12px 12px 0;
  background: linear-gradient(135deg, var(--price-red), #ff6b6b);
  border-radius: var(--radius-md);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(230, 57, 70, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}
.seckill-banner:active { transform: scale(0.985); box-shadow: 0 2px 12px rgba(230,57,70,0.2); }
.seckill-banner-left { display: flex; align-items: center; gap: 10px; }
.seckill-icon { font-size: 22px; animation: pulse-icon 1.5s ease-in-out infinite; }
@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
.seckill-title { font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }
.seckill-arrow { font-size: 13px; opacity: 0.85; font-weight: 500; }

.goods-section {
  margin: 12px 12px 0;
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid var(--amber);
  letter-spacing: 0.3px;
  font-family: var(--font-display);
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.goods-item {
  width: calc(50% - 5px);
  background: var(--card);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.goods-item:active { transform: scale(0.975); }

.goods-item img {
  width: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
  background: #f0ede8;
}

.goods-info {
  padding: 10px 10px 12px;
}

.goods-name {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}

.goods-intro {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--price-red);
  margin-top: 6px;
  font-family: var(--font-display);
}
</style>
