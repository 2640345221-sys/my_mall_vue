<template>
  <div class="search-container">
    <!-- 顶部搜索栏 -->
    <header class="search-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-search">
        <el-icon><Search /></el-icon>
        <input
          type="text"
          v-model="state.keyword"
          placeholder="搜索商品"
          @keyup.enter="handleSearch"
        />
        <el-icon v-if="state.keyword" @click="clearKeyword"><CircleClose /></el-icon>
      </div>
      <div class="header-right" @click="handleSearch">
        <span>搜索</span>
      </div>
    </header>

    <!-- 排序标签 -->
    <div class="sort-tabs" v-if="state.productList.length > 0">
      <div
        class="tab-item"
        :class="{ active: state.orderBy === '' }"
        @click="changeOrder('')"
      >
        推荐
      </div>
      <div
        class="tab-item"
        :class="{ active: state.orderBy === 'new' }"
        @click="changeOrder('new')"
      >
        新品
      </div>
      <div
        class="tab-item"
        :class="{ active: state.orderBy === 'price' }"
        @click="changeOrder('price')"
      >
        价格
        <el-icon v-if="state.orderBy === 'price'">
          <component :is="state.priceAsc ? ArrowUp : ArrowDown" />
        </el-icon>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="product-list" v-loading="state.loading">
      <div
        class="product-item"
        v-for="item in state.productList"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <img :src="item.coverImg" :alt="item.name" class="product-img" />
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-intro">{{ item.intro }}</div>
          <div class="product-price">¥{{ item.sellingPrice }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="state.productList.length === 0 && !state.loading && state.searched">
        <el-empty description="没有找到相关商品">
          <el-button type="primary" @click="goToHome">去首页看看</el-button>
        </el-empty>
      </div>

      <!-- 搜索提示 -->
      <div class="search-tip" v-if="!state.searched && !state.loading">
        <el-icon :size="60" color="#ddd"><Search /></el-icon>
        <p>输入关键词搜索商品</p>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="state.productList.length > 0">
      <el-button
        v-if="!state.finished"
        link
        :loading="state.loading"
        @click="loadMore"
      >
        加载更多
      </el-button>
      <span v-else class="no-more">没有更多了</span>
    </div>

    <!-- 历史搜索 -->
    <div class="history-section" v-if="state.history.length > 0 && !state.searched">
      <div class="history-header">
        <span>历史搜索</span>
        <el-icon @click="clearHistory"><Delete /></el-icon>
      </div>
      <div class="history-list">
        <el-tag
          v-for="(item, index) in state.history"
          :key="index"
          class="history-tag"
          @click="searchByHistory(item)"
        >
          {{ item }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search, CircleClose, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue'
import { useGoodsStore } from '@/stores/user/goods'

const route = useRoute()
const router = useRouter()
const goodsStore = useGoodsStore()

const state = reactive({
  keyword: '',
  categoryId: null as number | null,
  orderBy: '',
  priceAsc: true,
  productList: [] as Array<any>,
  loading: false,
  finished: false,
  page: 1,
  pageSize: 10,
  total: 0,
  searched: false,
  history: [] as string[]
})

// 初始化
const init = () => {
  const { keyword, categoryId } = route.query
  if (keyword) {
    state.keyword = keyword as string
  }
  if (categoryId) {
    state.categoryId = Number(categoryId)
  }
  
  // 加载历史搜索
  loadHistory()
  
  // 如果有关键词或分类ID，自动搜索
  if (state.keyword || state.categoryId) {
    handleSearch()
  }
}

// 加载历史搜索
const loadHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    state.history = JSON.parse(history)
  }
}

// 保存历史搜索
const saveHistory = () => {
  if (!state.keyword) return
  
  // 去重并限制数量
  const index = state.history.indexOf(state.keyword)
  if (index > -1) {
    state.history.splice(index, 1)
  }
  state.history.unshift(state.keyword)
  if (state.history.length > 10) {
    state.history = state.history.slice(0, 10)
  }
  
  localStorage.setItem('searchHistory', JSON.stringify(state.history))
}

// 清空历史搜索
const clearHistory = () => {
  state.history = []
  localStorage.removeItem('searchHistory')
}

// 搜索商品
const searchGoods = async (isRefresh = false) => {
  if (state.loading) return
  
  state.loading = true
  try {
    if (isRefresh) {
      state.page = 1
      state.productList = []
    }
    
    const params: any = {
      pageNumber: state.page,
      pageSize: state.pageSize,
      keyword: state.keyword || undefined,
      categoryId: state.categoryId || undefined,
      orderBy: state.orderBy || undefined
    }
    
    // 如果是价格排序，添加排序方向
    if (state.orderBy === 'price') {
      params.sort = state.priceAsc ? 'asc' : 'desc'
    }
    
    const res = await goodsStore.search(params)
    const records = res.records || []
    
    state.productList = isRefresh ? records : [...state.productList, ...records]
    state.total = res.total || 0
    state.finished = state.productList.length >= state.total
    state.searched = true
    
    // 保存搜索历史
    if (isRefresh && state.keyword) {
      saveHistory()
    }
  } catch (error) {
    ElMessage.error('搜索失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

// 执行搜索
const handleSearch = () => {
  if (!state.keyword && !state.categoryId) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  searchGoods(true)
}

// 清空关键词
const clearKeyword = () => {
  state.keyword = ''
  state.searched = false
  state.productList = []
}

// 切换排序
const changeOrder = (orderBy: string) => {
  if (state.orderBy === orderBy && orderBy === 'price') {
    state.priceAsc = !state.priceAsc
  } else {
    state.orderBy = orderBy
    state.priceAsc = true
  }
  searchGoods(true)
}

// 从历史搜索
const searchByHistory = (keyword: string) => {
  state.keyword = keyword
  handleSearch()
}

// 加载更多
const loadMore = () => {
  if (state.finished || state.loading) return
  state.page++
  searchGoods()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到首页
const goToHome = () => {
  router.push('/home')
}

// 跳转到商品详情
const goToDetail = (id: number) => {
  router.push(`/goods/${id}`)
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.search-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: white;
  z-index: 1000;
  border-bottom: 1px solid #eee;
}

.header-left {
  font-size: 20px;
  color: #666;
  margin-right: 10px;
}

.header-search {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 8px 12px;
}

.header-search input {
  flex: 1;
  border: none;
  background: transparent;
  margin: 0 8px;
  font-size: 14px;
}

.header-right {
  margin-left: 10px;
  font-size: 14px;
  color: #1baeae;
}

.sort-tabs {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-bottom: 1px solid #eee;
  z-index: 1000;
}

.tab-item {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.tab-item.active {
  color: #1baeae;
}

.product-list {
  padding-top: 100px;
}

.product-item {
  display: flex;
  background: white;
  padding: 15px;
  margin-bottom: 1px;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 15px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 15px;
  color: #333;
}

.product-intro {
  font-size: 13px;
  color: #999;
}

.product-price {
  font-size: 16px;
  color: #f44;
}

.empty-state {
  padding-top: 100px;
}

.search-tip {
  text-align: center;
  padding-top: 150px;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 20px;
}

.no-more {
  color: #999;
  font-size: 13px;
}

.history-section {
  padding: 15px;
  background: white;
  margin-top: 10px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
