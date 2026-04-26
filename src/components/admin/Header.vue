<template>
  <header class="admin-header">
    <div class="breadcrumb">
      <span>首页</span>
      <span class="separator">/</span>
      <span>{{ title }}</span>
    </div>
    <div class="user-info">
      <el-dropdown @command="handleCommand">
        <span class="user-dropdown">
          {{ adminName }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{
  title: string
}>()

const router = useRouter()

const adminName = computed(() => {
  const adminInfo = localStorage.getItem('adminInfo')
  return adminInfo ? JSON.parse(adminInfo).name : '管理员'
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    ElMessage.success('退出成功')
    router.push('/admin/login')
  }
}
</script>

<style scoped>
.admin-header {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #999;
}

.user-info .user-dropdown {
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
