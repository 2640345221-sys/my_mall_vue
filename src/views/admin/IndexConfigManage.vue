<template>
  <div class="admin-layout">
    <admin-sidebar active-menu="/admin/index-config" />
    <div class="main-content">
      <admin-header title="首页配置管理" />
      <div class="page-content">
        <!-- 配置类型选择 -->
        <el-tabs v-model="state.configType" @tab-change="handleTabChange">
          <el-tab-pane label="热销商品" name="3" />
          <el-tab-pane label="新品上线" name="4" />
          <el-tab-pane label="为你推荐" name="5" />
        </el-tabs>

        <!-- 操作栏 -->
        <div class="action-bar">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增配置
          </el-button>
        </div>

        <!-- 配置表格 -->
        <el-table :data="state.configList" v-loading="state.loading" border>
          <el-table-column prop="id" label="ID" min-width="80" />
          <el-table-column prop="name" label="配置名称" min-width="200" />
          <el-table-column label="商品ID" min-width="100">
            <template #default="scope">
              {{ scope.row.goodsId }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="配置类型" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.type === 3 ? 'danger' : scope.row.type === 4 ? 'primary' : 'success'">
                {{ scope.row.type === 3 ? '热销' : scope.row.type === 4 ? '新品' : '推荐' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="rank" label="优先值" min-width="100" />
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">
                删除
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="state.dialogVisible"
      :title="state.dialogType === 'add' ? '新增配置' : '编辑配置'"
      width="500px"
    >
      <el-form :model="state.form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="state.form.name" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="选择商品" prop="goodsId">
          <el-select
            v-model="state.form.goodsId"
            placeholder="选择商品"
            style="width: 100%"
            filterable
            remote
            :remote-method="searchGoods"
            :loading="state.goodsLoading"
          >
            <el-option
              v-for="item in state.goodsOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先值" prop="rank">
          <el-input-number v-model="state.form.rank" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="state.dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="state.submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import AdminSidebar from '@/components/admin/Sidebar.vue'
import AdminHeader from '@/components/admin/Header.vue'
import axios from '@/utils/axios'

const formRef = ref()

const state = reactive({
  configType: '4',
  configList: [] as any[],
  loading: false,
  dialogVisible: false,
  dialogType: 'add' as 'add' | 'edit',
  submitting: false,
  goodsLoading: false,
  goodsOptions: [] as any[],
  page: 1,
  pageSize: 10,
  total: 0,
  jumpPage: 1,
  form: {
    id: null as number | null,
    name: '',
    type: 4,
    goodsId: null as number | null,
    rank: 0
  }
})

const formRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  goodsId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  rank: [{ required: true, message: '请输入优先值', trigger: 'blur' }]
}

const loadConfigList = async () => {
  state.loading = true
  try {
    const res = await axios.get('/admin/indexConfig', {
      params: {
        pageNumber: state.page,
        pageSize: state.pageSize,
        type: state.configType
      }
    })
    
    if (res && res.records) {
      state.configList = res.records || []
      state.total = res.total || 0
    } else if (Array.isArray(res)) {
      state.configList = res
      state.total = res.length
    } else {
      state.configList = []
      state.total = 0
    }
  } catch (error: any) {
    ElMessage.error(`加载配置列表失败: ${error.response?.data?.message || error.message}`)
  } finally {
    state.loading = false
  }
}

const searchGoods = async (keyword: string) => {
  if (!keyword) return
  state.goodsLoading = true
  try {
    const res = await axios.get('/admin/goods', {
      params: {
        pageNumber: 1,
        pageSize: 20,
        keyword: keyword
      }
    })
    
    if (res && res.records) {
      state.goodsOptions = res.records
    } else if (Array.isArray(res)) {
      state.goodsOptions = res
    } else {
      state.goodsOptions = []
    }
  } catch (error: any) {
    console.error('搜索商品失败:', error)
  } finally {
    state.goodsLoading = false
  }
}

const handleTabChange = () => {
  state.page = 1
  loadConfigList()
}

const handleAdd = () => {
  state.dialogType = 'add'
  state.form = {
    id: null,
    name: '',
    type: parseInt(state.configType),
    goodsId: null,
    rank: 0
  }
  state.goodsOptions = []
  state.dialogVisible = true
}

const handleEdit = (row: any) => {
  state.dialogType = 'edit'
  state.form = {
    id: row.id,
    name: row.name,
    type: row.type,
    goodsId: row.goodsId,
    rank: row.rank
  }
  // 加载当前商品信息
  state.goodsOptions = [{
    id: row.goodsId,
    name: '商品ID: ' + row.goodsId
  }]
  state.dialogVisible = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    const params = {
      id: state.form.id,
      name: state.form.name,
      type: state.form.type,
      goodsId: state.form.goodsId,
      rank: state.form.rank
    }

    if (state.dialogType === 'add') {
      await axios.post('/admin/indexConfig', params)
      ElMessage.success('新增成功')
    } else {
      await axios.put('/admin/indexConfig', params)
      ElMessage.success('修改成功')
    }

    state.dialogVisible = false
    loadConfigList()
  } catch (error: any) {
    ElMessage.error(`操作失败: ${error.response?.data?.message || error.message}`)
  } finally {
    state.submitting = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该配置吗？', '提示', { type: 'warning' })
    await axios.delete('/admin/indexConfig', {
      params: {
        ids: [row.id]
      }
    })
    ElMessage.success('删除成功')
    loadConfigList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`删除失败: ${error.response?.data?.message || error.message}`)
    }
  }
}

const handleCurrentChange = (page: number) => {
  state.page = page
  loadConfigList()
}

// 计算总页数
const getTotalPages = (): number => {
  const total = Number(state.total) || 0
  const pageSize = Number(state.pageSize) || 10
  
  if (total <= 0 || pageSize <= 0) {
    return 0
  }
  
  return Math.ceil(total / pageSize)
}

onMounted(() => {
  loadConfigList()
})
</script>

<style scoped>
.action-bar {
  margin-bottom: 16px;
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