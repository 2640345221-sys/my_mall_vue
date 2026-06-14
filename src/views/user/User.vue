<template>
  <div class="user-container">
    <PageHeader title="我的" :showBack="false">
      <template #right>
        <el-icon @click="goToSetting" style="cursor:pointer"><Setting /></el-icon>
      </template>
    </PageHeader>

    
    <div class="user-card" v-if="state.user.id">
      <div class="user-avatar">
        <el-avatar :size="60" :src="state.user.avatar || defaultAvatar" />
      </div>
      <div class="user-info">
        <div class="user-name">{{ state.user.nickName || state.user.loginName }}</div>
        <div class="user-sign">{{ state.user.introduceSign || '这个人很懒，什么都没写~' }}</div>
      </div>
      <div class="user-arrow">
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    
    <div class="user-card skeleton" v-else>
      <el-skeleton :rows="2" animated />
    </div>

    
    <div class="order-entry">
      <div class="entry-header" @click="goToOrder">
        <span class="title">我的订单</span>
        <span class="all">全部订单 <el-icon><ArrowRight /></el-icon></span>
      </div>
      <div class="entry-list">
        <div class="entry-item" @click="goToOrderByStatus('0')">
          <el-icon :size="24" color="#f44"><Wallet /></el-icon>
          <span>待付款</span>
        </div>
        <div class="entry-item" @click="goToOrderByStatus('1')">
          <el-icon :size="24" color="#ff976a"><Box /></el-icon>
          <span>待发货</span>
        </div>
        <div class="entry-item" @click="goToOrderByStatus('2')">
          <el-icon :size="24" color="#1989fa"><Van /></el-icon>
          <span>待收货</span>
        </div>
        <div class="entry-item" @click="goToOrderByStatus('3')">
          <el-icon :size="24" color="#07c160"><ChatDotRound /></el-icon>
          <span>已完成</span>
        </div>
      </div>
    </div>

    
    <div class="function-list">
      <div class="function-item" @click="goToAddress">
        <div class="item-left">
          <el-icon><Location /></el-icon>
          <span>地址管理</span>
        </div>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="function-item" @click="goToProfile">
        <div class="item-left">
          <el-icon><User /></el-icon>
          <span>个人资料</span>
        </div>
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="function-item" @click="goToAbout">
        <div class="item-left">
          <el-icon><InfoFilled /></el-icon>
          <span>关于我们</span>
        </div>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    
    <div class="logout-section">
      <el-button type="danger" size="large" @click="handleLogout">
        退出登录
      </el-button>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  ArrowRight,
  Wallet,
  Box,
  Van,
  ChatDotRound,
  Location,
  User,
  InfoFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user/user'
import PageHeader from '@/components/PageHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const userStore = useUserStore()

const defaultAvatar = 'https://s.yezgea02.com/1604040746310/aaaddd.png'

const state = reactive({
  user: {} as any,
  loading: false
})

const loadUserInfo = async () => {
  state.loading = true
  try {
    state.user = userStore.userInfo || {}
  } catch (error) {
    console.error('加载用户信息失败', error)
  } finally {
    state.loading = false
  }
}

const goToSetting = () => {
  router.push('/user/setting')
}

const goToOrder = () => {
  router.push('/order')
}

const goToOrderByStatus = (status: string) => {
  router.push({
    path: '/order',
    query: { status }
  })
}

const goToAddress = () => {
  router.push({
    path: '/address',
    query: { from: 'mine' }
  })
}

const goToProfile = () => {
  router.push('/user/profile')
}

const goToAbout = () => {
  router.push('/about')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')

    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.user-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: white;
  z-index: 1000;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 16px;
}

.header-right {
  font-size: 20px;
  color: #666;
}

.user-card {
  margin-top: 44px;
  background: #1baeae;
  padding: 20px;
  display: flex;
  align-items: center;
  color: white;
}

.user-card.skeleton {
  background: white;
}

.user-avatar {
  margin-right: 15px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 18px;
  margin-bottom: 5px;
}

.user-sign {
  font-size: 13px;
}

.order-entry {
  background: white;
  margin-top: 10px;
  padding: 15px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.entry-header .all {
  font-size: 13px;
  color: #999;
}

.entry-list {
  display: flex;
  justify-content: space-around;
  padding-top: 15px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.entry-item span {
  font-size: 13px;
  color: #666;
}

.function-list {
  background: white;
  margin-top: 10px;
}

.function-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.logout-section {
  margin-top: 30px;
  padding: 0 20px;
}

.logout-section .el-button {
  width: 100%;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  background: white;
  border-top: 1px solid #eee;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
  font-size: 12px;
}

.nav-item.active,
.nav-item.router-link-active {
  color: #1baeae;
}
</style>
