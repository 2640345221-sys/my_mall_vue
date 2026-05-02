<template>
  <div class="order-container">
    <!-- 顶部导航 -->
    <header class="order-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">我的订单</div>
      <div class="header-right"></div>
    </header>

    <!-- 订单状态标签 -->
    <div class="order-tabs">
      <div
        class="tab-item"
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: state.status === tab.value }"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list" v-loading="state.loading">
      <div
        class="order-item"
        v-for="order in state.list"
        :key="order.orderNo"
        @click="goToDetail(order.orderNo)"
      >
        <!-- 订单头部 -->
        <div class="order-header-info">
          <span class="order-time">{{ order.createTime }}</span>
          <span class="order-status" :class="getStatusClass(order.orderStatus)">
            {{ getStatusText(order.orderStatus) }}
          </span>
        </div>

        <!-- 订单商品 -->
        <div class="order-goods">
          <div
            class="goods-item"
            v-for="item in order.orderCartDTO"
            :key="item.goodsId"
          >
            <img :src="item.coverImg" :alt="item.goodsName" class="goods-img" />
            <div class="goods-info">
              <div class="goods-name">{{ item.goodsName }}</div>
              <div class="goods-price-count">
                <span class="price">¥{{ item.price }}</span>
                <span class="count">x{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单底部 -->
        <div class="order-footer">
          <span class="total-label">共{{ getTotalCount(order) }}件商品</span>
          <span class="total-amount">
            实付: <span class="amount">¥{{ order.totalPrice }}</span>
          </span>
        </div>

        <!-- 订单操作 -->
        <div class="order-actions">
          <el-button
            v-if="order.status === 0"
            type="primary"
            size="small"
            @click.stop="handlePay(order)"
          >
            立即支付
          </el-button>
          <el-button
            v-if="order.status === 3"
            type="success"
            size="small"
            @click.stop="handleConfirm(order)"
          >
            确认收货
          </el-button>
          <el-button
            v-if="order.status === 0"
            size="small"
            @click.stop="handleCancel(order)"
          >
            取消订单
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="state.list.length === 0 && !state.loading">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="goToHome">去购物</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="state.list.length > 0">
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
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/user/order'

const router = useRouter()
const orderStore = useOrderStore()

// 订单状态标签
const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: '0' },
  { label: '待发货', value: '1' },
  { label: '待收货', value: '2' },
  { label: '已完成', value: '3' },
  { label: '已取消', value: '4' }
]

const state = reactive({
  status: '',
  list: [] as Array<any>,
  loading: false,
  finished: false,
  page: 1,
  pageSize: 10,
  total: 0
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

// 获取状态样式类
const getStatusClass = (status: number) => {
  const classMap: Record<number, string> = {
    0: 'status-unpaid',
    1: 'status-pending',
    2: 'status-shipped',
    3: 'status-completed',
    4: 'status-cancelled'
  }
  return classMap[status] || ''
}

// 获取商品总数
const getTotalCount = (order: any) => {
  if (!order.orderCartDTO) return 0
  return order.orderCartDTO.reduce((sum: number, item: any) => sum + item.count, 0)
}

// 加载订单列表
const loadOrderList = async (isRefresh = false) => {
  if (state.loading) return
  
  state.loading = true
  try {
    if (isRefresh) {
      state.page = 1
      state.list = []
    }
    
    const res = await orderStore.getOrderPage({
      pageNumber: state.page,
      pageSize: state.pageSize,
      orderStatus: state.status ? Number(state.status) : undefined,
      orderNo: ''
    } as any)
    
    const records = res.records || []
    state.list = isRefresh ? records : [...state.list, ...records]
    state.total = res.totalCount || 0
    state.finished = state.list.length >= state.total
  } catch (error) {
    ElMessage.error('加载订单失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

// 切换标签
const handleTabChange = (status: string) => {
  state.status = status
  loadOrderList(true)
}

// 加载更多
const loadMore = () => {
  if (state.finished || state.loading) return
  state.page++
  loadOrderList()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到首页
const goToHome = () => {
  router.push('/home')
}

// 跳转到订单详情
const goToDetail = (orderNo: string) => {
  router.push(`/order/${orderNo}`)
}

// 支付订单
const handlePay = async (order: any) => {
  try {
    await orderStore.payOrder({
      orderNo: order.orderNo,
      payType: 1 // 支付宝
    })
    ElMessage.success('支付成功')
    loadOrderList(true)
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

// 确认收货
const handleConfirm = async (order: any) => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.confirmOrder(order.orderNo)
    ElMessage.success('确认收货成功')
    loadOrderList(true)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认收货失败')
    }
  }
}

// 取消订单
const handleCancel = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.cancelOrder(order.orderNo)
    ElMessage.success('取消订单成功')
    loadOrderList(true)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消订单失败')
    }
  }
}

onMounted(() => {
  loadOrderList(true)
})
</script>

<style scoped>
.order-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
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

.order-tabs {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-bottom: 1px solid #eee;
  z-index: 1000;
}

.tab-item {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.tab-item.active {
  color: #1baeae;
  border-bottom: 2px solid #1baeae;
}

.order-list {
  padding-top: 100px;
}

.order-item {
  background: white;
  margin-bottom: 10px;
  padding: 15px;
}

.order-header-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 13px;
}

.order-time {
  color: #999;
}

.status-unpaid { color: #f44; }
.status-pending { color: #ff976a; }
.status-shipped { color: #1989fa; }
.status-completed { color: #07c160; }
.status-cancelled { color: #999; }

.order-goods {
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
  padding: 10px 0;
}

.goods-item {
  display: flex;
  padding: 8px 0;
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
  color: #f44;
}

.count {
  font-size: 12px;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 13px;
  color: #666;
}

.amount {
  color: #f44;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.empty-state {
  padding-top: 100px;
}

.load-more {
  text-align: center;
  padding: 20px;
}

.no-more {
  color: #999;
  font-size: 13px;
}
</style>
