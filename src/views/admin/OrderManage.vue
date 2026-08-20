<template>
  <div>
    
        <div class="search-bar">
          <el-input
            v-model="state.searchOrderNo"
            placeholder="请输入订单号"
            style="width: 200px"
            clearable
          />
          <el-select v-model="state.searchStatus" placeholder="订单状态" clearable style="width: 150px">
            <el-option label="待付款" :value="0" />
            <el-option label="待发货" :value="1" />
            <el-option label="待收货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>

        
        <el-table :data="state.orderList" v-loading="state.loading" border>
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column label="用户" min-width="120">
            <template #default="scope">
              {{ scope.row.orderAddress?.username || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalPrice" label="订单金额" min-width="100">
            <template #default="scope">
              ¥{{ formatPrice(scope.row.totalPrice) }}
            </template>
          </el-table-column>
          <el-table-column prop="payType" label="支付方式" min-width="100">
            <template #default="scope">
              {{ getPayTypeText(scope.row.payType) }}
            </template>
          </el-table-column>
          <el-table-column prop="orderStatus" label="订单状态" min-width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.orderStatus)">
                {{ getStatusText(scope.row.orderStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间" min-width="180" />
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleDetail(scope.row)">
                详情
              </el-button>
              <el-button
                v-if="scope.row.orderStatus === 1"
                type="warning"
                link
                @click="handleCheckDone(scope.row)"
              >
                配货
              </el-button>
              <el-button
                v-if="scope.row.orderStatus === 2"
                type="success"
                link
                @click="handleCheckOut(scope.row)"
              >
                发货
              </el-button>
              <el-button
                v-if="scope.row.orderStatus === 0"
                type="danger"
                link
                @click="handleClose(scope.row)"
              >
                关闭
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <AdminPagination :total="state.total" :model-page="state.page" @page-change="onPageChange" />

  
    <el-dialog v-model="state.detailVisible" title="订单详情" width="700px">
      <div v-if="state.currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <p><span>订单号：</span>{{ state.currentOrder.orderNo }}</p>
          <p><span>下单时间：</span>{{ state.currentOrder.createTime }}</p>
          <p><span>订单状态：</span>
            <el-tag :type="getStatusType(state.currentOrder.orderStatus)">
              {{ getStatusText(state.currentOrder.orderStatus) }}
            </el-tag>
          </p>
        </div>
        <div class="detail-section">
          <h4>收货信息</h4>
          <p><span>收货人：</span>{{ state.currentOrder.orderAddress?.username || '-' }}</p>
          <p><span>手机号：</span>{{ state.currentOrder.orderAddress?.userPhone || '-' }}</p>
          <p><span>收货地址：</span>{{ getAddressText(state.currentOrder.orderAddress) }}</p>
        </div>
        <div class="detail-section">
          <h4>商品信息</h4>
          <el-table :data="state.currentOrder.orderCartDTO || []" border size="small">
            <el-table-column prop="goodsName" label="商品名称" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="scope">¥{{ formatPrice(scope.row.price) }}</template>
            </el-table-column>
            <el-table-column prop="count" label="数量" width="80" />
            <el-table-column label="小计" width="100">
              <template #default="scope">¥{{ formatPrice(scope.row.price * scope.row.count) }}</template>
            </el-table-column>
          </el-table>
        </div>
        <div class="detail-section total">
          <p><span>商品总额：</span>¥{{ formatPrice(state.currentOrder.totalPrice) }}</p>
          <p><span>运费：</span>¥0</p>
          <p class="final-total"><span>实付金额：</span>¥{{ formatPrice(state.currentOrder.totalPrice) }}</p>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getPage, getOrderDetail, checkDone, checkOut, close } from '@/api/admin/order'
import { formatPrice } from '@/utils/format'
import AdminPagination from '@/components/AdminPagination.vue'

const state = reactive({
  orderList: [] as any[],
  loading: false,
  page: 1,
  pageSize: 10,
  total: 0,
  searchOrderNo: '',
  searchStatus: null as number | null,
  detailVisible: false,
  currentOrder: null as any
})

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'warning',
    1: 'primary',
    2: 'primary',
    3: 'success',
    4: 'info'
  }
  return typeMap[status] || 'danger'
}

const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '配货完成',
    3: '出库成功',
    4: '交易成功',
    [-1]: '已关闭',
    [-3]: '已取消'
  }
  return textMap[status] || '未知'
}

const getPayTypeText = (type: number) => {
  const textMap: Record<number, string> = {
    1: '支付宝',
    2: '微信支付'
  }
  return textMap[type] || '未知'
}

const loadOrderList = async () => {
  state.loading = true
  try {
    const res = await getPage({
      pageNumber: state.page,
      pageSize: state.pageSize,
      orderStatus: state.searchStatus ?? undefined as any,
      orderNo: state.searchOrderNo || ''
    })
    state.orderList = res.records || []
    state.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载订单列表失败')
  } finally {
    state.loading = false
  }
}

const handleSearch = () => {
  state.page = 1
  loadOrderList()
}

const handleDetail = async (row: any) => {
  try {
    const res = await getOrderDetail(row.orderNo)
    state.currentOrder = res
    state.detailVisible = true
  } catch (error) {
    ElMessage.error('加载订单详情失败')
  }
}

const getAddressText = (addr: any) => {
  if (!addr) return '-'
  return `${addr.province || ''}${addr.city || ''}${addr.region || ''}${addr.detailAddress || ''}`
}

const handleCheckDone = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认订单 ${row.orderNo} 配货完成？`, '提示', { type: 'warning' })
    await checkDone([row.id])
    ElMessage.success('配货成功')
    loadOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('配货失败')
    }
  }
}

const handleCheckOut = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认订单 ${row.orderNo} 出库发货？`, '提示', { type: 'warning' })
    await checkOut([row.id])
    ElMessage.success('发货成功')
    loadOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发货失败')
    }
  }
}

const handleClose = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要关闭订单 ${row.orderNo} 吗？关闭后库存会回补。`, '提示', { type: 'warning' })
    await close([row.id])
    ElMessage.success('关闭成功')
    loadOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('关闭失败')
    }
  }
}

function onPageChange(p: number) { state.page = p; loadOrderList() }

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.jump-label {
  color: #606266;
}

.total-pages,
.total-records {
  color: #606266;
  margin-left: 8px;
}
</style>

<style>
.order-detail {
  padding: 10px 0;
}

.order-detail .detail-section {
  margin-bottom: 20px;
}

.order-detail .detail-section h4 {
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
}

.order-detail .detail-section p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.order-detail .detail-section p span {
  color: #909399;
  margin-right: 8px;
}

.order-detail .detail-section.total {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.order-detail .detail-section.total .final-total {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  margin-top: 10px;
}
</style>
