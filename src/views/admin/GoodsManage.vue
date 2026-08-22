<template>
  <div>
    
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
              ¥{{ formatPrice(scope.row.originalPrice) }}
            </template>
          </el-table-column>
          <el-table-column prop="sellingPrice" label="售价" min-width="100">
            <template #default="scope">
              ¥{{ formatPrice(scope.row.sellingPrice) }}
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

        <AdminPagination :total="state.total" :model-page="state.page" @page-change="onPageChange" />

  
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
        <el-form-item label="上架状态" prop="sellStatus">
          <el-select v-model="state.form.sellStatus" placeholder="选择上架状态" style="width: 100%">
            <el-option label="上架" :value="false" />
            <el-option label="下架" :value="true" />
          </el-select>
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
import { pageGoods, insertGoods, updateGoods, updateSellStatus, deleteGoods } from '@/api/admin/goods'
import { getAll } from '@/api/admin/category'
import { formatPrice, yuanToFen } from '@/utils/format'
import AdminPagination from '@/components/AdminPagination.vue'

const formRef = ref()

const uploadUrl = '/api/admin/common/upload'
const uploadHeaders = {
  token: localStorage.getItem('adminToken') || ''
}

const handleCoverSuccess = (response: any) => {
  if (response.code === 1) {
    state.form.coverImg = response.data
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

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
    detailContent: '',
    sellStatus: false
  }
})

const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  sellingPrice: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stockNum: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const loadGoodsList = async () => {
  state.loading = true
  try {
    const res = await pageGoods({
      pageNumber: state.page,
      pageSize: state.pageSize,
      goodsName: state.searchKeyword || undefined,
      categoryId: state.searchCategory ?? undefined
    })
    state.goodsList = res.records || []
    state.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    state.loading = false
  }
}

const loadCategoryList = async () => {
  try {
    const res = await getAll()
    state.categoryList = res ? res.filter((item: any) => item.level === 3) : []
  } catch (error) {
    console.error('加载分类列表失败', error)
  }
}

const getCategoryName = (categoryId: number | null) => {
  if (!categoryId) return '-'
  const category = state.categoryList.find((item: any) => item.id === categoryId)
  return category ? category.name : '-'
}

const handleSearch = () => {
  state.page = 1
  loadGoodsList()
}

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
    detailContent: '',
    sellStatus: false
  }
  state.dialogVisible = true
}

const handleEdit = (row: any) => {
  state.dialogType = 'edit'
  state.form = { ...row, originalPrice: (row.originalPrice || 0) / 100, sellingPrice: (row.sellingPrice || 0) / 100 }
  state.dialogVisible = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  state.submitting = true
  try {
    const goodsData = { ...state.form, id: state.form.id ?? undefined, originalPrice: yuanToFen(state.form.originalPrice), sellingPrice: yuanToFen(state.form.sellingPrice) } as any
    if (state.dialogType === 'add') {
      await insertGoods(goodsData)
      ElMessage.success('新增成功')
    } else {
      await updateGoods(goodsData)
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

const handleStatus = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.sellStatus === false ? '下架' : '上架'}该商品吗？`,
      '提示',
      { type: 'warning' }
    )
    const newStatus = row.sellStatus === false ? 1 : 0
    await updateSellStatus(newStatus, [row.id])
    ElMessage.success('操作成功')
    loadGoodsList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
    await deleteGoods(row.id)
    ElMessage.success('删除成功')
    loadGoodsList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

function onPageChange(p: number) { state.page = p; loadGoodsList() }

onMounted(() => {
  loadGoodsList()
  loadCategoryList()
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

.image-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
}
</style>

<style>
.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 148px;
  height: 148px;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader .cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-uploader .cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  line-height: 148px;
  text-align: center;
}
</style>