<template>
  <div>
        
        <div class="search-bar">
          <el-input
            v-model="state.searchKeyword"
            placeholder="请输入用户名/手机号"
            style="width: 250px"
            clearable
          />
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>

        
        <el-table :data="state.userList" v-loading="state.loading" border>
          <el-table-column prop="id" label="ID" min-width="80" />
          <el-table-column prop="loginName" label="登录名" min-width="150" />
          <el-table-column prop="nickName" label="昵称" min-width="150" />
          <el-table-column prop="introduceSign" label="个性签名" min-width="180" show-overflow-tooltip />
          <el-table-column prop="locked" label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.locked === false ? 'success' : 'danger'">
                {{ scope.row.locked === false ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="注册时间" min-width="180" />
          <el-table-column label="操作" min-width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleStatus(scope.row)">
                {{ scope.row.locked === false ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <AdminPagination :total="state.total" :model-page="state.page" @page-change="onPageChange" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { page, setStatus } from '@/api/admin/user'
import AdminPagination from '@/components/AdminPagination.vue'

const state = reactive({
  userList: [] as any[],
  loading: false,
  page: 1,
  pageSize: 10,
  total: 0,
  searchKeyword: '',
})

const loadUserList = async () => {
  state.loading = true
  try {
    const res = await page({
      pageNumber: state.page,
      pageSize: state.pageSize,
      locked: 0
    })
    state.userList = res.records || []
    state.total = res.total || 0
  } catch (error) {
    ElMessage.error('加载会员列表失败')
  } finally {
    state.loading = false
  }
}

const handleSearch = () => {
  state.page = 1
  loadUserList()
}

const handleStatus = async (row: any) => {
  try {
    const action = row.locked === false ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', { type: 'warning' })
    const newStatus = row.locked === false ? 1 : 0
    await setStatus(newStatus, [row.id])
    ElMessage.success('操作成功')
    loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

function onPageChange(p: number) { state.page = p; loadUserList() }

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.search-bar {
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
