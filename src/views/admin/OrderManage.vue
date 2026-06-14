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
          <el-table-column prop="userName" label="用户" min-width="120" />
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
          <el-table-column prop="status" label="订单状态" min-width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
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
                v-if="scope.row.status === 1"
                type="success"
                link
                @click="handleShip(scope.row)"
              >
                发货
              </el-button>
              <el-button type="danger" link @click="handleCancel(scope.row)">
                取消
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
            <el-tag :type="getStatusType(state.currentOrder.status)">
              {{ getStatusText(state.currentOrder.status) }}
            </el-tag>
          </p>
        </div>
        <div class="detail-section">
          <h4>收货信息</h4>
          <p><span>收货人：</span>{{ state.currentOrder.userName }}</p>
          <p><span>手机号：</span>{{ state.currentOrder.userPhone }}</p>
          <p><span>收货地址：</span>{{ state.currentOrder.address }}</p>
        </div>
        <div class="detail-section">
          <h4>商品信息</h4>
          <el-table :data="state.currentOrder.items" border size="small">
            <el-table-column prop="name" label="商品名称" />
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

    
    <el-dialog v-model="state.shipVisible" title="订单发货" width="500px">
      <el-form :model="state.shipForm" label-width="100px">
        <el-form-item label="快递公司">
          <el-select v-model="state.shipForm.company" placeholder="选择快递公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通快递" value="圆通快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="EMS" value="EMS" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="state.shipForm.trackingNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="state.shipVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShipSubmit" :loading="state.shipLoading">
          确认发货
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getPage, getOrderDetail, shipOrder, cancelByOrderNo } from '@/api/admin/order'
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
  currentOrder: null as any,
  shipVisible: false,
  shipLoading: false,
  shipForm: {
    orderNo: '',
    company: '',
    trackingNo: ''
  }
})

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'info',
    4: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消'
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

const handleShip = (row: any) => {
  state.shipForm.orderNo = row.orderNo
  state.shipForm.company = ''
  state.shipForm.trackingNo = ''
  state.shipVisible = true
}

const handleShipSubmit = async () => {
  if (!state.shipForm.company || !state.shipForm.trackingNo) {
    ElMessage.warning('请填写完整的物流信息')
    return
  }
  state.shipLoading = true
  try {
    await shipOrder(state.shipForm)
    ElMessage.success('发货成功')
    state.shipVisible = false
    loadOrderList()
  } catch (error) {
    ElMessage.error('发货失败')
  } finally {
    state.shipLoading = false
  }
}

const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', { type: 'warning' })
    await cancelByOrderNo(row.orderNo)
    ElMessage.success('取消成功')
    loadOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
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
