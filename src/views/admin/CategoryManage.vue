<template>
  <div class="admin-layout">
    <admin-sidebar active-menu="/admin/category" />
    <div class="main-content">
      <admin-header title="分类管理" />
      <div class="page-content">
        <!-- 操作栏 -->
        <div class="action-bar">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>

        <!-- 分类表格 -->
        <el-table :data="state.categoryList" v-loading="state.loading" row-key="id">
          <el-table-column prop="id" label="ID" min-width="80" />
          <el-table-column prop="name" label="分类名称" min-width="200" />
          <el-table-column prop="level" label="层级" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.level === 1 ? 'primary' : scope.row.level === 2 ? 'success' : 'warning'">
                {{ scope.row.level === 1 ? '一级' : scope.row.level === 2 ? '二级' : '三级' }}
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
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="state.dialogVisible"
      :title="state.dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form :model="state.form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="state.form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <el-select v-model="state.form.parentId" placeholder="请选择二级分类" style="width: 100%">
            <el-option
              v-for="item in secondLevelCategories"
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
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import AdminSidebar from '@/components/admin/Sidebar.vue'
import AdminHeader from '@/components/admin/Header.vue'
import axios from '@/utils/axios'

const formRef = ref()

const state = reactive({
  categoryList: [] as any[],
  loading: false,
  dialogVisible: false,
  dialogType: 'add' as 'add' | 'edit',
  submitting: false,
  form: {
    id: null as number | null,
    name: '',
    parentId: 0,
    rank: 0
  }
})

// 二级分类列表
const secondLevelCategories = computed(() => {
  return state.categoryList.filter(item => item.level === 2)
})

// 调试：在组件挂载后立即检查数据
onMounted(() => {
  console.log('组件挂载完成，开始加载分类列表')
  loadCategoryList()
  
  // 2秒后再次检查数据状态
  setTimeout(() => {
    console.log('2秒后分类列表状态:', state.categoryList)
    console.log('分类列表长度:', state.categoryList.length)
    console.log('加载状态:', state.loading)
  }, 2000)
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择二级分类', trigger: 'change' }],
  rank: [{ required: true, message: '请输入优先值', trigger: 'blur' }]
}

const loadCategoryList = async () => {
  state.loading = true
  try {
    // axios拦截器已经处理了响应，直接返回数据数组
    const data = await axios.get('/admin/category')
    
    // 详细检查数据结构
    console.log('axios返回的数据:', data)
    console.log('数据类型:', typeof data)
    console.log('是否是数组:', Array.isArray(data))
    
    // 直接使用axios返回的数据（已经是处理后的数组）
    if (Array.isArray(data)) {
      // 使用响应式更新，确保Vue能检测到变化
      state.categoryList = [...data]
      console.log('分类列表:', state.categoryList)
      console.log('分类列表长度:', state.categoryList.length)
      console.log('第一条数据:', state.categoryList[0])
    } else {
      console.warn('返回的数据不是数组:', data)
      state.categoryList = []
    }
  } catch (error: any) {
    console.error('加载分类列表失败:', error)
    ElMessage.error(`加载分类列表失败: ${error.response?.data?.message || error.message}`)
  } finally {
    state.loading = false
  }
}

const handleAdd = () => {
  state.dialogType = 'add'
  // 默认选中第一个二级分类
  const firstSecondLevel = secondLevelCategories.value[0]
  state.form = {
    id: null,
    name: '',
    parentId: firstSecondLevel ? firstSecondLevel.id : 0,
    rank: 0
  }
  state.dialogVisible = true
}

const handleEdit = (row: any) => {
  state.dialogType = 'edit'
  state.form = {
    id: row.id,
    name: row.name,
    parentId: row.parentId || 0,
    rank: row.rank || 0
  }
  state.dialogVisible = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    // 构建正确的参数格式（固定为三级分类）
    const params = {
      ...state.form,
      level: 3
    }
    
    // 新增时移除id字段
    if (state.dialogType === 'add') {
      delete params.id
      await axios.post('/admin/category', params)
      ElMessage.success('新增成功')
    } else {
      // 修改时保留id字段
      await axios.put('/admin/category', params)
      ElMessage.success('修改成功')
    }
    state.dialogVisible = false
    loadCategoryList()
  } catch (error: any) {
    console.error('操作失败:', error)
    ElMessage.error(`操作失败: ${error.response?.data?.message || error.message}`)
  } finally {
    state.submitting = false
  }
}



const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', { type: 'warning' })
    // 后端接口要求使用ids参数，格式为List<Long>
    await axios.delete('/admin/category', { 
      params: { 
        ids: [row.id] 
      },
      paramsSerializer: {
        indexes: null // 禁用数组索引格式
      }
    })
    ElMessage.success('删除成功')
    loadCategoryList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(`删除失败: ${error.response?.data?.message || error.message}`)
    }
  }
}

onMounted(() => {
  loadCategoryList()
})
</script>

