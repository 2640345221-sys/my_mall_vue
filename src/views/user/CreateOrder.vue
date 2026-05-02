<template>
  <div class="create-order">
    <!-- 顶部导航 -->
    <header class="order-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">确认订单</div>
      <div class="header-right"></div>
    </header>

    <!-- 地址信息 -->
    <div class="address-section" @click="goToAddress">
      <div v-if="state.address.id" class="address-info">
        <div class="address-header">
          <span class="name">{{ state.address.username }}</span>
          <span class="phone">{{ state.address.userPhone }}</span>
        </div>
        <div class="address-detail">
          {{ state.address.provinceName }} {{ state.address.cityName }} {{ state.address.regionName }} {{ state.address.detailAddress }}
        </div>
      </div>
      <div v-else class="no-address">
        <el-icon><Location /></el-icon>
        <span>请选择收货地址</span>
      </div>
      <el-icon class="arrow"><ArrowRight /></el-icon>
    </div>

    <!-- 商品列表 -->
    <div class="goods-section">
      <h3 class="section-title">商品信息</h3>
      <div class="goods-list">
        <div class="goods-item" v-for="item in state.goodsList" :key="item.cartItemId">
          <img :src="item.coverImg" :alt="item.goodsName" class="goods-img" />
          <div class="goods-info">
            <div class="goods-name">{{ item.goodsName }}</div>
            <div class="goods-count">x{{ item.goodsCount }}</div>
            <div class="goods-price">¥{{ item.sellingPrice }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单金额 -->
    <div class="amount-section">
      <div class="amount-item">
        <span>商品金额</span>
        <span class="price">¥{{ totalAmount }}</span>
      </div>
      <div class="amount-item">
        <span>运费</span>
        <span class="price">¥0</span>
      </div>
      <div class="amount-item total">
        <span>实付金额</span>
        <span class="price total-price">¥{{ totalAmount }}</span>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="pay-section">
      <h3 class="section-title">支付方式</h3>
      <el-radio-group v-model="state.payType">
        <el-radio :label="1">
          <el-icon><Money /></el-icon>
          支付宝
        </el-radio>
        <el-radio :label="2">
          <el-icon><Wallet /></el-icon>
          微信支付
        </el-radio>
      </el-radio-group>
    </div>

    <!-- 底部提交栏 -->
    <div class="submit-bar">
      <div class="total-info">
        <span class="total-label">合计:</span>
        <span class="total-amount">¥{{ totalAmount }}</span>
      </div>
      <el-button type="danger" size="large" @click="handleSubmit" :loading="state.submitting">
        提交订单
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Location, Money, Wallet } from '@element-plus/icons-vue'
import { useAddressStore } from '@/stores/user/address'
import { useOrderStore } from '@/stores/user/order'
import { useShoppingCartStore } from '@/stores/user/shoppingcart'

const route = useRoute()
const router = useRouter()
const addressStore = useAddressStore()
const orderStore = useOrderStore()
const cartStore = useShoppingCartStore()

const state = reactive({
  goodsList: [] as Array<any>,
  address: {} as any,
  payType: 1,
  submitting: false,
  cartItemIds: [] as number[]
})

// 计算总金额
const totalAmount = computed(() => {
  return state.goodsList
    .reduce((sum, item) => sum + item.sellingPrice * item.goodsCount, 0)
    .toFixed(2)
})

// 初始化数据
const init = async () => {
  const { cartItemIds, addressId } = route.query
  
  // 解析购物车项ID
  if (cartItemIds) {
    try {
      state.cartItemIds = JSON.parse(cartItemIds as string)
    } catch (e) {
      ElMessage.error('参数错误')
      return
    }
  }
  
  // 获取购物车商品详情
  if (state.cartItemIds.length > 0) {
    try {
      const res = await cartStore.pageResult({ pageNumber: 1, pageSize: 100 })
      const allItems = res.records || []
      state.goodsList = allItems.filter((item: any) => 
        state.cartItemIds.includes(item.cartItemId)
      )
    } catch (error) {
      ElMessage.error('加载商品失败')
    }
  }
  
  // 获取地址
  await loadAddress(addressId as string)
}

// 加载地址
const loadAddress = async (addressId?: string) => {
  try {
    if (addressId) {
      // 获取指定地址
      const res = await addressStore.getById(Number(addressId))
      state.address = res || {}
    } else {
      // 获取默认地址
      const res = await addressStore.getDefaultAddresss()
      state.address = res || {}
    }
    
    // 如果没有地址，提示用户添加
    if (!state.address.id) {
      ElMessage.warning('请先添加收货地址')
    }
  } catch (error) {
    console.error('加载地址失败', error)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到地址选择
const goToAddress = () => {
  router.push({
    path: '/address',
    query: {
      from: 'create-order',
      cartItemIds: JSON.stringify(state.cartItemIds)
    }
  })
}

// 提交订单
const handleSubmit = async () => {
  if (!state.address.id) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  if (state.goodsList.length === 0) {
    ElMessage.warning('商品信息不能为空')
    return
  }
  
  state.submitting = true
  try {
    // 构建订单参数
    const params = {
      addressId: state.address.id,
      cartItemIds: state.cartItemIds
    }
    
    // 创建订单
    const result = await orderStore.saveOrder(params)
    ElMessage.success('订单创建成功')
    
    // 获取订单号并跳转支付
    const orderNo = result?.orderNo || result?.data?.orderNo
    if (orderNo) {
      await handlePay(orderNo)
    } else {
      // 如果没有返回订单号，跳转到订单列表
      router.push('/order')
    }
  } catch (error) {
    ElMessage.error('创建订单失败')
  } finally {
    state.submitting = false
  }
}

// 支付订单
const handlePay = async (orderNo: string) => {
  try {
    await orderStore.payOrder({
      orderNo,
      payType: state.payType
    })
    ElMessage.success('支付成功')
    
    // 跳转到订单详情
    setTimeout(() => {
      router.push(`/order/${orderNo}`)
    }, 1500)
  } catch (error) {
    ElMessage.error('支付失败')
    // 跳转到订单列表
    router.push('/order')
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.create-order {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.order-header {
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

.address-section {
  margin-top: 50px;
  background: white;
  padding: 15px;
  display: flex;
  align-items: center;
}

.address-info {
  flex: 1;
}

.name {
  font-size: 16px;
  margin-right: 10px;
}

.phone {
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #333;
}

.no-address {
  flex: 1;
  color: #999;
  font-size: 14px;
}

.arrow {
  font-size: 18px;
  color: #999;
}

.goods-section {
  margin-top: 10px;
  background: white;
  padding: 15px;
}

.section-title {
  font-size: 16px;
  margin-bottom: 15px;
}

.goods-list {
  border-top: 1px solid #eee;
}

.goods-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.goods-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 14px;
  color: #333;
}

.goods-count {
  font-size: 12px;
  color: #999;
}

.goods-price {
  font-size: 16px;
  color: #f44;
}

.amount-section {
  margin-top: 10px;
  background: white;
  padding: 15px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
}

.amount-item.total {
  border-top: 1px solid #eee;
  margin-top: 10px;
  padding-top: 15px;
}

.total-price {
  color: #f44;
  font-size: 18px;
}

.pay-section {
  margin-top: 10px;
  background: white;
  padding: 15px;
}

.submit-bar {
  position: fixed;
  bottom: 0;
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

.total-amount {
  font-size: 20px;
  color: #f44;
}

.submit-bar .el-button {
  min-width: 120px;
}
</style>
