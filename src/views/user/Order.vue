<template>
  <div class="order-container">
    <PageHeader title="我的订单" :topOffset="44" @back="goBack" />

    
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

    
    <div class="order-list" v-loading="state.loading">
      <div class="search-box">
        <el-icon><Search /></el-icon>
        <input v-model="state.keyword" placeholder="搜索订单号或商品" />
      </div>

      <div
        class="order-item"
        v-for="order in filteredList"
        :key="order.orderNo"
        @click="goToDetail(order.orderNo)"
      >
        
        <div class="order-header-info">
          <span class="order-time">{{ order.createTime }}</span>
          <span class="order-status" :class="getStatusClass(order.orderStatus)">
            {{ getStatusText(order.orderStatus) }}
          </span>
        </div>


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
                <span class="price">¥{{ formatPrice(item.price) }}</span>
                <span class="count">x{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <span class="total-label">共{{ order.orderCartDTO?.length || 0 }}件</span>
          <span class="total-amount">
            实付: <span class="amount">¥{{ formatPrice(order.totalPrice) }}</span>
          </span>
        </div>

        
        <div class="order-actions">
          <el-button
            v-if="order.orderStatus === 0"
            type="primary"
            size="small"
            @click.stop="handlePay(order)"
          >
            立即支付
          </el-button>
          <el-button
            v-if="order.orderStatus === 3"
            type="success"
            size="small"
            @click.stop="handleConfirm(order)"
          >
            确认签收
          </el-button>
          <el-button
            v-if="order.orderStatus === 0"
            size="small"
            @click.stop="handleCancel(order)"
          >
            取消订单
          </el-button>
        </div>
      </div>

      
      <div class="empty-state" v-if="state.list.length === 0 && !state.loading">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="goToHome">去购物</el-button>
        </el-empty>
      </div>
    </div>

    
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

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getOrderPage, payOrder, confirmOrder, cancelOrder } from '@/api/user/order'
import { formatPrice } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()

const tabs = [
  { label: '全部', value: '' },
  { label: '待支付', value: '0' },
  { label: '已支付', value: '1' },
  { label: '配货完成', value: '2' },
  { label: '出库成功', value: '3' },
  { label: '交易成功', value: '4' },
  { label: '已关闭', value: '-99' }
]

const state = reactive({
  status: '',
  keyword: '',
  list: [] as Array<any>,
  loading: false,
  finished: false,
  page: 1,
  pageSize: 10,
  total: 0
})

const filteredList = computed(() => {
  const kw = state.keyword.trim().toLowerCase()
  if (!kw) return state.list
  return state.list.filter(order => {
    if ((order.orderNo || '').toLowerCase().includes(kw)) return true
    const items = order.orderCartDTO || []
    return items.some((item: any) => (item.goodsName || '').toLowerCase().includes(kw))
  })
})

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '配货完成',
    3: '出库成功',
    4: '交易成功',
    [-1]: '已关闭',
    [-2]: '已关闭',
    [-3]: '已关闭'
  }
  return map[status] || ''
}

const getStatusClass = (status: number) => {
  if (status < 0) return 'status-cancelled'
  const map: Record<number, string> = {
    0: 'status-unpaid',
    1: 'status-paid',
    2: 'status-shipped',
    3: 'status-shipped',
    4: 'status-completed'
  }
  return map[status] || ''
}

const loadOrderList = async (isRefresh = false) => {
  if (state.loading) return
  
  state.loading = true
  try {
    if (isRefresh) {
      state.page = 1
      state.list = []
    }
    
    const res = await getOrderPage({
      pageNumber: state.page,
      pageSize: state.pageSize,
      orderStatus: state.status ? Number(state.status) : undefined
    })
    
    const records = res.records || []
    state.list = isRefresh ? records : [...state.list, ...records]
    state.total = res.total || 0
    state.finished = state.list.length >= state.total
  } catch (error) {
    ElMessage.error('加载订单失败')
    console.error(error)
  } finally {
    state.loading = false
  }
}

const handleTabChange = (status: string) => {
  state.status = status
  loadOrderList(true)
}

const loadMore = () => {
  if (state.finished || state.loading) return
  state.page++
  loadOrderList()
}

const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/home')
}

const goToDetail = (orderNo: string) => {
  router.push(`/order/${orderNo}`)
}

const handlePay = async (order: any) => {
  try {
    await payOrder({
      orderNo: order.orderNo,
      payType: 1
    })
    ElMessage.success('支付成功')
    loadOrderList(true)
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

const handleConfirm = async (order: any) => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await confirmOrder(order.orderNo)
    ElMessage.success('确认收货成功')
    loadOrderList(true)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认收货失败')
    }
  }
}

const handleCancel = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cancelOrder(order.orderNo)
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
  top: 88px;
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

.search-box { display: flex; align-items: center; gap: 8px; margin: 10px 12px; padding: 8px 12px; background: white; border-radius: 18px; color: #999; }
.search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #333; }

.order-list {
  padding-top: 144px;
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
  padding-top: 144px;
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
