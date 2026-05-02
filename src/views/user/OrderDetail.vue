<template>
  <div class="order-detail-container">
    <!-- 顶部导航 -->
    <header class="detail-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">订单详情</div>
      <div class="header-right"></div>
    </header>

    <!-- 订单状态 -->
    <div class="status-section" v-if="state.order.orderNo">
      <div class="status-icon">
        <el-icon :size="40" :color="getStatusColor(state.order.status)">
          <component :is="getStatusIcon(state.order.status)" />
        </el-icon>
      </div>
      <div class="status-text">{{ getStatusText(state.order.status) }}</div>
      <div class="status-desc">{{ getStatusDesc(state.order.status) }}</div>
    </div>

    <!-- 收货地址 -->
    <div class="address-section" v-if="state.order.address">
      <div class="section-icon">
        <el-icon><Location /></el-icon>
      </div>
      <div class="address-info">
        <div class="address-header">
          <span class="name">{{ state.order.address.username }}</span>
          <span class="phone">{{ state.order.address.userPhone }}</span>
        </div>
        <div class="address-detail">
          {{ state.order.address.provinceName }} {{ state.order.address.cityName }} {{ state.order.address.regionName }} {{ state.order.address.detailAddress }}
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="goods-section">
      <h3 class="section-title">商品信息</h3>
      <div class="goods-list">
        <div
          class="goods-item"
          v-for="item in state.order.orderItems"
          :key="item.id"
          @click="goToGoods(item.goodsId)"
        >
          <img :src="item.coverImg" :alt="item.name" class="goods-img" />
          <div class="goods-info">
            <div class="goods-name">{{ item.name }}</div>
            <div class="goods-price-count">
              <span class="price">¥{{ item.sellingPrice }}</span>
              <span class="count">x{{ item.goodsCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单信息 -->
    <div class="info-section">
      <h3 class="section-title">订单信息</h3>
      <div class="info-item">
        <span class="label">订单编号</span>
        <span class="value">{{ state.order.orderNo }}</span>
      </div>
      <div class="info-item">
        <span class="label">下单时间</span>
        <span class="value">{{ state.order.createTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">支付方式</span>
        <span class="value">{{ getPayTypeText(state.order.payType) }}</span>
      </div>
      <div class="info-item">
        <span class="label">配送方式</span>
        <span class="value">普通快递</span>
      </div>
    </div>

    <!-- 金额信息 -->
    <div class="amount-section">
      <div class="amount-item">
        <span class="label">商品总额</span>
        <span class="value">¥{{ state.order.totalPrice }}</span>
      </div>
      <div class="amount-item">
        <span class="label">运费</span>
        <span class="value">¥0</span>
      </div>
      <div class="amount-item total">
        <span class="label">实付金额</span>
        <span class="value">¥{{ state.order.totalPrice }}</span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar" v-if="state.order.status !== undefined">
      <el-button
        v-if="state.order.status === 0"
        type="primary"
        size="large"
        @click="showPayDialog"
      >
        立即支付
      </el-button>
      <el-button
        v-if="state.order.status === 2"
        type="success"
        size="large"
        @click="handleConfirm"
      >
        确认收货
      </el-button>
      <el-button
        v-if="state.order.status === 0"
        size="large"
        @click="handleCancel"
      >
        取消订单
      </el-button>
    </div>

    <!-- 支付弹窗 -->
    <el-dialog
      v-model="state.showPay"
      title="选择支付方式"
      width="90%"
      center
    >
      <div class="pay-options">
        <el-button type="primary" size="large" @click="handlePay(1)">
          <el-icon><Money /></el-icon>
          支付宝支付
        </el-button>
        <el-button type="success" size="large" @click="handlePay(2)">
          <el-icon><Wallet /></el-icon>
          微信支付
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Location,
  Money,
  Wallet,
  Clock,
  Box,
  Check,
  Close
} from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/user/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const state = reactive({
  order: {} as any,
  showPay: false,
  loading: false
})

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态描述
const getStatusDesc = (status: number) => {
  const descMap: Record<number, string> = {
    0: '请在30分钟内完成支付',
    1: '商家正在备货中',
    2: '商品已发出，请注意查收',
    3: '交易已完成，期待您的评价',
    4: '订单已取消'
  }
  return descMap[status] || ''
}

// 获取状态颜色
const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: '#f44',
    1: '#ff976a',
    2: '#1989fa',
    3: '#07c160',
    4: '#999'
  }
  return colorMap[status] || '#999'
}

// 获取状态图标
const getStatusIcon = (status: number) => {
  const iconMap: Record<number, any> = {
    0: Clock,
    1: Box,
    2: Box,
    3: Check,
    4: Close
  }
  return iconMap[status] || Clock
}

// 获取支付方式文本
const getPayTypeText = (payType: number) => {
  const typeMap: Record<number, string> = {
    1: '支付宝',
    2: '微信支付'
  }
  return typeMap[payType] || '未支付'
}

// 加载订单详情
const loadOrderDetail = async () => {
  const { orderNo } = route.params
  if (!orderNo) {
    ElMessage.error('订单号不存在')
    return
  }

  state.loading = true
  try {
    const res = await orderStore.getOrderDetail(orderNo as string)
    state.order = res || {}
  } catch (error) {
    ElMessage.error('加载订单详情失败')
  } finally {
    state.loading = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到商品详情
const goToGoods = (goodsId: number) => {
  router.push(`/goods/${goodsId}`)
}

// 显示支付弹窗
const showPayDialog = () => {
  state.showPay = true
}

// 支付订单
const handlePay = async (payType: number) => {
  try {
    await orderStore.payOrder({
      orderNo: state.order.orderNo,
      payType
    })
    ElMessage.success('支付成功')
    state.showPay = false
    loadOrderDetail()
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

// 确认收货
const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await orderStore.confirmOrder(state.order.orderNo)
    ElMessage.success('确认收货成功')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认收货失败')
    }
  }
}

// 取消订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await orderStore.cancelOrder(state.order.orderNo)
    ElMessage.success('取消订单成功')
    loadOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败')
    }
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
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

.status-section {
  margin-top: 44px;
  background: #1baeae;
  padding: 30px 20px;
  text-align: center;
  color: white;
}

.status-text {
  font-size: 18px;
  margin-bottom: 5px;
}

.status-desc {
  font-size: 13px;
}

.address-section {
  display: flex;
  background: white;
  padding: 15px;
  margin-top: 10px;
}

.section-icon {
  font-size: 20px;
  color: #1baeae;
  margin-right: 10px;
}

.address-info {
  flex: 1;
}

.name {
  font-size: 15px;
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

.goods-section {
  background: white;
  margin-top: 10px;
  padding: 15px;
}

.section-title {
  font-size: 15px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.goods-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.goods-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 12px;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 14px;
  color: #333;
}

.goods-price-count {
  display: flex;
  justify-content: space-between;
}

.price {
  font-size: 14px;
  color: #f44;
}

.count {
  font-size: 12px;
  color: #999;
}

.info-section {
  background: white;
  margin-top: 10px;
  padding: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-item .label {
  color: #999;
}

.amount-section {
  background: white;
  margin-top: 10px;
  padding: 15px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.amount-item.total {
  border-top: 1px solid #eee;
  margin-top: 10px;
  padding-top: 15px;
}

.amount-item.total .value {
  color: #f44;
  font-size: 18px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 15px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
}

.pay-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
}
</style>
