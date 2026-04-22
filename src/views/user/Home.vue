<template>
  <div class="home">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>My Mall 商城</h1>
          <div class="user-info">
            <span>欢迎，{{ userStore.userInfo?.nickName }}</span>
            <el-button type="danger" size="small" @click="logout">退出</el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <h2>首页内容</h2>
        <p>登录成功！这是用户端首页。</p>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'      
  import { useUserStore } from '@/stores/user/user'

const router = useRouter()  
const userStore = useUserStore()

const logout = async() => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>