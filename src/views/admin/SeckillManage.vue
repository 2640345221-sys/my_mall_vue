<template>
  <div>
    <div class="search-bar">
      <el-select v-model="state.searchStatus" placeholder="状态" clearable style="width: 120px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="success" @click="handleAdd">新增秒杀商品</el-button>
    </div>

    <el-table :data="state.list" v-loading="state.loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="goodsName" label="商品名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="seckillPrice" label="秒杀价" width="100">
        <template #default="scope">¥{{ formatPrice(scope.row.seckillPrice) }}</template>
      </el-table-column>
      <el-table-column prop="stockCount" label="秒杀库存" width="100" />
      <el-table-column label="秒杀时间" min-width="260">
        <template #default="scope">
          {{ scope.row.startTime }} ~ {{ scope.row.endTime }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="warning" link @click="handleToggleStatus(scope.row)">
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <AdminPagination :total="state.total" :model-page="state.page" @page-change="onPageChange" />

    <el-dialog v-model="state.dialogVisible" :title="state.dialogType === 'add' ? '新增秒杀商品' : '编辑秒杀商品'" width="600px">
      <el-form :model="state.form" label-width="100px">
        <el-form-item label="商品" required>
          <el-select v-model="state.form.goodsId" placeholder="选择商品" style="width: 100%" filterable>
            <el-option v-for="g in state.goodsList" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="秒杀价格" required>
          <el-input-number v-model="state.form.seckillPrice" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="秒杀库存" required>
          <el-input-number v-model="state.form.stockCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-date-picker v-model="state.form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-date-picker v-model="state.form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="state.dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="state.submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPage, save, update, deleteById, updateStatus } from '@/api/admin/seckill'
import { pageGoods } from '@/api/admin/goods'
import { formatPrice, yuanToFen } from '@/utils/format'
import AdminPagination from '@/components/AdminPagination.vue'

const state = reactive({
  list: [] as any[],
  goodsList: [] as any[],
  loading: false,
  page: 1,
  pageSize: 10,
  total: 0,
  searchStatus: null as number | null,
  dialogVisible: false,
  dialogType: 'add' as 'add' | 'edit',
  submitting: false,
  form: {
    id: null as number | null,
    goodsId: null as number | null,
    seckillPrice: 0,
    stockCount: 0,
    startTime: '',
    endTime: ''
  }
})

const formatDateTime = (date: string) => {
  if (!date) return ''
  return date.replace('T', ' ')
}

const loadList = async () => {
  state.loading = true
  try {
    const params: Record<string, any> = { pageNumber: state.page, pageSize: state.pageSize }
    if (state.searchStatus !== null) params.status = state.searchStatus
    const res = await getPage(params)
    state.list = res.records || []
    state.total = res.total || 0
  } catch { ElMessage.error('加载失败') }
  finally { state.loading = false }
}

const loadGoodsList = async () => {
  try {
    const res = await pageGoods({ pageNumber: 1, pageSize: 200 })
    state.goodsList = res.records || []
  } catch { /* ignore */ }
}

const handleSearch = () => { state.page = 1; loadList() }
const handleAdd = () => {
  state.dialogType = 'add'
  state.form = { id: null, goodsId: null, seckillPrice: 0, stockCount: 0, startTime: '', endTime: '' }
  state.dialogVisible = true
}
const handleEdit = (row: any) => {
  state.dialogType = 'edit'
  state.form = {
    id: row.id,
    goodsId: row.goodsId,
    seckillPrice: (row.seckillPrice || 0) / 100,
    stockCount: row.stockCount,
    startTime: row.startTime,
    endTime: row.endTime
  }
  state.dialogVisible = true
}
const handleSubmit = async () => {
  state.submitting = true
  try {
    const data = {
      ...state.form,
      seckillPrice: yuanToFen(state.form.seckillPrice),
      startTime: formatDateTime(state.form.startTime),
      endTime: formatDateTime(state.form.endTime)
    }
    if (state.dialogType === 'add') { await save(data) }
    else { await update(data) }
    ElMessage.success(state.dialogType === 'add' ? '新增成功' : '修改成功')
    state.dialogVisible = false
    loadList()
  } catch { ElMessage.error('操作失败') }
  finally { state.submitting = false }
}
const handleToggleStatus = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要${row.status === 1 ? '禁用' : '启用'}该秒杀商品吗？`, '提示', { type: 'warning' })
    await updateStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success('操作成功')
    loadList()
  } catch { /* cancel */ }
}
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' })
    await deleteById(row.id)
    ElMessage.success('删除成功')
    loadList()
  } catch { /* cancel */ }
}
function onPageChange(p: number) { state.page = p; loadList() }

onMounted(() => { loadList(); loadGoodsList() })
</script>

<style scoped>
.search-bar { margin-bottom: 16px; display: flex; gap: 10px; }
.pagination { margin-top: 16px; display: flex; justify-content: center; }
</style>
