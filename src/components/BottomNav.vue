<template>
  <nav class="top-nav">
    <div class="brand" @click="$router.push('/home')">
      <span class="brand-mark">M</span>
      <span class="brand-name">我的商城</span>
    </div>

    <div class="right-group">
      <div class="nav-items">
        <router-link to="/home" class="nav-item">首页</router-link>
        <router-link to="/category" class="nav-item">分类</router-link>
        <router-link to="/seckill" class="nav-item">秒杀</router-link>
        <router-link to="/cart" class="nav-item">购物车</router-link>
        <router-link to="/order" class="nav-item">订单</router-link>
      </div>
      <div class="user-entry">
        <router-link v-if="!isLogin" to="/login" class="login-btn">登录</router-link>
        <router-link v-else to="/user" class="login-btn">我的</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user/user'

const userStore = useUserStore()

const isLogin = computed(() => !!userStore.token)

onMounted(() => {
  if (userStore.token && !userStore.userInfo) {
    userStore.getInfo().catch(() => {})
  }
})
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 12px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 10px rgba(26, 26, 46, 0.05);
  z-index: 1000;
}

.brand {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-mark {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--ink), var(--ink-light));
  color: var(--amber);
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
}

.brand-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  font-family: var(--font-display);
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.right-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-items::-webkit-scrollbar { display: none; }

.nav-item {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}

.nav-item.router-link-active {
  color: var(--amber);
  font-weight: 600;
}

.user-entry {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.login-btn {
  color: var(--amber);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  padding: 3px 8px;
  border: 1px solid var(--amber);
  border-radius: 13px;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.login-btn:active {
  background: var(--amber);
  color: #fff;
}

</style>
