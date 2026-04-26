<template>
  <div class="admin-layout">
    <admin-sidebar active-menu="/admin/carousel" />
    <div class="main-content">
      <admin-header title="轮播图管理" />
      <div class="page-content">
        <!-- 操作栏 -->
        <div class="action-bar">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增轮播图
          </el-button>
        </div>

        <!-- 轮播图表格 -->
        <el-table :data="state.carouselList" v-loading="state.loading" border>
          <el-table-column prop="id" label="ID" min-width="80" />
          <el-table-column label="轮播图" min-width="200">
            <template #default="scope">
              <el-image
                :src="scope.row.carouselUrl"
                style="width: 150px; height: 80px"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="redirectUrl" label="跳转链接" min-width="250" show-overflow-tooltip />
          <el-table-column prop="rank" label="排序" min-width="100" />
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
                {{ scope.row.status === 0 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleStatus(scope.row)">
                {{ scope.row.status === 0 ? '禁用' : '启用' }}
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
      :title="state.dialogType === 'add' ? '新增轮播图' : '编辑轮播图'"
      width="500px"
    >
      <el-form :model="state.form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="轮播图" prop="carouselUrl">
          <el-input v-model="state.form.carouselUrl" placeholder="请输入图片URL" />
          <div v-if="state.form.carouselUrl" class="preview-image">
            <el-image :src="state.form.carouselUrl" style="width: 200px; height: 100px" fit="cover" />
          </div>
        </el-form-item>
        <el-form-item label="跳转链接" prop="redirectUrl">
          <el-input v-model="state.form.redirectUrl" placeholder="请输入跳转链接" />
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
  carouselList: [] as any[],
  loading: false,
  dialogVisible: false,
  dialogType: 'add' as 'add' | 'edit',
  submitting: false,
  form: {
    id: null as number | null,
    carouselUrl: '',
    redirectUrl: '',
    rank: 0
  }
})

const formRules = {
  carouselUrl: [{ required: true, message: '请输入轮播图URL', trigger: 'blur' }],
  rank: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const loadCarouselList = async () => {
  state.loading = true
  try {
    const params = new URLSearchParams()
    params.append('pageNumber', '1')
    params.append('pageSize', '100')
    const res = await axios.get(`/admin/carousel/page?${params.toString()}`)
    state.carouselList = res.records || []
  } catch (error) {
    ElMessage.error('加载轮播图列表失败')
  } finally {
    state.loading = false
  }
}

const handleAdd = () => {
  state.dialogType = 'add'
  state.form = {
    id: null,
    carouselUrl: '',
    redirectUrl: '',
    rank: 0
  }
  state.dialogVisible = true
}

const handleEdit = (row: any) => {
  state.dialogType = 'edit'
  state.form = {
    id: row.id,
    carouselUrl: row.carouselUrl,
    redirectUrl: row.redirectUrl,
    rank: row.rank
  }
  state.dialogVisible = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    if (state.dialogType === 'add') {
      await axios.post('/admin/carousels', state.form)
      ElMessage.success('新增成功')
    } else {
      await axios.put('/admin/carousels', state.form)
      ElMessage.success('修改成功')
    }
    state.dialogVisible = false
    loadCarouselList()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    state.submitting = false
  }
}

const handleStatus = async (row: any) => {
  try {
    const action = row.status === 0 ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}该轮播图吗？`, '提示', { type: 'warning' })
    await axios.put(`/admin/carousels/status/${row.id}`, {
      status: row.status === 0 ? 1 : 0
    })
    ElMessage.success('操作成功')
    loadCarouselList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', { type: 'warning' })
    await axios.delete(`/admin/carousels/${row.id}`)
    ElMessage.success('删除成功')
    loadCarouselList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadCarouselList()
})
</script>
