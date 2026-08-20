<template>
  <div>
        
        <div class="action-bar">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>

        
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

  
    <el-dialog
      v-model="state.dialogVisible"
      :title="state.dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form :model="state.form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="state.form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId" v-if="state.form.level > 1">
          <el-select v-model="state.form.parentId" :placeholder="state.form.level === 3 ? '请选择二级分类' : '请选择一级分类'" style="width: 100%">
            <el-option
              v-for="item in parentCategoryOptions"
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
import { insertCategory, deleteCategory, updateCategory, getAll } from '@/api/admin/category'

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
    rank: 0,
    level: 3
  }
})

const secondLevelCategories = computed(() => {
  return state.categoryList.filter(item => item.level === 2)
})

const firstLevelCategories = computed(() => {
  return state.categoryList.filter(item => item.level === 1)
})

const parentCategoryOptions = computed(() => {
  return state.form.level === 2 ? firstLevelCategories.value : secondLevelCategories.value
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择上级分类', trigger: 'change' }],
  rank: [{ required: true, message: '请输入优先值', trigger: 'blur' }]
}

const loadCategoryList = async () => {
  state.loading = true
  try {
    const data = await getAll()

    if (Array.isArray(data)) {
      state.categoryList = [...data]
    } else {
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
  const firstSecondLevel = secondLevelCategories.value[0]
  state.form = {
    id: null,
    name: '',
    parentId: firstSecondLevel ? firstSecondLevel.id : 0,
    rank: 0,
    level: 3
  }
  state.dialogVisible = true
}

const handleEdit = (row: any) => {
  state.dialogType = 'edit'
  state.form = {
    id: row.id,
    name: row.name,
    parentId: row.parentId || 0,
    rank: row.rank || 0,
    level: row.level || 3
  }
  state.dialogVisible = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    const params: any = {
      ...state.form
    }

    if (state.dialogType === 'add') {
      delete params.id
      await insertCategory(params)
      ElMessage.success('新增成功')
    } else {
      await updateCategory(params)
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
    await deleteCategory([row.id])
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

