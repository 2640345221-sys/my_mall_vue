<template>
  <div class="cart-container">
    <!-- 顶部导航 -->
    <header class="cart-header">
      <div class="header-left"></div>
      <div class="header-title">购物车</div>
      <div class="header-right" @click="goToHome">
        <el-icon><HomeFilled /></el-icon>
      </div>
    </header>

    <!-- 购物车内容 -->
    <div class="cart-content" v-if="state.list.length > 0">
      <!-- 购物车列表 -->
      <div class="cart-list">
        <div
          class="cart-item"
          v-for="item in state.list"
          :key="item.id"
        >
          <el-checkbox v-model="item.checked" @change="handleItemChange" />
          
          <div class="item-img" @click="goToDetail(item.goodsId)">
            <img :src="item.coverImg" :alt="item.name" />
          </div>
          
          <div class="item-info">
            <div class="item-name" @click="goToDetail(item.goodsId)">
              {{ item.name }}
            </div>
            <div class="item-price">¥{{ item.sellingPrice }}</div>
            <div class="item-actions">
              <el-input-number
                v-model="item.goodsCount"
                :min="1"
                :max="99"
                size="small"
                @change="(val) => handleCountChange(val, item)"
              />
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(item.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空购物车 -->
    <div class="empty-cart" v-else>
      <el-empty description="购物车空空如也">
        <el-button type="primary" @click="goToHome">去购物</el-button>
      </el-empty>
    </div>

    <!-- 底部结算栏 -->
    <div class="cart-footer" v-if="state.list.length > 0">
      <div class="footer-left">
        <el-checkbox v-model="state.checkAll" @change="handleCheckAll">
          全选
        </el-checkbox>
        <span class="total-text">
          合计: <span class="total-price">¥{{ totalPrice }}</span>
        </span>
      </div>
      <div class="footer-right">
        <el-button type="danger" size="large" @click="handleCheckout">
          结算({{ checkedCount }})
        </el-button>
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
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, Grid, ShoppingCart, User } from '@element-plus/icons-vue'
import { useShoppingCartStore } from '@/stores/user/shoppingcart'

const router = useRouter()
const cartStore = useShoppingCartStore()

const state = reactive({
  list: [] as Array<any>,
  checkAll: false,
  loading: false
})

// 计算总价
const totalPrice = computed(() => {
  return state.list
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.sellingPrice * item.goodsCount, 0)
    .toFixed(2)
})

// 计算选中数量
const checkedCount = computed(() => {
  return state.list.filter(item => item.checked).length
})

// 加载购物车数据
const loadCartData = async () => {
  state.loading = true
  try {
    const res = await cartStore.getCartPage({
      pageNumber: 1,
      pageSize: 100
    })
    state.list = (res.records || []).map((item: any) => ({
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

// 数量变化
const handleCountChange = async (value: number, item: any) => {
  if (!item.id) return
  
  try {
    await cartStore.updateGoods({
      id: item.id,
      goodsCount: value
    })
    ElMessage.success('更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
    // 恢复原数量
    loadCartData()
  }
}

// 删除商品
const handleDelete = async (id?: number) => {
  if (!id) return
  
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cartStore.deleteById(id)
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
  const allChecked = state.list.length > 0 && state.list.every(item => item.checked)
  state.checkAll = allChecked
}

// 全选
const handleCheckAll = (val: boolean) => {
  state.list.forEach(item => {
    item.checked = val
  })
}

// 结算
const handleCheckout = () => {
  const checkedItems = state.list.filter(item => item.checked)
  if (checkedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  // 跳转到创建订单页面，传递选中的购物车项ID
  const cartItemIds = checkedItems.map(item => item.id)
  router.push({
    path: '/create-order',
    query: { cartItemIds: JSON.stringify(cartItemIds) }
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
  padding: 10px 15px;
  background: white;
  z-index: 1000;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 16px;
}

.header-right {
  font-size: 20px;
  color: #666;
}

.cart-content {
  padding-top: 50px;
}

.cart-list {
  background: white;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.item-img {
  width: 80px;
  height: 80px;
  margin: 0 10px;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.item-price {
  font-size: 16px;
  color: #f44;
  margin-bottom: 8px;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.empty-cart {
  padding-top: 100px;
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
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-price {
  font-size: 18px;
  color: #f44;
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
