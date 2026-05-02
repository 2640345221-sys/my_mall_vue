<template>
  <div class="cart-container">
    <!-- 顶部导航 -->
    <header class="cart-header">
      <div class="header-left" @click="goToHome">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">购物车</div>
      <div class="header-right"></div>
    </header>

    <!-- 购物车内容 -->
    <div class="cart-content" v-if="list.length > 0">
      <!-- 购物车列表 -->
      <div class="cart-list">
        <div
          class="cart-item"
          v-for="item in list"
          :key="item.cartItemId"
        >
          <div class="item-checkbox">
            <el-checkbox v-model="item.checked" @change="handleItemChange" />
          </div>
          
          <div class="item-img" @click="goToDetail(item.goodsId)">
            <img :src="item.coverImg" :alt="item.goodsName" />
          </div>
          
          <div class="item-info">
            <div class="item-name" @click="goToDetail(item.goodsId)">
              {{ item.goodsName }}
            </div>
            <div class="item-bottom">
              <div class="item-price">
                <span class="symbol">¥</span>
                <span class="price">{{ item.sellingPrice }}</span>
              </div>
              <div class="item-actions">
                <div class="item-count">
                  <div class="count-btn" @click="updateCount(item, -1)">−</div>
                  <div class="count-value">{{ item.goodsCount }}</div>
                  <div class="count-btn" @click="updateCount(item, 1)">+</div>
                </div>
                <el-icon class="delete-icon" @click="handleDelete(item.cartItemId)">
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空购物车 -->
    <div class="empty-cart" v-else>
      <div class="empty-icon">
        <el-icon :size="80" color="#ccc"><ShoppingCart /></el-icon>
      </div>
      <div class="empty-text">购物车空空如也~</div>
      <el-button type="primary" round @click="goToHome">去逛逛</el-button>
    </div>

    <!-- 底部结算栏 -->
    <div class="cart-footer" v-if="list.length > 0">
      <div class="footer-left">
        <el-checkbox v-model="state.checkAll" @change="handleCheckAll">
          全选
        </el-checkbox>
      </div>
      <div class="footer-right">
        <div class="total-section">
          <span class="total-label">合计:</span>
          <span class="total-price">
            <span class="symbol">¥</span>
            <span class="price">{{ totalPrice }}</span>
          </span>
        </div>
        <div class="checkout-btn" @click="handleCheckout">
          结算({{ checkedCount }})
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/home" class="nav-item">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </router-link>
      <router-link to="/category" class="nav-item">
        <el-icon><Grid /></el-icon>
        <span>分类</span>
      </router-link>
      <router-link to="/cart" class="nav-item active">
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
import { reactive, onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, Grid, ShoppingCart, User, ArrowLeft, Delete } from '@element-plus/icons-vue'
import { useShoppingCartStore } from '@/stores/user/shoppingcart'

const router = useRouter()
const cartStore = useShoppingCartStore()

const list = ref<Array<any>>([])
const state = reactive({
  checkAll: false,
  loading: false
})

// 计算总价
const totalPrice = computed(() => {
  return list.value
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.sellingPrice * item.goodsCount, 0)
    .toFixed(2)
})

// 计算选中数量
const checkedCount = computed(() => {
  return list.value.filter(item => item.checked).length
})

// 加载购物车数据
const loadCartData = async () => {
  state.loading = true
  try {
    const res = await cartStore.pageResult({
      pageNumber: 1,
      pageSize: 100
    })
    list.value = (res.records || []).map((item: any) => ({
      ...item,
      checked: false
    }))
    state.checkAll = false
  } catch (error) {
    ElMessage.error('加载购物车失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

// 结算
const handleCheckout = () => {
  const checkedItems = list.value.filter(item => item.checked)
  
  if (checkedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  const cartItemIds = checkedItems.map(item => item.cartItemId)
  
  router.push({
    path: '/create-order',
    query: { cartItemIds: JSON.stringify(cartItemIds) }
  })
}

// 跳转到首页
const goToHome = () => {
  router.push('/home')
}

// 跳转到商品详情
const goToDetail = (goodsId?: number) => {
  if (goodsId) {
    router.push(`/goods/${goodsId}`)
  }
}

// 更新数量
const updateCount = async (item: any, delta: number) => {
  const newCount = item.goodsCount + delta
  if (newCount < 1 || newCount > 99) return
  
  item.goodsCount = newCount
  
  try {
    await cartStore.updateGoods({
      cartItemId: item.cartItemId,
      goodsCount: newCount
    })
  } catch (error) {
    ElMessage.error('更新失败')
    loadCartData()
  }
}

// 删除商品
const handleDelete = async (cartItemId?: number) => {
  if (!cartItemId) return
  
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      customClass: 'cart-message-box'
    })
    
    await cartStore.deleteGoods(cartItemId)
    ElMessage.success('删除成功')
    loadCartData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 单选变化
const handleItemChange = () => {
  const allChecked = list.value.length > 0 && list.value.every(item => item.checked)
  state.checkAll = allChecked
}

// 全选
const handleCheckAll = (val: boolean) => {
  list.value.forEach(item => {
    item.checked = val
  })
}

onMounted(() => {
  loadCartData()
})
</script>

<style scoped>
.cart-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
}

.cart-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  background: white;
  z-index: 1000;
  border-bottom: 1px solid #eee;
}

.header-left {
  font-size: 20px;
  color: #333;
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.header-right {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.cart-content {
  padding-top: 50px;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  margin-bottom: 10px;
}

.action-bar :deep(.el-checkbox__label) {
  font-size: 14px;
  font-weight: 500;
}

.batch-delete {
  color: #f44;
  font-size: 14px;
  cursor: pointer;
}

.cart-list {
  background: white;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.item-checkbox {
  margin-right: 10px;
}

.item-checkbox :deep(.el-checkbox) {
  transform: scale(1.2);
}

.item-img {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f9f9f9;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90px;
}

.item-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.item-price {
  color: #f44;
  font-weight: 500;
}

.item-price .symbol {
  font-size: 12px;
}

.item-price .price {
  font-size: 16px;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delete-icon {
  font-size: 18px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.delete-icon:hover {
  color: #f44;
}

.item-count {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.count-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.count-btn:active {
  background: #eee;
}

.count-value {
  width: 40px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
  background: white;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.empty-cart {
  padding-top: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.empty-icon {
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #999;
}

.cart-footer {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.footer-left :deep(.el-checkbox__label) {
  font-size: 14px;
  font-weight: 500;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-section {
  text-align: right;
}

.total-label {
  font-size: 12px;
  color: #666;
}

.total-price {
  color: #f44;
  font-weight: 500;
}

.total-price .symbol {
  font-size: 12px;
}

.total-price .price {
  font-size: 18px;
}

.checkout-btn {
  background: linear-gradient(135deg, #ff6034, #ee0a24);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.checkout-btn:active {
  opacity: 0.9;
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

<style>
.cart-message-box {
  width: 300px !important;
}

.cart-message-box .el-message-box__btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>