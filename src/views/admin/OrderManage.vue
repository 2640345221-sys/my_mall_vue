<template>
  <div class="admin-layout">
    <admin-sidebar active-menu="/admin/order" />
    <div class="main-content">
      <admin-header title="订单管理" />
      <div class="page-content">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="state.searchOrderNo"
            placeholder="请输入订单号"
            style="width: 200px"
            clearable
            @keyup.enter="handleSearch"
          />
          <el-select v-model="state.searchStatus" placeholder="订单状态" clearable style="width: 150px">
            <el-option label="待付款" :value="0" />
            <el-option label="待发货" :value="1" />
            <el-option label="待收货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
          <el-date-picker
            v-model="state.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>

        <!-- 订单状态分类 -->
        <div class="status-stats">
          <div
            class="stat-item"
            v-for="stat in state.statusStats"
            :key="stat.status"
            :class="{ active: state.searchStatus === stat.status }"
            @click="handleStatusFilter(stat.status)"
          >
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>

        <!-- 数据表格 -->
        <el-table :data="state.orderList" v-loading="state.loading"  style="margin-top: 16px">
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column prop="userId" label="用户ID" min-width="100">
            <template #default="scope">
              {{ scope.row.userId || '未知' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalPrice" label="订单金额" min-width="100">
            <template #default="scope">
              ¥{{ (scope.row.totalPrice / 100).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="payType" label="支付方式" min-width="100">
            <template #default="scope">
              {{ getPayTypeText(scope.row.payType) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" min-width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(getOrderStatus(scope.row))">
                {{ getStatusText(getOrderStatus(scope.row)) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间" min-width="180" />
          <el-table-column label="操作" min-width="280" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleDetail(scope.row)">
                详情
              </el-button>
              <el-button
                v-if="getOrderStatus(scope.row) === 1"
                type="success"
                link
                @click="handleShip(scope.row)"
              >
                发货
              </el-button>
              <el-button
                v-if="getOrderStatus(scope.row) === 0 || getOrderStatus(scope.row) === 1"
                type="danger"
                link
                @click="handleCancel(scope.row)"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="state.page"
            v-model:page-size="state.pageSize"
            :total="state.total"
            layout="prev, pager, next"
            :prev-text="'上一页'"
            :next-text="'下一页'"
            @current-change="handleCurrentChange"
          />
          <div class="pagination-info">
            <span class="jump-label">跳转到</span>
            <el-input-number
              v-model="state.jumpPage"
              :min="1"
              :max="getTotalPages() || 1"
              size="small"
              style="width: 80px; margin: 0 8px"
            />
            <span class="total-pages">共 {{ getTotalPages() || 0 }} 页</span>
            <span class="total-records">共 {{ state.total }} 条</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="state.detailVisible" title="订单详情" width="700px">
      <div v-if="state.currentOrder" class="order-detail">
        <!-- 订单状态 -->
        <div class="detail-section status-section">
          <el-tag :type="getStatusType(getOrderStatus(state.currentOrder))" size="large">
            {{ getStatusText(getOrderStatus(state.currentOrder)) }}
          </el-tag>
        </div>

        <!-- 订单信息 -->
        <div class="detail-section">
          <h4>订单信息</h4>
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">{{ state.currentOrder.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span class="value">{{ state.currentOrder.createTime }}</span>
          </div>
          <div class="detail-row">
            <span class="label">支付方式：</span>
            <span class="value">{{ getPayTypeText(state.currentOrder.payType) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态：</span>
            <span class="value">
              <el-tag :type="getStatusType(getOrderStatus(state.currentOrder))">
                {{ getStatusText(getOrderStatus(state.currentOrder)) }}
              </el-tag>
            </span>
          </div>
        </div>

        <!-- 收货信息 -->
        <div class="detail-section" v-if="state.currentOrder.orderAddress">
          <h4>收货信息</h4>
          <div class="detail-row">
            <span class="label">收货人：</span>
            <span class="value">{{ state.currentOrder.orderAddress.username || '未知' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">手机号：</span>
            <span class="value">{{ state.currentOrder.orderAddress.userPhone || '未知' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">收货地址：</span>
            <span class="value">
              <span v-if="state.currentOrder.orderAddress.province && state.currentOrder.orderAddress.city && state.currentOrder.orderAddress.region && state.currentOrder.orderAddress.detailAddress">
                {{ state.currentOrder.orderAddress.province }}{{ state.currentOrder.orderAddress.city }}{{ state.currentOrder.orderAddress.region }}{{ state.currentOrder.orderAddress.detailAddress }}
              </span>
              <span v-else-if="state.currentOrder.orderAddress.detailAddress">
                {{ state.currentOrder.orderAddress.detailAddress }}
              </span>
              <span v-else>
                未知
              </span>
            </span>
          </div>
        </div>
        <div class="detail-section" v-else>
          <h4>收货信息</h4>
          <div class="detail-row">
            <span class="label">收货信息：</span>
            <span class="value">暂无收货信息</span>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-section">
          <h4>商品信息</h4>
          <el-table :data="state.currentOrder.orderCartDTO || state.currentOrder.items || []" border size="small">
            <el-table-column prop="goodsName" label="商品名称" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="scope">¥{{ scope.row.price }}</template>
            </el-table-column>
            <el-table-column prop="count" label="数量" width="80" />
            <el-table-column label="小计" width="100">
              <template #default="scope">¥{{ (scope.row.price * scope.row.count) }}</template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 金额信息 -->
        <div class="detail-section total">
          <div class="detail-row">
            <span class="label">商品总额：</span>
            <span class="value">¥{{ state.currentOrder.totalPrice }}</span>
          </div>
          <div class="detail-row">
            <span class="label">运费：</span>
            <span class="value">¥0.00</span>
          </div>
          <div class="detail-row final-total">
            <span class="label">实付金额：</span>
            <span class="value">¥{{ state.currentOrder.totalPrice }}</span>
          </div>
        </div>

        <!-- 物流信息 -->
        <div class="detail-section" v-if="state.currentOrder.shipCompany">
          <h4>物流信息</h4>
          <div class="detail-row">
            <span class="label">快递公司：</span>
            <span class="value">{{ state.currentOrder.shipCompany }}</span>
          </div>
          <div class="detail-row">
            <span class="label">快递单号：</span>
            <span class="value">{{ state.currentOrder.trackingNo }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="state.shipVisible" title="订单发货" width="500px">
      <el-form :model="state.shipForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="state.shipForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="快递公司" prop="company" :rules="[{ required: true, message: '请选择快递公司', trigger: 'change' }]">
          <el-select v-model="state.shipForm.company" placeholder="选择快递公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通快递" value="圆通快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="EMS" value="EMS" />
            <el-option label="京东物流" value="京东物流" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="trackingNo" :rules="[{ required: true, message: '请输入快递单号', trigger: 'blur' }]">
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
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import AdminSidebar from '@/components/admin/Sidebar.vue'
import AdminHeader from '@/components/admin/Header.vue'
import { useAdminOrderStore } from '@/stores/admin/order'

const adminOrderStore = useAdminOrderStore()

const state = reactive({
  orderList: [] as any[],
  loading: false,
  page: 1,
  pageSize: 10,
  total: 0,
  searchOrderNo: '',
  searchStatus: null as number | null,
  dateRange: [] as string[],
  detailVisible: false,
  currentOrder: null as any,
  shipVisible: false,
  shipLoading: false,
  jumpPage: 1,
  shipForm: {
    orderNo: '',
    orderId: null as number | null,
    company: '',
    trackingNo: ''
  },
  cancelStatusFilter: false, // 是否筛选取消状态
  statusStats: [
    { label: '全部', status: null },
    { label: '待支付', status: 0 },
    { label: '已支付', status: 1 },
    { label: '出库成功', status: 3 },
    { label: '交易成功', status: 4 },
    { label: '已取消', status: -1 }
  ]
})

// 获取订单状态值（兼容不同字段名）
const getOrderStatus = (order: any): number => {
  // 优先使用 orderStatus 字段，如果不存在则使用 status 字段
  const status = order.orderStatus !== undefined ? order.orderStatus : order.status
  
  // 确保状态值是有效的数字
  const statusValue = Number(status)
  
  // 如果转换后是 NaN，返回默认值
  if (isNaN(statusValue)) {
    console.warn('订单状态值无效:', status, '订单:', order)
    return -1 // 返回无效状态标识
  }
  
  return statusValue
}

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    [-3]: 'danger',    // 取消订单关闭 - 红色
    [-2]: 'danger',    // 超时关闭 - 红色
    [-1]: 'danger',    // 确认订单关闭 - 红色
    0: 'warning',      // 待支付 - 黄色
    1: 'primary',      // 已支付 - 蓝色
    3: 'info',         // 出库成功 - 灰色
    4: 'success'       // 交易成功 - 绿色
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    [-3]: '取消订单关闭',
    [-2]: '超时关闭',
    [-1]: '确认订单关闭',
    0: '待支付',
    1: '已支付',
    3: '出库成功',
    4: '交易成功'
  }
  return textMap[status] || `未知(${status})`
}

const getPayTypeText = (type: number) => {
  const textMap: Record<number, string> = {
    1: '支付宝',
    2: '微信支付'
  }
  return textMap[type] || '未支付'
}

const loadOrderList = async () => {
  state.loading = true
  try {
    const params = {
      pageNumber: state.page,
      pageSize: state.pageSize,
      orderNo: state.searchOrderNo || '',
      orderStatus: state.searchStatus !== null ? state.searchStatus : undefined,
      startTime: state.dateRange && state.dateRange.length === 2 ? state.dateRange[0] : undefined,
      endTime: state.dateRange && state.dateRange.length === 2 ? state.dateRange[1] : undefined
    }
    
    const res = await adminOrderStore.getPage(params)
    
    // 如果选择了已取消分类，需要在前端过滤出所有取消状态的订单
    if (state.cancelStatusFilter) {
      state.orderList = (res.records || []).filter((order: any) => {
        const status = getOrderStatus(order)
        return status === -1 || status === -2 || status === -3
      })
      state.total = state.orderList.length
    } else {
      state.orderList = res.records || []
      state.total = res.total || 0
    }
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

const handleReset = () => {
  state.searchOrderNo = ''
  state.searchStatus = null
  state.dateRange = []
  state.page = 1
  loadOrderList()
}

const handleStatusFilter = (status: number | null) => {
  // 如果选择的是已取消(-1)，需要特殊处理，查询所有取消状态
  if (status === -1) {
    state.searchStatus = -1 // 保持状态为-1，确保高亮正确
    state.cancelStatusFilter = true // 标记为取消状态筛选
  } else {
    state.searchStatus = status
    state.cancelStatusFilter = false
  }
  state.page = 1
  loadOrderList()
}

const handleDetail = async (row: any) => {
  try {
    const res = await adminOrderStore.getOrder(row.orderNo)
    state.currentOrder = res
    state.detailVisible = true
  } catch (error) {
    ElMessage.error('加载订单详情失败')
  }
}

const handleShip = (row: any) => {
  state.shipForm.orderNo = row.orderNo
  state.shipForm.orderId = row.id
  state.shipForm.company = '顺丰速运' // 默认快递公司
  state.shipForm.trackingNo = row.orderNo // 快递单号默认为订单号
  state.shipVisible = true
}

const handleShipSubmit = async () => {
  state.shipLoading = true
  try {
    await adminOrderStore.checkOut([state.shipForm.orderId])
    ElMessage.success('发货成功')
    state.shipVisible = false
    loadOrderList()
  } catch (error) {
    ElMessage.error('发货失败')
  } finally {
    state.shipLoading = false
  }
}

const handleConfirmReceive = async (row: any) => {
  try {

    await ElMessageBox.confirm('确认该订单已收货？', '提示', { type: 'warning' })
    await adminOrderStore.checkDone([row.id])
    ElMessage.success('确认收货成功')
    loadOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('确认收货失败')
    }
  }
}

const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', { type: 'warning' })
    await adminOrderStore.close([row.id])
    ElMessage.success('取消成功')
    loadOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

const handleCurrentChange = (val: number) => {
  state.page = val
  loadOrderList()
}

const getTotalPages = (): number => {
  const total = Number(state.total) || 0
  const pageSize = Number(state.pageSize) || 10
  
  if (total <= 0 || pageSize <= 0) {
    return 0
  }
  
  return Math.ceil(total / pageSize)
}

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-stats {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e6f7ff;
}

.stat-item.active {
  background: #1baeae;
  color: white;
}

.stat-label {
  font-size: 14px;
  margin-bottom: 4px;
}

.stat-count {
  font-size: 20px;
  font-weight: bold;
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

.order-detail {
  padding: 10px 0;
}

.status-section {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  font-size: 14px;
}

.detail-row .label {
  color: #999;
  width: 100px;
  flex-shrink: 0;
}

.detail-row .value {
  color: #333;
  flex: 1;
}

.detail-section.total {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.final-total {
  font-size: 16px;
  font-weight: bold;
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 8px;
}

.final-total .value {
  color: #f44;
  font-size: 18px;
}
</style>