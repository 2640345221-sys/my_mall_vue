<template>
  <nav class="bottom-nav">
    <router-link to="/home" class="nav-item">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </router-link>
    <router-link to="/category" class="nav-item">
      <el-icon><Grid /></el-icon>
      <span>分类</span>
    </router-link>
    <router-link to="/cart" class="nav-item">
      <el-icon><ShoppingCart /></el-icon>
      <span>购物车</span>
    </router-link>
    <router-link to="/user" class="nav-item">
      <el-icon><User /></el-icon>
      <span>我的</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { HomeFilled, Grid, ShoppingCart, User } from '@element-plus/icons-vue'
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 6px 0;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 1000;
  box-shadow: 0 -1px 8px rgba(0,0,0,0.03);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-muted);
  font-size: 11px;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-item.router-link-active {
  color: var(--ink);
}
</style>
