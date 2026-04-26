<template>
  <aside class="admin-sidebar">
    <div class="logo">
      <el-icon :size="30"><Shop /></el-icon>
      <span>My Mall Admin</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="admin-menu"
      router
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <el-menu-item index="/admin/goods">
        <el-icon><Goods /></el-icon>
        <span>商品管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/order">
        <el-icon><Document /></el-icon>
        <span>订单管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/user">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/category">
        <el-icon><Menu /></el-icon>
        <span>分类管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/carousel">
        <el-icon><Picture /></el-icon>
        <span>轮播图管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/index-config">
        <el-icon><Setting /></el-icon>
        <span>首页配置</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Shop,
  Goods,
  Document,
  User,
  Menu,
  Picture,
  Setting
} from '@element-plus/icons-vue'

const props = defineProps<{
  activeMenu?: string
}>()

const route = useRoute()

const activeMenu = computed(() => props.activeMenu || route.path)
</script>

<style scoped>
.admin-sidebar {
  width: 220px;
  height: 100vh;
  background-color: #304156;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #263445;
}

.admin-menu {
  border-right: none !important;
}

.admin-sidebar::-webkit-scrollbar {
  width: 6px;
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.admin-sidebar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
