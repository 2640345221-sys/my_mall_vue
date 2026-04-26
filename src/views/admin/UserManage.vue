<template>
  <div class="admin-layout">
    <admin-sidebar active-menu="/admin/user" />
    <div class="main-content">
      <admin-header title="会员管理" />
      <div class="page-content">
        <!-- 搜索栏 -->
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

        <!-- 数据表格 -->
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
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import AdminSidebar from '@/components/admin/Sidebar.vue'
import AdminHeader from '@/components/admin/Header.vue'
import axios from '@/utils/axios'

const state = reactive({
  userList: [] as any[],
  loading: false,
  page: 1,
  pageSize: 10,
  total: 0,
  searchKeyword: ''
})

const loadUserList = async () => {
  state.loading = true
  try {
    const params = new URLSearchParams()
    params.append('pageNumber', String(state.page))
    params.append('pageSize', String(state.pageSize))
    if (state.searchKeyword) {
      params.append('keyword', state.searchKeyword)
    }
    const res = await axios.get(`/admin/user?${params.toString()}`)
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
    await axios.put(`/admin/user/${newStatus}`, [row.id])
    ElMessage.success('操作成功')
    loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleCurrentChange = (val: number) => {
  state.page = val
  loadUserList()
}

onMounted(() => {
  loadUserList()
})
</script>

