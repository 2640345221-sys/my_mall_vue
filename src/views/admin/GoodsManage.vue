<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <admin-sidebar active-menu="/admin/goods" />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <admin-header title="商品管理" />

      <!-- 页面内容 -->
      <div class="page-content">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="state.searchKeyword"
            placeholder="请输入商品名称"
            style="width: 200px"
            clearable
          />
          <el-select v-model="state.searchCategory" placeholder="选择分类" clearable style="width: 150px">
            <el-option
              v-for="item in state.categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>

        <!-- 数据表格 -->
        <el-table :data="state.goodsList" v-loading="state.loading" border>
          <el-table-column prop="id" label="ID" min-width="80" />
          <el-table-column label="商品图片" min-width="100">
            <template #default="scope">
              <el-image
                :src="scope.row.coverImg"
                style="width: 60px; height: 60px"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
          <el-table-column label="分类" min-width="120">
            <template #default="scope">
              {{ getCategoryName(scope.row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column prop="originalPrice" label="原价" min-width="100">
            <template #default="scope">
              ¥{{ scope.row.originalPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="sellingPrice" label="售价" min-width="100">
            <template #default="scope">
              ¥{{ scope.row.sellingPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="stockNum" label="库存" min-width="100" />
          <el-table-column prop="sellStatus" label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.sellStatus === false ? 'success' : 'danger'">
                {{ scope.row.sellStatus === false ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="180" />
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleStatus(scope.row)">
                {{ scope.row.sellStatus === false ? '下架' : '上架' }}
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
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="state.dialogVisible"
      :title="state.dialogType === 'add' ? '新增商品' : '编辑商品'"
      width="700px"
    >
      <el-form :model="state.form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="state.form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品简介" prop="intro">
          <el-input
            v-model="state.form.intro"
            type="textarea"
            rows="3"
            placeholder="请输入商品简介"
          />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="state.form.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="item in state.categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="state.form.originalPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="售价" prop="sellingPrice">
          <el-input-number v-model="state.form.sellingPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stockNum">
          <el-input-number v-model="state.form.stockNum" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="商品图片" prop="coverImg">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            accept="image/*"
          >
            <img v-if="state.form.coverImg" :src="state.form.coverImg" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <el-input v-model="state.form.coverImg" placeholder="或输入图片URL" style="margin-top: 10px;" />
        </el-form-item>
        <el-form-item label="商品详情" prop="detailContent">
          <el-input
            v-model="state.form.detailContent"
            type="textarea"
            rows="5"
            placeholder="请输入商品详情"
          />
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
import { Search, Plus } from '@element-plus/icons-vue'
import AdminSidebar from '@/components/admin/Sidebar.vue'
import AdminHeader from '@/components/admin/Header.vue'
import axios from '@/utils/axios'

const formRef = ref()

// 上传配置
const uploadUrl = '/api/admin/common/upload'
const uploadHeaders = {
  token: localStorage.getItem('adminToken') || ''
}

// 封面上传成功回调
const handleCoverSuccess = (response: any) => {
  if (response.code === 1) {
    state.form.coverImg = response.data
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

// 封面上传前校验
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const state = reactive({
  goodsList: [] as any[],
  categoryList: [] as any[],
  loading: false,
  page: 1,
  pageSize: 10,
  total: 0,
  searchKeyword: '',
  searchCategory: null as number | null,
  dialogVisible: false,
  dialogType: 'add' as 'add' | 'edit',
  submitting: false,
  form: {
    id: null as number | null,
    name: '',
    intro: '',
    categoryId: null as number | null,
    originalPrice: 0,
    sellingPrice: 0,
    stockNum: 0,
    coverImg: '',
    detailContent: ''
  }
})

const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  sellingPrice: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stockNum: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

// 加载商品列表
const loadGoodsList = async () => {
  state.loading = true
  try {
    const params = new URLSearchParams()
    params.append('pageNumber', String(state.page))
    params.append('pageSize', String(state.pageSize))
    if (state.searchKeyword) {
      params.append('goodsName', state.searchKeyword)
    }
    const res = await axios.get(`/admin/goods/page?${params.toString()}`)
    state.goodsList = res.records || []
    state.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    state.loading = false
  }
}

// 加载分类列表
const loadCategoryList = async () => {
  try {
    const res = await axios.get('/admin/category')
    state.categoryList = res || []
  } catch (error) {
    console.error('加载分类列表失败', error)
  }
}

// 获取分类名称
const getCategoryName = (categoryId: number | null) => {
  if (!categoryId) return '-'
  const category = state.categoryList.find((item: any) => item.id === categoryId)
  return category ? category.name : '-'
}

// 搜索
const handleSearch = () => {
  state.page = 1
  loadGoodsList()
}

// 新增
const handleAdd = () => {
  state.dialogType = 'add'
  state.form = {
    id: null,
    name: '',
    intro: '',
    categoryId: null,
    originalPrice: 0,
    sellingPrice: 0,
    stockNum: 0,
    coverImg: '',
    detailContent: ''
  }
  state.dialogVisible = true
}

// 编辑
const handleEdit = (row: any) => {
  state.dialogType = 'edit'
  state.form = { ...row }
  state.dialogVisible = true
}

// 提交
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    if (state.dialogType === 'add') {
      await axios.post('/admin/goods', state.form)
      ElMessage.success('新增成功')
    } else {
      await axios.put('/admin/goods', state.form)
      ElMessage.success('修改成功')
    }
    state.dialogVisible = false
    loadGoodsList()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    state.submitting = false
  }
}

// 修改状态
const handleStatus = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.sellStatus === false ? '下架' : '上架'}该商品吗？`,
      '提示',
      { type: 'warning' }
    )
    const newStatus = row.sellStatus === false ? 1 : 0
    await axios.put(`/admin/goods/${newStatus}`, [row.id])
    ElMessage.success('操作成功')
    loadGoodsList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
    await axios.delete(`/admin/goods/${row.id}`)
    ElMessage.success('删除成功')
    loadGoodsList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 分页
const handleCurrentChange = (val: number) => {
  state.page = val
  loadGoodsList()
}

onMounted(() => {
  loadGoodsList()
  loadCategoryList()
})
</script>
