<template>
  <div class="home-container">
    <div class="search-box">
      <el-icon><Search /></el-icon>
      <input
        v-model="state.searchKeyword"
        placeholder="搜索商品"
        @keyup.enter="goToSearch"
      />
    </div>

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

    
    <div class="goods-section">
      <h3 class="section-title">为您推荐</h3>
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
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { formatPrice } from '@/utils/format'
import { getNewGoods, getPopularGoods, getRecommendGoods } from '@/api/user/index'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()

const state = reactive({
  loading: true,
  searchKeyword: '',
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
  const kw = state.searchKeyword.trim()
  if (kw) {
    router.push({ path: '/goods-search', query: { keyword: kw } })
  } else {
    router.push('/goods-search')
  }
}

const goToDetail = (goodsId?: number) => {
  if (goodsId) {
    router.push(`/goods/${goodsId}`)
  }
}

onMounted(() => {
  loadHomeData()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: var(--bg-warm);
  padding-top: 44px;
  padding-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 12px 0;
  padding: 9px 14px;
  background: var(--card);
  border-radius: 18px;
  color: var(--text-muted);
  box-shadow: var(--shadow-sm);
}
.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text);
}

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
