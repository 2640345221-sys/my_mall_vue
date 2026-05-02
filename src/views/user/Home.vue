<template>
  <div class="home-container">
    <!-- 顶部搜索栏 -->
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

    <!-- 分类导航 -->
    <div class="category-section">
      <div
        class="category-item"
        v-for="item in state.categoryList"
        :key="item.id"
        @click="goToCategoryDetail(item.id)"
      >
        <div class="category-icon">
          <el-icon><Goods /></el-icon>
        </div>
        <span>{{ item.name }}</span>
      </div>
    </div>

    <!-- 新品上线 -->
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
            <div class="goods-price">¥{{ item.sellingPrice }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门商品 -->
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
            <div class="goods-price">¥{{ item.sellingPrice }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐商品 -->
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
            <div class="goods-price">¥{{ item.sellingPrice }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/home" class="nav-item active">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </router-link>
      <router-link to="/category" class="nav-item">
        <el-icon><Grid /></el-icon>
        <span>分类</span>
      </router-link>
      <router-link to="/cart" class="nav-item">
        <el-icon><ShoppingCart /></el-icon>
        <span>购物车</span>
      </router-link>
      <router-link to="/user" class="nav-item">
        <el-icon><User /></el-icon>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Menu, Search, User, Goods, HomeFilled, Grid, ShoppingCart } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user/user'
import { useIndexStore } from '@/stores/user/index'
import { useCategoryStore } from '@/stores/user/category'

const router = useRouter()
const userStore = useUserStore()
const indexStore = useIndexStore()
const categoryStore = useCategoryStore()

const state = reactive({
  headerScroll: false,
  loading: true,
  categoryList: [] as Array<any>,
  newGoodsList: [] as Array<any>,
  popularGoodsList: [] as Array<any>,
  recommendGoodsList: [] as Array<any>
})

// 加载首页数据
const loadHomeData = async () => {
  state.loading = true
  try {
    // 并行加载所有数据
    const [categoryRes, newRes, popularRes, recommendRes] = await Promise.all([
      categoryStore.getCategory(),
      indexStore.getNewGoods(),
      indexStore.getPopularGoods(),
      indexStore.getRecommendGoods()
    ])

    state.categoryList = categoryRes || []
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

// 跳转到搜索
const goToSearch = () => {
  router.push('/goods-search')
}

// 跳转到分类
const goToCategory = () => {
  router.push('/category')
}

// 跳转到指定分类
const goToCategoryDetail = (categoryId?: number) => {
  if (categoryId) {
    router.push(`/goods-search?categoryId=${categoryId}`)
  } else {
    router.push('/category')
  }
}

// 跳转到商品详情
const goToDetail = (goodsId?: number) => {
  if (goodsId) {
    router.push(`/goods/${goodsId}`)
  }
}

// 监听滚动
nextTick(() => {
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    state.headerScroll = scrollTop > 100
  })
})

onMounted(() => {
  loadHomeData()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 60px;
  padding-bottom: 60px;
  overflow-y: auto;
}

.home-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  z-index: 1000;
}

.home-header.active {
  background: #1baeae;
}

.header-left {
  color: #1baeae;
  font-size: 20px;
}

.home-header.active .header-left,
.home-header.active .header-right {
  color: white;
}

.header-search {
  flex: 1;
  display: flex;
  align-items: center;
  margin: 0 15px;
  padding: 8px 15px;
  background: white;
  border-radius: 20px;
}

.app-name {
  color: #1baeae;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
  padding-right: 10px;
  border-right: 1px solid #ddd;
}

.search-box {
  color: #999;
  font-size: 14px;
}

.header-right {
  color: #1baeae;
  font-size: 14px;
}

.carousel-section img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.category-section {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
  background: white;
  margin-top: 10px;
}

.category-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.category-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  margin-bottom: 8px;
  color: #1baeae;
}

.category-item span {
  font-size: 12px;
  color: #666;
}

.goods-section {
  margin-top: 10px;
  background: white;
  padding: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #1baeae;
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.goods-item {
  width: calc(50% - 5px);
  background: #f9f9f9;
}

.goods-item img {
  width: 100%;
  height: 200px;  /* 增加高度，确保图片完全显示 */
  object-fit: contain;  /* 保持图片比例，完全显示 */
}

.goods-info {
  padding: 10px;
}

.goods-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-intro {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.goods-price {
  font-size: 16px;
  color: #f44;
  margin-top: 8px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
  font-size: 12px;
}

.nav-item.active,
.nav-item.router-link-active {
  color: #1baeae;
}
</style>
