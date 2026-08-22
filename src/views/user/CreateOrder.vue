<template>
  <div class="create-order">
    <PageHeader title="确认订单" :topOffset="44" @back="goBack" />

    
    <div class="address-section" @click="goToAddress">
      <div v-if="state.address.id" class="address-info">
        <div class="address-header">
          <span class="name">{{ state.address.username }}</span>
          <span class="phone">{{ state.address.userPhone }}</span>
        </div>
        <div class="address-detail">
          {{ state.address.province }} {{ state.address.city }} {{ state.address.region }} {{ state.address.detailAddress }}
        </div>
      </div>
      <div v-else class="no-address">
        <el-icon><Location /></el-icon>
        <span>请选择收货地址</span>
      </div>
      <el-icon class="arrow"><ArrowRight /></el-icon>
    </div>

    
    <div class="goods-section">
      <h3 class="section-title">商品信息</h3>
      <div class="goods-list">
        <div class="goods-item" v-for="item in state.goodsList" :key="item.cartItemId">
          <img :src="item.coverImg" :alt="item.goodsName" class="goods-img" />
          <div class="goods-info">
            <div class="goods-name">{{ item.goodsName }}</div>
            <div class="goods-count">x{{ item.goodsCount }}</div>
            <div class="goods-price">¥{{ formatPrice(item.sellingPrice) }}</div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="amount-section">
      <div class="amount-item">
        <span>商品金额</span>
        <span class="price">¥{{ formatPrice(totalAmount) }}</span>
      </div>
      <div class="amount-item">
        <span>运费</span>
        <span class="price">¥0</span>
      </div>
      <div class="amount-item total">
        <span>实付金额</span>
        <span class="price total-price">¥{{ formatPrice(totalAmount) }}</span>
      </div>
    </div>

    
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

    
    <div class="submit-bar">
      <div class="total-info">
        <span class="total-label">合计:</span>
        <span class="total-amount">¥{{ formatPrice(totalAmount) }}</span>
      </div>
      <el-button type="danger" size="large" @click="handleSubmit" :loading="state.submitting">
        提交订单
      </el-button>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Location, Money, Wallet } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import { getById as getAddressById, getDefault as getDefaultAddress } from '@/api/user/address'
import { createOrder, payOrder } from '@/api/user/order'
import { getCartPage } from '@/api/user/cart'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()
//保存支付成功后延迟跳转的定时器句柄，组件卸载时清理，防止页面跳走后仍触发路由跳转
let payTimer: number | null = null

const state = reactive({
  goodsList: [] as Array<any>,
  address: {} as any,
  payType: 1,
  submitting: false,
  cartItemIds: [] as number[]
})

const totalAmount = computed(() => {
  return state.goodsList
    .reduce((sum, item) => sum + item.sellingPrice * item.goodsCount, 0)
})

const init = async () => {
  const { cartItemIds, addressId } = route.query
  
  if (cartItemIds) {
    try {
      state.cartItemIds = JSON.parse(cartItemIds as string)
    } catch (e) {
      ElMessage.error('参数错误')
      return
    }
  }
  
  if (state.cartItemIds.length > 0) {
    try {
      const res = await getCartPage({ pageNumber: 1, pageSize: 100 })
      const allItems = res.records || []
      state.goodsList = allItems.filter((item: any) =>
        state.cartItemIds.includes(item.cartItemId)
      )
    } catch (error) {
      ElMessage.error('加载商品失败')
    }
  }
  
  await loadAddress(addressId as string)
}

const loadAddress = async (addressId?: string) => {
  try {
    if (addressId) {
      const res = await getAddressById(Number(addressId))
      state.address = res || {}
    } else {
      const res = await getDefaultAddress()
      state.address = res || {}
    }
    
    if (!state.address.id) {
      ElMessage.warning('请先添加收货地址')
    }
  } catch (error) {
    console.error('加载地址失败', error)
  }
}

const goBack = () => {
  router.back()
}

const goToAddress = () => {
  router.push({
    path: '/address',
    query: {
      from: 'create-order',
      cartItemIds: JSON.stringify(state.cartItemIds)
    }
  })
}

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
    const params = {
      addressId: state.address.id,
      cartItemIds: state.cartItemIds
    }
    
    const orderNo = await createOrder(params)
    ElMessage.success('订单创建成功')
    
    await handlePay(orderNo)
  } catch (error) {
    ElMessage.error('创建订单失败')
  } finally {
    state.submitting = false
  }
}

const handlePay = async (orderNo: string) => {
  try {
    await payOrder({
      orderNo,
      payType: state.payType
    })
    ElMessage.success('支付成功')
    
    payTimer = window.setTimeout(() => {
      router.push(`/order/${orderNo}`)
    }, 1500)
  } catch (error) {
    ElMessage.error('支付失败')
    router.push('/order')
  }
}

onMounted(() => {
  init()
})

//组件卸载时清除延迟跳转的定时器，避免用户中途离开仍被强行跳转到订单页
onBeforeUnmount(() => {
  if (payTimer) {
    clearTimeout(payTimer)
    payTimer = null
  }
})
</script>

<style scoped>
.create-order {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 44px;
  padding-bottom: 100px;
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
  margin-top: 0;
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
