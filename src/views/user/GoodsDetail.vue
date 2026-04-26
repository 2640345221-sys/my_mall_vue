<template>
  <div class="goods-detail">
    <!-- 顶部导航 -->
    <header class="detail-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">商品详情</div>
      <div class="header-right"></div>
    </header>

    <!-- 商品内容 -->
    <div class="detail-content" v-if="state.goods.id">
      <!-- 商品轮播图 -->
      <div class="goods-swipe">
        <el-carousel height="300px" v-if="carouselList.length > 0">
          <el-carousel-item v-for="(item, index) in carouselList" :key="index">
            <img :src="item" alt="商品图片" />
          </el-carousel-item>
        </el-carousel>
        <img v-else :src="state.goods.coverImg" class="goods-cover" />
      </div>

      <!-- 商品信息 -->
      <div class="goods-info">
        <div class="goods-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ state.goods.sellingPrice }}</span>
          <span class="original-price" v-if="state.goods.originalPrice">
            ¥{{ state.goods.originalPrice }}
          </span>
        </div>
        <h1 class="goods-name">{{ state.goods.name }}</h1>
        <p class="goods-intro">{{ state.goods.intro }}</p>
        <div class="goods-tags">
          <el-tag v-if="state.goods.tag" type="danger" size="small">{{ state.goods.tag }}</el-tag>
          <el-tag type="info" size="small">免邮费</el-tag>
          <el-tag type="info" size="small">正品保证</el-tag>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="goods-detail-content">
        <div class="detail-tabs">
          <div class="tab-item active">商品详情</div>
          <div class="tab-item">规格参数</div>
        </div>
        <div class="detail-html" v-html="state.goods.detailContent"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <el-skeleton :rows="10" animated v-else />

    <!-- 底部操作栏 -->
    <div class="action-bar" v-if="state.goods.id">
      <div class="action-left">
        <div class="action-item" @click="goToHome">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </div>
        <div class="action-item" @click="goToCart">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
          <el-badge v-if="cartCount > 0" :value="cartCount" class="cart-badge" />
        </div>
      </div>
      <div class="action-right">
        <el-button type="warning" @click="handleAddCart" :loading="state.adding">
          加入购物车
        </el-button>
        <el-button type="danger" @click="handleBuyNow">
          立即购买
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, HomeFilled, ShoppingCart } from '@element-plus/icons-vue'
import { useGoodsStore } from '@/stores/user/goods'
import { useShoppingCartStore } from '@/stores/user/shoppingcart'

const route = useRoute()
const router = useRouter()
const goodsStore = useGoodsStore()
const cartStore = useShoppingCartStore()

const state = reactive({
  goods: {} as any,
  loading: false,
  adding: false,
  cartCount: 0
})

// 轮播图列表
const carouselList = computed(() => {
  if (state.goods.carousel && state.goods.carousel.length > 0) {
    return state.goods.carousel
  }
  return state.goods.coverImg ? [state.goods.coverImg] : []
})

// 加载商品详情
const loadGoodsDetail = async () => {
  const { id } = route.params
  if (!id) {
    ElMessage.error('商品ID不存在')
    return
  }

  state.loading = true
  try {
    const res = await goodsStore.getGoodsById(Number(id))
    state.goods = res || {}
  } catch (error) {
    ElMessage.error('加载商品详情失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 返回首页
const goToHome = () => {
  router.push('/home')
}

// 跳转到购物车
const goToCart = () => {
  router.push('/cart')
}

// 加入购物车
const handleAddCart = async () => {
  if (!state.goods.id) return

  state.adding = true
  try {
    await cartStore.addItem({
      goodsId: state.goods.id,
      goodsCount: 1
    })
    ElMessage.success('加入购物车成功')
    // 更新购物车数量
    await loadCartCount()
  } catch (error) {
    ElMessage.error('加入购物车失败')
  } finally {
    state.adding = false
  }
}

// 立即购买
const handleBuyNow = async () => {
  if (!state.goods.id) return

  try {
    await cartStore.addItem({
      goodsId: state.goods.id,
      goodsCount: 1
    })
    // 跳转到购物车
    router.push('/cart')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 加载购物车数量
const loadCartCount = async () => {
  // 这里可以调用获取购物车数量的接口
  // state.cartCount = await cartStore.getCartCount()
}

onMounted(() => {
  loadGoodsDetail()
  loadCartCount()
})
</script>

<style scoped>
.goods-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.detail-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  z-index: 1000;
  border-bottom: 1px solid #eee;
}

.header-left {
  font-size: 20px;
  color: #666;
}

.header-title {
  font-size: 16px;
}

.detail-content {
  padding-top: 50px;
}

.goods-swipe img,
.goods-cover {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.goods-info {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.goods-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

.price-value {
  font-size: 24px;
  color: #f44;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.goods-name {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.goods-intro {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.goods-detail-content {
  background: white;
  padding: 15px;
}

.detail-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.tab-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #666;
}

.tab-item.active {
  color: #1baeae;
  border-bottom: 2px solid #1baeae;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
}

.action-left {
  display: flex;
  gap: 20px;
  margin-right: 15px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.action-item span {
  font-size: 12px;
  color: #666;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
}

.action-right {
  flex: 1;
  display: flex;
  gap: 10px;
}

.action-right .el-button {
  flex: 1;
}
</style>
