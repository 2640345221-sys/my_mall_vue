<template>
  <div class="goods-detail">
    <PageHeader title="商品详情" @back="goBack" />

    
    <div class="detail-content" v-if="state.goods.id">
      
      <div class="goods-info">
        <div class="goods-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ state.goods.sellingPrice }}</span>
          <span class="original-price" v-if="state.goods.originalPrice">
            ¥{{ formatPrice(state.goods.originalPrice) }}
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

      
      <div class="goods-detail-content">
        <div class="detail-tabs">
          <div class="tab-item active">商品详情</div>
          <div class="tab-item">规格参数</div>
        </div>
        <div class="detail-html" v-html="state.goods.detailContent"></div>
      </div>
    </div>

    
    <el-skeleton :rows="10" animated v-else />

    
    <div class="action-bar" v-if="state.goods.id">
      <div class="action-left">
        <div class="action-item" @click="goToHome">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </div>
        <div class="action-item" @click="goToCart">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
          <el-badge v-if="state.cartCount > 0" :value="state.cartCount" class="cart-badge" />
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
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { HomeFilled, ShoppingCart } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import { getGoodsById } from '@/api/user/goods'
import { addItem } from '@/api/user/cart'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const state = reactive({
  goods: {} as any,
  loading: false,
  adding: false,
  cartCount: 0
})


const loadGoodsDetail = async () => {
  const { id } = route.params
  if (!id) {
    ElMessage.error('商品ID不存在')
    return
  }

  state.loading = true
  try {
    const res = await getGoodsById(Number(id))
    state.goods = res || {}
  } catch (error) {
    ElMessage.error('加载商品详情失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/home')
}

const goToCart = () => {
  router.push('/cart')
}

const handleAddCart = async () => {
  if (!state.goods.id) return

  state.adding = true
  try {
    await addItem({
      goodsId: state.goods.id,
      goodsCount: 1
    })
    ElMessage.success('加入购物车成功')
    await loadCartCount()
  } catch (error) {
    ElMessage.error('加入购物车失败')
  } finally {
    state.adding = false
  }
}

const handleBuyNow = async () => {
  if (!state.goods.id) return

  try {
    await addItem({
      goodsId: state.goods.id,
      goodsCount: 1
    })
    router.push('/cart')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const loadCartCount = async () => {
   state.cartCount =  0;
}

onMounted(() => {
  loadGoodsDetail()
  loadCartCount()
})
</script>

<style scoped>
.goods-detail {
  min-height: 100vh;
  background: var(--bg-warm);
  padding-bottom: 70px;
}

.detail-content { padding-top: 0; }

.goods-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #e8e4de;
}

.goods-info {
  background: var(--card);
  padding: 20px 16px;
  margin: -12px 12px 10px;
  border-radius: var(--radius-lg);
  position: relative;
  z-index: 1;
  box-shadow: var(--shadow-md);
}

.goods-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.price-value {
  font-size: 30px;
  font-weight: 700;
  color: var(--price-red);
  font-family: var(--font-display);
}
.price-value::before { content: '¥'; font-size: 18px; margin-right: 2px; }

.original-price {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: line-through;
  margin-left: 12px;
}

.goods-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
  line-height: 1.4;
  font-family: var(--font-display);
}

.goods-intro {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.goods-detail-content {
  background: var(--card);
  margin: 0 12px;
  padding: 18px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.detail-tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
  margin-bottom: 16px;
}

.tab-item {
  padding: 10px 24px;
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}
.tab-item.active {
  color: var(--ink);
  border-bottom: 2px solid var(--amber);
  margin-bottom: -2px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 1000;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.04);
}

.action-left {
  display: flex;
  gap: 24px;
  margin-right: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  color: var(--text-muted);
  font-size: 20px;
}
.action-item span { font-size: 11px; margin-top: 2px; }

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
