<template>
  <div>
        
        <el-tabs v-model="state.configType" @tab-change="handleTabChange">
          <el-tab-pane label="热销商品" name="3" />
          <el-tab-pane label="新品上线" name="4" />
          <el-tab-pane label="为你推荐" name="5" />
        </el-tabs>

        
        <div class="action-bar">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增配置
          </el-button>
        </div>

        
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

        <AdminPagination :total="state.total" :model-page="state.page" @page-change="onPageChange" />

  
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
            placeholder="请选择商品"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in state.allGoodsList"
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
import { getIndexConfigPage, deleteIndexConfig, updateIndexConfig, addIndexConfig } from '@/api/admin/indexConfig'
import { pageGoods } from '@/api/admin/goods'
import AdminPagination from '@/components/AdminPagination.vue'

const formRef = ref()

const state = reactive({
  configType: '4',
  configList: [] as any[],
  loading: false,
  dialogVisible: false,
  dialogType: 'add' as 'add' | 'edit',
  submitting: false,
  allGoodsList: [] as any[],
  page: 1,
  pageSize: 10,
  total: 0,
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
    const res = await getIndexConfigPage({
      pageNumber: state.page,
      pageSize: state.pageSize,
      type: parseInt(state.configType)
    })
    
    state.configList = res?.records || []
    state.total = res?.total || 0
  } catch (error: any) {
    ElMessage.error(`加载配置列表失败: ${error.response?.data?.message || error.message}`)
  } finally {
    state.loading = false
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
  state.dialogVisible = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    const params = {
      id: state.form.id ?? undefined,
      name: state.form.name,
      type: state.form.type,
      goodsId: state.form.goodsId,
      rank: state.form.rank
    }

    if (state.dialogType === 'add') {
      await addIndexConfig(params as any)
      ElMessage.success('新增成功')
    } else {
      await updateIndexConfig(params as any)
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
    await deleteIndexConfig([row.id])
    ElMessage.success('删除成功')
    loadConfigList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`删除失败: ${error.response?.data?.message || error.message}`)
    }
  }
}

function onPageChange(p: number) { state.page = p; loadConfigList() }

const loadAllGoods = async () => {
  try {
    const res = await pageGoods({
      pageNumber: 1,
      pageSize: 1000,
      goodsName: ''
    })
    
    state.allGoodsList = res?.records || []
  } catch (error: any) {
    console.error('加载商品列表失败:', error)
  }
}

onMounted(() => {
  loadConfigList()
  loadAllGoods()
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