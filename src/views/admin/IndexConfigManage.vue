<template>
  <div class="admin-layout">
    <admin-sidebar active-menu="/admin/index-config" />
    <div class="main-content">
      <admin-header title="首页配置" />
      <div class="page-content">
        <!-- 配置类型选择 -->
        <el-tabs v-model="state.configType" @tab-change="handleTabChange">
          <el-tab-pane label="热销商品" name="4" />
          <el-tab-pane label="新品上线" name="5" />
          <el-tab-pane label="为你推荐" name="6" />
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
          <el-table-column prop="configName" label="配置名称" min-width="200" />
          <el-table-column label="商品图片" min-width="120">
            <template #default="scope">
              <el-image
                :src="scope.row.goodsCoverImg"
                style="width: 80px; height: 80px"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="goodsName" label="商品名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="rank" label="排序" min-width="100" />
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
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="state.dialogVisible"
      :title="state.dialogType === 'add' ? '新增配置' : '编辑配置'"
      width="500px"
    >
      <el-form :model="state.form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="state.form.configName" placeholder="请输入配置名称" />
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
        <el-form-item label="排序" prop="rank">
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
  form: {
    id: null as number | null,
    configName: '',
    configType: 4,
    goodsId: null as number | null,
    rank: 0
  }
})

const formRules = {
  configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  goodsId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  rank: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const loadConfigList = async () => {
  state.loading = true
  try {
    const params = new URLSearchParams()
    params.append('pageNumber', '1')
    params.append('pageSize', '100')
    params.append('type', String(state.configType))
    const res = await axios.get(`/admin/indexConfig?${params.toString()}`)
    state.configList = res.records || []
  } catch (error) {
    ElMessage.error('加载配置列表失败')
  } finally {
    state.loading = false
  }
}

const searchGoods = async (keyword: string) => {
  if (!keyword) return
  state.goodsLoading = true
  try {
    const params = new URLSearchParams()
    params.append('pageNumber', '1')
    params.append('pageSize', '20')
    params.append('goodsName', keyword)
    const res = await axios.get(`/admin/goods/page?${params.toString()}`)
    state.goodsOptions = res.records || []
  } catch (error) {
    console.error('搜索商品失败', error)
  } finally {
    state.goodsLoading = false
  }
}

const handleTabChange = () => {
  loadConfigList()
}

const handleAdd = () => {
  state.dialogType = 'add'
  state.form = {
    id: null,
    configName: '',
    configType: parseInt(state.configType),
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
    configName: row.configName,
    configType: row.configType,
    goodsId: row.goodsId,
    rank: row.rank
  }
  // 加载当前商品信息
  state.goodsOptions = [{
    id: row.goodsId,
    name: row.goodsName
  }]
  state.dialogVisible = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    const params = {
      ...state.form,
      configType: parseInt(state.configType)
    }

    if (state.dialogType === 'add') {
      await axios.post('/admin/index-configs', params)
      ElMessage.success('新增成功')
    } else {
      await axios.put('/admin/index-configs', params)
      ElMessage.success('修改成功')
    }
    state.dialogVisible = false
    loadConfigList()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    state.submitting = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该配置吗？', '提示', { type: 'warning' })
    await axios.delete(`/admin/index-configs/${row.id}`)
    ElMessage.success('删除成功')
    loadConfigList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadConfigList()
})
</script>
